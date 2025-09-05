import { useState, useEffect } from 'react';
import { MemberNavigation } from '../components/member-navigation';
import { apiRequest } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/use-auth';

export default function RetrainCheckout() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();

  const handleRetrainingPayment = async () => {
    setIsProcessing(true);
    
    try {
      // 🔄 PHASE 2: Create retraining-specific Stripe checkout session
      const response = await apiRequest("POST", "/api/create-retrain-checkout-session", {
        plan: "retraining-session", // New retraining-specific plan
        successUrl: `${window.location.origin}/payment-success?plan=retraining&type=retrain`,
        cancelUrl: `${window.location.origin}/retrain-checkout`,
      });

      const { url } = await response.json();
      
      // Redirect to Stripe hosted checkout
      window.location.href = url;
    } catch (error) {
      console.error('Retraining checkout error:', error);
      toast({
        title: "Checkout Error",
        description: "Unable to start retraining checkout. Please try again.",
      });
      setIsProcessing(false);
    }
  };

  const handleTestRetrainingPayment = async () => {
    setIsProcessing(true);
    
    try {
      // For testing - simulate successful retraining payment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Test Retraining Payment Successful",
        description: "Redirecting to training access...",
      });
      
      // Redirect to payment success page with retraining context
      setLocation('/payment-success?plan=retraining&type=retrain');
    } catch (error) {
      console.error('Test retraining payment error:', error);
      toast({
        title: "Test Payment Error",
        description: "Please try again.",
      });
      setIsProcessing(false);
    }
  };

  // SEO Meta tags setup
  useEffect(() => {
    document.title = "Retrain AI Model - SSELFIE Studio";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Retrain your AI model with new photos for $10. Fresh training, quick process, enhanced quality. Upload new images and update your personal AI model.');
    }
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <MemberNavigation transparent={false} />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/42585527/maya_y34j0fn5exrma0crzhsr3x1wwr_0_1756582110537.png)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-8 text-center">
          <div className="text-xs tracking-[0.4em] uppercase text-white/60 mb-8 font-light">
            Model Enhancement
          </div>
          <h1 className="font-serif text-[clamp(4rem,10vw,8rem)] leading-[0.9] font-extralight tracking-[0.3em] uppercase text-white mb-8">
            Retrain
          </h1>
          <h2 className="font-serif text-[clamp(1.5rem,4vw,3rem)] leading-[1] font-extralight tracking-[0.5em] uppercase text-white/80 mb-12">
            Your AI Model
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto font-light mb-16">
            Ready to refresh your AI model with new photos or updated style? One-time $10 retraining fee gets you access to the full training process again.
          </p>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-black">
        <div className="max-w-5xl mx-auto px-8">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="text-xs tracking-[0.4em] uppercase text-white/60 mb-4">
                Fresh Training
              </div>
              <h3 className="font-serif text-2xl font-light text-white mb-6">
                New Photos
              </h3>
              <p className="text-white/70 font-light leading-relaxed">
                Upload new photos and retrain your AI model with updated images and styling preferences.
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-xs tracking-[0.4em] uppercase text-white/60 mb-4">
                Quick Process
              </div>
              <h3 className="font-serif text-2xl font-light text-white mb-6">
                25-30 Minutes
              </h3>
              <p className="text-white/70 font-light leading-relaxed">
                Same streamlined training process you experienced before with consistent completion times.
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-xs tracking-[0.4em] uppercase text-white/60 mb-4">
                Enhanced Quality
              </div>
              <h3 className="font-serif text-2xl font-light text-white mb-6">
                Better Results
              </h3>
              <p className="text-white/70 font-light leading-relaxed">
                Latest AI training optimizations ensure even better image quality and style accuracy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-white/5">
        <div className="max-w-4xl mx-auto px-8">
          <div className="bg-black border border-white/20 p-12 text-center">
            <div className="text-xs tracking-[0.4em] uppercase text-white/60 mb-8">
              AI Model Retraining
            </div>
            
            <div className="mb-12">
              <div className="font-serif text-[clamp(4rem,8vw,6rem)] font-extralight text-white mb-4">
                $10
              </div>
              <div className="text-white/60 text-sm tracking-[0.2em] uppercase">
                Per Retraining Session
              </div>
            </div>

            <div className="space-y-4 mb-12 text-white/70">
              <div className="text-sm tracking-[0.1em] uppercase">Upload New Photos</div>
              <div className="text-sm tracking-[0.1em] uppercase">Train Fresh AI Model</div>
              <div className="text-sm tracking-[0.1em] uppercase">Generate Unlimited Images</div>
            </div>

            {user && (
              <div className="text-white/50 text-xs mb-8">
                Signed in as: {user.email}
              </div>
            )}

            {/* Payment Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button
                onClick={handleRetrainingPayment}
                disabled={isProcessing}
                className="bg-white text-black px-12 py-4 text-xs uppercase tracking-[0.3em] hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  "Pay $10 & Retrain"
                )}
              </button>
              
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={handleTestRetrainingPayment}
                  disabled={isProcessing}
                  className="border border-white text-white px-12 py-4 text-xs uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-colors"
                >
                  Test Retraining Payment
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="py-24 bg-black">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <div className="text-xs tracking-[0.4em] uppercase text-white/60 mb-8">
            Support
          </div>
          
          <p className="text-white/70 font-light mb-8 max-w-2xl mx-auto">
            Questions about retraining? The process works exactly like your original training.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12 text-white/50">
            <div className="text-xs tracking-[0.2em] uppercase">
              Same Training Process
            </div>
            <div className="text-xs tracking-[0.2em] uppercase">
              25-30 Minute Completion
            </div>
            <div className="text-xs tracking-[0.2em] uppercase">
              Fresh Photos & Styling
            </div>
          </div>
          
          <p className="text-white/40 text-xs tracking-[0.1em] uppercase">
            Secure Payment Processing via Stripe • Cancel Anytime During Checkout
          </p>
        </div>
      </section>
    </div>
  );
}