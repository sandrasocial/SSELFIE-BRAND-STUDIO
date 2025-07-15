import { Link } from "wouter";

interface LoginPromptProps {
  title?: string;
  message?: string;
  showFeatures?: boolean;
}

export default function LoginPrompt({ 
  title = "Access Your AI Studio",
  message = "Sign in to continue with your personalized AI photography experience",
  showFeatures = true 
}: LoginPromptProps) {

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* SSELFIE Branding */}
        <div className="mb-12">
          <h1 className="font-serif text-4xl font-light text-black mb-4">
            SSELFIE STUDIO
          </h1>
          <h2 className="font-serif text-2xl font-light text-black mb-4">
            {title}
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            {message}
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-gray-50 border border-gray-200 p-8 mb-8">
          <button
            onClick={handleLogin}
            className="w-full bg-black text-white py-4 px-8 font-medium tracking-wide uppercase text-sm hover:bg-gray-900 transition-colors mb-6"
          >
            Sign In to Continue
          </button>

          <p className="text-xs text-gray-500 leading-relaxed">
            Secure sign-in • Your personal AI models and data are protected
          </p>
        </div>

        {showFeatures && (
          <div className="space-y-3 text-sm text-gray-700">
            <div className="font-medium text-black">Your AI Studio includes:</div>
            <div>Personal FLUX model training with your selfies</div>
            <div>Maya AI photographer for editorial image generation</div>
            <div>Victoria AI strategist for business development</div>
            <div>Professional landing page templates</div>
            <div>Unlimited creative possibilities</div>
          </div>
        )}

        {/* Back to Home */}
        <div className="mt-8">
          <Link href="/" className="text-sm text-gray-600 hover:text-black transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}