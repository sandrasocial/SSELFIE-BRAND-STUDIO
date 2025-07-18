import React from 'react';

interface ConversationTestComponentProps {
  messageNumber: number;
  systemStatus: 'active' | 'verified' | 'testing';
}

export default function ConversationTestComponent({ 
  messageNumber = 51, 
  systemStatus = 'verified' 
}: ConversationTestComponentProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Gallery Style */}
      <div className="max-w-6xl mx-auto px-8 py-16">
        <div className="text-center space-y-12">
          
          {/* Editorial Headline */}
          <h1 className="text-6xl md:text-8xl font-thin tracking-tight text-black"
              style={{ fontFamily: 'Times New Roman, serif' }}>
            CONVERSATION
          </h1>
          
          <div className="w-24 h-px bg-black mx-auto"></div>
          
          {/* Subheadline */}
          <h2 className="text-2xl md:text-3xl font-light text-black uppercase tracking-wide"
              style={{ fontFamily: 'Times New Roman, serif' }}>
            System Verification
          </h2>
          
          {/* Status Display */}
          <div className="bg-gray-50 p-12 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              
              <div className="space-y-4">
                <p className="text-sm font-light text-gray-600 uppercase tracking-wide">
                  Message Count
                </p>
                <p className="text-4xl font-thin text-black"
                   style={{ fontFamily: 'Times New Roman, serif' }}>
                  #{messageNumber}
                </p>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm font-light text-gray-600 uppercase tracking-wide">
                  System Status
                </p>
                <p className="text-4xl font-thin text-black capitalize"
                   style={{ fontFamily: 'Times New Roman, serif' }}>
                  {systemStatus}
                </p>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm font-light text-gray-600 uppercase tracking-wide">
                  Design System
                </p>
                <p className="text-4xl font-thin text-black"
                   style={{ fontFamily: 'Times New Roman, serif' }}>
                  Active
                </p>
              </div>
              
            </div>
          </div>
          
          {/* Editorial Quote */}
          <div className="py-16">
            <blockquote className="text-3xl md:text-4xl font-light italic text-black leading-relaxed max-w-4xl mx-auto"
                        style={{ fontFamily: 'Times New Roman, serif' }}>
              "This component represents the moment when conversation becomes art—
              when technical verification transforms into luxury experience."
            </blockquote>
          </div>
          
          {/* Status Indicators */}
          <div className="space-y-6">
            {['Memory Management', 'Design System', 'Component Creation', 'Editorial Aesthetic'].map((feature, index) => (
              <div key={index} className="flex items-center justify-center space-x-4">
                <div className="w-2 h-2 bg-black rounded-full"></div>
                <span className="text-sm font-light text-gray-600 uppercase tracking-wide">
                  {feature}
                </span>
                <span className="text-sm font-light text-black">
                  Verified
                </span>
              </div>
            ))}
          </div>
          
        </div>
      </div>
      
      {/* Footer */}
      <div className="border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-8 text-center">
          <p className="text-sm font-light text-gray-600">
            SSELFIE STUDIO • Luxury Editorial Design System • Message #{messageNumber}
          </p>
        </div>
      </div>
      
    </div>
  );
}