import session from "express-session";
import type { Express } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import passport from "passport";
import { Strategy as OAuth2Strategy } from "passport-oauth2";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

// NEW: Use Repl Identity - the 2025 working authentication method
function parseReplIdentity() {
  const replIdentity = process.env.REPL_IDENTITY;
  if (!replIdentity) {
    console.log('⚠️ No REPL_IDENTITY found - user not authenticated via Replit');
    return null;
  }
  
  try {
    // REPL_IDENTITY is a PASETO token containing user info
    // For now, we'll use a simplified approach since the format may be complex
    console.log('✅ REPL_IDENTITY token found:', replIdentity.substring(0, 50) + '...');
    return { hasIdentity: true, token: replIdentity };
  } catch (error) {
    console.error('❌ Error parsing REPL_IDENTITY:', error);
    return null;
  }
}

console.log('🔧 Using Repl Identity authentication system');

// Replit OAuth2 Configuration
const REPLIT_AUTH_CONFIG = {
  authorizationURL: '/@replit/auth',
  tokenURL: 'https://replit.com/api/oauth/token',
  userProfileURL: 'https://replit.com/api/oauth/userinfo'
};

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  const isSSELFIEDomain = process.env.REPLIT_DOMAINS?.includes('sselfie.ai') || false;
  const useSecureCookies = process.env.NODE_ENV === 'production' || isSSELFIEDomain;
  
  console.log('🔒 SESSION CONFIG:', {
    domain: process.env.REPLIT_DOMAINS,
    isSSELFIEDomain,
    useSecureCookies,
    sessionTtl: sessionTtl / (24 * 60 * 60 * 1000) + ' days'
  });

  const PgSession = connectPg(session);
  
  return session({
    store: new PgSession({
      conString: process.env.DATABASE_URL,
      tableName: 'session',
      createTableIfMissing: true,
    }),
    secret: process.env.REPL_ID!,
    resave: false,
    saveUninitialized: false,
    name: 'sselfie.session',
    cookie: {
      maxAge: sessionTtl,
      secure: useSecureCookies,
      httpOnly: true,
      sameSite: useSecureCookies ? 'none' : 'lax',
      domain: isSSELFIEDomain ? '.sselfie.ai' : undefined
    },
    rolling: true
  });
}

function updateUserSession(user: any, tokens: any) {
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = tokens.expires_at;
}

async function upsertUser(claims: any) {
  await storage.upsertUser({
    id: claims.sub,
    email: claims.email,
    firstName: claims.first_name,
    lastName: claims.last_name,
    profileImageUrl: claims.profile_image_url,
  } as any);
}

export async function setupAuth(app: Express) {
  console.log('🔧 Setting up Replit OAuth authentication (Standard OAuth2)...');
  
  app.set("trust proxy", 1);
  app.use(getSession());
  // Passport middleware - restored working authentication
  app.use(passport.initialize());
  app.use(passport.session());

  // Get domains from environment
  const domains = process.env.REPLIT_DOMAINS!.split(",");
  
  // Add current development domain dynamically
  const devDomain = `${process.env.REPL_ID}-00-3ij9k7qy14rai.picard.replit.dev`;
  if (!domains.includes(devDomain)) {
    domains.push(devDomain);
    console.log(`🔧 Added development domain: ${devDomain}`);
  }
  
  app.locals.authDomains = domains;
  
  // OAuth strategy configuration - restored working authentication
  for (const domain of domains) {
    const callbackURL = `https://${domain}/api/callback`;
    
    console.log(`🔍 Registering OAuth2 strategy for domain: ${domain}`);
    console.log(`🔍 Callback URL: ${callbackURL}`);
      
    const strategy = new OAuth2Strategy(
      {
        authorizationURL: REPLIT_AUTH_CONFIG.authorizationURL,
        tokenURL: REPLIT_AUTH_CONFIG.tokenURL,
        clientID: process.env.REPL_ID!,
        clientSecret: process.env.REPL_ID!, // Replit uses REPL_ID for both
        callbackURL,
        scope: ['openid', 'profile', 'email']
      },
      async (accessToken: string, refreshToken: string, profile: any, done: any) => {
        try {
          console.log('🔍 OAuth2 verification - fetching user profile...');
          
          // Fetch user profile from Replit Auth API
          const response = await fetch(REPLIT_AUTH_CONFIG.userProfileURL, {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to fetch user profile: ${response.status}`);
          }
          
          const userProfile = await response.json();
          console.log('✅ OAuth2 user profile received:', { 
            id: userProfile.id, 
            email: userProfile.email 
          });
          
          const userClaims = {
            sub: userProfile.id.toString(),
            email: userProfile.email,
            first_name: userProfile.firstName || userProfile.displayName?.split(' ')[0],
            last_name: userProfile.lastName || userProfile.displayName?.split(' ')[1],
            profile_image_url: userProfile.image
          };
          
          const user = {
            claims: userClaims,
            access_token: accessToken,
            refresh_token: refreshToken
          };
          
          await upsertUser(userClaims);
          done(null, user);
        } catch (error) {
          console.error('❌ OAuth2 verification error:', error);
          done(error);
        }
      }
    );
    
    // Set strategy name for domain-specific routing
    strategy.name = `replitauth:${domain}`;
    passport.use(strategy);
    console.log(`✅ Registered OAuth2 strategy for: ${domain}`);
  }

  // Passport serialization - restored working authentication
  passport.serializeUser((user: Express.User, cb) => {
    try {
      cb(null, user);
    } catch (error) {
      console.error('Passport serialize error:', error);
      cb(error);
    }
  });
  
  passport.deserializeUser((user: Express.User, cb) => {
    try {
      cb(null, user);
    } catch (error) {
      console.error('Passport deserialize error:', error);
      cb(null, false);
    }
  });

  // Login endpoint with fixed hostname resolution
  app.get("/api/login", (req, res, next) => {
    console.log('🔍 Login endpoint called:', {
      hostname: req.hostname,
      host: req.headers.host,
      query: req.query,
      authDomains: app.locals.authDomains
    });

    // Find matching strategy based on hostname or fallback
    let strategyDomain = req.hostname;
    
    // For localhost development, use first available domain
    if (req.hostname === 'localhost' || (req.hostname && req.hostname.includes('127.0.0.1'))) {
      strategyDomain = app.locals.authDomains[0];
      console.log(`🔍 Localhost detected, using fallback domain: ${strategyDomain}`);
    }
    
    // Check if domain has registered strategy
    if (!app.locals.authDomains.includes(strategyDomain)) {
      strategyDomain = app.locals.authDomains[0];
      console.log(`🔍 Domain not found, using fallback: ${strategyDomain}`);
    }

    const strategy = `replitauth:${strategyDomain}`;
    console.log(`🔍 Using OAuth2 strategy: ${strategy}`);

    try {
      // ZARA'S AUTHENTICATION FIX: Ensure response object exists before using
      if (!res || typeof res.status !== 'function') {
        console.error('❌ Invalid response object in authentication');
        return next(new Error('Invalid response object'));
      }
      
      // Restore working authentication
      passport.authenticate(strategy, { state: req.query.returnTo || '/workspace' })(req, res, next);
    } catch (error) {
      console.error('❌ Strategy authentication error:', error);
      if (res && typeof res.status === 'function' && !res.headersSent) {
        res.status(500).json({ error: 'Strategy configuration error', details: error.message });
      } else {
        next(error);
      }
    }
  });

  // Callback endpoint with proper hostname resolution
  app.get("/api/callback", (req, res, next) => {
    console.log('🔍 Callback endpoint called:', {
      hostname: req.hostname,
      host: req.headers.host,
      query: req.query,
      code: req.query.code,
      state: req.query.state,
      error: req.query.error
    });

    // Check for OAuth errors in callback
    if (req.query.error) {
      console.error('❌ OAuth callback error:', req.query.error, req.query.error_description);
      return res.redirect('/?error=oauth_failed');
    }

    // Find matching strategy (same logic as login)
    let strategyDomain = req.hostname;
    
    if (req.hostname === 'localhost' || (req.hostname && req.hostname.includes('127.0.0.1'))) {
      strategyDomain = app.locals.authDomains[0];
      console.log(`🔍 Callback localhost detected, using fallback domain: ${strategyDomain}`);
    }
    
    if (!app.locals.authDomains.includes(strategyDomain)) {
      strategyDomain = app.locals.authDomains[0];
      console.log(`🔍 Callback domain not found, using fallback: ${strategyDomain}`);
    }

    const strategy = `replitauth:${strategyDomain}`;
    console.log(`🔍 Using callback strategy: ${strategy}`);

    // Restore working authentication callback
    try {
      passport.authenticate(strategy, {
        successRedirect: req.query.state || '/workspace',
        failureRedirect: '/workspace?auth=failed'
      })(req, res, next);
    } catch (error) {
      console.error('❌ Passport authenticate error:', error);
      res.redirect('/workspace?auth=error');
    }
  });

  // User info endpoint
  app.get("/api/auth/user", async (req, res) => {
    try {
      console.log('🔍 Auth check - Session debug:', {
        hasSession: !!req.session,
        isAuthenticated: req.isAuthenticated?.(),
        hasPassport: !!req.session?.passport,
        passportUser: req.session?.passport?.user,
      });

      if (req.isAuthenticated?.() && req.session?.passport?.user) {
        const userSession = req.session.passport.user;
        
        // Check for claims in user session
        const userId = userSession.claims?.sub || userSession.id;
        if (userId) {
          console.log('✅ Found authenticated user, fetching user data for:', userId);
          
          const user = await storage.getUser(userId);
          if (user) {
            console.log('✅ User found:', user.email);
            return res.json({
              id: user.id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              profileImageUrl: user.profileImageUrl
            });
          }
        }
      }

      console.log('❌ User not authenticated or not found');
      res.status(401).json({ error: 'Not authenticated' });
    } catch (error) {
      console.error('❌ Auth check error:', error);
      res.status(500).json({ error: 'Authentication check failed' });
    }
  });

  // Logout endpoint
  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ error: 'Logout failed' });
      }
      
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destroy error:', err);
          return res.status(500).json({ error: 'Session cleanup failed' });
        }
        
        res.clearCookie('sselfie.session');
        res.json({ success: true });
      });
    });
  });

  console.log('✅ Authentication system setup complete');
}

// Authentication middleware
export function isAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated?.()) {
    return next();
  }
  
  console.log('❌ Authentication required, redirecting to home page');
  res.status(401).json({ 
    error: 'Authentication required',
    needsLogin: true 
  });
}

// Admin middleware  
export function isAdmin(req: any, res: any, next: any) {
  if (req.isAuthenticated?.()) {
    const userSession = req.session?.passport?.user;
    const email = userSession?.claims?.email || userSession?.email;
    
    if (email === 'ssa@ssasocial.com') {
      return next();
    }
  }
  
  console.log('❌ Admin access required');
  res.status(403).json({ error: 'Admin access required' });
}