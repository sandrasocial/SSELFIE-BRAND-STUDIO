import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { TrainingCompletionMonitor } from "./training-completion-monitor";
import { registerCoverImageRoutes } from "./routes/cover-image-routes";
import cors from "cors";

const app = express();

// Add CORS support for cross-origin requests from production domain to dev server
app.use(cors({
  origin: [
    'https://sselfie.ai', 
    'https://e33979fc-c9be-4f0d-9a7b-6a3e83046828-00-3ij9k7qy14rai.picard.replit.dev',
    'http://localhost:3000',
    'http://localhost:5000'
  ],
  credentials: true, // Important for session cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Add headers for iframe compatibility and image loading
app.use((req, res, next) => {
  // Allow framing for visual editor iframe
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  
  // Set referrer policy for better image loading
  res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');
  
  // Remove restrictive CSP headers completely for development
  // This allows Stripe.js and other external scripts to load without restrictions
  
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Add static file serving for public directory (flatlays, etc.) BEFORE routes
app.use(express.static('public'));

(async () => {
  const server = await registerRoutes(app);
  
  // Register cover image routes for Flux approval system
  registerCoverImageRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Start the training completion monitor
  const monitor = TrainingCompletionMonitor.getInstance();
  monitor.startMonitoring();
  console.log('🚀 Training Completion Monitor started - will check for stuck trainings every 2 minutes');

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // For Vercel deployment, export the app instead of starting server
  if (process.env.VERCEL) {
    // Export the Express app for Vercel serverless
    return app;
  }

  // ALWAYS serve the app on port 5000 for development
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = process.env.PORT || 5000;
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
