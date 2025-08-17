import { useState } from 'react';
import { MemberNavigation } from '@/components/member-navigation';
import { HeroFullBleed } from '@/components/HeroFullBleed';
import { SandraImages } from '@/lib/sandra-images';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from 'wouter';

export default function SimpleCheckout() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStripeCheckout = async () => {
    setIsProcessing(true);
    
    try {
      // Create Stripe checkout session instead of payment intent
      const response = await apiRequest("POST", "/api/create-checkout-session", {
        priceId: "price_1234567890", // We'll use a fixed price ID
        successUrl: `${window.location.origin}/payment-success?plan=sselfie-studio`,
        cancelUrl: `${window.location.origin}/checkout`,
      });

      const { url } = await response.json();
      
      // Redirect to Stripe hosted checkout
      window.location.href = url;
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Error",
        description: "Unable to start checkout process. Please try again.",
        variant: "destructive",
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
    <div className="min-h-screen bg-white">
      <MemberNavigation />
      
      <HeroFullBleed
        backgroundImage={SandraImages.editorial.luxury1}
        tagline="Your transformation starts here"
        title="SECURE CHECKOUT"
        ctaText="Continue"
        onCtaClick={() => {}}
        fullHeight={false}
      />

      <main className="max-w-4xl mx-auto px-8 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="border border-gray-200 p-8 mb-8">
            <h2 className="text-2xl font-light mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
              Order Summary
            </h2>
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="font-medium">SSELFIE AI Brand Photoshoot</div>
                <div className="text-sm text-gray-600">100 monthly AI-generated professional photos</div>
              </div>
              <div className="text-xl font-light" style={{ fontFamily: 'Times New Roman, serif' }}>
                €67/month
              </div>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center">
                <div className="font-medium">Total</div>
                <div className="text-xl font-light" style={{ fontFamily: 'Times New Roman, serif' }}>
                  €67/month
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleStripeCheckout}
              disabled={isProcessing}
              className="w-full bg-black text-white py-4 px-6 text-xs uppercase tracking-wider hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {isProcessing ? 'PROCESSING...' : 'PROCEED TO SECURE PAYMENT'}
            </button>

            <div className="text-center text-sm text-gray-500">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <span>🔒</span>
                <span>Secure payment powered by Stripe</span>
              </div>
              <div>Or for testing purposes:</div>
            </div>

            <button
              onClick={handleTestPayment}
              disabled={isProcessing}
              className="w-full border border-gray-300 text-gray-700 py-4 px-6 text-xs uppercase tracking-wider hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {isProcessing ? 'PROCESSING...' : 'SIMULATE PAYMENT (TEST ONLY)'}
            </button>
          </div>

          <div className="mt-8 text-center text-sm text-gray-600">
            <p>By proceeding, you agree to our Terms of Service and Privacy Policy.</p>
            <p className="mt-2">Cancel anytime. No long-term commitment.</p>
          </div>
        </div>
      </main>
    </div>
  );
}