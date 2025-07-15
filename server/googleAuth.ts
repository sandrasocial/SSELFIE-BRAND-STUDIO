import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-for-dev',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true, // Always secure for production domain
      maxAge: sessionTtl,
      sameSite: 'lax',
      domain: process.env.REPLIT_DOMAINS?.includes('sselfie.ai') ? 'sselfie.ai' : undefined,
    },
  });
}

export async function setupGoogleAuth(app: Express) {
  // Use provided Google Client ID temporarily
  const googleClientId = process.env.GOOGLE_CLIENT_ID || '455845546346-e89jtb6to8567cnl66k9se71ked1dbf6.apps.googleusercontent.com';
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  if (!googleClientSecret) {
    console.warn('⚠️ GOOGLE_CLIENT_SECRET not found - Please add it to Replit Secrets');
    console.warn('⚠️ Google Auth will be disabled until secret is provided');
    
    // Set up session and basic auth structure without Google OAuth
    app.set("trust proxy", 1);
    app.use(getSession());
    app.use(passport.initialize());
    app.use(passport.session());
    
    // Temporary auth routes that show instructions
    app.get('/api/login', (req, res) => {
      res.json({
        error: 'Google OAuth not configured',
        message: 'Please add GOOGLE_CLIENT_SECRET to Replit Secrets',
        instructions: 'Go to Google Console → Credentials → Your OAuth app → Copy Client Secret'
      });
    });
    
    app.get('/api/logout', (req, res) => {
      res.redirect('/');
    });
    
    console.log('⚠️ Temporary auth setup completed - Google OAuth disabled');
    return;
  }

  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Fixed callback URLs for Google OAuth
  const getCallbackURL = (req?: any) => {
    if (process.env.NODE_ENV === 'production') {
      return 'https://sselfie.ai/api/auth/google/callback';
    }
    
    // For Replit development
    const host = req?.get('host');
    if (host && host.includes('replit.dev')) {
      return `https://${host}/api/auth/google/callback`;
    }
    
    // For localhost development
    return 'http://localhost:5000/api/auth/google/callback';
  };

  // Google OAuth Strategy with custom domain callback URL
  const domains = process.env.REPLIT_DOMAINS?.split(',') || ['localhost:5000'];
  const customDomain = domains.find(domain => domain.includes('sselfie.ai'));
  const fallbackDomain = domains[0];
  
  const primaryDomain = customDomain || fallbackDomain;
  const callbackURL = primaryDomain.includes('localhost') 
    ? `http://${primaryDomain}/api/auth/google/callback`
    : `https://${primaryDomain}/api/auth/google/callback`;
  
  console.log('🔍 Google OAuth callback URL:', callbackURL);
  console.log('🔍 Available domains:', domains);
  console.log('🔍 Google Client ID (first 10 chars):', googleClientId.substring(0, 10) + '...');
  console.log('🔍 Google Client Secret (first 10 chars):', googleClientSecret.substring(0, 10) + '...');
  
  passport.use(new GoogleStrategy({
    clientID: googleClientId,
    clientSecret: googleClientSecret,
    callbackURL: callbackURL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('🔍 Google OAuth callback received for user:', profile.id);
      console.log('🔍 Profile details:', JSON.stringify(profile, null, 2));
      console.log('🔍 Access token present:', !!accessToken);
      console.log('🔍 Refresh token present:', !!refreshToken);
      
      // Extract user data from Google profile
      const userData = {
        id: profile.id,
        email: profile.emails?.[0]?.value || '',
        firstName: profile.name?.givenName || '',
        lastName: profile.name?.familyName || '',
        profileImageUrl: profile.photos?.[0]?.value || '',
      };

      // Special admin setup for ssa@ssasocial.com
      if (userData.email === 'ssa@ssasocial.com') {
        userData.role = 'admin';
        userData.monthlyGenerationLimit = -1; // Unlimited
        userData.plan = 'sselfie-studio';
        userData.mayaAiAccess = true;
        userData.victoriaAiAccess = true;
        console.log('👑 Setting admin privileges for ssa@ssasocial.com');
      }

      // Upsert user in database
      const user = await storage.upsertUser(userData);
      console.log('✅ User authenticated successfully:', user.id);
      
      return done(null, user);
    } catch (error) {
      console.error('❌ Google Auth error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        name: error.name,
        stack: error.stack
      });
      return done(error, null);
    }
  }));

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      console.log('🔍 Deserializing user with ID:', id);
      const user = await storage.getUser(id);
      if (!user) {
        console.log('⚠️ User not found during deserialization:', id);
        return done(null, false);
      }
      console.log('✅ User deserialized successfully:', user.id, user.email);
      done(null, user);
    } catch (error) {
      console.error('❌ Error deserializing user:', error);
      console.error('❌ Error details:', error.message, error.stack);
      done(null, false);
    }
  });

  // Auth routes
  app.get('/api/login', (req, res, next) => {
    console.log('🔍 Starting Google OAuth login');
    
    passport.authenticate('google', {
      scope: ['profile', 'email']
    })(req, res, next);
  });

  app.get('/api/auth/google/callback', 
    (req, res, next) => {
      console.log('🔍 Google callback received:', req.url);
      console.log('🔍 Query params:', req.query);
      
      passport.authenticate('google', { 
        failureRedirect: '/api/login?error=auth_failed',
        successRedirect: '/workspace'
      })(req, res, next);
    }
  );

  app.get("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error('❌ Logout error:', err);
        return res.status(500).json({ error: 'Logout failed' });
      }
      res.redirect('/');
    });
  });

  console.log('✅ Google Authentication enabled successfully');
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  console.log('🔍 Auth middleware check:');
  console.log('- req.isAuthenticated():', req.isAuthenticated?.());
  console.log('- req.user exists:', !!req.user);
  console.log('- req.user:', req.user);
  console.log('- req.session:', req.session);
  console.log('- req.sessionID:', req.sessionID);
  console.log('- cookies:', req.headers.cookie);

  if (!req.isAuthenticated?.() || !req.user) {
    console.log('❌ Authentication failed - unauthorized');
    return res.status(401).json({ message: "Unauthorized" });
  }

  console.log('✅ Authentication successful');
  return next();
};