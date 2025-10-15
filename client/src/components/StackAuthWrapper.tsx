import React from 'react';
import { StackProvider, StackTheme } from '@stackframe/react';
import { stackClientApp } from '../../../stack/client';

interface StackAuthWrapperProps {
  children: React.ReactNode;
}

export default function StackAuthWrapper({ children }: StackAuthWrapperProps) {
  console.log('🔐 Initializing Stack Auth wrapper...');

  // Ensure React.forwardRef is available
  if (!React.forwardRef) {
    console.error('❌ React.forwardRef is not available in StackAuthWrapper!');
    throw new Error('React.forwardRef is required for Stack Auth');
  }

  console.log('✅ React.forwardRef available, initializing Stack Auth...');

  return (
    <StackProvider app={stackClientApp as any}>
      <StackTheme>
        {children}
      </StackTheme>
    </StackProvider>
  );
}