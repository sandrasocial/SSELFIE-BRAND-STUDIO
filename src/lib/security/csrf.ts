import { useState, useEffect } from 'react';

export const useCSRFToken = () => {
  const [csrfToken, setCSRFToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch('/api/security/csrf-token');
        const data = await response.json();
        setCSRFToken(data.token);
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
      }
    };

    fetchToken();
  }, []);

  return csrfToken;
};

export const CSRFProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const csrfToken = useCSRFToken();

  if (!csrfToken) {
    return null; // Or a loading state
  }

  return (
    <>
      <meta name="csrf-token" content={csrfToken} />
      {children}
    </>
  );
};