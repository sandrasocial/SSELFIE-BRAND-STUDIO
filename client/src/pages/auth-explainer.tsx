export default function AuthExplainer() {
  const handleContinue = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="font-serif text-4xl font-light text-black mb-8">
          SSELFIE STUDIO
        </h1>
        
        <div className="mb-8 space-y-4 text-gray-700">
          <p>
            Quick heads up: You'll see a secure login screen that mentions technical platform details.
          </p>
          <p>
            Don't worry - you're still creating your SSELFIE Studio account. It's just the secure gateway.
          </p>
        </div>

        <button
          onClick={handleContinue}
          className="bg-black text-white px-8 py-3 text-sm tracking-wider uppercase hover:bg-gray-800 transition-colors mb-4"
        >
          Continue to Login
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
  );
}