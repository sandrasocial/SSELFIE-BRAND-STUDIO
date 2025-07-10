import { useState, useEffect } from 'react';
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Navigation } from '@/components/navigation';
import { HeroFullBleed } from '@/components/HeroFullBleed';
import { SandraImages } from '@/lib/sandra-images';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';

// Load Stripe
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ planType }: { planType: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) return;
    
    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/thank-you?plan=${planType}`,
        },
      });

      if (error) {
        console.error('Stripe payment error:', error);
        toast({
          title: "Payment Failed",
          description: error.message || "There was an issue processing your payment. Please try again.",
          variant: "destructive",
        });
        setIsProcessing(false);
      }
    } catch (err) {
      console.error('Payment confirmation error:', err);
      toast({
        title: "Payment Error",
        description: "Unable to process payment. Please check your details and try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="border border-gray-200 p-8">
          <h3 className="text-xl font-light mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
            Payment Information
          </h3>
          <PaymentElement />
        </div>
        
        <div className="text-center">
          <button
            type="submit"
            disabled={!stripe || isProcessing}
            className="bg-black text-white px-12 py-4 text-xs uppercase tracking-wider hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {isProcessing ? 'PROCESSING...' : 'COMPLETE PURCHASE'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default function Checkout() {
  const { isAuthenticated } = useAuth();
  const [clientSecret, setClientSecret] = useState("");
  const [planType, setPlanType] = useState("sselfie-studio");
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Get plan from URL params (always sselfie-studio now)
    const urlParams = new URLSearchParams(window.location.search);
    const plan = urlParams.get('plan') || 'sselfie-studio';
    setPlanType('sselfie-studio');

    // No authentication required for checkout - users can purchase before login

    // Single product pricing
    const amount = 97;
    
    apiRequest("POST", "/api/create-payment-intent", { 
      amount: amount,
      plan: plan,
      currency: 'eur'
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          console.error('No client secret in response');
          setClientSecret('error');
        }
      })
      .catch((error) => {
        console.error('Payment intent creation failed:', error);
        setClientSecret('error');
      });
  }, [isAuthenticated, setLocation]);

  const getPlanDetails = (plan: string) => {
    return { 
      name: 'SSELFIE STUDIO', 
      price: '€97', 
      description: 'Complete AI selfie personal branding system with 300 monthly AI generations' 
    };
  };

  const planDetails = getPlanDetails(planType);

  // No authentication check needed - pre-login purchases are allowed

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600">Setting up your checkout...</div>
        </div>
      </div>
    );
  }

  if (clientSecret === 'error') {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
            Checkout Error
          </h1>
          <p className="text-gray-600 mb-8">
            There was an issue setting up your checkout. Please try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-black text-white px-8 py-3 text-xs uppercase tracking-wider hover:bg-gray-800 transition-colors"
          >
            TRY AGAIN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <HeroFullBleed
        backgroundImage={SandraImages.hero.pricing}
        title="CHECKOUT"
        tagline="Complete your SSELFIE transformation"
        alignment="left"
      />

      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Order Summary */}
        <div className="mb-16">
          <div className="max-w-2xl mx-auto border border-gray-200 p-8">
            <h2 className="text-2xl font-light mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
              Order Summary
            </h2>
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="font-medium">{planDetails.name}</div>
                <div className="text-sm text-gray-600">{planDetails.description}</div>
              </div>
              <div className="text-xl font-light" style={{ fontFamily: 'Times New Roman, serif' }}>
                {planDetails.price}
              </div>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center">
                <div className="font-medium">Total</div>
                <div className="text-xl font-light" style={{ fontFamily: 'Times New Roman, serif' }}>
                  {planDetails.price}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm planType={planType} />
        </Elements>

        {/* Security Notice */}
        <div className="text-center mt-12">
          <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">
            SECURE PAYMENT POWERED BY STRIPE
          </div>
          <div className="text-sm text-gray-600">
            Your payment information is encrypted and secure
          </div>
        </div>
      </div>
    </div>
  );
}