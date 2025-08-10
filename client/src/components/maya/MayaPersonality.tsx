// Maya STYLE Interface - Personality & Avatar Components
// August 10, 2025 - Redesign Implementation

import { cn } from '@/lib/utils';
import { MayaMood } from '@/types/maya/MayaTypes';

interface MayaAvatarProps {
  mood?: MayaMood;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function MayaAvatar({ mood = 'confident', size = 'md', className }: MayaAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const borderClasses = {
    sm: 'border border-amber-400',
    md: 'border-2 border-amber-400',
    lg: 'border-2 border-amber-400',
  };

  return (
    <div className={cn(
      "relative rounded-full overflow-hidden shadow-lg transition-all duration-500",
      sizeClasses[size],
      borderClasses[size],
      className
    )}>
      <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-amber-200">
        {/* Maya's sophisticated avatar with mood-based expressions */}
        <div className={cn(
          "absolute inset-2 rounded-full transition-all duration-500",
          mood === 'confident' && "bg-gradient-to-br from-amber-500 to-amber-600",
          mood === 'excited' && "bg-gradient-to-br from-amber-400 to-amber-500 animate-pulse",
          mood === 'thinking' && "bg-gradient-to-br from-amber-600 to-amber-700",
          mood === 'creating' && "bg-gradient-to-br from-amber-300 to-amber-400 animate-pulse"
        )}>
          {/* Eyes */}
          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-black rounded-full opacity-80" 
               style={{ width: size === 'lg' ? '6px' : size === 'md' ? '4px' : '2px',
                       height: size === 'lg' ? '6px' : size === 'md' ? '4px' : '2px' }} />
          <div className="absolute top-1/4 right-1/4 w-1 h-1 bg-black rounded-full opacity-80"
               style={{ width: size === 'lg' ? '6px' : size === 'md' ? '4px' : '2px',
                       height: size === 'lg' ? '6px' : size === 'md' ? '4px' : '2px' }} />
          
          {/* Mood indicator (small glow) */}
          {mood === 'excited' && (
            <div className="absolute inset-0 rounded-full bg-amber-300 opacity-30 animate-ping" />
          )}
          {mood === 'creating' && (
            <div className="absolute inset-0 rounded-full bg-amber-200 opacity-40 animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
}

interface MayaStatusIndicatorProps {
  mood: MayaMood;
  message?: string;
  className?: string;
}

export function MayaStatusIndicator({ mood, message, className }: MayaStatusIndicatorProps) {
  const getStatusMessage = () => {
    if (message) return message;
    
    switch (mood) {
      case 'confident':
        return "Ready to style";
      case 'excited':
        return "Creating magic";
      case 'thinking':
        return "Analyzing style";
      case 'creating':
        return "Crafting your look";
      default:
        return "Maya is here";
    }
  };

  return (
    <div className={cn("flex items-center space-x-3", className)}>
      <MayaAvatar mood={mood} size="sm" />
      <div className="text-sm text-gray-600 font-light tracking-wide">
        {getStatusMessage()}
      </div>
    </div>
  );
}

interface LuxuryProgressIndicatorProps {
  progress: number;
  isActive?: boolean;
  className?: string;
}

export function LuxuryProgressIndicator({ progress, isActive = true, className }: LuxuryProgressIndicatorProps) {
  const getProgressMessage = () => {
    if (progress < 30) return "Analyzing your style profile";
    if (progress < 60) return "Selecting the perfect aesthetic";
    if (progress < 90) return "Creating your signature look";
    return "Perfecting every detail";
  };

  return (
    <div className={cn("relative w-full max-w-md mx-auto", className)}>
      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full transition-all duration-1000 ease-out",
            isActive 
              ? "bg-gradient-to-r from-amber-400 to-amber-600" 
              : "bg-gray-300"
          )}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      
      {isActive && (
        <div className="mt-4 text-center">
          <div className="font-serif text-sm text-gray-600 tracking-wide">
            Maya is crafting your editorial vision...
          </div>
          <div className="font-light text-xs text-gray-500 mt-1">
            {getProgressMessage()}
          </div>
        </div>
      )}
    </div>
  );
}