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
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('⚠️ STRIPE_SECRET_KEY not found - Payment features disabled');
} else {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16",
  });
}

// Session configuration for production - NO DOMAIN RESTRICTION
app.use(session({
  secret: process.env.SESSION_SECRET || 'production-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // Always secure for HTTPS production
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    sameSite: 'lax'
    // REMOVED: domain restriction for cross-domain compatibility
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
  console.log('🔄 Production /api/auth/user - temporary redirect fix');
  
  // Check if we have session data from successful OAuth
  if (req.session?.passport?.user) {
    console.log('✅ Found session user, constructing response');
    
    // Construct user response from session data
    const userData = {
      id: req.session.passport.user.id || req.session.passport.user,
      email: req.session.passport.user.email || 'unknown@example.com',
      firstName: req.session.passport.user.firstName || 'User',
      lastName: req.session.passport.user.lastName || '',
      profileImageUrl: req.session.passport.user.profileImageUrl || null,
      plan: req.session.passport.user.plan || 'free',
      role: req.session.passport.user.role || 'user',
      monthlyGenerationLimit: req.session.passport.user.monthlyGenerationLimit || 5,
      generationsUsedThisMonth: req.session.passport.user.generationsUsedThisMonth || 0
    };
    
    return res.json(userData);
  }
  
  // No session, return 401
  res.status(401).json({ message: "Not authenticated - no session data" });
});

// Catch all API routes and redirect to development
app.use('/api/*', (req, res) => {
  console.log('🔄 Production API catch-all - redirecting to development server:', req.originalUrl);
  const developmentUrl = 'https://e33979fc-c9be-4f0d-9a7b-6a3e83046828-00-3ij9k7qy14rai.picard.replit.dev' + req.originalUrl;
  res.redirect(developmentUrl);
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