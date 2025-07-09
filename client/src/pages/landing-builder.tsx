import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Navigation } from '@/components/navigation';
import { HeroFullBleed } from '@/components/hero-full-bleed';
import { SandraAiChat } from '@/components/sandra-ai-chat';
import { SandraImages } from '@/lib/sandra-images';
import { MoodboardCollections, getMoodboardCollection } from '@/lib/moodboard-collections';

interface LandingBuilderProps {}

export default function LandingBuilder({}: LandingBuilderProps) {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('booking');
  const [pageConfig, setPageConfig] = useState({
    template: 'booking',
    colors: { primary: '#0a0a0a', secondary: '#f5f5f5' },
    fonts: { heading: 'Times New Roman', body: 'Inter' },
    sections: ['hero', 'about', 'services', 'testimonials', 'contact'],
    integrations: []
  });
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  // Fetch user's AI images for landing page integration
  const { data: aiImages = [] } = useQuery({
    queryKey: ['/api/ai-images'],
    enabled: isAuthenticated
  });

  useEffect(() => {
    // Load onboarding data
    const savedData = localStorage.getItem('brandbookOnboardingData');
    if (savedData) {
      setOnboardingData(JSON.parse(savedData));
    }
    
    // Fetch from database as backup
    fetch('/api/onboarding')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setOnboardingData(data);
        }
      })
      .catch(err => console.error('Error loading onboarding data:', err));
  }, []);

  const templates = [
    {
      id: 'booking',
      name: 'Booking Page',
      description: 'Perfect for service providers, coaches, consultants',
      sections: ['hero', 'about', 'services', 'testimonials', 'booking', 'contact']
    },
    {
      id: 'service',
      name: 'Service Page',
      description: 'Showcase expertise and convert visitors to clients',
      sections: ['hero', 'services', 'process', 'results', 'testimonials', 'contact']
    },
    {
      id: 'product',
      name: 'Product Page',
      description: 'Sales-focused with proven conversion psychology',
      sections: ['hero', 'features', 'benefits', 'testimonials', 'pricing', 'guarantee']
    },
    {
      id: 'portfolio',
      name: 'Portfolio Page',
      description: 'Creative showcase to attract dream clients',
      sections: ['hero', 'portfolio', 'about', 'process', 'testimonials', 'contact']
    }
  ];

  const handlePageUpdate = (updates: any) => {
    setPageConfig(prev => ({ ...prev, ...updates }));
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setPageConfig(prev => ({
        ...prev,
        template: templateId,
        sections: template.sections
      }));
    }
  };

  // Helper function to get user's AI images by style for landing pages
  const getAiImagesByStyle = (style: string) => {
    if (!aiImages || aiImages.length === 0) return [];
    return aiImages
      .filter(img => img.style === style && img.generationStatus === 'completed' && img.imageUrl && img.imageUrl !== 'error')
      .map(img => {
        if (typeof img.imageUrl === 'string' && img.imageUrl.startsWith('[')) {
          try {
            const imageArray = JSON.parse(img.imageUrl);
            return imageArray[0];
          } catch (e) {
            return null;
          }
        }
        return img.imageUrl;
      })
      .filter(url => url && url !== 'error' && url !== 'canceled');
  };

  // Create curated image collection for landing pages
  const getPageImages = () => {
    const userPortraits = [
      ...getAiImagesByStyle('editorial'),
      ...getAiImagesByStyle('professional'),
      ...getAiImagesByStyle('portrait')
    ].slice(0, 3);

    const userLifestyle = [
      ...getAiImagesByStyle('lifestyle'),
      ...getAiImagesByStyle('business'),
      ...getAiImagesByStyle('luxury')
    ].slice(0, 2);

    // Get moodboard images based on user's style preference
    const stylePreference = onboardingData?.stylePreference || 'luxury-minimal';
    const styleMapping = {
      'luxury-minimal': 'luxury-minimal',
      'editorial-bold': 'editorial-magazine',
      'feminine-soft': 'pink-girly',
      'business-professional': 'business-professional',
      'creative-artistic': 'bohemian-creative',
      'wellness-calm': 'wellness-reiki'
    };

    const collectionId = styleMapping[stylePreference as keyof typeof styleMapping] || 'luxury-minimal';
    const collection = getMoodboardCollection(collectionId);
    const moodboardImages = collection?.images.slice(0, 6) || [];

    return {
      portraits: userPortraits.length > 0 ? userPortraits : [
        SandraImages.portraits.professional[0],
        SandraImages.portraits.professional[1],
        SandraImages.portraits.professional[2]
      ],
      lifestyle: userLifestyle,
      flatlays: moodboardImages,
      hero: userPortraits[0] || SandraImages.portraits.professional[0],
      about: userPortraits[1] || SandraImages.portraits.professional[1]
    };
  };

  const pageImages = getPageImages();

  const handleSavePage = async () => {
    try {
      const response = await fetch('/api/landing-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          config: pageConfig, 
          onboardingData,
          template: selectedTemplate,
          images: pageImages // Include curated images
        })
      });
      
      if (response.ok) {
        setLocation('/workspace');
      }
    } catch (error) {
      console.error('Error saving landing page:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <HeroFullBleed 
        title="LANDING PAGE"
        subtitle="BUILDER"
        tagline="Design Your Perfect Landing Page"
        ctaText="Start Building"
        backgroundImage={SandraImages.editorial.laptop1}
      />

      <div className="max-w-7xl mx-auto px-6 py-16">
        
        {/* Template Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-light text-[#0a0a0a] mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
            Choose Your Template
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template.id)}
                className={`p-4 border text-left transition-colors ${
                  selectedTemplate === template.id
                    ? 'border-[#0a0a0a] bg-[#f5f5f5]'
                    : 'border-[#e5e5e5] bg-white hover:bg-[#f5f5f5]'
                }`}
              >
                <h3 className="font-medium text-[#0a0a0a] mb-2">{template.name}</h3>
                <p className="text-sm text-[#666]">{template.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-screen max-h-[800px]">
          
          {/* Sandra AI Designer Chat */}
          <div className="border border-[#e5e5e5] bg-white overflow-hidden">
            <div className="bg-[#f5f5f5] p-4 border-b border-[#e5e5e5]">
              <h3 className="text-lg font-light text-[#0a0a0a]" style={{ fontFamily: 'Times New Roman, serif' }}>
                Sandra AI Designer
              </h3>
              <p className="text-sm text-[#666] mt-1">
                Design your {templates.find(t => t.id === selectedTemplate)?.name}
              </p>
            </div>
            
            <SandraAiChat 
              context="landing-builder"
              userContext={onboardingData}
              pageConfig={pageConfig}
              selectedTemplate={selectedTemplate}
              availableImages={pageImages}
              onUpdate={handlePageUpdate}
              placeholder="Tell Sandra how you want your landing page..."
            />
          </div>

          {/* Live Page Preview */}
          <div className="border border-[#e5e5e5] bg-white overflow-hidden">
            <div className="bg-[#f5f5f5] p-4 border-b border-[#e5e5e5] flex justify-between items-center">
              <h3 className="text-lg font-light text-[#0a0a0a]" style={{ fontFamily: 'Times New Roman, serif' }}>
                Live Preview
              </h3>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setPreviewMode('desktop')}
                  className={`px-3 py-1 text-xs border border-[#e5e5e5] transition-colors ${
                    previewMode === 'desktop' 
                      ? 'bg-[#0a0a0a] text-white' 
                      : 'bg-white text-[#666] hover:bg-[#f5f5f5]'
                  }`}
                >
                  Desktop
                </button>
                <button 
                  onClick={() => setPreviewMode('mobile')}
                  className={`px-3 py-1 text-xs border border-[#e5e5e5] transition-colors ${
                    previewMode === 'mobile' 
                      ? 'bg-[#0a0a0a] text-white' 
                      : 'bg-white text-[#666] hover:bg-[#f5f5f5]'
                  }`}
                >
                  Mobile
                </button>
              </div>
            </div>
            
            <div className={`h-full overflow-y-auto bg-white ${
              previewMode === 'mobile' ? 'max-w-sm mx-auto' : ''
            }`}>
              <LandingPagePreview 
                template={selectedTemplate}
                config={pageConfig}
                onboardingData={onboardingData}
                mode={previewMode}
              />
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={() => setLocation('/dashboard-builder')}
            className="text-xs uppercase tracking-wider text-[#666] hover:text-[#0a0a0a] transition-colors"
          >
            ← Back to Dashboard
          </button>
          
          <div className="flex space-x-4">
            <button
              className="bg-white border border-[#e5e5e5] text-[#0a0a0a] px-8 py-4 text-xs uppercase tracking-wider hover:bg-[#f5f5f5] transition-colors"
            >
              Preview Live
            </button>
            <button
              onClick={handleSavePage}
              className="bg-[#0a0a0a] text-white px-8 py-4 text-xs uppercase tracking-wider hover:bg-gray-800 transition-colors"
            >
              Publish Page
            </button>
          </div>
        </div>

        {/* Integration Options */}
        <div className="mt-8 p-6 bg-[#f5f5f5] border border-[#e5e5e5]">
          <h3 className="text-xl font-light text-[#0a0a0a] mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
            Connect Integrations
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Calendly', desc: 'Booking calendar' },
              { name: 'Stripe', desc: 'Payment processing' },
              { name: 'Mailchimp', desc: 'Email marketing' },
              { name: 'Google Analytics', desc: 'Website tracking' }
            ].map((integration, index) => (
              <button
                key={index}
                className="p-4 bg-white border border-[#e5e5e5] text-left hover:bg-gray-50 transition-colors"
              >
                <h4 className="font-medium text-[#0a0a0a] mb-1">{integration.name}</h4>
                <p className="text-sm text-[#666]">{integration.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Landing Page Preview Component
function LandingPagePreview({ 
  template, 
  config, 
  onboardingData, 
  mode 
}: { 
  template: string; 
  config: any; 
  onboardingData: any; 
  mode: 'desktop' | 'mobile' 
}) {
  if (!onboardingData) {
    return (
      <div className="flex items-center justify-center h-full text-[#666]">
        Loading your brand data...
      </div>
    );
  }

  const businessName = onboardingData.businessName || 'Your Business';
  const tagline = onboardingData.brandMessage || 'Transform your business with professional services';

  return (
    <div className="min-h-full">
      
      {/* Hero Section */}
      <section className="bg-[#f5f5f5] p-8 lg:p-16 text-center">
        <h1 className={`font-light text-[#0a0a0a] mb-6 ${
          mode === 'mobile' ? 'text-3xl' : 'text-5xl lg:text-6xl'
        }`} style={{ fontFamily: 'Times New Roman, serif' }}>
          {businessName}
        </h1>
        <p className={`text-[#666] mb-8 max-w-2xl mx-auto ${
          mode === 'mobile' ? 'text-lg' : 'text-xl'
        }`}>
          {tagline}
        </p>
        <button className="bg-[#0a0a0a] text-white px-8 py-4 text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors">
          {template === 'booking' ? 'Book Now' : 
           template === 'product' ? 'Get Started' :
           template === 'portfolio' ? 'View Work' : 'Learn More'}
        </button>
      </section>

      {/* Template-specific sections */}
      {template === 'booking' && (
        <>
          <section className="p-8 lg:p-16">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className={`font-light text-[#0a0a0a] mb-6 ${
                mode === 'mobile' ? 'text-2xl' : 'text-3xl'
              }`} style={{ fontFamily: 'Times New Roman, serif' }}>
                About {businessName}
              </h2>
              <p className="text-[#666] text-lg mb-8">
                {onboardingData.brandStory || 'Professional services tailored to your needs with years of experience and proven results.'}
              </p>
            </div>
          </section>

          <section className="bg-[#f5f5f5] p-8 lg:p-16">
            <div className="max-w-4xl mx-auto">
              <h2 className={`font-light text-[#0a0a0a] mb-8 text-center ${
                mode === 'mobile' ? 'text-2xl' : 'text-3xl'
              }`} style={{ fontFamily: 'Times New Roman, serif' }}>
                Services
              </h2>
              <div className={`grid gap-8 ${
                mode === 'mobile' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'
              }`}>
                {['Consultation', 'Strategy', 'Implementation'].map((service, index) => (
                  <div key={index} className="bg-white p-6 border border-[#e5e5e5]">
                    <h3 className="text-xl font-light text-[#0a0a0a] mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
                      {service}
                    </h3>
                    <p className="text-[#666] mb-4">
                      Professional {service.toLowerCase()} services designed to help you achieve your goals.
                    </p>
                    <div className="text-[#0a0a0a] font-medium">
                      From €{(index + 1) * 97}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {template === 'product' && (
        <>
          <section className="p-8 lg:p-16">
            <div className="max-w-4xl mx-auto">
              <h2 className={`font-light text-[#0a0a0a] mb-8 text-center ${
                mode === 'mobile' ? 'text-2xl' : 'text-3xl'
              }`} style={{ fontFamily: 'Times New Roman, serif' }}>
                Features
              </h2>
              <div className={`grid gap-6 ${
                mode === 'mobile' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'
              }`}>
                {['Premium Quality', 'Fast Delivery', 'Expert Support', 'Money-Back Guarantee'].map((feature, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-[#0a0a0a] text-white flex items-center justify-center text-sm">
                      ✓
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-[#0a0a0a] mb-2">{feature}</h3>
                      <p className="text-[#666]">Experience the best with our premium {feature.toLowerCase()}.</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* Contact Section */}
      <section className="p-8 lg:p-16 bg-white border-t border-[#e5e5e5]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className={`font-light text-[#0a0a0a] mb-6 ${
            mode === 'mobile' ? 'text-2xl' : 'text-3xl'
          }`} style={{ fontFamily: 'Times New Roman, serif' }}>
            Get In Touch
          </h2>
          <p className="text-[#666] mb-8">
            Ready to get started? Contact us today for a consultation.
          </p>
          <div className={`grid gap-4 ${
            mode === 'mobile' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'
          }`}>
            <input
              type="text"
              placeholder="Your Name"
              className="border border-[#e5e5e5] p-4 text-[#0a0a0a]"
            />
            <input
              type="email"
              placeholder="Your Email"
              className="border border-[#e5e5e5] p-4 text-[#0a0a0a]"
            />
          </div>
          <textarea
            placeholder="Your Message"
            rows={4}
            className="w-full border border-[#e5e5e5] p-4 text-[#0a0a0a] mt-4"
          />
          <button className="bg-[#0a0a0a] text-white px-8 py-4 text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors mt-6">
            Send Message
          </button>
        </div>
      </section>

    </div>
  );
}