import { createLazyComponent } from '../components/Suspense';

// Core App Components
export const SselfieAppLayout = createLazyComponent(() => 
  import('../app_v2/SselfieAppLayout.js'), 'SselfieAppLayout');

export const MayaPage = createLazyComponent(() => 
  import('./MayaPage.js'), 'MayaPage');

// Auth Components
export const SignInHandler = createLazyComponent(() =>
  import('./handler/sign-in'), 'SignInHandler');

export const PostLoginHandler = createLazyComponent(() =>
  import('./handler/PostLoginHandler'), 'PostLoginHandler');

// Page Components
export const BusinessLanding = createLazyComponent(() =>
  import('./landing/business-landing'), 'BusinessLanding');

export const SimpleTraining = createLazyComponent(() =>
  import('./onboarding/simple-training'), 'SimpleTraining');

export const SimpleCheckout = createLazyComponent(() =>
  import('./simple-checkout'), 'SimpleCheckout');

export const EmbeddedCheckout = createLazyComponent(() =>
  import('./embedded-checkout'), 'EmbeddedCheckout');

export const PaymentSuccess = createLazyComponent(() =>
  import('./payment-success'), 'PaymentSuccess');

export const ThankYou = createLazyComponent(() =>
  import('./thank-you'), 'ThankYou');

export const Terms = createLazyComponent(() =>
  import('./legal/terms'), 'Terms');

export const Privacy = createLazyComponent(() =>
  import('./legal/privacy'), 'Privacy');

export const AuthSuccessComponent = createLazyComponent(() =>
  import('./auth-success'), 'AuthSuccess');

export const NotFound = createLazyComponent(() =>
  import('./not-found'), 'NotFound');

export const SSELFIEGallery = createLazyComponent(() =>
  import('./sselfie-gallery'), 'SSELFIEGallery');

export const AICommandCenter = createLazyComponent(() =>
  import('./AICommandCenter'), 'AICommandCenter');