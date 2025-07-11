import React, { useEffect } from 'react';
import { useLocation } from 'wouter';

export default function PhotoshootThankYou() {
  const [, navigate] = useLocation();

  useEffect(() => {
    // Create user session after successful payment
    // This simulates account creation after purchase
    const createSession = async () => {
      try {
        const response = await fetch('/api/create-session-after-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentSuccess: true,
            source: 'photoshoot-checkout'
          }),
        });
        
        if (response.ok) {
          console.log('Session created after payment');
        }
      } catch (error) {
        console.error('Session creation failed:', error);
      }
    };

    createSession();
  }, []);

  const handleBeginJourney = () => {
    navigate('/studio');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-8 py-5">
          <div className="font-serif text-xl font-light tracking-wide">SSELFIE</div>
        </div>
      </nav>

      {/* Success Message */}
      <div className="max-w-4xl mx-auto px-8 py-32 text-center">
        <div className="mb-16">
          <div className="w-20 h-20 bg-black rounded-full mx-auto mb-8 flex items-center justify-center">
            <span className="text-white text-2xl">✓</span>
          </div>
          
          <h1 className="font-serif font-extralight text-[clamp(3rem,6vw,6rem)] uppercase mb-8 leading-none">
            Welcome
          </h1>
          
          <p className="text-xl font-light text-gray-600 mb-16 max-w-2xl mx-auto">
            Payment successful! Your SSELFIE AI Photoshoot subscription is now active. 
            Let's start creating your professional brand photos.
          </p>
        </div>

        {/* Next Steps */}
        <div className="bg-gray-50 p-12 mb-16">
          <div className="text-xs tracking-[0.4em] uppercase text-gray-500 mb-8 font-light">
            Your Next Steps
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-black text-white rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="font-serif text-lg font-light">1</span>
              </div>
              <h3 className="font-serif text-lg uppercase font-light mb-2">Upload Selfies</h3>
              <p className="text-sm text-gray-600 font-light">
                Train your personal AI model with 10+ photos
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-black text-white rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="font-serif text-lg font-light">2</span>
              </div>
              <h3 className="font-serif text-lg uppercase font-light mb-2">Chat with Sandra</h3>
              <p className="text-sm text-gray-600 font-light">
                Discuss your vision for perfect prompts
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-black text-white rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="font-serif text-lg font-light">3</span>
              </div>
              <h3 className="font-serif text-lg uppercase font-light mb-2">Generate & Download</h3>
              <p className="text-sm text-gray-600 font-light">
                Create and save professional photos
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleBeginJourney}
          className="bg-black text-white px-12 py-6 text-sm tracking-[0.3em] uppercase font-light hover:bg-gray-900 transition-colors"
        >
          Begin Your Journey
        </button>
        
        <div className="mt-8 text-sm text-gray-500 font-light">
          <p>Training takes about 15 minutes. We'll notify you when ready.</p>
        </div>
      </div>

      {/* Support Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <div className="text-xs tracking-[0.4em] uppercase text-gray-500 mb-8 font-light">
            Need Help?
          </div>
          
          <p className="text-lg font-light text-gray-600 mb-8">
            Questions about your photoshoot setup? We're here to help.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:hello@sselfie.ai" 
              className="border border-black text-black px-6 py-3 text-xs tracking-[0.3em] uppercase font-light hover:bg-black hover:text-white transition-all duration-300"
            >
              Email Support
            </a>
            <a 
              href="/how-it-works" 
              className="border border-black text-black px-6 py-3 text-xs tracking-[0.3em] uppercase font-light hover:bg-black hover:text-white transition-all duration-300"
            >
              View Guide
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}