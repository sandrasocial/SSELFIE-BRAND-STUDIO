import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function BuildOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Your Phone Is All You Need",
      subtitle: "No fancy equipment. No design degree. Just you + window light.",
      description: "In the next 20 minutes, you'll transform from hiding to showing up as the version of yourself you've always wanted to be."
    },
    {
      title: "Upload Your Truth",
      subtitle: "10-15 selfies with natural light. Raw. Real. Unfiltered.",
      description: "MAYA will transform these into editorial-quality brand photos that look like you hired a celebrity photographer."
    },
    {
      title: "Watch The Magic Happen",
      subtitle: "AI styling that doesn't look AI. It looks like you.",
      description: "From phone selfies to complete business launch in 20 minutes. Your mess becomes your message."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Full-bleed hero section */}
      <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        
        {/* Editorial content container */}
        <div className="max-w-4xl mx-auto px-8 text-center">
          
          {/* Main headline - Times New Roman */}
          <h1 
            className="text-6xl md:text-8xl font-serif text-black uppercase tracking-wide mb-8 leading-tight"
            style={{ fontFamily: 'Times New Roman, serif', fontWeight: 200 }}
          >
            Your Phone.<br />
            Your Rules.<br />
            Your Empire.
          </h1>

          {/* Editorial subtitle */}
          <p className="text-xl text-gray-600 mb-16 max-w-2xl mx-auto leading-relaxed">
            Transform from hiding behind filters to showing up as the confident, magnetic, 
            unapologetic version of yourself you've always wanted to be.
          </p>

          {/* Step indicator */}
          <div className="flex justify-center mb-16">
            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentStep ? 'bg-black' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Current step content */}
          <div className="mb-16 transition-all duration-500">
            <h2 
              className="text-4xl font-serif text-black mb-4"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              {steps[currentStep].title}
            </h2>
            <p className="text-2xl text-gray-800 mb-6 font-light">
              {steps[currentStep].subtitle}
            </p>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {steps[currentStep].description}
            </p>
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-center space-x-6">
            {currentStep > 0 && (
              <Button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-900 px-8 py-3"
              >
                Previous
              </Button>
            )}
            
            {currentStep < steps.length - 1 ? (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="border-black text-black hover:bg-black hover:text-white px-8 py-3"
              >
                Continue
              </Button>
            ) : (
              <Button className="bg-black text-white hover:bg-gray-800 px-12 py-3 text-lg">
                Start Building Your Empire
              </Button>
            )}
          </div>

          {/* Bottom editorial quote */}
          <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2">
            <p 
              className="text-2xl italic text-gray-600 max-w-2xl text-center leading-relaxed"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              "This isn't about perfect photos. It's about your personal brand."
            </p>
          </div>
        </div>
      </div>

      {/* Transformation preview section */}
      <div className="py-32 bg-gray-50">
        <div className="max-w-6xl mx-auto px-8 text-center">
          <h3 
            className="text-5xl font-serif text-black uppercase tracking-wide mb-16"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            The Transformation
          </h3>
          
          <div className="grid md:grid-cols-3 gap-16">
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-8 flex items-center justify-center">
                <span className="text-4xl text-gray-400">📱</span>
              </div>
              <h4 className="text-2xl font-serif text-black mb-4">Before</h4>
              <p className="text-gray-600">Phone selfies, hiding, "I don't know what I'm doing"</p>
            </div>
            
            <div className="text-center">
              <div className="w-32 h-32 bg-black rounded-full mx-auto mb-8 flex items-center justify-center">
                <span className="text-4xl text-white">✨</span>
              </div>
              <h4 className="text-2xl font-serif text-black mb-4">During</h4>
              <p className="text-gray-600">AI magic, one brave upload, watching yourself become</p>
            </div>
            
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-gray-800 to-black rounded-full mx-auto mb-8 flex items-center justify-center">
                <span className="text-4xl text-white">👑</span>
              </div>
              <h4 className="text-2xl font-serif text-black mb-4">After</h4>
              <p className="text-gray-600">Editorial perfection, confident, magnetic, unapologetic</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}