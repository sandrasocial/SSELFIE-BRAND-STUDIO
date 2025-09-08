import { useState } from 'react';
import { MemberNavigation } from '../components/member-navigation';
import { apiRequest } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import { useLocation } from 'wouter';

export default function SimpleCheckout() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStripeCheckout = async () => {
    setIsProcessing(true);
    
    try {
      // Create Stripe checkout session instead of payment intent
      const data = await apiRequest("/api/create-checkout-session", "POST", {
        plan: "sselfie-studio", // Use the correct plan name
        successUrl: `${window.location.origin}/payment-success?plan=sselfie-studio`,
        cancelUrl: `${window.location.origin}/simple-checkout`,
      });

      console.log('🔍 Checkout response:', data);
      
      if (data.url) {
        // Redirect to Stripe hosted checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Error",
        description: "Unable to start checkout process. Please try again.",
        
      });
      setIsProcessing(false);
    }
  };

  const handleTestPayment = async () => {
    setIsProcessing(true);
    
    try {
      // For testing - simulate successful payment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Test Payment Successful",
        description: "Redirecting to your workspace...",
      });
      
      // Redirect to payment success page
      setLocation('/payment-success?plan=sselfie-studio');
    } catch (error) {
      console.error('Test payment error:', error);
      setIsProcessing(false);
    }
  };

  return (
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
              disabled={isProcessing}
              style={{
                width: '100%',
                background: '#000000',
                color: '#ffffff',
                border: 'none',
                padding: 'clamp(20px, 5vw, 48px) clamp(32px, 8vw, 96px)',
                fontSize: 'clamp(10px, 2.5vw, 11px)',
                fontWeight: 400,
                letterSpacing: 'clamp(0.2em, 1vw, 0.3em)',
                textTransform: 'uppercase',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                transition: 'all 300ms ease',
                opacity: isProcessing ? 0.5 : 1,
                minHeight: '48px', // Touch-friendly minimum
                touchAction: 'manipulation' // Prevent zoom on double-tap
              }}
              onMouseEnter={!isProcessing ? (e) => e.target.style.background = '#757575' : undefined}
              onMouseLeave={!isProcessing ? (e) => e.target.style.background = '#000000' : undefined}
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
    </div>
  );
}