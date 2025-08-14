import { LoginForm } from '../components/auth/LoginForm';
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

      {/* Login Form */}
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
        <LoginForm />
      </div>

      <GlobalFooter />
    </div>
  );
}