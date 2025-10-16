import { useState, useEffect, useMemo, useRef } from '../lib/react-hooks';
import { stackClientApp } from '../../../stack/client.js';

// Apply the patch to Stack Auth
export function patchStackFrameReact() {
  try {
    // Create our own useUser implementation
    const originalUseUser = stackClientApp.useUser;
    Object.defineProperty(stackClientApp, 'useUser', {
      value: function useUserPatched() {
        const [data, setData] = useState<unknown | null>(null);
        const [error, setError] = useState<Error | null>(null);
        
        // Use a ref to track if we are mounting
        const mountingRef = useRef(true);
        const promiseRef = useRef<Promise<unknown> | null>(null);

        if (!data && !error && mountingRef.current) {
          // Only create one promise
          if (!promiseRef.current) {
            promiseRef.current = stackClientApp.getUser()
              .then((user: any) => {
                setData(user);
                return user;
              })
              .catch((err: Error) => {
                setError(err);
                throw err;
              });
          }
          
          // Throw the promise for Suspense
          throw promiseRef.current;
        }

        // After first mount, don't throw again
        useEffect(() => {
          mountingRef.current = false;
        }, []);

        if (error) throw error;
        return data;
      },
      configurable: true,
      enumerable: true
    });

    console.log('✅ Stack Auth useUser patched successfully');
  } catch (err) {
    console.error('❌ Failed to patch Stack Auth:', err);
    throw err;
  }
}