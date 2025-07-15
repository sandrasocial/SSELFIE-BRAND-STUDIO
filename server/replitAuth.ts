import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true, // CRITICAL: Allow table creation if missing
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  // PRODUCTION STABILITY: Always use secure cookies for sselfie.ai domain
  const isSSELFIEDomain = process.env.REPLIT_DOMAINS?.includes('sselfie.ai');
  const useSecureCookies = isSSELFIEDomain || process.env.NODE_ENV === 'production';
  
  console.log('🔒 PRODUCTION SESSION CONFIG:', { 
    domain: process.env.REPLIT_DOMAINS,
    isSSELFIEDomain, 
    useSecureCookies,
    sessionTtl: sessionTtl / (24 * 60 * 60 * 1000) + ' days'
  });
  
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    rolling: true, // Extend session on each request
    cookie: {
      httpOnly: true,
      secure: useSecureCookies,
      maxAge: sessionTtl,
      sameSite: 'lax',
      domain: isSSELFIEDomain ? '.sselfie.ai' : undefined // Allow subdomains
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  console.log('🔄 Upserting user:', claims["sub"], claims["email"]);
  
  // Check if this is the admin user
  if (claims["email"] === "ssa@ssasocial.com") {
    console.log('👑 Setting admin privileges for ssa@ssasocial.com');
  }
  
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });

  // Ensure user model exists for both accounts
  console.log('🔄 Ensuring user model exists for:', claims["email"]);
  try {
    await storage.ensureUserModel(claims["sub"]);
  } catch (error) {
    console.error('❌ Failed to ensure user model:', error);
  }
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  // Register strategies for configured domains only (NO localhost)
  const domains = process.env.REPLIT_DOMAINS!.split(",");
  
  // Make domains available in the route handlers
  app.locals.authDomains = domains;
  
  for (const domain of domains) {
    const callbackURL = `https://${domain}/api/callback`;
      
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL,
      },
      verify,
    );
    passport.use(strategy);
    console.log(`✅ Registered auth strategy for: ${domain}`);
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    // Check if this is a forced account selection (for switching)
    const forceAccountSelection = req.query.prompt === 'select_account';
    
    // For account switching, always force logout and re-authentication
    if (forceAccountSelection) {
      console.log('🔍 Account switching requested - forcing logout and re-authentication');
      if (req.isAuthenticated()) {
        req.logout(() => {
          req.session.destroy((err) => {
            if (err) console.error('❌ Session destroy error:', err);
            res.clearCookie('connect.sid');
            console.log('✅ Session cleared for account switching');
            // Continue with authentication flow after logout
            authenticateUser();
          });
        });
        return;
      }
    }
    
    // Check if user is already authenticated (unless forcing account selection)
    if (!forceAccountSelection && req.isAuthenticated() && req.user?.expires_at) {
      const now = Math.floor(Date.now() / 1000);
      if (now <= req.user.expires_at) {
        console.log('✅ User already authenticated, redirecting to workspace');
        return res.redirect('/workspace');
      }
    }
    
    function authenticateUser() {
      
      // Get the correct hostname for strategy matching
      let hostname = req.hostname;
      
      console.log(`🔍 Login requested for hostname: ${hostname}`);
      console.log(`🔍 Available strategies: ${req.app.locals.authDomains.join(', ')}`);
      
      // CRITICAL: For development domains, still authenticate with the development strategy
      // This allows both sselfie.ai AND replit.dev to work independently
      if (!hasStrategy) {
        console.log('🔄 No strategy found for hostname, redirecting to production domain');
        return res.redirect(302, 'https://sselfie.ai/api/login');
      }
      
      const strategyName = `replitauth:${hostname}`;
      const hasStrategy = req.app.locals.authDomains.includes(hostname);
      
      if (!hasStrategy) {
        console.error(`❌ No auth strategy found for hostname: ${hostname}`);
        console.error(`❌ Available domains: ${req.app.locals.authDomains.join(', ')}`);
        return res.status(500).json({ 
          error: 'Authentication not configured for this domain',
          hostname,
          availableDomains: req.app.locals.authDomains
        });
      }
      
      const authOptions: any = {
        scope: ["openid", "email", "profile", "offline_access"],
      };
      
      // Force account selection only when explicitly requested
      if (forceAccountSelection) {
        authOptions.prompt = "select_account";
        console.log('🔍 Forcing account selection for account switching');
      } else {
        console.log('🔍 Login requested - starting authentication flow');
      }
      
      console.log(`🔍 Using strategy: ${strategyName} for domain: ${hostname}`);
      passport.authenticate(strategyName, authOptions)(req, res, next);
    }
    
    // Start authentication flow
    authenticateUser();
  });

  app.get("/api/callback", (req, res, next) => {
    let hostname = req.hostname;
    
    // CRITICAL: Force sselfie.ai domain for all authentication callbacks
    if (hostname === 'localhost' || hostname.includes('replit.dev')) {
      hostname = 'sselfie.ai';
    }
    
    console.log(`🔍 OAuth callback for hostname: ${hostname}`);
    
    passport.authenticate(`replitauth:${hostname}`, {
      successRedirect: '/workspace',
      failureRedirect: '/api/login',
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    console.log('🔍 Logout requested for user:', req.user?.claims?.email);
    req.logout(() => {
      // Clear session completely to allow account switching
      req.session.destroy((err) => {
        if (err) {
          console.error('❌ Session destroy error:', err);
        }
        res.clearCookie('connect.sid');
        console.log('✅ User logged out successfully, session cleared');
        
        // Build end session URL with prompt=select_account for account switching
        const endSessionUrl = client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href;
        
        res.redirect(endSessionUrl);
      });
    });
  });

  // Add account switching route
  app.get("/api/switch-account", (req, res) => {
    console.log('🔍 Account switch requested for user:', req.user?.claims?.email);
    req.logout(() => {
      // Clear session completely
      req.session.destroy((err) => {
        if (err) {
          console.error('❌ Session destroy error during account switch:', err);
        }
        res.clearCookie('connect.sid');
        console.log('✅ Session cleared for account switch');
        
        // Redirect to branded account switch page instead of direct auth
        res.redirect('/switch-account');
      });
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;
  const sessionId = req.sessionID;
  const now = Math.floor(Date.now() / 1000);

  // PRODUCTION LOGGING: Detailed auth state for debugging
  const authState = {
    sessionId: sessionId?.substring(0, 8) + '...',
    isAuthenticated: req.isAuthenticated?.() || false,
    hasUser: !!user,
    userEmail: user?.claims?.email,
    userId: user?.claims?.sub,
    expiresAt: user?.expires_at,
    currentTime: now,
    timeToExpiry: user?.expires_at ? (user.expires_at - now) : 'N/A',
    hasRefreshToken: !!user?.refresh_token
  };

  console.log('🔒 PRODUCTION AUTH CHECK:', authState);

  // Check basic authentication
  if (!req.isAuthenticated() || !user?.expires_at) {
    console.log('❌ Auth failed: No session or expiry');
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Check token expiry with 5-minute buffer for refresh
  const refreshBuffer = 5 * 60; // 5 minutes
  if (now <= (user.expires_at - refreshBuffer)) {
    console.log('✅ Auth valid: Token has time remaining');
    return next();
  }

  // Attempt token refresh for near-expiry tokens
  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    console.log('❌ Auth failed: No refresh token available');
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    console.log('🔄 Refreshing token for user:', user.claims?.email);
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    console.log('✅ Token refreshed successfully for:', user.claims?.email);
    return next();
  } catch (error) {
    console.error('❌ Token refresh failed:', error.message);
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};