interface BrandedLoginButtonProps {
  text?: string;
  subtitle?: string;
  className?: string;
  showBrand?: boolean;
}

export default function BrandedLoginButton({ 
  text = "Sign in to continue",
  subtitle = "Access your AI photography studio",
  className = "",
  showBrand = true 
}: BrandedLoginButtonProps) {

  const handleLogin = () => {
    window.location.href = "/login";
  };

  return (
    <div className={`text-center ${className}`}>
      {showBrand && (
        <div className="mb-6">
          <h2 className="font-serif text-2xl font-light text-black mb-2">
            SSELFIE STUDIO
          </h2>
          <p className="text-gray-600 text-sm">
            {subtitle}
          </p>
        </div>
      )}

      <button
        onClick={handleLogin}
        className="bg-black text-white py-3 px-8 font-medium tracking-wide uppercase text-sm hover:bg-gray-900 transition-colors w-full max-w-xs"
      >
        {text}
      </button>

      <p className="text-xs text-gray-500 mt-4 leading-relaxed">
        Secure authentication • Your data is protected
      </p>
    </div>
  );
}