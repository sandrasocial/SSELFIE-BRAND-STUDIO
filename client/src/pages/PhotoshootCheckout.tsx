import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Load Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements || isProcessing) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/thank-you`,
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
      toast({
        title: "Payment Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-white p-8 border border-gray-200">
        <PaymentElement 
          options={{
            layout: 'accordion',
            paymentMethodOrder: ['card']
          }}
        />
      </div>
      
      <button
        type="submit"
        disabled={!stripe || !elements || isProcessing}
        className="w-full bg-black text-white py-4 px-8 text-sm tracking-[0.3em] uppercase font-light hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? 'Processing...' : 'Complete Payment'}
      </button>
    </form>
  );
};

export default function PhotoshootCheckout() {
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Create PaymentIntent for €97 subscription
    apiRequest("POST", "/api/create-payment-intent", { 
      amount: 97, // €97
      currency: 'eur',
      description: 'SSELFIE AI Brand Photoshoot - Monthly Subscription'
    })
      .then((data) => {
        setClientSecret(data.clientSecret);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Payment setup failed:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm tracking-[0.3em] uppercase font-light">Setting up payment...</p>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="font-serif text-2xl mb-4 uppercase font-light">Payment Error</h2>
          <p className="text-gray-600 mb-8 font-light">
            Unable to set up payment. Please try again or contact support.
          </p>
          <Link 
            href="/" 
            className="inline-block border border-black text-black px-6 py-3 text-xs tracking-[0.3em] uppercase font-light hover:bg-black hover:text-white transition-all duration-300"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-8 py-5 flex justify-between items-center">
          <Link href="/" className="font-serif text-xl font-light tracking-wide">SSELFIE</Link>
          <div className="text-xs tracking-[0.4em] uppercase text-gray-500 font-light">Checkout</div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Order Summary */}
          <div>
            <div className="text-xs tracking-[0.4em] uppercase text-gray-500 mb-8 font-light">
              Order Summary
            </div>
            
            <div className="bg-white p-8 border border-gray-200 mb-8">
              <h2 className="font-serif text-3xl uppercase font-light mb-6">
                SSELFIE AI Photoshoot
              </h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="font-light">Monthly Subscription</span>
                  <span className="font-light">€97.00</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="font-light">VAT (included)</span>
                  <span className="font-light">€0.00</span>
                </div>
                <div className="flex justify-between py-3 font-medium text-lg">
                  <span>Total</span>
                  <span>€97.00</span>
                </div>
              </div>

              <div className="text-sm text-gray-600 font-light space-y-2">
                <p>✓ Custom AI model trained on your selfies</p>
                <p>✓ Unlimited professional photo generations</p>
                <p>✓ Sandra AI chat for perfect prompts</p>
                <p>✓ High-resolution downloads</p>
                <p>✓ Cancel anytime</p>
              </div>
            </div>

            <div className="text-xs text-gray-500 font-light">
              <p className="mb-2">
                Your subscription will automatically renew monthly at €97. 
                You can cancel at any time from your account settings.
              </p>
              <p>
                By proceeding, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>

          {/* Payment Form */}
          <div>
            <div className="text-xs tracking-[0.4em] uppercase text-gray-500 mb-8 font-light">
              Payment Details
            </div>

            <Elements 
              stripe={stripePromise} 
              options={{ 
                clientSecret,
                appearance: {
                  theme: 'flat',
                  variables: {
                    colorPrimary: '#0a0a0a',
                    colorBackground: '#ffffff',
                    colorText: '#0a0a0a',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    fontSizeBase: '16px',
                    borderRadius: '0px',
                  }
                }
              }}
            >
              <CheckoutForm />
            </Elements>

            <div className="mt-8 flex items-center justify-center gap-4 text-xs text-gray-500">
              <span>Secured by</span>
              <span className="font-medium">Stripe</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}