import { ComponentType, lazy } from 'react';
import { createLazyComponent } from './components/Suspense';

type LazyComponent<P = {}> = ComponentType<P>;

interface LazyModules {
  SselfieAppLayout: LazyComponent;
  MayaPage: LazyComponent;
  SignInHandler: LazyComponent;
  PostLoginHandler: LazyComponent;
  BusinessLanding: LazyComponent;
  SimpleTraining: LazyComponent;
  SimpleCheckout: LazyComponent;
  EmbeddedCheckout: LazyComponent;
  PaymentSuccess: LazyComponent;
  ThankYou: LazyComponent;
  Terms: LazyComponent;
  Privacy: LazyComponent;
  AuthSuccessComponent: LazyComponent;
  NotFound: LazyComponent;
  SSELFIEGallery: LazyComponent;
  AICommandCenter: LazyComponent;
}

// Create lazy-loaded components with proper typings
export const lazyModules: LazyModules = {
  SselfieAppLayout: createLazyComponent(() => import("./app_v2/SselfieAppLayout.js"), 'SselfieAppLayout'),
  MayaPage: createLazyComponent(() => import("./pages/MayaPage.js"), 'MayaPage'),
  SignInHandler: createLazyComponent(() => import("./pages/handler/sign-in"), 'SignInHandler'),
  PostLoginHandler: createLazyComponent(() => import("./pages/handler/PostLoginHandler"), 'PostLoginHandler'),
  BusinessLanding: createLazyComponent(() => import("./pages/landing/business-landing"), 'BusinessLanding'),
  SimpleTraining: createLazyComponent(() => import("./pages/onboarding/simple-training"), 'SimpleTraining'),
  SimpleCheckout: createLazyComponent(() => import("./pages/simple-checkout"), 'SimpleCheckout'),
  EmbeddedCheckout: createLazyComponent(() => import("./pages/embedded-checkout"), 'EmbeddedCheckout'),
  PaymentSuccess: createLazyComponent(() => import("./pages/payment-success"), 'PaymentSuccess'),
  ThankYou: createLazyComponent(() => import("./pages/thank-you"), 'ThankYou'),
  Terms: createLazyComponent(() => import("./pages/legal/terms"), 'Terms'),
  Privacy: createLazyComponent(() => import("./pages/legal/privacy"), 'Privacy'),
  AuthSuccessComponent: createLazyComponent(() => import("./pages/auth-success"), 'AuthSuccess'),
  NotFound: createLazyComponent(() => import("./pages/not-found"), 'NotFound'),
  SSELFIEGallery: createLazyComponent(() => import("./pages/sselfie-gallery"), 'SSELFIEGallery'),
  AICommandCenter: createLazyComponent(() => import("./pages/AICommandCenter"), 'AICommandCenter')
};