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
      console.error('❌ Error stack:', error.stack);
      verified(error, null);
    }
  };

  for (const domain of process.env
    .REPLIT_DOMAINS!.split(",")) {
    const cleanDomain = domain.trim();
    console.log('🔍 Setting up auth strategy for domain:', cleanDomain);
    
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
    console.log('🔍 Available auth strategies:', Object.keys(passport._strategies));
    console.log('🔍 Looking for strategy:', `replitauth:${hostname}`);
    
    passport.authenticate(`replitauth:${hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    const hostname = req.hostname === 'localhost' ? 'localhost' : req.hostname;
    
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
