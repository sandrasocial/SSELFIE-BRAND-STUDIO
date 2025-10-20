import * as React from 'react';
import { SignIn } from '@stackframe/react';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <SignIn
        fullPage={true}
        automaticRedirect={true}
        firstTab="password"
        extraInfo={
          <>
            When signing in, you agree to our{' '}
            <a href="/legal/terms" className="text-blue-600 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/legal/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
          </>
        }
      />
    </div>
  );
}