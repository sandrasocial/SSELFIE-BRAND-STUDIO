import { useState } from 'react';
import { MemberNavigation } from '../components/member-navigation';
import { HeroFullBleed } from '../components/HeroFullBleed';
import { SandraImages } from '../lib/sandra-images';
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

  return (
    <div className="min-h-screen bg-black">
      <MemberNavigation />
      
      {/* 🔄 PHASE 2: CUSTOM HERO SECTION FOR RETRAINING */}
      <section 
        className="relative w-full min-h-screen flex items-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${SandraImages.hero.homepage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="container mx-auto px-6 py-24">
          <div className="max-w-4xl mx-auto text-center">
            {/* 🔄 PHASE 2: RETRAINING-SPECIFIC HEADER */}
            <h1 className="text-5xl md:text-7xl font-light text-white mb-8 leading-tight">
              Retrain Your 
              <span className="block text-[#D4AF37] font-normal">AI Model</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Ready to refresh your AI model with new photos or updated style? 
              <span className="text-[#D4AF37]"> One-time $10 retraining fee</span> gets you access to the full training process again.
            </p>

            {/* 🔄 PHASE 2: RETRAINING BENEFITS SECTION */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                <div className="text-[#D4AF37] text-3xl mb-4">🔄</div>
                <h3 className="text-xl font-semibold text-white mb-3">Fresh Training</h3>
                <p className="text-gray-400">Upload new photos and retrain your AI model with updated images and styling preferences.</p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                <div className="text-[#D4AF37] text-3xl mb-4">⚡</div>
                <h3 className="text-xl font-semibold text-white mb-3">Quick Process</h3>
                <p className="text-gray-400">Same streamlined training process you experienced before - typically completes in 25-30 minutes.</p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                <div className="text-[#D4AF37] text-3xl mb-4">💎</div>
                <h3 className="text-xl font-semibold text-white mb-3">Enhanced Quality</h3>
                <p className="text-gray-400">Latest AI training optimizations ensure even better image quality and style accuracy.</p>
              </div>
            </div>

            {/* 🔄 PHASE 2: PRICING SECTION */}
            <div className="bg-gradient-to-r from-[#D4AF37]/20 to-transparent border border-[#D4AF37]/30 rounded-3xl p-12 mb-12">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-left">
                  <h2 className="text-3xl font-semibold text-white mb-4">
                    AI Model Retraining
                  </h2>
                  <p className="text-gray-300 mb-2">
                    <span className="text-[#D4AF37] font-semibold">One-time payment</span> for complete model retraining
                  </p>
                  <p className="text-gray-400 text-sm">
                    Upload new photos • Train fresh AI model • Generate unlimited images
                  </p>
                  {user && (
                    <p className="text-gray-500 text-sm mt-2">
                      Signed in as: {user.email}
                    </p>
                  )}
                </div>
                
                <div className="text-center">
                  <div className="text-6xl font-light text-[#D4AF37] mb-2">$10</div>
                  <div className="text-gray-400 text-sm">per retraining session</div>
                </div>
              </div>
            </div>

            {/* 🔄 PHASE 2: PAYMENT BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button
                onClick={handleRetrainingPayment}
                disabled={isProcessing}
                className="bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold py-4 px-12 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  "Pay $10 & Retrain"
                )}
              </button>
              
              {/* 🔄 PHASE 2: TEST BUTTON FOR DEVELOPMENT */}
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={handleTestRetrainingPayment}
                  disabled={isProcessing}
                  className="border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black font-semibold py-4 px-12 rounded-xl transition-all duration-300 min-w-[200px]"
                >
                  Test Retraining Payment
                </button>
              )}
            </div>

            {/* 🔄 PHASE 2: ADDITIONAL INFO */}
            <div className="mt-16 text-center">
              <p className="text-gray-400 text-sm mb-4">
                Questions about retraining? The process works exactly like your original training.
              </p>
              <p className="text-gray-500 text-xs">
                Secure payment processing via Stripe • Cancel anytime during checkout
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}