import { useState } from "react";
import UserStyleguide from "./user-styleguide";

// Demo data for testing SANDRA AI styleguide concept
const demoStyleguide = {
  userId: "demo123",
  templateId: "minimalistic",
  title: "Sarah Johnson",
  subtitle: "Strategic Brand Consultant",
  personalMission: "Empowering women entrepreneurs to build authentic, profitable brands that reflect their true essence and create meaningful impact in the world.",
  brandVoice: "Warm, professional, and inspiring with an authentic, conversational tone that makes complex business concepts feel accessible and achievable.",
  targetAudience: "Ambitious women entrepreneurs ready to elevate their brand and scale their business with authentic, strategic positioning.",
  visualStyle: "Refined minimal with editorial sophistication",
  colorPalette: {
    primary: "#1a1a1a",
    secondary: "#666666",
    accent: "#f8f8f8",
    text: "#1a1a1a",
    background: "#fefefe",
    border: "#f0f0f0"
  },
  typography: {
    headline: "Helvetica Neue, sans-serif",
    subheading: "Helvetica Neue, sans-serif", 
    body: "Helvetica Neue, sans-serif",
    accent: "Helvetica Neue, sans-serif"
  },
  imageSelections: {
    heroImage: "https://i.postimg.cc/VLCFmXVr/1.png",
    portraitImages: [
      "https://i.postimg.cc/VLCFmXVr/1.png",
      "https://i.postimg.cc/WpDyqFyj/10.png",
      "https://i.postimg.cc/SRz1B3Hk/11.png"
    ],
    lifestyleImages: [
      "https://i.postimg.cc/VLCFmXVr/1.png",
      "https://i.postimg.cc/WpDyqFyj/10.png",
      "https://i.postimg.cc/SRz1B3Hk/11.png",
      "https://i.postimg.cc/VLCFmXVr/1.png"
    ]
  },
  brandPersonality: {
    traits: ["Authentic", "Professional", "Inspiring", "Strategic", "Warm", "Confident"],
    keywords: ["Authentic", "Strategic", "Inspiring"],
    vibe: "Refined Minimal Professional"
  },
  businessApplications: {
    primaryService: "Strategic Brand Consulting",
    priceRange: "Premium Investment",
    clientExperience: "Transformational & Personal"
  },
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export default function StyleguideDemo() {
  const [viewMode, setViewMode] = useState<'preview' | 'fullscreen'>('preview');

  if (viewMode === 'fullscreen') {
    // Mock the API response for demo
    return (
      <div className="min-h-screen">
        <UserStyleguide userId="demo123" />
        <div className="fixed top-4 right-4 z-50">
          <button 
            onClick={() => setViewMode('preview')}
            className="bg-black text-white px-4 py-2 text-xs uppercase tracking-wider"
          >
            ← Back to Demo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="text-center mb-16">
          <div className="text-xs uppercase tracking-widest text-gray-600 mb-4">
            SANDRA AI Concept Demo
          </div>
          <h1 className="font-times text-6xl uppercase font-light tracking-tight mb-8">
            Personal Styleguide System
          </h1>
          <p className="text-xl font-light text-gray-600 max-w-4xl mx-auto leading-relaxed">
            SANDRA AI creates personalized styleguides for each user using their AI images, 
            personal story, and brand preferences. This replaces generic brandbooks with 
            truly personal brand experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-16">
          <div>
            <h2 className="font-times text-3xl uppercase font-light tracking-tight mb-8">
              The Vision
            </h2>
            <div className="space-y-6 text-lg font-light leading-relaxed">
              <p>
                Instead of generic brandbooks, SANDRA AI creates personalized styleguides 
                that become each user's visual brand bible.
              </p>
              <p>
                <strong>Two Templates Integrated:</strong> "Refined Minimalist" (clean sophistication) 
                and "Bold Femme" (strong, confident design with earthy tones and Impact typography).
              </p>
              <p>
                Users can chat with SANDRA to request changes, try different templates, 
                or adjust specific sections. Each styleguide becomes a living, evolving 
                brand document.
              </p>
            </div>
            
            <div className="mt-12">
              <h3 className="text-xs uppercase tracking-widest text-gray-600 mb-6">
                SANDRA AI Features
              </h3>
              <div className="space-y-4 text-base font-light">
                <div className="flex items-start">
                  <div className="w-4 h-4 bg-black mr-4 mt-1 flex-shrink-0"></div>
                  <div>2 of 5 styleguide templates operational (Refined Minimalist, Bold Femme)</div>
                </div>
                <div className="flex items-start">
                  <div className="w-4 h-4 bg-black mr-4 mt-1 flex-shrink-0"></div>
                  <div>Intelligent template selection based on user preferences</div>
                </div>
                <div className="flex items-start">
                  <div className="w-4 h-4 bg-black mr-4 mt-1 flex-shrink-0"></div>
                  <div>Dynamic color palettes matching brand personality</div>
                </div>
                <div className="flex items-start">
                  <div className="w-4 h-4 bg-black mr-4 mt-1 flex-shrink-0"></div>
                  <div>Smart image integration (AI portraits + flatlay collections)</div>
                </div>
                <div className="flex items-start">
                  <div className="w-4 h-4 bg-black mr-4 mt-1 flex-shrink-0"></div>
                  <div>Conversational editing with natural language requests</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-xs uppercase tracking-widest text-gray-600 mb-6">
                Preview Demo Styleguide
              </h3>
              <div className="bg-white border border-gray-200 aspect-[4/3] cursor-pointer hover:border-black transition-all duration-300"
                   onClick={() => setViewMode('fullscreen')}>
                <div className="h-1/2 bg-black text-white relative overflow-hidden">
                  <div className="absolute inset-0 opacity-30">
                    <img 
                      src={demoStyleguide.imageSelections.heroImage} 
                      alt="Hero"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="relative z-10 h-full flex items-center justify-center text-center p-4">
                    <div>
                      <div className="text-[8px] uppercase tracking-widest text-white/60 mb-2">
                        {demoStyleguide.brandPersonality.vibe}
                      </div>
                      <div className="font-times text-lg uppercase font-light tracking-wide">
                        {demoStyleguide.title}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-1/2 p-4 flex flex-col justify-between">
                  <div className="flex gap-1 mb-3">
                    {Object.values(demoStyleguide.colorPalette).slice(0, 4).map((color, index) => (
                      <div 
                        key={index}
                        className="w-4 h-4 border border-gray-200"
                        style={{ backgroundColor: color }}
                      ></div>
                    ))}
                  </div>

                  <div className="flex-1">
                    <div className="text-[10px] uppercase tracking-widest text-gray-600 mb-2">
                      Personal Mission
                    </div>
                    <div className="text-xs font-light leading-tight text-gray-800 line-clamp-3">
                      {demoStyleguide.personalMission.slice(0, 80)}...
                    </div>
                  </div>

                  <div className="flex justify-between items-end mt-3">
                    <div className="text-[8px] uppercase tracking-widest text-gray-500">
                      Refined Minimal
                    </div>
                    <div className="text-[8px] uppercase tracking-widest text-gray-500">
                      View Full &rsaquo;
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-500 mt-4 text-center">
                Click to view full styleguide experience
              </p>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-widest text-gray-600 mb-6">
                SANDRA AI Chat Interface
              </h3>
              <div className="bg-gray-50 p-6 border border-gray-200">
                <div className="space-y-4">
                  <div className="text-right">
                    <div className="inline-block bg-black text-white px-4 py-2 text-sm">
                      "Create my styleguide"
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="inline-block bg-white border border-gray-200 px-4 py-2 text-sm max-w-md">
                      Perfect! I'm creating your personalized styleguide based on your mission 
                      and business goals. I've selected the Refined Minimal template that matches 
                      your brand personality...
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">
                      SANDRA AI builds styleguide in real-time
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="text-xs uppercase tracking-widest text-gray-600 mb-4">
            Ready to Build?
          </div>
          <button 
            onClick={() => setViewMode('fullscreen')}
            className="bg-black text-white px-8 py-4 text-xs uppercase tracking-wider hover:bg-gray-800 transition-colors"
          >
            View Full Styleguide Demo
          </button>
        </div>
      </div>
    </div>
  );
}