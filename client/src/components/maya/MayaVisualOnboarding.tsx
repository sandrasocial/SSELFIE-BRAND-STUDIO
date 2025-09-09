/**
 * MAYA VISUAL ONBOARDING - Luxury Card-Based Interface
 * Replaces static forms with sophisticated visual selection
 * Based on SSELFIE Studio luxury design system
 */

import React, { useState, useEffect } from 'react';
import { useToast } from '../../hooks/use-toast';

interface OnboardingData {
  gender?: 'woman' | 'man' | 'prefer-not-to-say';
  preferredName?: string;
  primaryUse?: 'business' | 'personal' | 'both';
  styleVibe?: string;
}

interface MayaVisualOnboardingProps {
  onComplete: (data: OnboardingData) => void;
  isLoading?: boolean;
  initialMessage?: string;
}

export const MayaVisualOnboarding: React.FC<MayaVisualOnboardingProps> = ({
  onComplete,
  isLoading = false,
  initialMessage = "Hi there! ✨ I'm Maya, your personal AI stylist. Let me get to know you so I can create perfect photos for your brand!"
}) => {
  const [currentStep, setCurrentStep] = useState<'welcome' | 'gender' | 'name' | 'use' | 'style'>('welcome');
  const [data, setData] = useState<OnboardingData>({});
  const [isAnimating, setIsAnimating] = useState(false);
  const { toast } = useToast();

  const handleNext = (stepData: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...stepData }));
    
    setIsAnimating(true);
    setTimeout(() => {
      switch (currentStep) {
        case 'welcome': setCurrentStep('gender'); break;
        case 'gender': setCurrentStep('name'); break;
        case 'name': setCurrentStep('use'); break;
        case 'use': setCurrentStep('style'); break;
        case 'style': 
          onComplete({ ...data, ...stepData });
          break;
      }
      setIsAnimating(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className={`max-w-2xl w-full transition-all duration-500 ${isAnimating ? 'opacity-0 transform translate-y-8' : 'opacity-100 transform translate-y-0'}`}>
        
        {/* Maya Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-6 mb-8">
            <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-sm font-light tracking-wider relative">
              MAYA
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="text-left">
              <h1 className="font-serif text-2xl font-light tracking-wider uppercase mb-1">Personal AI Stylist</h1>
              <p className="text-sm text-gray-600 tracking-wider uppercase">SSELFIE Studio</p>
            </div>
          </div>
        </div>

        {currentStep === 'welcome' && <WelcomeStep message={initialMessage} onNext={() => handleNext({})} />}
        {currentStep === 'gender' && <GenderStep onNext={(gender) => handleNext({ gender })} />}
        {currentStep === 'name' && <NameStep onNext={(preferredName) => handleNext({ preferredName })} />}
        {currentStep === 'use' && <UseStep onNext={(primaryUse) => handleNext({ primaryUse })} />}
        {currentStep === 'style' && <StyleStep onNext={(styleVibe) => handleNext({ styleVibe })} isLoading={isLoading} />}
      </div>
    </div>
  );
};

// Welcome Step
const WelcomeStep: React.FC<{ message: string; onNext: () => void }> = ({ message, onNext }) => (
  <div className="text-center">
    <div className="mb-12">
      <p className="text-lg leading-relaxed text-gray-800 max-w-xl mx-auto mb-8 font-light">
        {message}
      </p>
      <div className="w-16 h-px bg-black mx-auto mb-8"></div>
      <p className="text-sm text-gray-600 tracking-wide uppercase">Ready to get started?</p>
    </div>
    
    <button
      onClick={onNext}
      className="group relative bg-black text-white px-12 py-4 text-sm tracking-wider uppercase font-light transition-all duration-400 hover:bg-gray-900 hover:-translate-y-1 overflow-hidden"
    >
      <span className="relative z-10">Let's Begin</span>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 group-hover:animate-pulse"></div>
    </button>
  </div>
);

// Gender Selection Step
const GenderStep: React.FC<{ onNext: (gender: 'woman' | 'man' | 'prefer-not-to-say') => void }> = ({ onNext }) => (
  <div>
    <div className="text-center mb-12">
      <h2 className="font-serif text-3xl font-light tracking-wider uppercase mb-6">Gender Selection</h2>
      <p className="text-gray-600 max-w-md mx-auto font-light leading-relaxed">
        This helps me create the perfect styling and poses that highlight your best features.
      </p>
    </div>

    <div className="space-y-4 max-w-md mx-auto">
      {[
        { value: 'woman' as const, label: 'Woman', description: 'Elegant, powerful, sophisticated styling' },
        { value: 'man' as const, label: 'Man', description: 'Sharp, confident, professional looks' },
        { value: 'prefer-not-to-say' as const, label: 'Prefer not to say', description: 'Versatile styling approach' }
      ].map(option => (
        <button
          key={option.value}
          onClick={() => onNext(option.value)}
          className="w-full p-6 border border-gray-200 hover:border-black transition-all duration-400 text-left group hover:shadow-lg hover:-translate-y-1"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl font-light tracking-wide mb-2 group-hover:text-black transition-colors">
                {option.label}
              </h3>
              <p className="text-sm text-gray-600 font-light">
                {option.description}
              </p>
            </div>
            <div className="text-gray-400 group-hover:text-black transition-colors text-xl">→</div>
          </div>
        </button>
      ))}
    </div>
  </div>
);

// Name Input Step
const NameStep: React.FC<{ onNext: (name: string) => void }> = ({ onNext }) => {
  const [name, setName] = useState('');

  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="font-serif text-3xl font-light tracking-wider uppercase mb-6">What should I call you?</h2>
        <p className="text-gray-600 max-w-md mx-auto font-light leading-relaxed">
          I love working with clients personally. Your name helps me create a warm, personalized experience.
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your preferred name"
            className="w-full p-6 border-b-2 border-gray-200 focus:border-black bg-transparent text-lg font-light tracking-wide text-center focus:outline-none transition-colors"
            autoFocus
          />
        </div>
        
        <div className="text-center">
          <button
            onClick={() => name.trim() && onNext(name.trim())}
            disabled={!name.trim()}
            className="bg-black text-white px-12 py-4 text-sm tracking-wider uppercase font-light transition-all duration-400 hover:bg-gray-900 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

// Primary Use Step
const UseStep: React.FC<{ onNext: (use: 'business' | 'personal' | 'both') => void }> = ({ onNext }) => (
  <div>
    <div className="text-center mb-12">
      <h2 className="font-serif text-3xl font-light tracking-wider uppercase mb-6">Photo Purpose</h2>
      <p className="text-gray-600 max-w-md mx-auto font-light leading-relaxed">
        Where will you use these photos? This helps me create the right energy and styling approach.
      </p>
    </div>

    <div className="grid gap-4 max-w-lg mx-auto">
      {[
        { 
          value: 'business' as const, 
          label: 'Business & Professional', 
          description: 'LinkedIn, website, client meetings',
          icon: '💼'
        },
        { 
          value: 'personal' as const, 
          label: 'Personal Brand & Social', 
          description: 'Instagram, personal branding, lifestyle',
          icon: '✨'
        },
        { 
          value: 'both' as const, 
          label: 'Both Business & Personal', 
          description: 'Versatile photos for all platforms',
          icon: '🎯'
        }
      ].map(option => (
        <button
          key={option.value}
          onClick={() => onNext(option.value)}
          className="p-6 border border-gray-200 hover:border-black transition-all duration-400 text-left group hover:shadow-lg hover:-translate-y-1"
        >
          <div className="flex items-start gap-4">
            <span className="text-2xl">{option.icon}</span>
            <div className="flex-1">
              <h3 className="font-serif text-lg font-light tracking-wide mb-2 group-hover:text-black transition-colors">
                {option.label}
              </h3>
              <p className="text-sm text-gray-600 font-light">
                {option.description}
              </p>
            </div>
            <div className="text-gray-400 group-hover:text-black transition-colors">→</div>
          </div>
        </button>
      ))}
    </div>
  </div>
);

// Style Vibe Step
const StyleStep: React.FC<{ onNext: (style: string) => void; isLoading: boolean }> = ({ onNext, isLoading }) => (
  <div>
    <div className="text-center mb-12">
      <h2 className="font-serif text-3xl font-light tracking-wider uppercase mb-6">Your Style Vibe</h2>
      <p className="text-gray-600 max-w-md mx-auto font-light leading-relaxed">
        What style makes you feel most confident and powerful? Choose what resonates with you.
      </p>
    </div>

    <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
      {[
        { label: 'Classic & Polished', description: 'Timeless elegance, clean lines, sophisticated' },
        { label: 'Bold & Statement', description: 'Strong colors, eye-catching, powerful presence' },
        { label: 'Creative & Expressive', description: 'Unique textures, artistic, authentic' },
        { label: 'Relaxed Professional', description: 'Approachable, casual elevated, warm' },
        { label: 'Luxury & Editorial', description: 'High-fashion, editorial, aspirational' },
        { label: 'Modern & Minimalist', description: 'Clean, contemporary, effortless chic' }
      ].map(style => (
        <button
          key={style.label}
          onClick={() => onNext(style.label)}
          disabled={isLoading}
          className="p-6 border border-gray-200 hover:border-black transition-all duration-400 text-left group hover:shadow-lg hover:-translate-y-1 disabled:opacity-50 disabled:transform-none"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-light tracking-wide mb-2 group-hover:text-black transition-colors">
                {style.label}
              </h3>
              <p className="text-sm text-gray-600 font-light">
                {style.description}
              </p>
            </div>
            <div className="text-gray-400 group-hover:text-black transition-colors">
              {isLoading ? '⏳' : '→'}
            </div>
          </div>
        </button>
      ))}
    </div>

    {isLoading && (
      <div className="text-center mt-8">
        <p className="text-gray-600 font-light tracking-wide">
          Perfect! Setting up your personalized styling experience...
        </p>
      </div>
    )}
  </div>
);