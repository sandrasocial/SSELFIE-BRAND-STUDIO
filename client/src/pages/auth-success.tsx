import { useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';

export default function AuthSuccess() {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Redirect to workspace after successful authentication
    setTimeout(() => {
      setLocation('/workspace');
    }, 2000);
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Authentication Successful</h1>
        <p className="text-gray-600">Redirecting to your workspace...</p>
      </div>
    </div>
  );
}