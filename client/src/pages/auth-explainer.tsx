import { useState } from "react";

export default function AuthExplainer() {
  const [showDetails, setShowDetails] = useState(false);

  const handleContinue = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* SSELFIE Branding */}
        <div className="mb-8">
          <img 
            src="https://i.postimg.cc/65NtYqMK/Black-transperent-logo.png" 
            alt="SSELFIE Studio" 
            className="w-16 h-16 mx-auto mb-4"
          />
          <h1 className="font-serif text-3xl font-light text-black mb-2">
            SSELFIE STUDIO
          </h1>
          <p className="text-gray-600 text-lg">
            Ready to access your AI photography studio?
          </p>
        </div>

        {/* Main Explanation */}
        <div className="bg-gray-50 border border-gray-200 p-8 mb-6">
          <h2 className="text-lg font-medium text-black mb-4">
            Quick & Secure Login
          </h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            We use enterprise-grade security for your account. You'll see a login page 
            that mentions technical terms, but don't worry - it's just the secure system 
            that protects your data.
          </p>
          
          <div className="text-left space-y-3 mb-6">
            <div className="flex items-start space-x-3">
              <span className="text-green-600 font-bold">✓</span>
              <span className="text-sm text-gray-700">Your SSELFIE Studio account stays completely private</span>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-green-600 font-bold">✓</span>
              <span className="text-sm text-gray-700">We only access your name and email for your profile</span>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-green-600 font-bold">✓</span>
              <span className="text-sm text-gray-700">Your AI photos and models belong exclusively to you</span>
            </div>
          </div>

          {/* Technical Details Toggle */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-gray-500 hover:text-gray-700 underline mb-4"
          >
            {showDetails ? "Hide" : "Show"} technical details
          </button>

          {showDetails && (
            <div className="bg-white border border-gray-200 p-4 text-left text-xs text-gray-600 leading-relaxed">
              <p className="mb-2">
                <strong>What you'll see:</strong> The login page may reference "Replit account" - 
                this is the name of the secure infrastructure that powers SSELFIE Studio and many 
                professional applications.
              </p>
              <p>
                <strong>What it means:</strong> You're creating/accessing your secure SSELFIE Studio 
                account through enterprise-grade authentication. Think of it like logging into your 
                bank through a secure gateway.
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleContinue}
            className="w-full py-4 bg-black text-white text-sm tracking-wide uppercase hover:bg-gray-800 transition-colors"
          >
            Continue to Secure Login
          </button>
          
          <button
            onClick={() => window.history.back()}
            className="w-full py-3 border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 transition-colors"
          >
            Go Back
          </button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">
            Trusted by photographers and entrepreneurs worldwide
          </p>
          <div className="flex justify-center space-x-4 text-xs text-gray-400">
            <span>🔒 256-bit Encryption</span>
            <span>🛡️ GDPR Compliant</span>
            <span>✅ SOC 2 Security</span>
          </div>
        </div>
      </div>
    </div>
  );
}