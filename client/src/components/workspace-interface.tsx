import React, { useState } from 'react';
import { EditorialImage } from './sandra-image-library';

interface WorkspaceInterfaceProps {
  onPreview?: () => void;
  onLaunch?: () => void;
}

export const WorkspaceInterface: React.FC<WorkspaceInterfaceProps> = ({
  onPreview,
  onLaunch
}) => {
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    { id: 1, title: "AI Images", description: "30 editorial shots ready", status: "complete" },
    { id: 2, title: "Templates", description: "Luxury layouts selected", status: "complete" },
    { id: 3, title: "Copy", description: "Your voice, amplified", status: "in-progress" },
    { id: 4, title: "Setup", description: "Payments & booking ready", status: "pending" },
  ];

  const aiMessages = [
    { text: "Your images are perfect. Let's build your story around them.", time: "Now" },
    { text: "I've generated your brand copy. Want to see it?", time: "2 min ago" },
    { text: "Your business is ready to launch. Shall we go live?", time: "5 min ago" },
  ];

  return (
    <div className="workspace-preview shadow-2xl overflow-hidden max-w-6xl mx-auto">
      {/* Header Bar */}
      <div className="bg-[var(--luxury-black)] text-white p-4 border-b border-[var(--accent-line)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="eyebrow-text text-white system-text">SSELFIE Studio</span>
            <span className="text-xs text-white/60 system-text">→ Your Brand Workspace</span>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={onPreview}
              className="luxury-button text-white border-white/30 hover:border-white system-text"
            >
              Preview Live
            </button>
            <button 
              onClick={onLaunch}
              className="px-4 py-2 text-xs tracking-wide uppercase bg-white text-[var(--luxury-black)] hover:bg-white/90 transition-colors system-text"
            >
              Launch Business
            </button>
          </div>
        </div>
      </div>
      
      {/* Workspace Content */}
      <div className="grid grid-cols-12 min-h-[600px]">
        {/* Left Sidebar - Tools */}
        <div className="col-span-3 bg-[var(--editorial-gray)] border-r border-[var(--accent-line)] p-6">
          <h3 className="eyebrow-text text-[var(--soft-gray)] mb-6 system-text">
            Brand Builder
          </h3>
          <div className="space-y-4">
            {steps.map((step) => (
              <div 
                key={step.id}
                className={`p-4 bg-white border border-[var(--accent-line)] cursor-pointer transition-all
                  ${activeStep === step.id ? 'border-[var(--luxury-black)]' : 'hover:border-[var(--soft-gray)]'}`}
                onClick={() => setActiveStep(step.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs tracking-wide uppercase text-[var(--luxury-black)] system-text">
                    {String(step.id).padStart(2, '0')}. {step.title}
                  </p>
                  <div className={`w-2 h-2 rounded-full ${
                    step.status === 'complete' ? 'bg-green-500' : 
                    step.status === 'in-progress' ? 'bg-yellow-500' : 
                    'bg-gray-300'
                  }`} />
                </div>
                <p className="text-sm text-[var(--soft-gray)] system-text font-light">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Main Canvas Area */}
        <div className="col-span-6 bg-white p-8">
          <div className="text-center mb-8">
            <h3 className="editorial-headline text-3xl font-light text-[var(--luxury-black)] mb-4">
              Your Brand Preview
            </h3>
            <p className="text-sm text-[var(--soft-gray)] system-text font-light">
              Watch your business come to life in real-time
            </p>
          </div>
          
          {/* Live Preview Window */}
          <div className="relative border border-[var(--accent-line)] bg-[var(--editorial-gray)] aspect-[4/3] overflow-hidden">
            <img 
              src="https://i.postimg.cc/4NG0n2wN/out-1-12.png"
              alt="Live brand preview" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-6 left-6 text-white">
              <h4 className="editorial-headline text-2xl font-light mb-2">Your Brand</h4>
              <p className="text-sm opacity-80 system-text">Coming to life...</p>
            </div>
          </div>
        </div>
        
        {/* Right Sidebar - AI Assistant */}
        <div className="col-span-3 bg-[var(--luxury-black)] text-white p-6">
          <h3 className="eyebrow-text text-white/60 mb-6 system-text">
            Sandra AI
          </h3>
          <div className="space-y-4">
            {aiMessages.map((message, index) => (
              <div 
                key={index}
                className={`p-4 ${index === 0 ? 'bg-white/10' : 'bg-white/5'}`}
              >
                <p className="text-sm system-text font-light mb-2">
                  "{message.text}"
                </p>
                <p className="text-xs text-white/60 system-text">
                  Sandra AI • {message.time}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
