import React from 'react';
import { StackProvider } from "@stackframe/stack";

interface StackAuthProviderProps {
  children: React.ReactNode;
}

export function StackAuthProvider({ children }: StackAuthProviderProps) {
  // Use the project ID from the JWKS URL since we have that
  const projectId = "253d7343-a0d4-43a1-be5c-822f590d40be";
  const publishableKey = import.meta.env.VITE_NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY;
  
  if (!publishableKey) {
    console.error('❌ Stack Auth: Missing VITE_NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY');
    // Return children without Stack Auth if key is missing
    return <>{children}</>;
  }

  console.log('✅ Stack Auth: Initializing with project ID:', projectId);
  
  return (
    <StackProvider
      projectId={projectId}
      publishableClientKey={publishableKey}
    >
      {children}
    </StackProvider>
  );
}