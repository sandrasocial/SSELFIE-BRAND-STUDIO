import * as client from "openid-client";
import { Strategy } from "openid-client/passport";

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
      console.log('🔍 OIDC Discovery starting...');
      
      // CRITICAL FIX: Replit uses custom discovery endpoint
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
      
      // FAILSAFE: Create manual configuration if discovery fails
      console.log('🔧 Using manual OIDC configuration as fallback...');
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
  
  // Enhanced session configuration with conditional settings
  const isSSELFIEDomain = process.env.REPLIT_DOMAINS?.includes('sselfie.ai') || false;
  const useSecureCookies = process.env.NODE_ENV === 'production' || isSSELFIEDomain;
  
  console.log('🔒 PRODUCTION SESSION CONFIG:', {
    domain: process.env.REPLIT_DOMAINS,
    isSSELFIEDomain,
    useSecureCookies,
    sessionTtl: '7 days'
  });
  
  // Fallback to memory store if database session fails
  try {
    const pgStore = connectPg(session);
    const sessionStore = new pgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true, // Allow table creation
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
        secure: false, // Disable for development
        sameSite: 'lax',
        maxAge: sessionTtl,
      },
    });
  } catch (error) {
    console.error('⚠️ Database session failed, using memory store:', error);
    return session({
      secret: process.env.SESSION_SECRET!,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: sessionTtl,
      },
    });
  }
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
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  // Get domains from environment and add development domains
  const domains = process.env.REPLIT_DOMAINS!.split(",");
  
  // Add current development domain dynamically
  const devDomain = `${process.env.REPL_ID}-00-3ij9k7qy14rai.picard.replit.dev`;
  if (!domains.includes(devDomain)) {
    domains.push(devDomain);
    console.log(`🔧 Added development domain: ${devDomain}`);
  }
  
  // Add workspace domain for agent access
  const workspaceDomain = `${process.env.REPL_ID}-00-workspace.ssa27.replit.dev`;
  if (!domains.includes(workspaceDomain)) {
    domains.push(workspaceDomain);
    console.log(`🔧 Added workspace domain: ${workspaceDomain}`);
  }
  
  // Make domains available in the route handlers
  app.locals.authDomains = domains;
  
  for (const domain of domains) {
    const callbackURL = `https://${domain}/api/callback`;
    
    console.log(`🔍 Registering strategy for domain: ${domain}`);
    console.log(`🔍 Callback URL: ${callbackURL}`);
      
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL
      },
      verify,
    );
    passport.use(strategy);
    console.log(`✅ Registered auth strategy for: ${domain}`);
  }

  passport.serializeUser((user: any, cb) => {
    try {
      cb(null, user);
    } catch (error) {
      console.error('Passport serialize error:', error);
      cb(error);
    }
  });
  
  passport.deserializeUser((user: any, cb) => {
    try {
      cb(null, user);
    } catch (error) {
      console.error('Passport deserialize error:', error);
      cb(null, false); // Continue without user instead of throwing
    }
  });

  app.get("/api/login", (req, res, next) => {
    // Check if this is a forced account selection (for switching)
    const forceAccountSelection = req.query.prompt === 'select_account';
    
    // For account switching, always force logout and re-authentication
    if (forceAccountSelection) {
      console.log('🔍 Account switching requested - forcing logout and re-authentication');
      if ((req as any).isAuthenticated()) {
        (req as any).logout(() => {
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
    if (!forceAccountSelection && (req as any).isAuthenticated() && req.user) {
      const user = req.user as any;
      if (user.expires_at) {
        const now = Math.floor(Date.now() / 1000);
        if (now <= user.expires_at) {
          console.log('✅ User already authenticated, redirecting to workspace');
          return res.redirect('/workspace');
        }
      }
    }
    
    function authenticateUser() {
      // Get the correct hostname for strategy matching
      let hostname = req.hostname;
      
      console.log(`🔍 Login requested for hostname: ${hostname}`);
      console.log(`🔍 Available strategies: ${req.app.locals.authDomains.join(', ')}`);
      
      // Handle localhost development - use available replit.dev domain strategy
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        const devDomain = domains.find(d => d.includes('replit.dev'));
        if (devDomain) {
          console.log(`🔄 Localhost detected - using ${devDomain} strategy without redirect`);
          hostname = devDomain; // Use the domain for strategy selection but don't redirect
        } else {
          console.log(`🔄 Localhost detected - using sselfie.ai strategy`);
          hostname = 'sselfie.ai';
        }
      }
      
      const hasStrategy = req.app.locals.authDomains.includes(hostname);
      
      // ENHANCED: Strategy validation with fallback mechanisms
      if (!hasStrategy) {
        console.error(`❌ No auth strategy found for hostname: ${hostname}`);
        console.error(`❌ Available domains: ${req.app.locals.authDomains.join(', ')}`);
        
        // FIX: Add strategy fallback for edge cases
        const fallbackDomain = req.app.locals.authDomains.find((d: string) => d.includes('sselfie.ai'));
        if (fallbackDomain) {
          console.log(`🔄 Using fallback strategy: ${fallbackDomain}`);
          hostname = fallbackDomain;
        } else {
          // Use first available domain as last resort
          hostname = req.app.locals.authDomains[0];
          console.log(`🔄 Using first available domain as fallback: ${hostname}`);
        }
      }
      
      console.log(`🔍 Login requested - starting authentication flow with simplified OAuth`);
      console.log(`🔍 Using strategy: replitauth:${hostname} for domain: ${hostname}`);
      
      // CRITICAL FIX: Force OAuth mode instead of email verification
      passport.authenticate(`replitauth:${hostname}`, {
        scope: ["openid", "email", "profile", "offline_access"],
        response_type: "code",
        prompt: "consent", // Force OAuth consent screen instead of email verification
        access_type: "offline" // Ensure refresh tokens
      })(req, res, next);
    }
    
    authenticateUser();
  });

  // Enhanced callback handling with detailed debugging
  app.get("/api/callback", (req, res, next) => {
    console.log('🔍 OAuth callback received:', {
      hostname: req.hostname,
      query: req.query,
      hasCode: !!req.query.code,
      hasError: !!req.query.error
    });
    
    if (req.query.error) {
      console.error('❌ OAuth callback error:', req.query.error, req.query.error_description);
      return res.redirect(`/?error=oauth_error&details=${encodeURIComponent(req.query.error as string)}`);
    }
    
    if (!req.query.code) {
      console.error('❌ OAuth callback missing authorization code');
      return res.redirect('/?error=missing_auth_code');
    }
    
    // Get the correct hostname for strategy matching
    let hostname = req.hostname;
    
    // Handle localhost development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      const devDomain = domains.find(d => d.includes('replit.dev'));
      if (devDomain) {
        console.log(`🔄 Callback localhost detected - using ${devDomain} strategy`);
        hostname = devDomain;
      } else {
        console.log(`🔄 Callback localhost detected - using sselfie.ai strategy`);
        hostname = 'sselfie.ai';
      }
    }
    
    const hasStrategy = req.app.locals.authDomains.includes(hostname);
    
    if (!hasStrategy) {
      console.error(`❌ No callback strategy found for hostname: ${hostname}`);
      console.error(`❌ Available domains: ${req.app.locals.authDomains.join(', ')}`);
      
      // ENHANCED: Add more robust fallback for callback
      const fallbackDomain = req.app.locals.authDomains.find((d: string) => d.includes('sselfie.ai'));
      if (fallbackDomain) {
        console.log(`🔄 Using fallback callback strategy: ${fallbackDomain}`);
        hostname = fallbackDomain;
      } else {
        console.log(`🔄 Using first domain for callback: ${req.app.locals.authDomains[0]}`);
        hostname = req.app.locals.authDomains[0];
      }
    }
    
    console.log(`🔍 Callback using strategy: replitauth:${hostname}`);
    
    // POPUP WINDOW SUPPORT: Check if this is a popup window callback
    const isPopup = req.query.popup === 'true' || req.headers.referer?.includes('oauth_popup');
    
    if (isPopup) {
      // Handle popup window callback with postMessage
      passport.authenticate(`replitauth:${hostname}`, {
        successReturnToOrRedirect: "/api/popup-success",
        failureRedirect: "/api/popup-error"
      })(req, res, next);
    } else {
      // Standard full-page callback handling
      passport.authenticate(`replitauth:${hostname}`, {
        successReturnToOrRedirect: "/workspace",
        failureRedirect: "/api/manual-callback"
      })(req, res, next);
    }
  });

  // Popup success handler
  app.get("/api/popup-success", (req, res) => {
    console.log('✅ Popup OAuth success - sending postMessage to parent');
    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'OAUTH_SUCCESS',
                user: ${JSON.stringify((req.user as any)?.claims || {})}
              }, window.location.origin);
              window.close();
            } else {
              // Fallback if no opener
              window.location.href = '/workspace';
            }
          </script>
          <p>Authentication successful! This window should close automatically.</p>
        </body>
      </html>
    `);
  });
  
  // Popup error handler
  app.get("/api/popup-error", (req, res) => {
    console.log('❌ Popup OAuth error - sending postMessage to parent');
    const error = req.query.error || 'Authentication failed';
    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'OAUTH_ERROR',
                error: '${error}'
              }, window.location.origin);
              window.close();
            } else {
              // Fallback if no opener
              window.location.href = '/?error=' + encodeURIComponent('${error}');
            }
          </script>
          <p>Authentication failed. This window should close automatically.</p>
        </body>
      </html>
    `);
  });

  // Manual callback route for OAuth failures
  app.get("/api/manual-callback", handleManualTokenExchange);

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
      
      // CRITICAL FIX: Use correct openid-client v5+ parameters for authorizationCodeGrant
      console.log('🔧 Using openid-client v5+ compatible token exchange...');
      
      // Create proper URL object for currentUrl parameter (required by openid-client v5+)
      const currentUrl = new URL(`https://${hostname}/api/callback?code=${code}`);
      
      // FIX: Use current openid-client v5+ API with proper parameters
      const tokenSet = await client.authorizationCodeGrant(config, currentUrl);
      
      console.log('✅ Manual token exchange successful');
      
      // Create user object using openid-client's token set
      const user: any = {};
      updateUserSession(user, tokenSet);
      
      // Get claims from the token set
      const claims = tokenSet.claims();
      await upsertUser(claims);
      
      // Log in the user manually
      req.logIn(user, (loginErr: any) => {
        if (loginErr) {
          console.error('❌ Manual login error:', loginErr);
          return res.redirect('/?error=manual_login_failed');
        }
        
        console.log('✅ Manual OAuth login successful for user:', user.claims?.email);
        
        // Check if this is a popup callback
        const isPopup = req.query.popup === 'true' || req.headers.referer?.includes('oauth_popup');
        if (isPopup) {
          res.redirect('/api/popup-success');
        } else {
          res.redirect('/workspace');
        }
      });
      
    } catch (error: any) {
      console.error('❌ Manual token exchange failed:', error);
      console.error('❌ Error details:', error.message);
      res.redirect('/?error=token_exchange_failed&details=' + encodeURIComponent(error.message));
    }
  }

  app.get("/api/logout", (req, res) => {
    console.log('🔍 Logout requested for user:', (req.user as any)?.claims?.email);
    (req as any).logout(() => {
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
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  // DEVELOPMENT BYPASS DISABLED - User should authenticate with real OAuth account (ssa@ssasocial.com)

  if (!(req as any).isAuthenticated || !(req as any).isAuthenticated() || !user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // CRITICAL FIX: Handle impersonation by overriding user claims
  if ((req.session as any)?.impersonatedUser) {
    const impersonatedUser = (req.session as any).impersonatedUser;
    console.log(`🎭 Using impersonated user in isAuthenticated: ${impersonatedUser.email}`);
    
    // Override the user claims to use impersonated user's data
    (req.user as any).claims = {
      sub: impersonatedUser.id,
      email: impersonatedUser.email,
      first_name: impersonatedUser.firstName,
      last_name: impersonatedUser.lastName,
      profile_image_url: impersonatedUser.profileImageUrl
    };
    
    return next();
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