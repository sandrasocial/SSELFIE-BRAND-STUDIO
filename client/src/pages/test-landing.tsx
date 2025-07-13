export default function TestLanding() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-black mb-4">SSELFIE STUDIO</h1>
        <p className="text-xl text-gray-600">Test Landing Page Working</p>
        <button 
          onClick={() => window.location.href = '/api/login'}
          className="mt-8 px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors"
        >
          Login
        </button>
      </div>
    </div>
  );
}