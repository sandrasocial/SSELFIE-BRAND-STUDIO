#!/usr/bin/env node

/**
 * Validation script for SSELFIE authentication flow
 * Checks that all components and routes are properly configured
 */

const fs = require('fs');
const path = require('path');

const projectRoot = '/home/runner/work/SSELFIE-BRAND-STUDIO/SSELFIE-BRAND-STUDIO';

console.log('🔍 Validating SSELFIE Authentication Flow...\n');

// Check 1: Verify all route components exist
console.log('📁 Checking route components:');
const requiredComponents = [
  'client/src/pages/auth-success.tsx',
  'client/src/pages/handler/sign-in.tsx',
  'client/src/pages/landing/business-landing.tsx',
  'client/src/pages/onboarding/simple-training.tsx',
  'client/src/pages/simple-checkout.tsx',
  'client/src/pages/embedded-checkout.tsx',
  'client/src/pages/payment-success.tsx',
  'client/src/pages/thank-you.tsx',
  'client/src/pages/legal/terms.tsx',
  'client/src/pages/legal/privacy.tsx',
  'client/src/pages/not-found.tsx',
  'client/src/pages/sselfie-gallery.tsx',
  'client/features/MagicLinkSignInPage.tsx',
  'client/features/MyForgotPassword.tsx',
  'client/features/ResetPasswordPage.tsx',
  'client/src/app_v2/SselfieAppLayout.tsx',
  'client/src/components/SafeStackSignIn.tsx',
  'client/src/components/PageLoader.tsx',
  'client/src/components/ErrorBoundary.tsx',
  'client/src/hooks/use-auth.ts',
  'stack/client.ts',
  'stack/server.ts'
];

let allComponentsExist = true;
for (const component of requiredComponents) {
  const fullPath = path.join(projectRoot, component);
  const exists = fs.existsSync(fullPath);
  console.log(exists ? `  ✅ ${component}` : `  ❌ MISSING: ${component}`);
  if (!exists) allComponentsExist = false;
}

// Check 2: Verify Stack Auth URLs are consistent
console.log('\n🔗 Checking Stack Auth URL configuration:');
const clientConfigPath = path.join(projectRoot, 'stack/client.ts');
const serverConfigPath = path.join(projectRoot, 'stack/server.ts');

const clientConfig = fs.readFileSync(clientConfigPath, 'utf-8');
const serverConfig = fs.readFileSync(serverConfigPath, 'utf-8');

const checkUrl = (config, name, url) => {
  const regex = new RegExp(`${name}:\\s*["']([^"']+)["']`);
  const match = config.match(regex);
  if (match) {
    const found = match[1];
    const matches = found === url;
    console.log(matches ? 
      `  ✅ ${name}: "${found}"` : 
      `  ⚠️ ${name}: "${found}" (expected: "${url}")`
    );
    return matches;
  } else {
    console.log(`  ❌ ${name}: not found`);
    return false;
  }
};

console.log('Client configuration:');
const clientUrlsCorrect = [
  checkUrl(clientConfig, 'afterSignIn', '/auth-success'),
  checkUrl(clientConfig, 'afterSignUp', '/auth-success'),
  checkUrl(clientConfig, 'afterSignOut', '/'),
  checkUrl(clientConfig, 'oauthCallback', '/handler/oauth-callback')
].every(x => x);

console.log('Server configuration:');
const serverUrlsCorrect = [
  checkUrl(serverConfig, 'afterSignIn', '/auth-success'),
  checkUrl(serverConfig, 'afterSignUp', '/auth-success'),
  checkUrl(serverConfig, 'afterSignOut', '/')
].every(x => x);

// Check 3: Verify App.tsx has all critical routes
console.log('\n🛣️ Checking App.tsx routes:');
const appTsxPath = path.join(projectRoot, 'client/src/App.tsx');
const appTsx = fs.readFileSync(appTsxPath, 'utf-8');

const criticalRoutes = [
  '/auth-success',
  '/handler/sign-in',
  '/handler/sign-up',
  '/handler/oauth-callback',
  '/handler/:path*',
  '/magic-link',
  '/forgot-password',
  '/password-reset',
  '/',
  '/business',
  '/simple-training',
  '/simple-checkout',
  '/app'
];

let allRoutesPresent = true;
for (const route of criticalRoutes) {
  const routePattern = route.replace('/', '\\/').replace('*', '\\*').replace(':', '\\:');
  const regex = new RegExp(`path=["']${routePattern}["']`);
  const exists = regex.test(appTsx);
  console.log(exists ? `  ✅ ${route}` : `  ❌ MISSING: ${route}`);
  if (!exists) allRoutesPresent = false;
}

// Check 4: Verify SmartHome and HandlerRoutes exist
console.log('\n🧩 Checking critical components in App.tsx:');
const criticalComponents = [
  'SmartHome',
  'HandlerRoutes',
  'ProtectedRouteWrapper',
  'Router'
];

let allComponentsInApp = true;
for (const component of criticalComponents) {
  const regex = new RegExp(`function ${component}`);
  const exists = regex.test(appTsx);
  console.log(exists ? `  ✅ ${component}` : `  ❌ MISSING: ${component}`);
  if (!exists) allComponentsInApp = false;
}

// Check 5: Verify SafeStackSignIn redirects to SmartHome
console.log('\n🔄 Checking redirect logic:');
const safeStackSignInPath = path.join(projectRoot, 'client/src/components/SafeStackSignIn.tsx');
const safeStackSignIn = fs.readFileSync(safeStackSignInPath, 'utf-8');

const redirectsToHome = /window\.location\.replace\(["']\/["']\)/.test(safeStackSignIn);
const redirectsToApp = /window\.location\.replace\(["']\/app["']\)/.test(safeStackSignIn);

if (redirectsToHome) {
  console.log('  ✅ SafeStackSignIn redirects to / (SmartHome) ✓');
} else if (redirectsToApp) {
  console.log('  ⚠️ SafeStackSignIn redirects to /app (should redirect to /)');
} else {
  console.log('  ⚠️ SafeStackSignIn redirect logic not found');
}

// Final summary
console.log('\n' + '='.repeat(60));
console.log('📊 VALIDATION SUMMARY:');
console.log('='.repeat(60));
console.log(`✅ All components exist: ${allComponentsExist ? 'YES' : 'NO'}`);
console.log(`✅ Stack Auth URLs correct: ${clientUrlsCorrect && serverUrlsCorrect ? 'YES' : 'NO'}`);
console.log(`✅ All routes present: ${allRoutesPresent ? 'YES' : 'NO'}`);
console.log(`✅ Critical components in App.tsx: ${allComponentsInApp ? 'YES' : 'NO'}`);
console.log(`✅ Redirect logic correct: ${redirectsToHome ? 'YES' : 'NO'}`);
console.log('='.repeat(60));

const allValid = allComponentsExist && clientUrlsCorrect && serverUrlsCorrect && 
                 allRoutesPresent && allComponentsInApp && redirectsToHome;

if (allValid) {
  console.log('\n🎉 Authentication flow validation PASSED!');
  console.log('✅ All checks passed. The authentication flow should work correctly.\n');
  process.exit(0);
} else {
  console.log('\n⚠️ Authentication flow validation FAILED!');
  console.log('❌ Some checks failed. Please review the issues above.\n');
  process.exit(1);
}
