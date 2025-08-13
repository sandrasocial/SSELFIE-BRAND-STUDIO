import { Route, Switch, Redirect } from "wouter";
import { lazy, Suspense } from 'react';
import ProtectedRoute from '../guards/ProtectedRoute';
import TierGuard from '../guards/TierGuard';

// STEP 1: TRAIN - AI Model Creation (All Tiers)
const Workspace = lazy(() => import('../pages/workspace'));
const SimpleTraining = lazy(() => import('../pages/simple-training'));
const Onboarding = lazy(() => import('../pages/onboarding'));

// STEP 2: STYLE - Image Generation (All Tiers)  
const Maya = lazy(() => import('../pages/maya'));
const AIGenerator = lazy(() => import('../pages/ai-generator'));
const SSELFIEGallery = lazy(() => import('../pages/sselfie-gallery'));

// STEP 3: SHOOT - Professional Prompts (All Tiers)
const AIPhotoshoot = lazy(() => import('../pages/ai-photoshoot'));
const CustomPhotoshootLibrary = lazy(() => import('../pages/custom-photoshoot-library'));
const FlatlayLibrary = lazy(() => import('../pages/flatlay-library'));

// STEP 4: BUILD - Website Creation (Entrepreneur Tier €67)
const Victoria = lazy(() => import('../pages/victoria'));
const VictoriaChat = lazy(() => import('../pages/victoria-chat'));
const VictoriaBuilder = lazy(() => import('../pages/victoria-builder'));
const VictoriaPreview = lazy(() => import('../pages/victoria-preview'));
const Build = lazy(() => import('../pages/build'));
const PhotoSelection = lazy(() => import('../pages/photo-selection'));
const BrandOnboarding = lazy(() => import('../pages/brand-onboarding'));

// STEP 5: MANAGE - Business Dashboard (Future)
// const Dashboard = lazy(() => import('../pages/dashboard'));
// const Bookings = lazy(() => import('../pages/bookings'));

// User Profile & Settings
const Profile = lazy(() => import('../pages/profile'));

// Payment Flow
const Checkout = lazy(() => import('../pages/checkout'));
const SimpleCheckout = lazy(() => import('../pages/simple-checkout'));
const PaymentSuccess = lazy(() => import('../pages/payment-success'));
const ThankYou = lazy(() => import('../pages/thank-you'));
const Welcome = lazy(() => import('../pages/welcome'));
const AuthSuccess = lazy(() => import('../pages/auth-success'));
const SwitchAccount = lazy(() => import('../pages/switch-account'));

// Loading component
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full" />
    </div>
  );
}

export default function MemberRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Switch>
        {/* PAYMENT FLOW */}
        <Route path="/checkout" component={Checkout} />
        <Route path="/simple-checkout" component={SimpleCheckout} />
        <Route path="/welcome" component={Welcome} />
        <Route path="/thank-you" component={ThankYou} />
        <Route path="/payment-success" component={PaymentSuccess} />
        <Route path="/auth-success" component={AuthSuccess} />
        <Route path="/switch-account" component={SwitchAccount} />

        {/* STEP 1: TRAIN - AI Model Creation (All Tiers) */}
        <Route path="/workspace" component={(props) => <ProtectedRoute component={Workspace} {...props} />} />
        <Route path="/studio" component={(props) => <ProtectedRoute component={Workspace} {...props} />} />
        <Route path="/onboarding" component={(props) => <ProtectedRoute component={Onboarding} {...props} />} />
        <Route path="/ai-training" component={(props) => <ProtectedRoute component={SimpleTraining} {...props} />} />
        <Route path="/simple-training" component={(props) => <ProtectedRoute component={SimpleTraining} {...props} />} />

        {/* STEP 2: STYLE - Image Generation (All Tiers) */}
        <Route path="/maya" component={(props) => <ProtectedRoute component={Maya} {...props} />} />
        <Route path="/ai-generator" component={(props) => <ProtectedRoute component={AIGenerator} {...props} />} />
        <Route path="/gallery" component={(props) => <ProtectedRoute component={SSELFIEGallery} {...props} />} />
        <Route path="/sselfie-gallery" component={(props) => <ProtectedRoute component={SSELFIEGallery} {...props} />} />

        {/* STEP 3: SHOOT - Professional Prompts (All Tiers) */}
        <Route path="/ai-photoshoot" component={(props) => <ProtectedRoute component={AIPhotoshoot} {...props} />} />
        <Route path="/custom-photoshoot-library" component={(props) => <ProtectedRoute component={CustomPhotoshootLibrary} {...props} />} />
        <Route path="/flatlay-library" component={(props) => <ProtectedRoute component={FlatlayLibrary} {...props} />} />
        <Route path="/flatlays" component={() => <ProtectedRoute component={() => <Redirect to="/flatlay-library" />} />} />

        {/* STEP 4: BUILD - Website Creation (Entrepreneur Tier €67) */}
        <Route path="/victoria" component={(props) => (
          <ProtectedRoute component={(componentProps) => (
            <TierGuard requiredTier="entrepreneur">
              <Victoria {...componentProps} />
            </TierGuard>
          )} {...props} />
        )} />
        <Route path="/victoria-chat" component={(props) => (
          <ProtectedRoute component={(componentProps) => (
            <TierGuard requiredTier="entrepreneur">
              <VictoriaChat {...componentProps} />
            </TierGuard>
          )} {...props} />
        )} />
        <Route path="/victoria-builder" component={(props) => (
          <ProtectedRoute component={(componentProps) => (
            <TierGuard requiredTier="entrepreneur">
              <VictoriaBuilder {...componentProps} />
            </TierGuard>
          )} {...props} />
        )} />
        <Route path="/victoria-preview" component={(props) => (
          <ProtectedRoute component={(componentProps) => (
            <TierGuard requiredTier="entrepreneur">
              <VictoriaPreview {...componentProps} />
            </TierGuard>
          )} {...props} />
        )} />
        <Route path="/build" component={(props) => (
          <ProtectedRoute component={(componentProps) => (
            <TierGuard requiredTier="entrepreneur">
              <Build {...componentProps} />
            </TierGuard>
          )} {...props} />
        )} />
        <Route path="/photo-selection" component={(props) => (
          <ProtectedRoute component={(componentProps) => (
            <TierGuard requiredTier="entrepreneur">
              <PhotoSelection {...componentProps} />
            </TierGuard>
          )} {...props} />
        )} />
        <Route path="/brand-onboarding" component={(props) => (
          <ProtectedRoute component={(componentProps) => (
            <TierGuard requiredTier="entrepreneur">
              <BrandOnboarding {...componentProps} />
            </TierGuard>
          )} {...props} />
        )} />

        {/* STEP 5: MANAGE - Business Dashboard (Future Implementation) */}
        {/* <Route path="/dashboard" component={(props) => <ProtectedRoute component={Dashboard} {...props} />} /> */}
        {/* <Route path="/bookings" component={(props) => <ProtectedRoute component={Bookings} {...props} />} /> */}

        {/* USER PROFILE & SETTINGS */}
        <Route path="/profile" component={(props) => <ProtectedRoute component={Profile} {...props} />} />
      </Switch>
    </Suspense>
  );
}