import { SignIn } from '@stackframe/react';
import { stackClientApp } from '../src/stack';

export default function CredentialSignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white to-[#f5f3f0]">
      <div className="max-w-md w-full px-6 py-12 rounded-xl shadow-lg bg-white/80 border border-[#e5e0d8]">
        <h1 className="font-serif text-3xl text-center mb-6 tracking-tight text-[#1a1a1a]">
          Welcome to SSELFIE STUDIO
        </h1>
        <p className="text-center text-[#6b5e4e] mb-8 font-light">
          Sign in to your Studio
        </p>
        <SignIn app={stackClientApp} />
      </div>
    </div>
  );
}
