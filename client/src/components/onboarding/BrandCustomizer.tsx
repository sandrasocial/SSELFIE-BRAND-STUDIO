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
    <div className="space-y-12 p-6 bg-pure-white">
      <div>
        <h2 className="editorial-headline mb-2">Brand Your Site</h2>
        <p className="system-text text-soft-gray mb-8">
          Customize your site's look and feel
        </p>
      </div>

      <div className="space-y-8">
        {/* Brand Name */}
        <div className="space-y-4">
          <Label className="eyebrow-text">Brand Name</Label>
          <Input
            value={customization.brandName}
            onChange={(e) => onChange({ brandName: e.target.value })}
            className="text-2xl font-times"
            placeholder="Your Brand Name"
          />
        </div>

        {/* Color Palettes */}
        <div className="space-y-4">
          <Label className="eyebrow-text">Color Palette</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(Object.keys(PALETTES) as Array<keyof typeof PALETTES>).map((palette) => (
              <Card
                key={palette}
                className={`p-4 cursor-pointer transition-all duration-300 ${
                  customization.colors.palette === palette
                    ? 'border-luxury-black'
                    : 'border-accent-line'
                }`}
                onClick={() => onChange({
                  colors: {
                    ...customization.colors,
                    palette,
                    ...PALETTES[palette]
                  }
                })}
              >
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: PALETTES[palette].primary }} />
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: PALETTES[palette].secondary }} />
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: PALETTES[palette].accent }} />
                  </div>
                  <p className="system-text capitalize">{palette}</p>
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
                className="w-full p-2 border border-accent-line"
              >
                <option value="Times New Roman">Times New Roman</option>
                <option value="Georgia">Georgia</option>
                <option value="Playfair">Playfair</option>
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

        {/* Brand Vibe */}
        <div className="space-y-4">
          <Label className="eyebrow-text">Brand Vibe</Label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {['editorial', 'luxury', 'minimalist', 'modern', 'bold'].map((vibe) => (
              <Card
                key={vibe}
                className={`p-4 cursor-pointer text-center transition-all duration-300 ${
                  customization.vibe === vibe
                    ? 'border-luxury-black'
                    : 'border-accent-line'
                }`}
                onClick={() => onChange({ vibe: vibe as BrandCustomization['vibe'] })}
              >
                <p className="system-text capitalize">{vibe}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};