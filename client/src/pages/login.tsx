import { GlobalFooter } from '../components/global-footer';

export default function Login() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">SSELFIE Studio</h1>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/" className="text-gray-600 hover:text-black">Home</a>
              <a href="/pricing" className="text-gray-600 hover:text-black">Pricing</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Replit Auth Login */}
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
        <div className="bg-white p-8 rounded-lg shadow-sm border max-w-md w-full">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to access your SSELFIE Studio workspace</p>
          </div>
          
          <a 
            href="/api/login"
            className="w-full bg-black text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm0 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10z"/>
              <path d="M8 12l3-3v2h5v2h-5v2z"/>
            </svg>
            Sign in with Replit
          </a>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Don't have access? <a href="/pricing" className="text-black hover:underline">Subscribe first</a>
            </p>
          </div>
        </div>
      </div>

      <GlobalFooter />
    </div>
  );
}