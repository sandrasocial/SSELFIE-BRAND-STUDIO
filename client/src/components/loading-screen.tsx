import React from 'react';
import { PreLoginNavigationUnified } from '../components/pre-login-navigation-unified';
import { SandraImages } from '../lib/sandra-images';

interface LoadingScreenProps {
  message?: string;
  showNavigation?: boolean;
}

export function LoadingScreen({ message = "Loading...", showNavigation = true }: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-white">
      {showNavigation && <PreLoginNavigationUnified />}
      
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mb-8">
            <div className="animate-spin w-12 h-12 border-4 border-[#0a0a0a] border-t-transparent rounded-full mx-auto"></div>
          </div>
          
          <h2 className="text-2xl font-light mb-4 text-[#0a0a0a]" style={{ fontFamily: 'Times New Roman, serif' }}>
            {message}
          </h2>
          
          <p className="text-sm text-[#666666] max-w-md mx-auto">
            Building something beautiful takes a moment. Thank you for your patience.
          </p>
        </div>
      </div>
    </div>
  );
}

export function InlineLoader({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#0a0a0a] border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-sm text-[#666666]">{message}</p>
      </div>
    </div>
  );
}

export function ProcessingLoader({ 
  title = "Processing...", 
  steps = [], 
  currentStep = 0 
}: { 
  title?: string; 
  steps?: string[]; 
  currentStep?: number; 
}) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="animate-spin w-12 h-12 border-4 border-[#0a0a0a] border-t-transparent rounded-full mx-auto"></div>
        </div>
        
        <h2 className="text-2xl font-light mb-6 text-[#0a0a0a]" style={{ fontFamily: 'Times New Roman, serif' }}>
          {title}
        </h2>
        
        {steps.length > 0 && (
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={index} className={`text-left p-3 border ${
                index === currentStep 
                  ? 'bg-[#f5f5f5] border-[#0a0a0a]' 
                  : index < currentStep 
                    ? 'bg-[#f5f5f5] border-[#e5e5e5] text-[#666666]' 
                    : 'border-[#e5e5e5] text-[#666666]'
              }`}>
                <div className="flex items-center">
                  <div className="text-sm font-light mr-3" style={{ fontFamily: 'Times New Roman, serif' }}>
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <div className="text-sm">{step}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <p className="text-xs text-[#666666] mt-6">
          Please don't close this page while we're processing your request.
        </p>
      </div>
    </div>
  );
}