import { useState, useEffect } from "react";
import { useLocation } from "wouter";
// Stripe temporarily disabled for deployment build
// // import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
// // import { loadStripe } from '@stripe/stripe-js';
import { useToast } from "../hooks/use-toast";

// Initialize Stripe with comprehensive error handling
const getStripePromise = () => {
  const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
  console.log('🔐 Stripe Key Check:', {
    hasKey: !!stripeKey,
    keyLength: stripeKey?.length || 0,
    keyPrefix: stripeKey?.substring(0, 7) || 'none'
  });
  
  if (!stripeKey) {
    console.warn('VITE_STRIPE_PUBLIC_KEY not found - Stripe functionality will be disabled');
    return null;
  }
  
  try {
    const promise = loadStripe(stripeKey);
    console.log('✅ Stripe promise created successfully');
    return promise;
  } catch (error) {
    console.error('❌ Failed to create Stripe promise:', error);
    return null;
  }
};

const stripePromise = getStripePromise();

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [selectedPlan] = useState<string>(() => {
    // Check URL params and localStorage for plan selection
    const urlParams = new URLSearchParams(window.location.search);
    const urlPlan = urlParams.get('plan');
    const storedPlan = localStorage.getItem('selectedPlan');
    return urlPlan || storedPlan || 'full-access';
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/welcome?plan=${selectedPlan}`,
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Payment error:', err);
      toast({
        title: "Payment Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const planDetails = {
    'basic': {
      name: 'SSELFIE Studio Basic',
      price: 29,
      features: [
        'Trained personal AI model',
        '30 AI images per month',
        'Maya AI photographer chat',
        'AI photoshoot access',
        'Email support'
      ]
    },
    'full-access': {
      name: 'SSELFIE Studio Full Access',
      price: 67,
      features: [
        'Trained personal AI model',
        '100 AI images per month',
        'Maya AI photographer chat',
        'Victoria website builder',
        '4-page website included',
        'Flatlay library access',
        'All future features',
        'Priority support'
      ]
    },
    // Legacy support
    'sselfie-studio': {
      name: 'SSELFIE Studio Full Access',
      price: 67,
      features: [
        'Trained personal AI model',
        '100 AI images per month',
        'Maya AI photographer chat',
        'Victoria website builder',
        '4-page website included',
        'Flatlay library access',
        'All future features',
        'Priority support'
      ]
    }
  };

  const plan = planDetails[selectedPlan as keyof typeof planDetails] || planDetails['full-access'];

  return (
    <div className="max-w-4xl mx-auto px-8 py-16">
      <div className="text-center mb-16">
        <h1 className="font-serif text-4xl font-light text-black mb-4">
          Complete Your Order
        </h1>
        <p className="text-gray-600">
          You're one step away from building your personal brand
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-16">
        {/* Order Summary */}
        <div>
          <h2 className="text-xl font-medium mb-8">Order Summary</h2>
          
          <div className="bg-white p-8 border border-gray-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-medium text-lg">{plan.name}</h3>
                <p className="text-gray-600 text-sm">Monthly subscription</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-light">€{plan.price}</div>
                <div className="text-sm text-gray-500">per month</div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <h4 className="font-medium mb-4">What's included:</h4>
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start text-sm text-gray-700">
                    <span className="text-black mr-3">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="border-t border-gray-200 pt-6 mt-6">
              <div className="flex justify-between items-center text-lg font-medium">
                <span>Total due today:</span>
                <span>€{plan.price}</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Billed monthly • Cancel anytime
              </p>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div>
          <h2 className="text-xl font-medium mb-8">Payment Information</h2>
          
          <div className="bg-white p-8 border border-gray-200">
            <form onSubmit={handleSubmit} className="space-y-6">
              <PaymentElement />
              
              <button
                type="submit"
                disabled={loading || !stripe || !elements}
                className="w-full py-4 bg-black text-white text-sm uppercase tracking-[0.3em] hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? 'Processing...' : `Complete Purchase - €${plan.price}/month`}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Secure checkout • 30-day money-back guarantee
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<string>('sselfie-studio');

  // Check if Stripe is available
  if (!stripePromise) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-yellow-800 mb-4">Payment Unavailable</h1>
          <p className="text-yellow-700 mb-4">
            Payment processing is currently unavailable. Please contact support for assistance.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    // Get selected plan from localStorage or default to studio
    const plan = localStorage.getItem('selectedPlan') || 'sselfie-studio';
    setSelectedPlan(plan);

    // Create PaymentIntent as soon as the page loads
    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            amount: 67, // €67 for SSELFIE Studio
            plan: plan,
            currency: 'usd'
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to create payment intent');
        }
        
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error('Error creating payment intent:', error);
      }
    };

    createPaymentIntent();
  }, []);

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up your checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <div className="font-serif text-xl tracking-wide text-black">
            SSELFIE
          </div>
        </div>
      </div>

      {/* Make SURE to wrap the form in <Elements> which provides the stripe context */}
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <CheckoutForm />
      </Elements>
    </div>
  );
}