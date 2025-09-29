import { useState, useEffect } from 'react';
import { MemberNavigation } from '../components/member-navigation.js';
import { CheckoutErrorBoundary } from '../components/checkout-error-boundary.js';
import { CheckoutLoading, PaymentProgressIndicator } from '../components/ui/checkout-loading.js';
import { PaymentConfirmationModal, PaymentConfirmationData, UserData } from '../components/ui/payment-confirmation-modal.js';
import { useEnhancedToast } from "../hooks/enhanced-toast.js";
import { useAuth } from '../hooks/use-auth.js';
import { useLocation } from 'wouter';
import { PaymentSuccessService, handlePaymentSuccess } from '../services/payment-success.js';
import { 
  validateEmailRealtime, 
  validateCheckoutForm, 
  type CheckoutFormData,
  type CheckoutValidationResult
} from '../utils/checkout-validation.js';
import { 
  checkoutApiRequest, 
  checkNetworkConnectivity,
  classifyError
} from '../utils/api-client.js';
import { 
  getStripeConfig, 
  logConfigurationStatus,
  ConfigurationError
} from '../utils/env-config.js';

type ProcessingStep = 'idle' | 'validation' | 'processing' | 'complete';
type PaymentStatus = 'pre-payment' | 'processing' | 'success' | 'error';

export default function SimpleCheckout() {
  const toast = useEnhancedToast();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  
  // State management
  const [email, setEmail] = useState('');
  const [processingStep, setProcessingStep] = useState<ProcessingStep>('idle');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pre-payment');
  const [emailValidation, setEmailValidation] = useState<{
    isValid: boolean;
    status: 'valid' | 'invalid' | 'empty' | 'incomplete';
    message?: string;
  }>({ isValid: false, status: 'empty', message: '' });
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [networkConnected, setNetworkConnected] = useState(true);
  const [configurationValid, setConfigurationValid] = useState(true);
  const [userData, setUserData] = useState<UserData>({ isAuthenticated: false });

  // Configuration
  const plan = 'sselfie-studio';
  const amount = 47;
  const isProcessing = processingStep !== 'idle';

  // Initialize configuration check
  useEffect(() => {
    logConfigurationStatus();
    
    try {
      const stripeConfig = getStripeConfig();
      if (!stripeConfig) {
        setConfigurationValid(false);
        toast.showConfigurationErrorToast();
      }
    } catch (error) {
      setConfigurationValid(false);
      toast.showConfigurationErrorToast();
    }

    // Check network connectivity
    checkNetworkConnectivity().then(setNetworkConnected);
  }, []);

  // Check for payment success from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const planParam = urlParams.get('plan');
    const emailParam = urlParams.get('email');

    if (status === 'success') {
      console.log('🎉 Payment success detected from URL');
      
      // Set modal to success state
      setPaymentStatus('success');
      setShowConfirmationModal(true);
      
      // Pre-fill form with returned data
      if (emailParam) setEmail(emailParam);
      
      // Clean URL
      window.history.replaceState({}, '', '/simple-checkout');
    }
  }, []);

  // Real-time email validation
  useEffect(() => {
    if (email) {
      const validation = validateEmailRealtime(email);
      setEmailValidation(validation);
    } else {
      setEmailValidation({ isValid: false, status: 'empty', message: '' });
    }
  }, [email]);

  // Initialize user data for payment modal
  useEffect(() => {
    const initUserData = async () => {
      const data = await PaymentSuccessService.getUserData(isAuthenticated, user);
      setUserData(data);
    };

    initUserData();
  }, [isAuthenticated, user]);

  // Enhanced form validation
  const validateForm = (): CheckoutValidationResult => {
    const formData: CheckoutFormData = {
      email: email.trim(),
      amount,
      plan
    };
    
    return validateCheckoutForm(formData);
  };

  // Enhanced checkout handler with better error handling
  const handleStripeCheckout = async () => {
    // Pre-validation
    const validation = validateForm();
    
    if (!validation.isValid) {
      const firstError = Object.entries(validation.errors)[0];
      if (firstError) {
        toast.showValidationToast(firstError[0], firstError[1]);
      }
      return;
    }

    // Show email suggestions if any
    if (validation.suggestions?.email) {
      toast.showWarningToast(
        `Did you mean ${validation.suggestions.email[0]}?`
      );
      return;
    }

    // Check configuration
    if (!configurationValid) {
      toast.showConfigurationErrorToast();
      return;
    }

    // Check network connectivity
    if (!networkConnected) {
      toast.showNetworkErrorToast(() => handleStripeCheckout());
      return;
    }

    // Show confirmation modal
    setShowConfirmationModal(true);
  };

  // Confirmed checkout process - Enhanced with modal flow
  const handleConfirmedCheckout = async () => {
    setPaymentStatus('processing');
    setProcessingStep('validation');
    
    try {
      // Store email for auto-registration
      localStorage.setItem('checkout-email', email);
      
      setProcessingStep('processing');

      // Create Stripe checkout session with modal success URL
      const successUrl = `${window.location.origin}/checkout?status=success&plan=${plan}&email=${encodeURIComponent(email)}`;
      const cancelUrl = `${window.location.origin}/simple-checkout`;

      const data = await checkoutApiRequest("/api/create-checkout-session", "POST", {
        plan,
        customerEmail: email,
        successUrl,
        cancelUrl,
      });

      console.log('🔍 Checkout response:', data);
      
      if (data.url) {
        setProcessingStep('complete');
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received from server');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setProcessingStep('idle');
      setPaymentStatus('error');
      
      const classification = classifyError(error as Error);
      
      if (classification.type === 'network') {
        toast.showNetworkErrorToast(() => handleConfirmedCheckout());
      } else {
        toast.showPaymentErrorToast(error as Error, () => handleConfirmedCheckout());
      }
    }
  };

  // Enhanced test payment handler
  const handleTestPayment = async () => {
    const validation = validateForm();
    
    if (!validation.isValid) {
      const firstError = Object.entries(validation.errors)[0];
      if (firstError) {
        toast.showValidationToast(firstError[0], firstError[1]);
      }
      return;
    }
    
    setProcessingStep('validation');
    
    try {
      localStorage.setItem('checkout-email', email);
      
      setProcessingStep('processing');
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setProcessingStep('complete');
      
      toast.showPaymentSuccessToast();
      
      setTimeout(() => {
        setLocation(`/payment-success?plan=${plan}&email=${encodeURIComponent(email)}`);
      }, 1500);
    } catch (error) {
      console.error('Test payment error:', error);
      setProcessingStep('idle');
      toast.showErrorToast('Test payment failed. Please try again.');
    }
  };

  // Handle continue from success modal
  const handleSuccessContinue = async () => {
    const result = await handlePaymentSuccess({
      plan,
      email,
      userId: userData.isAuthenticated ? user?.id : undefined,
      isModal: true
    });

    if (result.success && result.redirectPath) {
      setShowConfirmationModal(false);
      
      // Small delay for UX
      setTimeout(() => {
        if (result.redirectPath?.startsWith('http')) {
          window.location.href = result.redirectPath;
        } else {
          setLocation(result.redirectPath);
        }
      }, 500);
    } else {
      // Fallback to legacy page if service fails
      setLocation(`/payment-success?plan=${plan}&email=${encodeURIComponent(email)}`);
    }
  };

  // Get email input styling based on validation state
  const getEmailInputStyle = () => {
    const baseStyle = {
      width: '100%',
      padding: '16px 20px',
      fontSize: '16px',
      border: '1px solid #e8e8e8',
      background: '#ffffff',
      fontFamily: 'Helvetica Neue, Arial, sans-serif',
      fontWeight: 300,
      outline: 'none',
      transition: 'border-color 300ms ease'
    };

    if (emailValidation.status === 'valid') {
      return { ...baseStyle, borderColor: '#10b981' };
    }
    
    if (emailValidation.status === 'invalid') {
      return { ...baseStyle, borderColor: '#ef4444' };
    }
    
    return baseStyle;
  };

  // Render loading state
  if (isProcessing) {
    return (
      <CheckoutErrorBoundary>
        <div className="min-h-screen" style={{ 
          background: '#ffffff',
          fontFamily: 'Helvetica Neue, -apple-system, BlinkMacSystemFont, Segoe UI, Arial, sans-serif',
        }}>
          <MemberNavigation />
          
          <main className="flex items-center justify-center min-h-screen p-4">
            <div className="max-w-md w-full text-center">
              <PaymentProgressIndicator step={processingStep === 'validation' ? 'validation' : processingStep === 'processing' ? 'processing' : 'complete'} />
              <CheckoutLoading variant={processingStep === 'validation' ? 'validation' : 'processing'} />
            </div>
          </main>
        </div>
      </CheckoutErrorBoundary>
    );
  }

  const confirmationData: PaymentConfirmationData = {
    plan,
    amount,
    email: email.trim(),
    currency: 'EUR'
  };

  return (
    <CheckoutErrorBoundary onError={(error) => {
      console.error('Checkout boundary error:', error);
      toast.showErrorToast('A critical error occurred. The page will reload.');
    }}>
      <div className="min-h-screen" style={{ 
        background: '#ffffff',
        fontFamily: 'Helvetica Neue, -apple-system, BlinkMacSystemFont, Segoe UI, Arial, sans-serif',
        fontWeight: 300,
        color: '#000000'
      }}>
      <MemberNavigation />
      
      {/* Luxury Header Section - Mobile Responsive */}
      <header style={{ 
        padding: 'clamp(80px, 20vw, 200px) 0 clamp(64px, 15vw, 128px)', 
        textAlign: 'center',
        background: '#fafafa'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 clamp(20px, 5vw, 96px)' 
        }}>
          <div style={{
            fontSize: 'clamp(10px, 2.5vw, 11px)',
            fontWeight: 400,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#757575',
            marginBottom: 'clamp(32px, 8vw, 64px)'
          }}>
            SECURE CHECKOUT
          </div>
          
          <h1 style={{
            fontFamily: 'Times New Roman, serif',
            fontWeight: 200,
            lineHeight: 0.95,
            letterSpacing: 'clamp(0.1em, 2vw, 0.3em)',
            textTransform: 'uppercase',
            fontSize: 'clamp(2rem, 8vw, 5rem)',
            marginBottom: 'clamp(48px, 12vw, 96px)'
          }}>
            COMPLETE YOUR<br />TRANSFORMATION
          </h1>
          
          <p style={{
            fontSize: 'clamp(15px, 3.5vw, 17px)',
            lineHeight: 1.7,
            fontWeight: 300,
            color: '#757575',
            maxWidth: '55ch',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            You're moments away from accessing Maya, your AI personal brand strategist, 
            and creating professional photos that represent exactly who you are.
          </p>
        </div>
      </header>

      <main style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '0 clamp(20px, 5vw, 96px) clamp(80px, 20vw, 200px)' 
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          
          {/* Email Collection Form */}
          <div style={{
            background: '#fafafa',
            padding: 'clamp(48px, 12vw, 64px) clamp(32px, 8vw, 64px)',
            marginBottom: 'clamp(48px, 12vw, 96px)',
            border: '1px solid #e8e8e8'
          }}>
            <h3 style={{
              fontFamily: 'Times New Roman, serif',
              fontWeight: 200,
              letterSpacing: 'clamp(0.15em, 2vw, 0.25em)',
              textTransform: 'uppercase',
              fontSize: 'clamp(18px, 4.5vw, 24px)',
              marginBottom: 'clamp(32px, 8vw, 48px)',
              textAlign: 'center',
              lineHeight: 1.1
            }}>
              Your Email Address
            </h3>
            
            <div style={{ marginBottom: 'clamp(32px, 8vw, 48px)' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                style={getEmailInputStyle()}
                onFocus={(e) => {
                  if (emailValidation.status !== 'invalid') {
                    (e.target as HTMLElement).style.borderColor = '#757575';
                  }
                }}
                onBlur={(e) => {
                  if (emailValidation.status === 'valid') {
                    (e.target as HTMLElement).style.borderColor = '#10b981';
                  } else if (emailValidation.status === 'invalid') {
                    (e.target as HTMLElement).style.borderColor = '#ef4444';
                  } else {
                    (e.target as HTMLElement).style.borderColor = '#e8e8e8';
                  }
                }}
                required
              />
              
              {/* Email validation feedback */}
              {email && (
                <div className="mt-2 text-xs">
                  {emailValidation.status === 'valid' && (
                    <div className="text-green-600 flex items-center">
                      <span className="mr-1">✓</span>
                      Valid email address
                    </div>
                  )}
                  {emailValidation.status === 'invalid' && emailValidation.message && (
                    <div className="text-red-600 flex items-center">
                      <span className="mr-1">⚠</span>
                      {emailValidation.message}
                    </div>
                  )}
                  {emailValidation.status === 'incomplete' && (
                    <div className="text-yellow-600 flex items-center">
                      <span className="mr-1">⏳</span>
                      {emailValidation.message || 'Continue typing...'}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <p style={{
              fontSize: 'clamp(13px, 3vw, 15px)',
              color: '#757575',
              lineHeight: 1.6,
              fontWeight: 300,
              textAlign: 'center',
              marginBottom: '24px'
            }}>
              We'll create your account automatically after payment and send you a welcome email with next steps.
            </p>
          </div>
          {/* Order Summary Card - Mobile Responsive */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e8e8e8',
            padding: 'clamp(48px, 12vw, 128px) clamp(24px, 6vw, 96px)',
            marginBottom: 'clamp(64px, 16vw, 128px)',
            transition: 'all 400ms ease'
          }}>
            <h2 style={{
              fontFamily: 'Times New Roman, serif',
              fontWeight: 200,
              letterSpacing: 'clamp(0.15em, 3vw, 0.25em)',
              textTransform: 'uppercase',
              fontSize: 'clamp(18px, 4.5vw, 24px)',
              marginBottom: 'clamp(48px, 12vw, 96px)',
              lineHeight: 1.1,
              textAlign: 'center'
            }}>
              Your Investment
            </h2>
            
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '16px',
              marginBottom: 'clamp(32px, 8vw, 64px)',
              paddingBottom: 'clamp(32px, 8vw, 64px)',
              borderBottom: '1px solid #f0f0f0'
            }}>
              <div style={{ flex: '1 1 250px', minWidth: '250px' }}>
                <div style={{
                  fontSize: 'clamp(15px, 3.5vw, 17px)',
                  fontWeight: 300,
                  color: '#000000',
                  marginBottom: '16px',
                  letterSpacing: '0.05em'
                }}>
                  SSELFIE STUDIO
                </div>
                <div style={{
                  fontSize: 'clamp(13px, 3vw, 15px)',
                  color: '#757575',
                  lineHeight: 1.6
                }}>
                  Personal AI model training + Maya AI photographer + 100 monthly professional photos
                </div>
              </div>
              <div style={{
                fontFamily: 'Times New Roman, serif',
                fontSize: 'clamp(20px, 5vw, 24px)',
                fontWeight: 200,
                color: '#000000',
                whiteSpace: 'nowrap',
                alignSelf: 'flex-start'
              }}>
                €47/month
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{
                fontSize: 'clamp(15px, 3.5vw, 17px)',
                fontWeight: 300,
                letterSpacing: '0.05em'
              }}>
                Total Today
              </div>
              <div style={{
                fontFamily: 'Times New Roman, serif',
                fontSize: 'clamp(24px, 6vw, 30px)',
                fontWeight: 200,
                color: '#000000'
              }}>
                €47
              </div>
            </div>
          </div>

          {/* Payment Button - Mobile Optimized */}
          <div style={{ marginBottom: 'clamp(48px, 12vw, 96px)' }}>
            <button
              onClick={handleStripeCheckout}
              disabled={isProcessing || !emailValidation.isValid}
              style={{
                width: '100%',
                background: isProcessing || !emailValidation.isValid ? '#757575' : '#000000',
                color: '#ffffff',
                border: 'none',
                padding: 'clamp(20px, 5vw, 48px) clamp(32px, 8vw, 96px)',
                fontSize: 'clamp(10px, 2.5vw, 11px)',
                fontWeight: 400,
                letterSpacing: 'clamp(0.2em, 1vw, 0.3em)',
                textTransform: 'uppercase',
                cursor: isProcessing || !emailValidation.isValid ? 'not-allowed' : 'pointer',
                transition: 'all 300ms ease',
                opacity: isProcessing || !emailValidation.isValid ? 0.7 : 1,
                minHeight: '48px',
                touchAction: 'manipulation'
              }}
              onMouseEnter={!isProcessing && emailValidation.isValid ? (e) => (e.target as HTMLElement).style.background = '#333333' : undefined}
              onMouseLeave={!isProcessing && emailValidation.isValid ? (e) => (e.target as HTMLElement).style.background = '#000000' : undefined}
            >
              {isProcessing ? 'PROCESSING YOUR PAYMENT...' : 'SECURE PAYMENT WITH STRIPE'}
            </button>

            <div style={{
              textAlign: 'center',
              marginTop: 'clamp(24px, 6vw, 48px)',
              fontSize: 'clamp(12px, 2.8vw, 13px)',
              color: '#757575'
            }}>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px'
              }}>
                <span style={{ fontSize: '16px' }}>🔒</span>
                <span style={{ 
                  textAlign: 'center',
                  lineHeight: 1.4
                }}>
                  256-bit SSL encryption • Secure payment powered by Stripe
                </span>
              </div>
            </div>
          </div>

          {/* Terms - Mobile Responsive Typography */}
          <div style={{
            textAlign: 'center',
            fontSize: 'clamp(12px, 2.8vw, 13px)',
            color: '#757575',
            lineHeight: 1.6,
            maxWidth: '50ch',
            margin: '0 auto'
          }}>
            <p>By proceeding, you agree to our Terms of Service and Privacy Policy.</p>
            <p style={{ marginTop: '16px' }}>
              Cancel anytime with one click. No long-term commitment required.
            </p>
          </div>
        </div>
      </main>

      {/* Enhanced Payment Confirmation Modal */}
      <PaymentConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => {
          setShowConfirmationModal(false);
          setPaymentStatus('pre-payment');
        }}
        onConfirm={handleConfirmedCheckout}
        data={confirmationData}
        isProcessing={isProcessing}
        paymentStatus={paymentStatus}
        userData={userData}
        onContinue={handleSuccessContinue}
      />
      </div>
    </CheckoutErrorBoundary>
  );
}