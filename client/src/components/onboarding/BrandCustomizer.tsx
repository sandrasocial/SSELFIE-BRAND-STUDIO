import React from 'react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export interface BrandCustomization {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    palette: 'editorial' | 'luxury' | 'minimalist' | 'bold';
  };
  fonts: {
    primary: 'Times New Roman' | 'Georgia' | 'Playfair';
    secondary: 'Arial' | 'Helvetica' | 'Proxima Nova';
  };
  vibe: 'editorial' | 'luxury' | 'minimalist' | 'modern' | 'bold';
  brandName: string;
}

interface BrandCustomizerProps {
  customization: BrandCustomization;
  onChange: (updates: Partial<BrandCustomization>) => void;
}

const PALETTES = {
  editorial: {
    primary: '#0a0a0a',
    secondary: '#f5f5f5',
    accent: '#ffffff'
  },
  luxury: {
    primary: '#000000',
    secondary: '#f0f0f0',
    accent: '#808080'
  },
  minimalist: {
    primary: '#1a1a1a',
    secondary: '#fafafa',
    accent: '#e0e0e0'
  },
  bold: {
    primary: '#000000',
    secondary: '#ffffff',
    accent: '#333333'
  }
};

export const BrandCustomizer: React.FC<BrandCustomizerProps> = ({
  customization,
  onChange
}) => {
  return (
    <div className="space-y-16 p-8 md:p-12 bg-pure-white">
      <div className="max-w-2xl">
        <h2 className="editorial-headline mb-4">Express Your Personal Style</h2>
        <p className="system-text text-soft-gray text-lg leading-relaxed">
          Make your website reflect who you are. Choose colors, fonts, and vibes that feel authentically you.
        </p>
      </div>

      <div className="space-y-8">
        {/* Personal Brand Name */}
        <div className="space-y-4">
          <Label className="eyebrow-text">What should we call you?</Label>
          <Input
            value={customization.brandName}
            onChange={(e) => onChange({ brandName: e.target.value })}
            className="text-2xl font-times"
            placeholder="Your name or personal brand"
          />
          <p className="system-text text-soft-gray text-sm">
            This could be your real name, stage name, or how you want to be known professionally
          </p>
        </div>

        {/* Color Palettes */}
        <div className="space-y-4">
          <Label className="eyebrow-text">Color Palette</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(Object.keys(PALETTES) as Array<keyof typeof PALETTES>).map((palette) => (
              <Card
                key={palette}
                className={`p-6 cursor-pointer group transition-all duration-500 ${
                  customization.colors.palette === palette
                    ? 'border-luxury-black bg-editorial-gray'
                    : 'border-accent-line hover:border-luxury-black/50'
                }`}
                onClick={() => onChange({
                  colors: {
                    ...customization.colors,
                    palette,
                    ...PALETTES[palette]
                  }
                })}
              >
                <div className="space-y-4">
                  <div className="flex space-x-3">
                    <div className="w-8 h-8 transform group-hover:scale-110 transition-transform duration-500" style={{ backgroundColor: PALETTES[palette].primary }} />
                    <div className="w-8 h-8 transform group-hover:scale-110 transition-transform duration-500 delay-75" style={{ backgroundColor: PALETTES[palette].secondary }} />
                    <div className="w-8 h-8 transform group-hover:scale-110 transition-transform duration-500 delay-150" style={{ backgroundColor: PALETTES[palette].accent }} />
                  </div>
                  <p className="system-text capitalize text-lg tracking-wide">{palette}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Typography */}
        <div className="space-y-4">
          <Label className="eyebrow-text">Typography</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Primary Font</Label>
              <select
                value={customization.fonts.primary}
                onChange={(e) => onChange({
                  fonts: {
                    ...customization.fonts,
                    primary: e.target.value as BrandCustomization['fonts']['primary']
                  }
                })}
                className="w-full p-3 border border-accent-line bg-editorial-gray hover:border-luxury-black/50 transition-colors duration-300 text-lg"
                style={{ fontFamily: customization.fonts.primary }}
              >
                <option value="Times New Roman" style={{ fontFamily: 'Times New Roman' }}>Times New Roman</option>
                <option value="Georgia" style={{ fontFamily: 'Georgia' }}>Georgia</option>
                <option value="Playfair" style={{ fontFamily: 'Playfair Display' }}>Playfair</option>
              </select>
            </div>
            <div>
              <Label>Secondary Font</Label>
              <select
                value={customization.fonts.secondary}
                onChange={(e) => onChange({
                  fonts: {
                    ...customization.fonts,
                    secondary: e.target.value as BrandCustomization['fonts']['secondary']
                  }
                })}
                className="w-full p-2 border border-accent-line"
              >
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Proxima Nova">Proxima Nova</option>
              </select>
            </div>
          </div>
        </div>

        {/* Personal Vibe */}
        <div className="space-y-4">
          <Label className="eyebrow-text">What's your vibe?</Label>
          <p className="system-text text-soft-gray text-sm mb-4">
            Choose the energy that best represents your personality
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { vibe: 'editorial', description: 'Sophisticated & Timeless' },
              { vibe: 'luxury', description: 'Elegant & Premium' },
              { vibe: 'minimalist', description: 'Clean & Simple' },
              { vibe: 'modern', description: 'Fresh & Contemporary' },
              { vibe: 'bold', description: 'Confident & Statement-Making' }
            ].map(({ vibe, description }) => (
              <Card
                key={vibe}
                className={`p-4 cursor-pointer text-center transition-all duration-300 ${
                  customization.vibe === vibe
                    ? 'border-luxury-black'
                    : 'border-accent-line'
                }`}
                onClick={() => onChange({ vibe: vibe as BrandCustomization['vibe'] })}
              >
                <p className="system-text capitalize font-medium">{vibe}</p>
                <p className="text-xs text-soft-gray mt-1">{description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};