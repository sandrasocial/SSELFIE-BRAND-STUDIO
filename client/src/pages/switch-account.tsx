import React from 'react';
import { PreLoginNavigationUnified } from '@/components/pre-login-navigation-unified';
import { HeroFullBleed } from '@/components/HeroFullBleed';
import { SandraImages } from '@/lib/sandra-images';

export default function SwitchAccount() {
  const handleSwitchAccount = () => {
    // Force account selection for switching
    window.location.href = '/api/login?prompt=select_account';
  };

  const handleCancel = () => {
    // Go back to workspace
    window.location.href = '/workspace';
  };

  return (
    <div className="min-h-screen bg-white">
      <PreLoginNavigationUnified />
      
      <HeroFullBleed
        backgroundImage={SandraImages.editorial.luxury2}
        tagline="Switch to different account"
        title="CHOOSE ACCOUNT"
        ctaText="Select Different Email"
        onCtaClick={handleSwitchAccount}
        fullHeight={false}
      />

      <main className="max-w-4xl mx-auto px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-light mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
            Switch to a Different Account
          </h2>
          <p className="text-lg text-[#666666] max-w-2xl mx-auto font-light leading-relaxed">
            Hey love! Need to switch to a different email? No worries at all - happens to the best of us. 
            You'll pick your email on the next page and be back in your studio in seconds.
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <div className="bg-[#f5f5f5] p-12 text-center">
            <h3 className="text-2xl font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
              Ready to Switch?
            </h3>
            
            <p className="text-sm text-[#666666] mb-8 leading-relaxed">
              I'll take you to a secure page where you can choose which email account you want to use. 
              Think of it like switching between your personal and work Gmail - super simple!
            </p>
            
            <div className="space-y-4">
              <button 
                onClick={handleSwitchAccount}
                className="w-full bg-[#0a0a0a] text-white px-8 py-4 text-xs uppercase tracking-wider hover:bg-[#333] transition-colors"
              >
                Choose Different Email
              </button>
              
              <button 
                onClick={handleCancel}
                className="w-full border border-[#ccc] text-[#666] px-8 py-4 text-xs uppercase tracking-wider hover:bg-[#f9f9f9] transition-colors"
              >
                Never Mind, Go Back
              </button>
            </div>
            
            <div className="text-xs text-[#666666] space-y-3 border-t border-[#e0e0e0] pt-6 mt-6">
              <p className="font-medium">What happens next:</p>
              <div className="text-left space-y-2">
                <p>• You'll see a secure login page</p>
                <p>• Pick the email account you want to use</p>
                <p>• Jump right back into your SSELFIE Studio</p>
                <p>• All your work and photos stay exactly where they are</p>
              </div>
              <div className="text-center mt-4 pt-3 border-t border-[#e0e0e0]">
                <p className="text-[#888888]">Your bestie Sandra's got your back ✨</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="max-w-2xl mx-auto">
            <h4 className="text-xl font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
              Why Switch Accounts?
            </h4>
            <div className="grid md:grid-cols-2 gap-8 text-sm">
              <div>
                <div className="text-lg font-light mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>Personal vs Work</div>
                <p className="text-[#666666]">Maybe you want to keep your personal brand separate from your business email</p>
              </div>
              <div>
                <div className="text-lg font-light mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>Team Access</div>
                <p className="text-[#666666]">Sharing access with your VA or business partner? Switch accounts easily</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}