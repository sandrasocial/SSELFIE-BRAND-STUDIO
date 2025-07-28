import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate authentication processing
    const timer = setTimeout(() => {
      navigate('/app');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-times font-light text-black mb-4">
          Welcome to SSELFIE
        </h1>
        <p className="text-gray-600 mb-8">
          Setting up your account...
        </p>
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    </div>
  );
};

export default AuthCallback;