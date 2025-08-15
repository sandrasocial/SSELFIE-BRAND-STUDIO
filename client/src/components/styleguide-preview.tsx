import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../hooks/use-auth";

interface StyleguidePreviewProps {
  userId?: string;
  className?: string;
}

export default function StyleguidePreview({ userId, className = "" }: StyleguidePreviewProps) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  const { data: styleguide, isLoading } = useQuery({
    queryKey: [`/api/styleguide/${targetUserId}`],
    enabled: !!targetUserId,
  });

  if (isLoading) {
    return (
      <div className={`bg-gray-50 border border-gray-200 aspect-[4/3] flex items-center justify-center ${className}`}>
        <div className="animate-spin w-6 h-6 border-4 border-black border-t-transparent"></div>
      </div>
    );
  }

  if (!styleguide) {
    return (
      <div className={`bg-gray-50 border border-gray-200 aspect-[4/3] flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <div className="text-xs uppercase tracking-widest text-gray-600 mb-4">
            No Styleguide Yet
          </div>
          <div className="text-sm font-light text-gray-500">
            SANDRA AI will create your personalized styleguide
          </div>
        </div>
      </div>
    );
  }

  const handleClick = () => {
    window.open(`/styleguide/${targetUserId}`, '_blank');
  };

  return (
    <div 
      className={`bg-white border border-gray-200 aspect-[4/3] cursor-pointer hover:border-black transition-all duration-300 ${className}`}
      onClick={handleClick}
    >
      {/* Preview Hero Section */}
      <div className="h-1/2 bg-black text-white relative overflow-hidden">
        {styleguide.imageSelections?.heroImage && (
          <div className="absolute inset-0 opacity-30">
            <img 
              src={styleguide.imageSelections.heroImage} 
              alt="Hero"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="relative z-10 h-full flex items-center justify-center text-center p-4">
          <div>
            <div className="text-[8px] uppercase tracking-widest text-white/60 mb-2">
              {styleguide.brandPersonality?.vibe || "Personal Brand"}
            </div>
            <div className="font-times text-lg uppercase font-light tracking-wide">
              {styleguide.title}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Content Section */}
      <div className="h-1/2 p-4 flex flex-col justify-between">
        {/* Color Palette Preview */}
        {styleguide.colorPalette && (
          <div className="flex gap-1 mb-3">
            {Object.values(styleguide.colorPalette).slice(0, 4).map((color, index) => (
              <div 
                key={index}
                className="w-4 h-4 border border-gray-200"
                style={{ backgroundColor: color }}
              ></div>
            ))}
          </div>
        )}

        {/* Preview Text */}
        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-widest text-gray-600 mb-2">
            Personal Mission
          </div>
          <div className="text-xs font-light leading-tight text-gray-800">
            {styleguide.personalMission || styleguide.brandVoice || "Authentic personal branding"}
          </div>
        </div>

        {/* Template Badge */}
        <div className="flex justify-between items-end mt-3">
          <div className="text-[8px] uppercase tracking-widest text-gray-500">
            {getTemplateName(styleguide.templateId)}
          </div>
          <div className="text-[8px] uppercase tracking-widest text-gray-500">
            View Full &rsaquo;
          </div>
        </div>
      </div>
    </div>
  );
}

function getTemplateName(templateId: string): string {
  const names: Record<string, string> = {
    'refined-minimal': 'Refined Minimal',
    'luxe-feminine': 'Luxe Feminine',
    'bold-femme': 'Bold Femme',
    'executive-essence': 'Executive Essence',
    'creative-bold': 'Creative Bold'
  };
  return names[templateId] || 'Custom';
}