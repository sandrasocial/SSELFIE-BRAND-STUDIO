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
    try {
      console.log('🔍 OIDC Discovery - ISSUER_URL:', process.env.ISSUER_URL ?? "https://replit.com/oidc");
      console.log('🔍 OIDC Discovery - REPL_ID:', process.env.REPL_ID);
      
      // Use manual OIDC configuration - discovery is failing
      const issuerUrl = process.env.ISSUER_URL ?? "https://replit.com/oidc";
      
      console.log('🔄 Using manual OIDC configuration due to discovery issues...');
      
      // Based on Replit's blog post, use the original /oidc path with fallback
      console.log('🔄 Attempting OIDC discovery with multiple issuer URLs...');
      
      // First try: Original /oidc path (from environment or default)
      try {
        const config = await client.discovery(
          new URL(issuerUrl),
          process.env.REPL_ID!
        );
        console.log('✅ Success with', issuerUrl);
        return config;
      } catch (oidcError) {
        console.log('❌ Failed with', issuerUrl, '- Error:', oidcError.message);
        
        // Second try: Root domain (as mentioned in blog post)
        try {
          const config = await client.discovery(
            new URL("https://replit.com"),
            process.env.REPL_ID!
          );
          console.log('✅ Success with https://replit.com issuer');
          return config;
        } catch (rootError) {
          console.error('❌ All OIDC discovery attempts failed');
          console.error('- OIDC path error:', oidcError.message);
          console.error('- Root domain error:', rootError.message);
          
          // This suggests a network or configuration issue
          throw new Error(`OIDC Discovery failed: ${rootError.message}`);
        }
      }
      
      console.log('✅ Manual OIDC Config created');
      console.log('🔍 Token endpoint:', manualConfig.token_endpoint);
      console.log('🔍 Auth endpoint:', manualConfig.authorization_endpoint);
      console.log('🔍 Issuer:', manualConfig.issuer);
      
      return manualConfig;
    } catch (error) {
      console.error('❌ OIDC Discovery failed:', error);
      throw error;
    }
  },
  { maxAge: 3600 * 1000 }
);

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
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: 'lax', // Essential for cross-browser compatibility
      maxAge: sessionTtl,
      domain: undefined, // Let browsers handle domain automatically
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
  try {
    console.log('🔍 Upserting user with claims:', {
      id: claims["sub"],
      email: claims["email"],
      firstName: claims["first_name"],
      lastName: claims["last_name"],
      profileImageUrl: claims["profile_image_url"],
    });
    
    const userData = {
      id: claims["sub"],
      email: claims["email"],
      firstName: claims["first_name"],
      lastName: claims["last_name"],
      profileImageUrl: claims["profile_image_url"],
    };
    
    const upsertedUser = await storage.upsertUser(userData);
    console.log('✅ User upserted successfully:', upsertedUser.id);
    
    // Initialize user usage for new users
    try {
      const existingUsage = await storage.getUserUsage(upsertedUser.id);
      if (!existingUsage) {
        console.log('🔍 Initializing user usage for new user');
        await storage.createUserUsage({
          userId: upsertedUser.id,
          plan: 'free',
          monthlyGenerationsAllowed: 5,
          monthlyGenerationsUsed: 0,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        });
        console.log('✅ User usage initialized successfully');
      }
    } catch (usageError) {
      console.error('⚠️ User usage initialization error (non-fatal):', usageError);
      // Don't throw - this shouldn't block authentication
    }
  } catch (error) {
    console.error('❌ upsertUser error:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Error stack:', error.stack);
    throw error;
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
    try {
      console.log('🔍 Auth verify function called');
      console.log('🔍 Token response type:', typeof tokens);
      console.log('🔍 Available token methods:', Object.getOwnPropertyNames(tokens));
      
      const claims = tokens.claims();
      console.log('🔍 User claims:', JSON.stringify(claims, null, 2));
      
      const user = {};
      updateUserSession(user, tokens);
      console.log('🔍 User session updated');
      
      await upsertUser(claims);
      console.log('🔍 User upserted successfully');
      
      verified(null, user);
    } catch (error) {
      console.error('❌ Auth verify error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        status: error.status,
        stack: error.stack?.substring(0, 500)
      });
      verified(error, null);
    }
  };

  // Configure OAuth strategies for all domains
  const domains = [...new Set(process.env.REPLIT_DOMAINS!.split(",").map(d => d.trim()))];
  
  for (const cleanDomain of domains) {
    console.log('🔍 Setting up auth strategy for domain:', cleanDomain);
    console.log('🔍 Callback URL will be:', `https://${cleanDomain}/api/callback`);
    
    const strategy = new Strategy(
      {
        name: `replitauth:${cleanDomain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${cleanDomain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
    console.log('✅ Auth strategy created:', `replitauth:${cleanDomain}`);
  }
  
  // Add localhost strategy for development
  const devStrategy = new Strategy(
    {
      name: `replitauth:localhost`,
      config,
      scope: "openid email profile offline_access", 
      callbackURL: `http://localhost:5000/api/callback`,
    },
    verify,
  );
  passport.use(devStrategy);

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    const hostname = req.hostname === 'localhost' ? 'localhost' : req.hostname;
    console.log('🔍 Login attempt - hostname:', hostname);
    console.log('🔍 Request URL:', req.url);
    console.log('🔍 Request headers host:', req.headers.host);
    console.log('🔍 Available auth strategies:', Object.keys(passport._strategies));
    console.log('🔍 Looking for strategy:', `replitauth:${hostname}`);
    
    // Check if strategy exists for this hostname
    if (!passport._strategies[`replitauth:${hostname}`]) {
      console.error(`❌ No auth strategy found for hostname: ${hostname}`);
      console.error('Available strategies:', Object.keys(passport._strategies));
      return res.status(500).json({ 
        error: 'Authentication not configured for this domain',
        hostname: hostname,
        availableStrategies: Object.keys(passport._strategies)
      });
    }
    
    passport.authenticate(`replitauth:${hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    const hostname = req.hostname === 'localhost' ? 'localhost' : req.hostname;
    
    console.log('🔍 OAuth callback - hostname:', hostname);
    console.log('🔍 Callback query params:', req.query);
    
    passport.authenticate(`replitauth:${hostname}`, (err, user, info) => {
      if (err) {
        console.error('❌ Authentication error:', err.message || err);
        return res.redirect('/api/login?error=auth_error');
      }
      
      if (!user) {
        console.error('❌ Authentication failed:', info?.message || 'No user returned');
        return res.redirect('/api/login?error=no_user');
      }
      
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          console.error('❌ Login error:', loginErr.message || loginErr);
          return res.redirect('/api/login?error=login_failed');
        }
        
        console.log('✅ Authentication successful, redirecting to workspace');
        return res.redirect('/workspace');
      });
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  // Debug authentication state
  console.log('🔍 Auth middleware check:');
  console.log('- req.isAuthenticated exists:', typeof req.isAuthenticated);
  console.log('- req.isAuthenticated():', req.isAuthenticated ? req.isAuthenticated() : 'N/A');
  console.log('- req.user exists:', !!req.user);
  console.log('- user.expires_at:', user?.expires_at);

  if (!req.isAuthenticated || !req.isAuthenticated() || !user?.expires_at) {
    console.log('❌ Authentication failed - redirecting to login');
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
