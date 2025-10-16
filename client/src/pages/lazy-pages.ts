import { createLazyComponent } from '../components/Suspense';

// Core App Components
export const SselfieAppLayout = createLazyComponent(() => 
  import('../app_v2/SselfieAppLayout.js'), 'SselfieAppLayout');

export const MayaPage = createLazyComponent(() => 
  import('./MayaPage.js'), 'MayaPage');

// Auth Components
export const SignInHandler = createLazyComponent(() => 
  import('./pages/handler/sign-in'), 'SignInHandler');

export const PostLoginHandler = createLazyComponent(() => 
  import('./pages/handler/PostLoginHandler'), 'PostLoginHandler');

// Page Components
export const BusinessLanding = createLazyComponent(() => 
  import('./pages/landing/business-landing'), 'BusinessLanding');

export const SimpleTraining = createLazyComponent(() => 
  import('./pages/onboarding/simple-training'), 'SimpleTraining');

export const SimpleCheckout = createLazyComponent(() => 
  import('./pages/simple-checkout'), 'SimpleCheckout');

export const EmbeddedCheckout = createLazyComponent(() => 
  import('./pages/embedded-checkout'), 'EmbeddedCheckout');

export const PaymentSuccess = createLazyComponent(() => 
  import('./pages/payment-success'), 'PaymentSuccess');

export const ThankYou = createLazyComponent(() => 
  import('./pages/thank-you'), 'ThankYou');

export const Terms = createLazyComponent(() => 
  import('./pages/legal/terms'), 'Terms');

export const Privacy = createLazyComponent(() => 
  import('./pages/legal/privacy'), 'Privacy');

export const AuthSuccessComponent = createLazyComponent(() => 
  import('./pages/auth-success'), 'AuthSuccess');

export const NotFound = createLazyComponent(() => 
  import('./pages/not-found'), 'NotFound');

export const SSELFIEGallery = createLazyComponent(() => 
  import('./pages/sselfie-gallery'), 'SSELFIEGallery');

export const AICommandCenter = createLazyComponent(() => 
  import('./pages/AICommandCenter'), 'AICommandCenter');