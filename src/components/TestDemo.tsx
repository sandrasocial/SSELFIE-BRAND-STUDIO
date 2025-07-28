import React, { useState, useEffect } from 'react';

const TestDemo: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const demoSteps = [
    {
      title: "Upload Your Selfie",
      description: "Start with a high-quality selfie to train your personal AI model",
      icon: "📸",
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "AI Model Training",
      description: "Our advanced AI learns your unique features and style",
      icon: "🤖",
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Generate Professional Photos",
      description: "Create stunning professional photos in any style or setting",
      icon: "✨",
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Build Your Brand",
      description: "Use your AI-generated photos to launch your business empire",
      icon: "🚀",
      color: "from-orange-500 to-red-500"
    }
  ];

  const sampleImages = [
    "/api/placeholder/300/400",
    "/api/placeholder/300/400", 
    "/api/placeholder/300/400",
    "/api/placeholder/300/400"
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsGenerating(false);
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const startDemo = () => {
    setIsGenerating(true);
    setProgress(0);
    setCurrentStep(0);
  };

  const nextStep = () => {
    if (currentStep < demoSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">
              SSELFIE Studio Demo
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Experience the power of AI-generated professional photography
            </p>
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white font-medium">Live Demo Ready</span>
            </div>
          </div>

          {/* Demo Flow */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
            {/* Left Side - Demo Steps */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white mb-8">How It Works</h2>
              
              {demoSteps.map((step, index) => (
                <div
                  key={index}
                  className={`relative p-6 rounded-2xl transition-all duration-500 ${
                    index === currentStep
                      ? 'bg-white/20 backdrop-blur-sm border-2 border-white/30 scale-105'
                      : index < currentStep
                      ? 'bg-white/10 backdrop-blur-sm border border-green-400/50'
                      : 'bg-white/5 backdrop-blur-sm border border-white/10'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center text-2xl flex-shrink-0`}>
                      {index < currentStep ? '✅' : step.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {step.title}
                      </h3>
                      <p className="text-gray-300">{step.description}</p>
                      {index === currentStep && isGenerating && (
                        <div className="mt-4">
                          <div className="w-full bg-white/20 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full bg-gradient-to-r ${step.color} transition-all duration-300`}
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <p className="text-sm text-white/80 mt-2">
                            Processing... {Math.round(progress)}%
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Side - Visual Demo */}
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Sample Results
                </h3>
                <p className="text-gray-300">
                  Professional photos generated from a single selfie
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {sampleImages.map((src, index) => (
                  <div
                    key={index}
                    className="aspect-[3/4] bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl overflow-hidden relative group hover:scale-105 transition-transform duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white/50 text-4xl">📸</div>
                    </div>
                    <div className="absolute bottom-2 left-2 right-2 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="font-medium">Professional Style {index + 1}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-400 mb-4">
                  Generate unlimited professional photos in minutes
                </p>
                <div className="flex items-center justify-center space-x-2 text-green-400">
                  <span className="text-sm font-medium">✨ AI-Powered</span>
                  <span className="text-sm font-medium">⚡ Lightning Fast</span>
                  <span className="text-sm font-medium">🎯 Brand Ready</span>
                </div>
              </div>
            </div>
          </div>

          {/* Demo Controls */}
          <div className="text-center space-y-6">
            <div className="flex justify-center space-x-4">
              <button
                onClick={startDemo}
                disabled={isGenerating}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
              >
                {isGenerating ? 'Demo Running...' : 'Start Demo'}
              </button>
              
              <button
                onClick={nextStep}
                disabled={currentStep >= demoSteps.length - 1 || isGenerating}
                className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 border border-white/20"
              >
                Next Step
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">10K+</div>
                <div className="text-gray-400 text-sm">Photos Generated</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">500+</div>
                <div className="text-gray-400 text-sm">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">98%</div>
                <div className="text-gray-400 text-sm">Satisfaction Rate</div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mt-16 grid md:grid-cols-4 gap-6">
            {[
              { icon: '🎨', title: 'Custom Styles', desc: '50+ professional styles' },
              { icon: '⚡', title: 'Fast Generation', desc: 'Results in under 5 minutes' },
              { icon: '🔒', title: 'Privacy First', desc: 'Your data stays secure' },
              { icon: '💼', title: 'Business Ready', desc: 'Commercial use included' }
            ].map((feature, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/10 transition-colors duration-300">
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h4 className="text-white font-semibold mb-2">{feature.title}</h4>
                <p className="text-gray-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestDemo;