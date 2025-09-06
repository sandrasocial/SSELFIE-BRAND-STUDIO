import React from 'react';
import { StackProvider } from "@stackframe/stack";

interface StackAuthProviderProps {
  children: React.ReactNode;
}

export function StackAuthProvider({ children }: StackAuthProviderProps) {
  return (
    <StackProvider
      projectId={import.meta.env.VITE_NEXT_PUBLIC_STACK_PROJECT_ID || "253d7343-a0d4-43a1-be5c-822f590d40be"}
      publishableClientKey={import.meta.env.VITE_NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY}
    >
      {children}
    </StackProvider>
  );
}