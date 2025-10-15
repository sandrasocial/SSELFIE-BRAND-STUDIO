import React from 'react';
import { StackProvider, StackTheme } from '@stackframe/react';
import { stackClientApp } from '../../../stack/client';

interface StackAuthWrapperProps {
  children: React.ReactNode;
}

export default function StackAuthWrapper({ children }: StackAuthWrapperProps) {
  console.log('🔐 Initializing Stack Auth wrapper...');
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    // Initialize Stack Auth
    try {
      if (!stackClientApp) {
        console.error('❌ Stack Auth client app is not initialized');
        return;
      }

      // Test Stack Auth initialization
      Promise.resolve(stackClientApp.getUser())
        .then(() => {
          console.log('✅ Stack Auth initialized successfully');
          setIsReady(true);
        })
        .catch((error) => {
          // This is expected if no user is signed in
          console.log('ℹ️ Stack Auth initialized (no user)', error);
          setIsReady(true);
        });
    } catch (error) {
      console.error('❌ Stack Auth initialization error:', error);
    }
  }, []);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <StackProvider app={stackClientApp as any /* TODO: Fix type */}>
      <StackTheme>
        {children}
      </StackTheme>
    </StackProvider>
  );
}