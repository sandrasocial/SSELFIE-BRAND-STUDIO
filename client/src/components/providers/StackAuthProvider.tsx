import React from "react";
import { StackProvider, StackTheme } from "@stackframe/react";
// ⚠️ CRITICAL: stackClientApp is already initialized in stack/client.ts
// It's imported directly here - no lazy loading needed
import { stackClientApp } from "../../../../stack/client";


interface StackAuthProviderProps {
  children: React.ReactNode;
}

/**
 * ✅ SIMPLIFIED: StackAuthProvider now just wraps children with StackProvider
 *
 * Stack Auth initialization happens in stack/client.ts at module load time
 * This component no longer does any initialization - it just provides the context
 *
 * This eliminates:
 * - Lazy loading delays
 * - Initialization timeouts
 * - Duplicate loading screens
 * - Conflicting initialization attempts
 */
export default function StackAuthProvider({ children }: StackAuthProviderProps) {
  // stackClientApp is already initialized in stack/client.ts
  // It's imported at the top of this file

  if (!stackClientApp) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-600 mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">Stack Auth is not initialized</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ✅ CLEANUP: Removed nested Suspense boundary
  // RootWrapper handles all Suspense boundaries
  return (
    <StackProvider app={stackClientApp as any}>
      <StackTheme>
        {children}
      </StackTheme>
    </StackProvider>
  );
}