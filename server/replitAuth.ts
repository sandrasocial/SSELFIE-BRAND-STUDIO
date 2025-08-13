import * as client from "openid-client";
import passport from "passport";
import { Strategy as OpenIDConnectStrategy } from "passport-openidconnect";
import session from "express-session";
import type { Express } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    try {
      console.log('🔍 OIDC Discovery starting...');
      
      const issuerUrl = process.env.ISSUER_URL ?? "https://replit.com/oidc";
      console.log(`🔍 Using OIDC issuer: ${issuerUrl}`);
      
      const config = await client.discovery(
        new URL(issuerUrl),
        process.env.REPL_ID!
      );
      console.log('✅ OIDC Discovery successful');
      return config;
    } catch (error: any) {
      console.error('❌ OIDC Discovery failed:', error.message);
      
      // Fallback manual configuration
      const issuerUrl = process.env.ISSUER_URL ?? "https://replit.com/oidc";
      
      const manualConfig = {
        issuer: issuerUrl,
        authorization_endpoint: `${issuerUrl}/authorize`,
        token_endpoint: `${issuerUrl}/token`,
        userinfo_endpoint: `${issuerUrl}/userinfo`,
        jwks_uri: `${issuerUrl}/jwks`,
        response_types_supported: ['code'],
        grant_types_supported: ['authorization_code', 'refresh_token'],
        scopes_supported: ['openid', 'email', 'profile'],
        metadata: {
          issuer: issuerUrl,
          authorization_endpoint: `${issuerUrl}/authorize`,
          token_endpoint: `${issuerUrl}/token`,
          userinfo_endpoint: `${issuerUrl}/userinfo`,
          jwks_uri: `${issuerUrl}/jwks`
        }
      };
      
      console.log('✅ Manual OIDC configuration created');
      return manualConfig as any;
    }
  },
  { maxAge: 3600 * 1000 }
);

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
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  // Get domains from environment
  const domains = process.env.REPLIT_DOMAINS!.split(",");
  
  // Add current development domain dynamically
  const devDomain = `${process.env.REPL_ID}-00-3ij9k7qy14rai.picard.replit.dev`;
  if (!domains.includes(devDomain)) {
    domains.push(devDomain);
    console.log(`🔧 Added development domain: ${devDomain}`);
  }
  
  app.locals.authDomains = domains;
  
  for (const domain of domains) {
    const callbackURL = `https://${domain}/api/callback`;
    
    console.log(`🔍 Registering OAuth strategy for domain: ${domain}`);
    console.log(`🔍 Callback URL: ${callbackURL}`);
      
    const strategy = new OpenIDConnectStrategy(
      {
        issuer: config.issuer || config.metadata?.issuer || "https://replit.com/oidc",
        authorizationURL: config.authorization_endpoint || config.metadata?.authorization_endpoint!,
        tokenURL: config.token_endpoint || config.metadata?.token_endpoint!,
        userInfoURL: config.userinfo_endpoint || config.metadata?.userinfo_endpoint!,
        clientID: process.env.REPL_ID!,
        clientSecret: process.env.REPL_ID!, // Replit uses REPL_ID for both
        callbackURL,
        scope: 'openid email profile offline_access'
      },
      async (issuer: any, profile: any, context: any, idToken: any, accessToken: any, refreshToken: any, verified: any) => {
        try {
          console.log('✅ OAuth callback received:', { 
            profileId: profile.id, 
            email: profile.emails?.[0]?.value 
          });
          
          const userClaims = {
            sub: profile.id,
            email: profile.emails?.[0]?.value,
            first_name: profile.name?.givenName,
            last_name: profile.name?.familyName,
            profile_image_url: profile.photos?.[0]?.value
          };
          
          const user = {
            claims: userClaims,
            access_token: accessToken,
            refresh_token: refreshToken
          };
          
          await upsertUser(userClaims);
          verified(null, user);
        } catch (error) {
          console.error('OAuth verification error:', error);
          verified(error);
        }
      }
    );
    
    // Set strategy name for domain-specific routing
    strategy.name = `replitauth:${domain}`;
    passport.use(strategy);
    console.log(`✅ Registered auth strategy for: ${domain}`);
  }

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

  // Login endpoint
  app.get("/api/login", (req, res, next) => {
    console.log('🔍 Login endpoint called:', {
      hostname: req.hostname,
      query: req.query,
      authDomains: app.locals.authDomains
    });

    const strategy = `replitauth:${req.hostname}`;
    console.log(`🔍 Using strategy: ${strategy}`);

    passport.authenticate(strategy, {
      scope: "openid email profile offline_access"
    })(req, res, next);
  });

  // Callback endpoint
  app.get("/api/callback", (req, res, next) => {
    console.log('🔍 Callback endpoint called:', {
      hostname: req.hostname,
      query: req.query
    });

    const strategy = `replitauth:${req.hostname}`;
    console.log(`🔍 Using callback strategy: ${strategy}`);

    passport.authenticate(strategy, (err: any, user: any) => {
      if (err) {
        console.error('❌ Authentication error:', err);
        return res.redirect('/');
      }
      
      if (!user) {
        console.error('❌ No user returned from authentication');
        return res.redirect('/');
      }

      req.logIn(user, (err: any) => {
        if (err) {
          console.error('❌ Login error:', err);
          return res.redirect('/');
        }
        
        console.log('✅ User successfully authenticated and logged in');
        res.redirect('/workspace');
      });
    })(req, res, next);
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
  
  console.log('❌ Authentication required, redirecting to login');
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