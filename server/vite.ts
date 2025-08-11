import { createServer as createViteServer } from "vite";
import type { ViteDevServer } from "vite";
import type { Express } from "express";
import type { Server } from "http";
import viteConfig from "../vite.config.js";
import { nanoid } from "nanoid";

export async function setupVite(app: Express, server: Server): Promise<ViteDevServer> {
  // Create Vite server in middleware mode
  const vite = await createViteServer({
    ...viteConfig,
    server: { middlewareMode: true },
    appType: 'spa'
  });

  // Use vite's connect instance as middleware
  app.use(vite.middlewares);

  // Handle SPA routing - serve index.html for non-API routes
  app.use('*', async (req, res, next) => {
    // Skip API routes
    if (req.originalUrl.startsWith('/api/')) {
      return next();
    }

    try {
      const url = req.originalUrl;

      // Transform the index.html with Vite
      let template = await vite.transformIndexHtml(url, `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SSELFIE Studio</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx?v=${nanoid()}"></script>
  </body>
</html>
      `);

      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });

  return vite;
}