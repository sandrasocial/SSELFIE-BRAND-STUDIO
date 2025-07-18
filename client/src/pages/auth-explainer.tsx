import { useState } from "react";

export default function AuthExplainer() {
  const [showDetails, setShowDetails] = useState(false);

  const handleContinue = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* SSELFIE Branding - Editorial Style */}
        <div className="text-center mb-16">
          <h1 className="font-serif text-5xl font-light text-black mb-6">
            SSELFIE STUDIO
          </h1>
          <p className="text-lg text-gray-600 font-light leading-relaxed max-w-md mx-auto">
            Your personal AI photography studio awaits
          </p>
        </div>

        {/* Main Content - Editorial Layout */}
        <div className="max-w-xl mx-auto">
          <div className="mb-12">
            <h2 className="font-serif text-2xl font-light text-black mb-8 text-center">
              One More Step
            </h2>
            
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p>
                Here's what happens next: You'll be taken to a secure login screen. It might mention some technical terms about the platform that powers this, but don't let that confuse you.
              </p>
              
              <p>
                Think of it like this - when you book a luxury hotel through a booking platform, you still get your beautiful suite. The booking platform is just the secure gateway.
              </p>
              
              <p>
                Your SSELFIE Studio account, your AI photos, your personal brand - it's all completely yours and private.
              </p>
            </div>
          </div>

          {/* What You Get */}
          <div className="border-t border-gray-200 pt-8 mb-12">
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <span className="text-black font-medium">•</span>
                <span className="text-gray-700">Your personal AI model trained on your photos</span>
              </div>
              <div className="flex items-start space-x-4">
                <span className="text-black font-medium">•</span>
                <span className="text-gray-700">Complete privacy - your data stays yours</span>
              </div>
              <div className="flex items-start space-x-4">
                <span className="text-black font-medium">•</span>
                <span className="text-gray-700">Professional AI photography in minutes</span>
              </div>
            </div>
          </div>

          {/* Technical Details Toggle */}
          <div className="text-center mb-12">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-gray-500 hover:text-black transition-colors border-b border-gray-300 hover:border-black"
            >
              {showDetails ? "Hide technical details" : "Why does the login mention other platforms?"}
            </button>

            {showDetails && (
              <div className="mt-6 p-6 bg-gray-50 text-left text-sm text-gray-600 leading-relaxed">
                <p className="mb-4">
                  <strong>The honest answer:</strong> SSELFIE Studio is built on enterprise-grade infrastructure. The login screen you'll see is from the secure authentication system that powers thousands of professional applications.
                </p>
                <p>
                  <strong>What this means for you:</strong> Bank-level security protecting your account and images. The technical platform name appears during login, but you're creating your SSELFIE Studio account.
                </p>
              </div>
            )}
          </div>

          {/* Continue Button */}
          <div className="text-center">
            <button
              onClick={handleContinue}
              className="bg-black text-white px-12 py-4 text-sm tracking-wider uppercase hover:bg-gray-800 transition-colors mb-6"
            >
              Continue to Studio
            </button>
            
            <div>
              <button
                onClick={() => window.history.back()}
                className="text-sm text-gray-500 hover:text-black transition-colors"
              >
                ← Go back
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-20 pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-400 mb-3">
            Trusted by thousands of creators worldwide
          </p>
          <div className="flex justify-center space-x-8 text-xs text-gray-400">
            <span>Enterprise Security</span>
            <span>GDPR Compliant</span>
            <span>Privacy First</span>
          </div>
        </div>
      </div>
    </div>
  );
}