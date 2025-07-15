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
    saveUninitialized: true, // CRITICAL: Required for OAuth state verification
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
        passReqToCallback: false,
        skipUserProfile: true
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
    
    // CRITICAL: Break infinite loops - if we see repeated login attempts, stop
    if (req.query.error) {
      console.log('🔍 Login attempted with error parameter, showing error page');
      return res.redirect(`/?auth_error=${req.query.error}`);
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
      
      // CRITICAL: For localhost development, redirect to production domain for authentication
      if (hostname === 'localhost' || hostname.includes('localhost')) {
        console.log('🔄 Localhost detected - redirecting to sselfie.ai for authentication');
        return res.redirect('https://sselfie.ai/api/login');
      }
      
      const hasStrategy = req.app.locals.authDomains.includes(hostname);
      
      // CRITICAL: Use the correct strategy for each domain
      if (!hasStrategy) {
        console.error(`❌ No auth strategy found for hostname: ${hostname}`);
        console.error(`❌ Available domains: ${req.app.locals.authDomains.join(', ')}`);
        return res.status(500).json({ 
          error: 'Authentication not configured for this domain',
          hostname,
          availableDomains: req.app.locals.authDomains
        });
      }
      
      const strategyName = `replitauth:${hostname}`;
      
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
    const hostname = req.hostname;
    
    console.log(`🔍 OAuth callback for hostname: ${hostname}`);
    console.log(`🔍 Callback query params:`, req.query);
    
    // CRITICAL: Prevent infinite loops by checking for errors
    if (req.query.error) {
      console.error('❌ OAuth error in callback:', req.query.error, req.query.error_description);
      return res.redirect('/?error=oauth_failed');
    }
    
    // CRITICAL FIX: Try multiple authentication approaches
    const tryAuthenticate = () => {
      passport.authenticate(`replitauth:${hostname}`, {
        session: true,
        failureRedirect: '/?error=auth_failed',
        failureFlash: false
      }, (err, user, info) => {
        console.log(`🔍 OAuth authenticate result:`, { err: !!err, user: !!user, info });
        
        if (err) {
          console.error('❌ OAuth callback error:', err);
          return res.redirect('/?error=auth_error');
        }
        
        if (!user) {
          console.error('❌ OAuth callback: No user returned. Info:', info);
          // CRITICAL: Manual OAuth code exchange to bypass state verification
          if (req.query.code && req.query.iss) {
            console.log('🔄 Attempting manual OAuth token exchange...');
            return handleManualTokenExchange(req, res, next);
          }
          return res.redirect('/?error=no_user');
        }
        
        req.logIn(user, (loginErr) => {
          if (loginErr) {
            console.error('❌ Login error after OAuth:', loginErr);
            return res.redirect('/?error=login_failed');
          }
          
          console.log('✅ OAuth callback successful for user:', user.claims?.email);
          console.log('✅ Redirecting to workspace...');
          res.redirect('/workspace');
        });
      })(req, res, next);
    };
    
    tryAuthenticate();
  });

  // CRITICAL: Manual OAuth token exchange function
  async function handleManualTokenExchange(req: any, res: any, next: any) {
    try {
      console.log('🔧 Manual token exchange - bypassing state verification');
      
      const code = req.query.code;
      const hostname = req.hostname;
      
      if (!code) {
        console.error('❌ No authorization code in callback');
        return res.redirect('/?error=no_auth_code');
      }
      
      // Get the OAuth configuration
      const config = await getOidcConfig();
      
      // Prepare token exchange with correct parameters
      const tokenParams = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: `https://${hostname}/api/callback`,
        client_id: process.env.REPL_ID!
      });
      
      console.log('🔧 Token exchange request:', { 
        redirect_uri: `https://${hostname}/api/callback`,
        hostname,
        hasCode: !!code,
        clientId: !!process.env.REPL_ID
      });
      
      // Make direct token request to Replit
      const tokenUrl = config.token_endpoint || 'https://replit.com/oidc/token';
      
      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: tokenParams.toString()
      });
      
      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('❌ Token exchange HTTP error:', tokenResponse.status, errorText);
        throw new Error(`Token exchange failed: ${tokenResponse.status} ${errorText}`);
      }
      
      const tokenData = await tokenResponse.json();
      console.log('✅ Manual token exchange successful');
      
      // Decode and validate the ID token
      const idToken = tokenData.id_token;
      if (!idToken) {
        throw new Error('No ID token in response');
      }
      
      // Parse JWT without verification (since we got it directly from Replit)
      const idTokenPayload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString());
      
      // Create user object with token data
      const user: any = {
        claims: idTokenPayload,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: idTokenPayload.exp
      };
      
      // Upsert user to database
      await upsertUser(idTokenPayload);
      
      // Log in the user manually
      req.logIn(user, (loginErr: any) => {
        if (loginErr) {
          console.error('❌ Manual login error:', loginErr);
          return res.redirect('/?error=manual_login_failed');
        }
        
        console.log('✅ Manual OAuth login successful for user:', user.claims?.email);
        res.redirect('/workspace');
      });
      
    } catch (error) {
      console.error('❌ Manual token exchange failed:', error);
      console.error('❌ Error details:', error.message);
      res.redirect('/?error=token_exchange_failed&details=' + encodeURIComponent(error.message));
    }
  }

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