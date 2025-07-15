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
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Dynamic based on environment
      maxAge: sessionTtl,
      sameSite: 'lax',
      domain: process.env.NODE_ENV === 'production' ? '.sselfie.ai' : undefined, // Allow subdomains in production
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

  // Register strategies for all domains (including localhost for development)
  const domains = process.env.REPLIT_DOMAINS!.split(",");
  
  // Add localhost for development if not already included
  if (!domains.includes('localhost') && process.env.NODE_ENV === 'development') {
    domains.push('localhost');
  }
  
  // Make domains available in the route handlers
  app.locals.authDomains = domains;
  
  for (const domain of domains) {
    const callbackURL = domain === 'localhost' 
      ? `http://localhost:5000/api/callback`
      : `https://${domain}/api/callback`;
      
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
      
      // Special handling for development
      if (hostname === 'localhost' || hostname.includes('localhost')) {
        hostname = 'localhost';
      }
      
      console.log(`🔍 Login requested for hostname: ${hostname}`);
      console.log(`🔍 Available strategies: ${req.app.locals.authDomains.join(', ')}`);
      
      // Check if we have a strategy for this hostname
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
      
      passport.authenticate(strategyName, authOptions)(req, res, next);
    }
    
    // Start authentication flow
    authenticateUser();
  });

  app.get("/api/callback", (req, res, next) => {
    let hostname = req.hostname;
    
    // Special handling for development
    if (hostname === 'localhost' || hostname.includes('localhost')) {
      hostname = 'localhost';
    }
    
    console.log(`🔍 OAuth callback for hostname: ${hostname}`);
    
    passport.authenticate(`replitauth:${hostname}`, {
      successRedirect: `${req.protocol}://${req.get('host')}/workspace`,
      failureRedirect: `${req.protocol}://${req.get('host')}/api/login`,
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

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};