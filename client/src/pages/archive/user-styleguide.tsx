import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

interface StyleguideProps {
  userId?: string; // For viewing other users' styleguides
}

export default function UserStyleguide({ userId }: StyleguideProps) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  const { data: styleguide, isLoading } = useQuery({
    queryKey: [`/api/styleguide/${targetUserId}`],
    enabled: !!targetUserId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent"></div>
      </div>
    );
  }

  if (!styleguide) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-md">
          <h1 className="font-times text-4xl uppercase font-light tracking-tight mb-6">
            No Styleguide Yet
          </h1>
          <p className="text-base font-light text-gray-600 mb-8">
            SANDRA AI will create your personalized styleguide once you complete onboarding.
          </p>
          <a 
            href="/onboarding" 
            className="inline-block px-8 py-4 text-xs uppercase tracking-widest border border-black bg-transparent hover:bg-black hover:text-white transition-all duration-300"
          >
            Complete Onboarding
          </a>
        </div>
      </div>
    );
  }

  const template = getTemplateLayout(styleguide.templateId);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center bg-black text-white relative overflow-hidden">
        {styleguide.imageSelections?.heroImage && (
          <div className="absolute inset-0 opacity-40">
            <img 
              src={styleguide.imageSelections.heroImage} 
              alt="Hero background"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="relative z-10 text-center max-w-4xl px-8">
          <div className="text-xs uppercase tracking-widest text-white/70 mb-8">
            {styleguide.brandPersonality?.vibe || "Personal Brand"}
          </div>
          <h1 className="font-times text-8xl md:text-12xl uppercase font-light tracking-wide mb-6">
            {styleguide.title}
          </h1>
          {styleguide.subtitle && (
            <div className="font-times text-3xl md:text-4xl uppercase font-light tracking-wider opacity-80 mb-12">
              {styleguide.subtitle}
            </div>
          )}
          {styleguide.personalMission && (
            <p className="text-lg font-light tracking-wide max-w-2xl mx-auto">
              {styleguide.personalMission}
            </p>
          )}
        </div>
      </section>

      {/* Personal Mission Section */}
      {styleguide.personalMission && (
        <section className="py-32 px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-xs uppercase tracking-widest text-gray-600 mb-8 text-center">
              Mission
            </div>
            <div className="font-times text-4xl md:text-5xl italic font-light text-center leading-tight max-w-4xl mx-auto">
              "{styleguide.personalMission}"
            </div>
          </div>
        </section>
      )}

      {/* Portrait Gallery */}
      {styleguide.imageSelections?.portraitImages && (
        <section className="py-32 bg-gray-50">
          <div className="max-w-7xl mx-auto px-8">
            <div className="text-xs uppercase tracking-widest text-gray-600 mb-16 text-center">
              Visual Identity
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {styleguide.imageSelections.portraitImages.slice(0, 3).map((image, index) => (
                <div key={index} className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                  <img 
                    src={image} 
                    alt={`Portrait ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Color Palette */}
      {styleguide.colorPalette && (
        <section className="py-32 px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-xs uppercase tracking-widest text-gray-600 mb-16 text-center">
              Color Palette
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {Object.entries(styleguide.colorPalette).map(([name, color]) => (
                <div key={name} className="text-center">
                  <div 
                    className="h-32 border border-gray-200 mb-6"
                    style={{ backgroundColor: color }}
                  ></div>
                  <div className="text-sm font-light mb-2 capitalize">{name}</div>
                  <div className="text-xs font-mono text-gray-600">{color}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Brand Voice */}
      {styleguide.brandVoice && (
        <section className="py-32 bg-black text-white">
          <div className="max-w-6xl mx-auto px-8 text-center">
            <div className="text-xs uppercase tracking-widest text-white/60 mb-16">
              Brand Voice
            </div>
            <div className="text-2xl md:text-3xl font-light leading-relaxed max-w-4xl mx-auto">
              {styleguide.brandVoice}
            </div>
          </div>
        </section>
      )}

      {/* Brand Personality */}
      {styleguide.brandPersonality?.traits && (
        <section className="py-32 px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-xs uppercase tracking-widest text-gray-600 mb-16 text-center">
              Brand Personality
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-center">
              {styleguide.brandPersonality.traits.map((trait, index) => (
                <div key={index} className="p-8 border border-gray-200 hover:bg-black hover:text-white transition-all duration-500">
                  <div className="text-lg font-light">{trait}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Lifestyle Gallery */}
      {styleguide.imageSelections?.lifestyleImages && (
        <section className="py-32 bg-gray-50">
          <div className="max-w-7xl mx-auto px-8">
            <div className="text-xs uppercase tracking-widest text-gray-600 mb-16 text-center">
              Lifestyle
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {styleguide.imageSelections.lifestyleImages.slice(0, 4).map((image, index) => (
                <div key={index} className="relative aspect-square overflow-hidden bg-gray-100">
                  <img 
                    src={image} 
                    alt={`Lifestyle ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Typography */}
      {styleguide.typography && (
        <section className="py-32 px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-xs uppercase tracking-widest text-gray-600 mb-16 text-center">
              Typography
            </div>
            <div className="space-y-16">
              <div className="text-center">
                <div className="text-xs uppercase tracking-widest text-gray-600 mb-4">Headlines</div>
                <div className="font-times text-6xl uppercase font-light tracking-tight">
                  {styleguide.typography.headline || "Times New Roman"}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs uppercase tracking-widest text-gray-600 mb-4">Body Text</div>
                <div className="text-xl font-light">
                  {styleguide.typography.body || "System Sans-Serif"}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Target Audience */}
      {styleguide.targetAudience && (
        <section className="py-32 bg-black text-white">
          <div className="max-w-6xl mx-auto px-8 text-center">
            <div className="text-xs uppercase tracking-widest text-white/60 mb-16">
              Target Audience
            </div>
            <div className="text-2xl md:text-3xl font-light leading-relaxed max-w-4xl mx-auto">
              {styleguide.targetAudience}
            </div>
          </div>
        </section>
      )}

      {/* Business Applications */}
      {styleguide.businessApplications && (
        <section className="py-32 px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-xs uppercase tracking-widest text-gray-600 mb-16 text-center">
              Business Applications
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
              <div>
                <div className="text-xs uppercase tracking-widest text-gray-600 mb-4">Service</div>
                <div className="text-lg font-light">{styleguide.businessApplications.primaryService}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-gray-600 mb-4">Investment</div>
                <div className="text-lg font-light">{styleguide.businessApplications.priceRange}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-gray-600 mb-4">Experience</div>
                <div className="text-lg font-light">{styleguide.businessApplications.clientExperience}</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-16 bg-gray-50 text-center">
        <div className="text-xs uppercase tracking-widest text-gray-600">
          Created by SANDRA AI • SSELFIE Studio
        </div>
      </footer>
    </div>
  );
}

// Helper function to get template-specific layouts
function getTemplateLayout(templateId: string) {
  const templates = {
    'refined-minimal': {
      heroStyle: 'center',
      colorScheme: 'monochrome',
      layout: 'minimal'
    },
    'luxe-feminine': {
      heroStyle: 'split',
      colorScheme: 'warm',
      layout: 'editorial'
    },
    'bold-femme': {
      heroStyle: 'fullscreen',
      colorScheme: 'nature',
      layout: 'magazine'
    },
    'executive-essence': {
      heroStyle: 'corporate',
      colorScheme: 'professional',
      layout: 'structured'
    },
    'creative-bold': {
      heroStyle: 'artistic',
      colorScheme: 'vibrant',
      layout: 'dynamic'
    }
  };
  
  return templates[templateId as keyof typeof templates] || templates['refined-minimal'];
}