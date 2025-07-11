import React from 'react';
import { Navigation } from '@/components/navigation';
import { AuthForm } from '@/components/auth-form';
import { SandraImages } from '@/lib/sandra-images';

export default function SignUp() {
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-[#0a0a0a]">
        <div className="min-h-screen grid md:grid-cols-2">
          {/* Left side - Image and Headline */}
          <div className="relative hidden md:flex flex-col justify-center p-12 lg:p-20">
            <div className="relative z-10 max-w-lg">
              <h1 className="font-serif text-5xl md:text-6xl font-light tracking-[-0.03em] text-[#f5f5f5] mb-4">
                Ready to start?
              </h1>
              <p className="text-xl text-[#f5f5f5]/80 mb-10 font-inter">
                This is the first step to showing up as her.
              </p>
              <p className="text-[#f5f5f5]/60 italic font-inter">
                &ldquo;It doesn&apos;t have to be perfect. You just have to begin.&rdquo;
              </p>
            </div>

            {/* Background image with overlay */}
            <div className="absolute inset-0">
              <img
                src={SandraImages.editorial.phone1}
                alt="Sandra in action"
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a]/90 to-[#0a0a0a]/70" />
            </div>
          </div>

          {/* Right side - Form */}
          <div className="flex items-center justify-center px-6 py-16 md:py-0 md:px-12 lg:px-20 bg-[#0a0a0a]">
            <div className="w-full max-w-md">
              {/* Mobile only headline */}
              <div className="mb-12 md:hidden">
                <h1 className="font-serif text-4xl font-light tracking-[-0.02em] text-[#f5f5f5] mb-3">
                  Ready to start?
                </h1>
                <p className="text-lg text-[#f5f5f5]/80 font-inter">
                  This is the first step to showing up as her.
                </p>
              </div>
              
              <AuthForm type="signup" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}