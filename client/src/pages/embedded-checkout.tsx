import React, { useState, useEffect } from 'react';
import { Elements, EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useLocation } from 'wouter';
import { MemberNavigation } from '../components/member-navigation.js';
import { useAuth } from '../hooks/use-auth.js';
import { useEnhancedToast } from '../hooks/enhanced-toast.js';
import { getStripeConfig } from '../utils/env-config.js';
import { CheckoutErrorBoundary } from '../components/checkout-error-boundary.js';

// SSELFIE Style Guide Variables
const STYLE_GUIDE = {
  colors: {
    stone: {
      50: '#fafaf9',
      100: '#f5f5f4', 
      200: '#e7e5e4',
      300: '#d6d3d1',
      400: '#a8a29e',
      500: '#78716c',
      600: '#57534e',
      700: '#44403c',
      800: '#292524',
      900: '#1c1917',
      950: '#0c0a09'
    }
  },
  typography: {
    serif: '"Times New Roman", serif',
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  spacing: {
    xs: '4px',
    sm: '8px', 
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
    huge: '64px'
  },
  borderRadius: {
    sm: '6px',
    md: '8px',
    lg: '12px'
  }
};

// Initialize Stripe with configuration validation
const getStripePromise = () => {
  try {
    const stripeConfig = getStripeConfig();
    if (!stripeConfig?.publicKey) {
      console.error('Stripe configuration invalid');
      return null;
    }
    return loadStripe(stripeConfig.publicKey);
  } catch (error) {
    console.error('Failed to initialize Stripe:', error);
    return null;
  }
};

const stripePromise = getStripePromise();

interface EmbeddedCheckoutPageProps {
  clientSecret?: string;
}

// Embedded Checkout Component with SSELFIE Styling
function SSELFIEEmbeddedCheckout({ clientSecret }: EmbeddedCheckoutPageProps) {
  const [, setLocation] = useLocation();
  
  const handleComplete = () => {
    console.log('🎉 Payment completed successfully');
    setLocation('/payment-success');
  };

  if (!clientSecret) {
    return (
      <div style={{ 
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: STYLE_GUIDE.colors.stone[50]
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: `3px solid ${STYLE_GUIDE.colors.stone[200]}`,
            borderTop: `3px solid ${STYLE_GUIDE.colors.stone[900]}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ 
            fontFamily: STYLE_GUIDE.typography.sans,
            fontSize: '14px',
            color: STYLE_GUIDE.colors.stone[600]
          }}>
            Preparing your secure payment...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id="embedded-checkout" style={{
      background: 'transparent',
      border: 'none',
      borderRadius: STYLE_GUIDE.borderRadius.lg
    }}>
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ 
          clientSecret,
          onComplete: handleComplete
        }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}

// Main Embedded Checkout Page
export default function EmbeddedCheckoutPage() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const toast = useEnhancedToast();
  const [clientSecret, setClientSecret] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Get email from URL params or authenticated user
  const urlParams = new URLSearchParams(window.location.search);
  const emailFromUrl = urlParams.get('email');
  const planFromUrl = urlParams.get('plan') || 'sselfie-studio';
  
  const customerEmail = isAuthenticated ? user?.email : emailFromUrl;

  useEffect(() => {
    if (!customerEmail) {
      toast.showErrorToast('Email required for payment processing');
      setLocation('/simple-checkout');
      return;
    }

    createEmbeddedCheckoutSession();
  }, [customerEmail]);

  const createEmbeddedCheckoutSession = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/create-embedded-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: planFromUrl,
          customerEmail,
          successUrl: `${window.location.origin}/payment-success?plan=${planFromUrl}`,
          cancelUrl: `${window.location.origin}/simple-checkout`
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create checkout session');
      }

      setClientSecret(data.client_secret);
      setLoading(false);
    } catch (err) {
      console.error('Embedded checkout session error:', err);
      setError(err instanceof Error ? err.message : 'Payment setup failed');
      setLoading(false);
      toast.showErrorToast('Unable to initialize payment. Please try again.');
    }
  };

  // Error state
  if (error) {
    return (
      <CheckoutErrorBoundary>
        <div style={{ 
          minHeight: '100vh',
          background: STYLE_GUIDE.colors.stone[50],
          fontFamily: STYLE_GUIDE.typography.sans
        }}>
          <MemberNavigation />
          
          <div style={{
            maxWidth: '600px',
            margin: '0 auto',
            padding: STYLE_GUIDE.spacing.xxl,
            textAlign: 'center'
          }}>
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: STYLE_GUIDE.borderRadius.lg,
              padding: STYLE_GUIDE.spacing.xl,
              marginBottom: STYLE_GUIDE.spacing.lg
            }}>
              <h2 style={{
                fontFamily: STYLE_GUIDE.typography.serif,
                fontSize: '24px',
                fontWeight: 200,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#dc2626',
                marginBottom: STYLE_GUIDE.spacing.md
              }}>
                Payment Setup Error
              </h2>
              <p style={{
                color: '#991b1b',
                marginBottom: STYLE_GUIDE.spacing.lg
              }}>
                {error}
              </p>
              <button
                onClick={() => setLocation('/simple-checkout')}
                style={{
                  background: STYLE_GUIDE.colors.stone[900],
                  color: '#ffffff',
                  border: 'none',
                  padding: `${STYLE_GUIDE.spacing.md} ${STYLE_GUIDE.spacing.xl}`,
                  fontSize: '12px',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  borderRadius: STYLE_GUIDE.borderRadius.md
                }}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </CheckoutErrorBoundary>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh',
        background: STYLE_GUIDE.colors.stone[50],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: `4px solid ${STYLE_GUIDE.colors.stone[200]}`,
            borderTop: `4px solid ${STYLE_GUIDE.colors.stone[900]}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 24px'
          }} />
          <p style={{
            fontFamily: STYLE_GUIDE.typography.sans,
            fontSize: '16px',
            color: STYLE_GUIDE.colors.stone[600]
          }}>
            Setting up your secure payment...
          </p>
        </div>
      </div>
    );
  }

  return (
    <CheckoutErrorBoundary>
      <div style={{ 
        minHeight: '100vh',
        background: STYLE_GUIDE.colors.stone[50],
        fontFamily: STYLE_GUIDE.typography.sans
      }}>
        <MemberNavigation />
        
        {/* Header Section */}
        <header style={{ 
          textAlign: 'center', 
          padding: `${STYLE_GUIDE.spacing.huge} ${STYLE_GUIDE.spacing.lg} ${STYLE_GUIDE.spacing.xl}`
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{
              fontFamily: STYLE_GUIDE.typography.serif,
              fontSize: 'clamp(36px, 6vw, 48px)',
              fontWeight: 200,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: STYLE_GUIDE.colors.stone[950],
              marginBottom: STYLE_GUIDE.spacing.md,
              lineHeight: 0.9
            }}>
              Complete Your Order
            </h1>
            
            <p style={{
              fontSize: '18px',
              color: STYLE_GUIDE.colors.stone[600],
              lineHeight: 1.6,
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Secure payment powered by Stripe. Your personal AI model training begins immediately after payment.
            </p>
          </div>
        </header>

        {/* Payment Section */}
        <main style={{ 
          maxWidth: '800px', 
          margin: '0 auto', 
          padding: `0 ${STYLE_GUIDE.spacing.lg} ${STYLE_GUIDE.spacing.huge}`
        }}>
          
          {/* Order Summary */}
          <div style={{
            background: '#ffffff',
            border: `1px solid ${STYLE_GUIDE.colors.stone[200]}`,
            borderRadius: STYLE_GUIDE.borderRadius.lg,
            padding: STYLE_GUIDE.spacing.xl,
            marginBottom: STYLE_GUIDE.spacing.xl,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{
              fontFamily: STYLE_GUIDE.typography.serif,
              fontSize: '20px',
              fontWeight: 200,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: STYLE_GUIDE.colors.stone[900],
              marginBottom: STYLE_GUIDE.spacing.lg
            }}>
              Order Summary
            </h2>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: STYLE_GUIDE.spacing.md
            }}>
              <div>
                <div style={{
                  fontSize: '16px',
                  fontWeight: 500,
                  color: STYLE_GUIDE.colors.stone[900],
                  marginBottom: '4px'
                }}>
                  SSELFIE STUDIO
                </div>
                <div style={{
                  fontSize: '14px',
                  color: STYLE_GUIDE.colors.stone[600]
                }}>
                  Personal AI model + Maya AI photographer + 100 monthly photos
                </div>
              </div>
              <div style={{
                fontSize: '24px',
                fontWeight: 300,
                color: STYLE_GUIDE.colors.stone[950]
              }}>
                €47/month
              </div>
            </div>
            
            <div style={{
              borderTop: `1px solid ${STYLE_GUIDE.colors.stone[200]}`,
              paddingTop: STYLE_GUIDE.spacing.md,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{
                fontSize: '16px',
                fontWeight: 500,
                color: STYLE_GUIDE.colors.stone[800]
              }}>
                Total Today
              </span>
              <span style={{
                fontSize: '28px',
                fontWeight: 200,
                color: STYLE_GUIDE.colors.stone[950]
              }}>
                €47
              </span>
            </div>
          </div>

          {/* Embedded Checkout */}
          <div style={{
            background: '#ffffff',
            border: `1px solid ${STYLE_GUIDE.colors.stone[200]}`,
            borderRadius: STYLE_GUIDE.borderRadius.lg,
            padding: STYLE_GUIDE.spacing.xl,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{
              fontFamily: STYLE_GUIDE.typography.serif,
              fontSize: '20px',
              fontWeight: 200,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: STYLE_GUIDE.colors.stone[900],
              marginBottom: STYLE_GUIDE.spacing.lg
            }}>
              Payment Information
            </h2>
            
            <SSELFIEEmbeddedCheckout clientSecret={clientSecret} />
          </div>

          {/* Security Notice */}
          <div style={{
            textAlign: 'center',
            marginTop: STYLE_GUIDE.spacing.xl,
            padding: STYLE_GUIDE.spacing.lg,
            fontSize: '13px',
            color: STYLE_GUIDE.colors.stone[500]
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <span style={{ fontSize: '16px' }}>🔒</span>
              <span>256-bit SSL encryption • Secure payment powered by Stripe</span>
            </div>
            <p>Cancel anytime with one click. No long-term commitment required.</p>
          </div>
        </main>

        {/* CSS Animation */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          /* Responsive Design */
          @media (max-width: 768px) {
            header {
              padding-left: 16px !important;
              padding-right: 16px !important;
            }
            
            main {
              padding-left: 16px !important;
              padding-right: 16px !important;
            }
            
            #embedded-checkout {
              padding: 16px !important;
            }
          }
          
          /* Stripe Embedded Checkout Container Styling */
          .StripeElement {
            border-radius: ${STYLE_GUIDE.borderRadius.md} !important;
          }
        `}</style>
      </div>
    </CheckoutErrorBoundary>
  );
}