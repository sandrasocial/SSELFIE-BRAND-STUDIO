import React, { useEffect } from 'react';
import { PreLoginNavigationUnified } from '../components/pre-login-navigation-unified';
import { useAuth } from '../hooks/use-auth';
import { Link, useLocation } from 'wouter';
import { useToast } from '../hooks/use-toast';
import { apiRequest } from '../lib/queryClient';

export default function PaymentSuccess() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Get plan and type from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const plan = urlParams.get('plan');
    const type = urlParams.get('type');
    const email = urlParams.get('email') || localStorage.getItem('checkout-email');
    
    // Handle retraining payments specifically
    if (plan === 'retraining' && type === 'retrain') {
      handleRetrainingSuccess();
      return;
    }
    
    // Handle regular subscription payments
    if (isAuthenticated && user) {
      // User is authenticated - upgrade existing account
      triggerUserUpgrade();
      
      // Show success message and redirect to training
      toast({
        title: "Welcome to SSELFIE Studio!",
        description: "Your payment was successful. Let's start creating your AI model.",
      });
      
      // Redirect to training after 3 seconds
      setTimeout(() => {
        setLocation('/simple-training');
      }, 3000);
    } else if (email) {
      // 🚀 AUTO-REGISTRATION: Create account for non-authenticated paying customer
      handleAutoRegistration(email, plan || 'sselfie-studio');
    } else {
      // Fallback: Show success message for non-authenticated users without email
      toast({
        title: "Payment Successful!",
        description: "Welcome to SSELFIE Studio! Please sign in to start your AI training.",
      });
    }
  }, [toast, isAuthenticated, user, setLocation]);

  // 🚀 AUTO-REGISTRATION: Create account for paying users automatically
  const handleAutoRegistration = async (email: string, plan: string) => {
    try {
      console.log('🚀 AUTO-REGISTRATION: Creating account for:', email);
      
      const response = await fetch('/api/auth/auto-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          plan,
          source: 'payment-success'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ AUTO-REGISTRATION: Account created successfully');
        
        // Show success message
        toast({
          title: "🎉 Welcome to SSELFIE Studio!",
          description: "Your account has been created and your payment is successful. Check your email for next steps!",
        });
        
        // Clear stored email
        localStorage.removeItem('checkout-email');
        
        // Redirect to training after showing message
        setTimeout(() => {
          setLocation('/simple-training');
        }, 4000);
        
      } else {
        console.error('❌ AUTO-REGISTRATION: Failed to create account:', data.error);
        toast({
          title: "Payment Successful!",
          description: "Your payment went through, but please contact support to activate your account.",
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error('❌ AUTO-REGISTRATION: Network error:', error);
      toast({
        title: "Payment Successful!",
        description: "Your payment was processed. Please check your email or contact support if you need help accessing your account.",
      });
    }
  };

  // 🔄 PHASE 4: Handle successful retraining payments
  const handleRetrainingSuccess = async () => {
    try {
      if (!isAuthenticated || !user) {
        toast({
          title: "Retraining Payment Successful!",
          description: "Please sign in to access your AI model training.",
        });
        return;
      }

      // Show immediate success message
      toast({
        title: "🎉 Retraining Payment Successful!",
        description: "Your AI model retraining access has been activated. Redirecting to training...",
      });

      // Wait 3 seconds to show the message, then redirect to training
      setTimeout(() => {
        setLocation('/simple-training');
      }, 3000);

    } catch (error) {
      console.error('Retraining success handling error:', error);
      toast({
        title: "Payment Successful",
        description: "Your retraining access is ready. Please visit the training page to continue.",
      });
      
      // Still redirect to training even if there's an error
      setTimeout(() => {
        setLocation('/simple-training');
      }, 3000);
    }
  };

  // Trigger upgrade automation after successful payment
  const triggerUserUpgrade = async () => {
    try {
      // Method 1: Try with authenticated user data
      if (user?.email) {
        const upgradeResponse = await fetch('/api/upgrade-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            plan: 'sselfie-studio' // Single business model
          })
        });

        if (upgradeResponse.ok) {
          const upgradeData = await upgradeResponse.json();
          console.log('✅ User upgrade successful:', upgradeData);
          
          // Clear stored plan
          localStorage.removeItem('userPlan');
          return;
        }
      }

      // Method 2: Fallback to automation endpoints (if authenticated)
      if (isAuthenticated) {
        await fetch('/api/automation/update-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ plan: 'sselfie-studio' })
        });
      }
    } catch (error) {
      console.error('Upgrade automation failed:', error);
      // Don't show error to user - they still got their payment processed
    }
  };

  // Get plan details from URL - simplified to single business model
  const urlParams = new URLSearchParams(window.location.search);
  const plan = urlParams.get('plan') || 'sselfie-studio';
  
  const getPlanName = (planType: string) => {
    // Single business model - always SSELFIE STUDIO
    if (planType === 'retraining') return 'AI Model Retraining';
    return 'SSELFIE STUDIO';
  };

  return (
    <div className="min-h-screen" style={{ 
      background: '#ffffff',
      fontFamily: 'Helvetica Neue, -apple-system, BlinkMacSystemFont, Segoe UI, Arial, sans-serif',
      fontWeight: 300,
      color: '#000000'
    }}>
      <PreLoginNavigationUnified />
      
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
            PAYMENT SUCCESSFUL
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
            WELCOME TO<br />SSELFIE STUDIO
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
            Your transformation begins now. You're about to create professional photos that represent exactly who you are becoming.
          </p>
        </div>
      </header>

      <main style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '0 clamp(20px, 5vw, 96px) clamp(80px, 20vw, 200px)' 
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(80px, 20vw, 160px)' }}>
          <div style={{
            display: 'inline-block',
            background: '#fafafa',
            color: '#000000',
            padding: 'clamp(16px, 4vw, 20px) clamp(32px, 8vw, 48px)',
            fontSize: 'clamp(12px, 2.8vw, 13px)',
            fontWeight: 400,
            letterSpacing: 'clamp(0.15em, 1.5vw, 0.25em)',
            textTransform: 'uppercase',
            marginBottom: 'clamp(32px, 8vw, 64px)',
            border: '1px solid #e8e8e8'
          }}>
            {getPlanName(plan)} ACTIVATED
          </div>
          
          <h2 style={{
            fontFamily: 'Times New Roman, serif',
            fontWeight: 200,
            letterSpacing: 'clamp(0.15em, 2vw, 0.25em)',
            textTransform: 'uppercase',
            fontSize: 'clamp(20px, 6vw, 30px)',
            marginBottom: 'clamp(32px, 8vw, 64px)',
            lineHeight: 1.1
          }}>
            Your Investment in Yourself<br />Starts Now
          </h2>
          
          <p style={{
            fontSize: 'clamp(15px, 3.5vw, 17px)',
            color: '#757575',
            maxWidth: '55ch',
            margin: '0 auto',
            fontWeight: 300,
            lineHeight: 1.7
          }}>
            Thank you for choosing to invest in your personal brand. 
            You're about to create something extraordinary with Maya, your AI photographer.
          </p>
        </div>

        {/* Next Steps - Mobile Responsive Card */}
        <div style={{
          background: '#fafafa',
          padding: 'clamp(48px, 12vw, 128px) clamp(24px, 6vw, 96px)',
          marginBottom: 'clamp(80px, 20vw, 160px)',
          border: '1px solid #e8e8e8'
        }}>
          <h3 style={{
            fontFamily: 'Times New Roman, serif',
            fontWeight: 200,
            letterSpacing: 'clamp(0.15em, 2vw, 0.25em)',
            textTransform: 'uppercase',
            fontSize: 'clamp(18px, 4.5vw, 24px)',
            marginBottom: 'clamp(48px, 12vw, 96px)',
            textAlign: 'center',
            lineHeight: 1.1
          }}>
            Your Next Steps
          </h3>
          
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              textAlign: 'left',
              marginBottom: 'clamp(32px, 8vw, 64px)',
              gap: 'clamp(16px, 4vw, 32px)'
            }}>
              <div style={{
                fontFamily: 'Times New Roman, serif',
                fontSize: 'clamp(20px, 5vw, 24px)',
                fontWeight: 200,
                marginTop: '8px',
                color: '#757575',
                flexShrink: 0
              }}>01</div>
              <div>
                <h4 style={{
                  fontSize: 'clamp(15px, 3.5vw, 17px)',
                  fontWeight: 300,
                  color: '#000000',
                  marginBottom: '8px',
                  letterSpacing: '0.05em'
                }}>
                  Upload Your Training Photos
                </h4>
                <p style={{
                  fontSize: 'clamp(13px, 3vw, 15px)',
                  color: '#757575',
                  lineHeight: 1.6,
                  fontWeight: 300
                }}>
                  Create your personal AI model with 15-25 selfies for the best results.
                </p>
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              textAlign: 'left',
              marginBottom: 'clamp(32px, 8vw, 64px)',
              gap: 'clamp(16px, 4vw, 32px)'
            }}>
              <div style={{
                fontFamily: 'Times New Roman, serif',
                fontSize: 'clamp(20px, 5vw, 24px)',
                fontWeight: 200,
                marginTop: '8px',
                color: '#757575',
                flexShrink: 0
              }}>02</div>
              <div>
                <h4 style={{
                  fontSize: 'clamp(15px, 3.5vw, 17px)',
                  fontWeight: 300,
                  color: '#000000',
                  marginBottom: '8px',
                  letterSpacing: '0.05em'
                }}>
                  Meet Maya, Your AI Photographer
                </h4>
                <p style={{
                  fontSize: 'clamp(13px, 3vw, 15px)',
                  color: '#757575',
                  lineHeight: 1.6,
                  fontWeight: 300
                }}>
                  Maya will understand your style and create professional photos that represent who you are.
                </p>
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              textAlign: 'left',
              gap: 'clamp(16px, 4vw, 32px)'
            }}>
              <div style={{
                fontFamily: 'Times New Roman, serif',
                fontSize: 'clamp(20px, 5vw, 24px)',
                fontWeight: 200,
                marginTop: '8px',
                color: '#757575',
                flexShrink: 0
              }}>03</div>
              <div>
                <h4 style={{
                  fontSize: 'clamp(15px, 3.5vw, 17px)',
                  fontWeight: 300,
                  color: '#000000',
                  marginBottom: '8px',
                  letterSpacing: '0.05em'
                }}>
                  Generate 100 Monthly Photos
                </h4>
                <p style={{
                  fontSize: 'clamp(13px, 3vw, 15px)',
                  color: '#757575',
                  lineHeight: 1.6,
                  fontWeight: 300
                }}>
                  Create professional photos for LinkedIn, Instagram, websites, and more.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button - Mobile Optimized */}
        <div style={{ textAlign: 'center' }}>
          <button 
            onClick={() => {
              if (isAuthenticated && user) {
                setLocation('/simple-training');
              } else {
                window.location.href = '/simple-training';
              }
            }}
            style={{
              background: '#000000',
              color: '#ffffff',
              border: 'none',
              padding: 'clamp(20px, 5vw, 48px) clamp(32px, 8vw, 96px)',
              fontSize: 'clamp(10px, 2.5vw, 11px)',
              fontWeight: 400,
              letterSpacing: 'clamp(0.2em, 1vw, 0.3em)',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 300ms ease',
              display: 'inline-block',
              minHeight: '48px', // Touch-friendly minimum
              touchAction: 'manipulation' // Prevent zoom on double-tap
            }}
            onMouseEnter={(e) => e.target.style.background = '#757575'}
            onMouseLeave={(e) => e.target.style.background = '#000000'}
          >
            START YOUR AI TRAINING
          </button>
          
          <p style={{
            fontSize: 'clamp(12px, 2.8vw, 13px)',
            color: '#757575',
            marginTop: 'clamp(24px, 6vw, 48px)',
            fontWeight: 300
          }}>
            {isAuthenticated && user ? 'Redirecting automatically in a few moments...' : 'Please sign in to begin your training'}
          </p>
        </div>
      </main>
    </div>
  );
}