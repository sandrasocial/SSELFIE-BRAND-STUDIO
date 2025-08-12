import { FC } from 'react';
import { EditorialImage } from './sandra-image-library';

interface WorkspaceInterfaceProps {
  onPreview?: () => void;
  onLaunch?: () => void;
}

export const WorkspaceInterface: FC<WorkspaceInterfaceProps> = ({
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
    <div className="workspace-preview shadow-2xl overflow-hidden container-editorial">
      {/* Header Bar */}
      <div className="bg-[var(--luxury-black)] text-white card-padding-responsive border-b border-[var(--accent-line)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <span className="eyebrow-responsive text-white">SSELFIE Studio</span>
            <span className="text-[10px] sm:text-xs text-white/60 hidden sm:block">→ Your Brand Workspace</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button 
              onClick={onPreview}
              className="cta-button-responsive text-white border-white/30 hover:border-white bg-transparent flex-1 sm:flex-none"
            >
              <span className="hidden sm:inline">Preview Live</span>
              <span className="sm:hidden">Preview</span>
            </button>
            <button 
              onClick={onLaunch}
              className="cta-button-responsive bg-white text-[var(--luxury-black)] hover:bg-white/90 border-none flex-1 sm:flex-none"
            >
              <span className="hidden sm:inline">Launch Business</span>
              <span className="sm:hidden">Launch</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Workspace Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]">
        {/* Left Sidebar - Tools (Mobile: Full width, Desktop: 3 cols) */}
        <div className="lg:col-span-3 bg-[var(--editorial-gray)] border-b lg:border-b-0 lg:border-r border-[var(--accent-line)] card-padding-responsive">
          <h3 className="eyebrow-responsive text-[var(--soft-gray)] mb-4 lg:mb-6">
            Brand Builder
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 lg:gap-4">
            {steps.map((step) => (
              <div 
                key={step.id}
                className={`p-3 lg:p-4 bg-white border border-[var(--accent-line)] cursor-pointer transition-all
                  ${activeStep === step.id ? 'border-[var(--luxury-black)]' : 'hover:border-[var(--soft-gray)]'}`}
                onClick={() => setActiveStep(step.id)}
              >
                <div className="flex items-center justify-between mb-1 lg:mb-2">
                  <p className="eyebrow-responsive text-[var(--luxury-black)]">
                    {String(step.id).padStart(2, '0')}. {step.title}
                  </p>
                  <div className={`w-2 h-2 rounded-full ${
                    step.status === 'complete' ? 'bg-green-500' : 
                    step.status === 'in-progress' ? 'bg-yellow-500' : 
                    'bg-gray-300'
                  }`} />
                </div>
                <p className="body-text-responsive text-[var(--soft-gray)] font-light">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Main Canvas Area (Mobile: Full width, Desktop: 6 cols) */}
        <div className="lg:col-span-6 bg-white card-padding-responsive">
          <div className="text-center-mobile mb-6 lg:mb-8">
            <h3 className="editorial-subhead-responsive text-[var(--luxury-black)] mb-3 lg:mb-4">
              Your Brand Preview
            </h3>
            <p className="body-text-responsive text-[var(--soft-gray)] font-light">
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
            <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 text-white">
              <h4 className="editorial-subhead-responsive font-light mb-1 sm:mb-2">Your Brand</h4>
              <p className="body-text-responsive opacity-80">Coming to life...</p>
            </div>
          </div>
        </div>
        
        {/* Right Sidebar - AI Assistant (Mobile: Full width, Desktop: 3 cols) */}
        <div className="lg:col-span-3 bg-[var(--luxury-black)] text-white card-padding-responsive">
          <h3 className="eyebrow-responsive text-white/60 mb-4 lg:mb-6">
            Sandra AI
          </h3>
          <div className="grid grid-cols-1 gap-3 lg:gap-4">
            {aiMessages.map((message, index) => (
              <div 
                key={index}
                className={`p-3 lg:p-4 ${index === 0 ? 'bg-white/10' : 'bg-white/5'}`}
              >
                <p className="body-text-responsive font-light mb-2">
                  "{message.text}"
                </p>
                <p className="text-[10px] sm:text-xs text-white/60">
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
