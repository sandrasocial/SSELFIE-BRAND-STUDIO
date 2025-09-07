// server/vite.ts

import express, { type Express } from "express";
import fs from "node:fs";
import path from "node:path";
import {
  createServer as createViteServer,
  createLogger,
  type InlineConfig,
} from "vite";
import { type Server } from "node:http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const clientRoot = path.resolve(import.meta.dirname, "..", "client");
  const isProd = process.env.NODE_ENV === "production";

  const serverOptions = {
    middlewareMode: true,
    hmr: {
      server,
      port: parseInt(process.env.PORT || "5000", 10),
      host: "0.0.0.0",
    },
    allowedHosts: true as const,
  };

  // Use your existing vite.config, but force the correct root here.
  const inlineConfig: InlineConfig = {
    ...viteConfig,
    configFile: false,
    root: clientRoot,
    server: serverOptions,
    appType: "custom",
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        // Don't kill the process in dev; let the overlay show the error.
        viteLogger.error(msg, options);
      },
    },
  };

  const vite = await createViteServer(inlineConfig);

  app.use(vite.middlewares);

  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    // Let API routes be handled by your API handlers
    if (url.startsWith("/api/")) return next();

    try {
      const clientTemplate = path.resolve(clientRoot, "index.html");

      // Always reload index.html from disk in dev
      let template = await fs.promises.readFile(clientTemplate, "utf-8");

      // 🔧 IMPORTANT:
      // In dev, NO query params on the entry, or Vite's transform/HMR breaks.
      // If you want cache-busting, apply it in production only.
      if (isProd) {
        const cacheBuster = nanoid();
        template = template.replace(
          `src="/src/main.tsx"`,
          `src="/src/main.tsx?v=${cacheBuster}"`,
        );
      }

      const page = await vite.transformIndexHtml(url, template);
      res
        .status(200)
        .set({
          "Content-Type": "text/html",
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        })
        .end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });

  log(`Vite dev mounted. Root => ${clientRoot}`, "vite");
  if (!fs.existsSync(path.join(clientRoot, "src", "main.tsx"))) {
    log(
      `Missing client/src/main.tsx — ensure <script src="/src/main.tsx"> in client/index.html`,
      "vite",
    );
  }
}

export function serveStatic(app: Express) {
  // Serve the built client app (matches Vite outDir: client/dist)
  const distPath = path.resolve(import.meta.dirname, "..", "client", "dist");
  const assetsPath = path.join(distPath, "assets");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}. Run "npm run build" to create it.`,
    );
  }

  if (!fs.existsSync(assetsPath)) {
    throw new Error(
      `Could not find the assets directory: ${assetsPath}. Make sure the Vite build completed correctly.`,
    );
  }

  // Debug what's available
  const assets = fs.readdirSync(assetsPath);
  log(`Available assets: ${assets.join(", ")}`, "static-server");

  // Static assets
  app.use(express.static(distPath));

  // Log missing assets for easier debugging
  app.use("/assets/*", (req, _res, next) => {
    const assetPath = req.path;
    if (!fs.existsSync(path.join(distPath, assetPath))) {
      log(`404 Asset not found: ${assetPath}`, "static-server");
    }
    next();
  });

  // SPA fallback
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
