import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export default function Checkout() {
  const [, setLocation] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<string>('sselfie-studio');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get selected plan from localStorage or default to studio
    const plan = localStorage.getItem('selectedPlan') || 'sselfie-studio';
    setSelectedPlan(plan);
  }, []);

  const planDetails = {
    'sselfie-studio': {
      name: 'SSELFIE Studio',
      price: 47,
      features: [
        '100 AI images per month',
        'Maya AI + Victoria AI unlimited',
        'Complete brand builder ecosystem',
        'Landing pages + custom domain',
        'Priority support'
      ]
    }
  };

  const handleCheckout = async () => {
    setLoading(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Set up user plan via API
      const response = await fetch('/api/setup-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan: selectedPlan }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to setup plan');
      }
      
      // Store user plan for demo
      localStorage.setItem('userPlan', selectedPlan);
      
      // Redirect to thank you page
      setLocation('/thank-you');
    } catch (error) {
      console.error('Checkout error:', error);
      setLoading(false);
    }
  };

  const plan = planDetails[selectedPlan as keyof typeof planDetails];

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
                  <div className="text-2xl font-light">${plan.price}</div>
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
                  <span>${plan.price}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Billed monthly • Cancel anytime
                </p>
              </div>
            </div>

            {/* Plan info only - no switching needed with single paid plan */}
            <div className="mt-8">
              <p className="text-sm text-gray-600">
                Includes everything you need to build your personal brand
              </p>
            </div>
          </div>

          {/* Payment Form */}
          <div>
            <h2 className="text-xl font-medium mb-8">Payment Information</h2>
            
            <div className="bg-white p-8 border border-gray-200">
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    placeholder="1234 5678 9012 3456"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                      placeholder="MM/YY"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                      placeholder="123"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Billing Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    placeholder="Full Name"
                    required
                  />
                </div>

                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full py-4 bg-black text-white text-sm uppercase tracking-[0.3em] hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? 'Processing...' : `Complete Purchase - $${plan.price}/month`}
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
    </div>
  );
}