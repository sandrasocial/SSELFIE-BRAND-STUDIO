// PRODUCTION API FOR SSELFIE.AI DOMAIN
// Synchronized with development Google OAuth setup
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import Stripe from 'stripe';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Simple session configuration for production

// CORS configuration for production
app.use(cors({
  origin: ['https://sselfie.ai', 'https://www.sselfie.ai'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Initialize Stripe
let stripe;
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('⚠️ STRIPE_SECRET_KEY not found - Payment features disabled');
} else {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16",
  });
}

// Simple session configuration for production
app.use(session({
  secret: process.env.SESSION_SECRET || 'production-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // Always secure for HTTPS production
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    sameSite: 'lax'
  }
}));

// Production notice - redirect to development for immediate launch
app.get('/api/login', (req, res) => {
  console.log('🔄 Production login request - redirecting to working development server');
  
  // Redirect to development server for proper Google OAuth
  res.redirect('https://e33979fc-c9be-4f0d-9a7b-6a3e83046828-00-3ij9k7qy14rai.picard.replit.dev/api/login');
});

// Redirect root to development server
app.get('/', (req, res) => {
  console.log('🔄 Root request - redirecting to working development server');
  res.redirect('https://e33979fc-c9be-4f0d-9a7b-6a3e83046828-00-3ij9k7qy14rai.picard.replit.dev/');
});

// Redirect all other routes to development server
app.get('*', (req, res) => {
  console.log('🔄 Fallback redirect to development server:', req.path);
  res.redirect('https://e33979fc-c9be-4f0d-9a7b-6a3e83046828-00-3ij9k7qy14rai.picard.replit.dev' + req.path);
});

app.get('/api/logout', (req, res) => {
  if (req.session) {
    console.log('Vercel Logout: Destroying session for user:', req.session.userId);
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
      }
      res.redirect('/');
    });
  } else {
    res.redirect('/');
  }
});

app.get('/api/auth/user', (req, res) => {
  console.log('🔄 Production /api/auth/user - proxying to development server');
  
  // Proxy request to development server with all cookies
  const developmentUrl = 'https://e33979fc-c9be-4f0d-9a7b-6a3e83046828-00-3ij9k7qy14rai.picard.replit.dev/api/auth/user';
  
  // Forward all cookies to development server
  const headers = {};
  if (req.headers.cookie) {
    headers.Cookie = req.headers.cookie;
  }
  
  fetch(developmentUrl, {
    headers,
    credentials: 'include'
  })
  .then(response => response.json())
  .then(data => {
    console.log('✅ Development server response:', data);
    res.json(data);
  })
  .catch(error => {
    console.error('❌ Development server error:', error);
    res.status(401).json({ message: "Not authenticated - proxy error" });
  });
});

// Catch all API routes and proxy to development
app.use('/api/*', (req, res) => {
  console.log('🔄 Production API catch-all - proxying to development server:', req.originalUrl);
  const developmentUrl = 'https://e33979fc-c9be-4f0d-9a7b-6a3e83046828-00-3ij9k7qy14rai.picard.replit.dev' + req.originalUrl;
  
  // Forward all cookies to development server
  const headers = {};
  if (req.headers.cookie) {
    headers.Cookie = req.headers.cookie;
  }
  
  // Forward method and body for POST requests
  const options = {
    method: req.method,
    headers,
    credentials: 'include'
  };
  
  if (req.method === 'POST' && req.body) {
    options.body = JSON.stringify(req.body);
    headers['Content-Type'] = 'application/json';
  }
  
  fetch(developmentUrl, options)
  .then(response => {
    res.status(response.status);
    return response.json();
  })
  .then(data => {
    res.json(data);
  })
  .catch(error => {
    console.error('❌ Development server proxy error:', error);
    res.status(500).json({ message: "Proxy error" });
  });
});

// Clear session endpoint for testing
app.post('/api/clear-session', (req, res) => {
  console.log('Clear session request received');
  
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Session clear error:', err);
        return res.status(500).json({ message: 'Session clear failed' });
      }
      
      console.log('Session cleared successfully');
      res.json({ message: 'Session cleared - you can now test as a new user' });
    });
  } else {
    res.json({ message: 'No session to clear' });
  }
});

// Stripe payment endpoint
app.post("/api/create-payment-intent", async (req, res) => {
  try {
    const { amount, plan, currency = 'eur' } = req.body;
    
    if (!amount || !plan) {
      return res.status(400).json({ message: 'Amount and plan are required' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        plan,
      },
      description: `SSELFIE ${plan} subscription`,
    });

    console.log(`Payment intent created for ${plan}: ${paymentIntent.id}`);
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({ message: "Error creating payment intent: " + error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    platform: 'Vercel',
    endpoints: {
      login: '/api/login',
      logout: '/api/logout',
      auth: '/api/auth/user',
      payment: '/api/create-payment-intent'
    }
  });
});

// Handle all other API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

export default app;