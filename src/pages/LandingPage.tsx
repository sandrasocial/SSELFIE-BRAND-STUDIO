import React from 'react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-6xl md:text-8xl font-times font-light tracking-wider text-black mb-8">
              SSELFIE
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Transform your selfies into a complete business launch. 
              AI-powered personal branding that scales globally.
            </p>
            <div className="space-x-6">
              <a
                href="/auth/callback"
                className="inline-block bg-black text-white px-8 py-3 font-medium hover:bg-gray-800 transition-colors"
              >
                Start Building
              </a>
              <a
                href="#features"
                className="inline-block text-black border border-black px-8 py-3 font-medium hover:bg-black hover:text-white transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-times font-light text-black mb-6">
              Your Complete Brand Ecosystem
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <h3 className="text-xl font-medium text-black mb-4">AI Image Generation</h3>
              <p className="text-gray-600 leading-relaxed">
                Custom FLUX-trained models transform your selfies into professional brand photography.
              </p>
            </div>
            
            <div className="text-center">
              <h3 className="text-xl font-medium text-black mb-4">Brand Designer</h3>
              <p className="text-gray-600 leading-relaxed">
                4 luxury templates with Sandra AI Designer integration for complete brand identity.
              </p>
            </div>
            
            <div className="text-center">
              <h3 className="text-xl font-medium text-black mb-4">Business Automation</h3>
              <p className="text-gray-600 leading-relaxed">
                Payment processing, email automation, and customer management - all included.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;