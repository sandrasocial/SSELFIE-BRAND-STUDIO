import React from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';

interface BrandCustomizationProps {
  onCustomizationChange: (customization: BrandCustomization) => void;
}

interface BrandCustomization {
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

export const BrandCustomizer: React.FC<BrandCustomizationProps> = ({
  onCustomizationChange
}) => {
  const [customization, setCustomization] = React.useState<BrandCustomization>({
    colors: {
      primary: '#0a0a0a',
      secondary: '#ffffff',
      accent: '#f5f5f5',
      palette: 'editorial'
    },
    fonts: {
      primary: 'Times New Roman',
      secondary: 'Arial'
    },
    vibe: 'editorial',
    brandName: ''
  });

  const handleChange = (field: string, value: any) => {
    const updated = {
      ...customization,
      [field]: value
    };
    setCustomization(updated);
    onCustomizationChange(updated);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="editorial-headline mb-4">Define Your Brand</h2>
        <p className="editorial-subheadline mb-8">Curate your visual identity with editorial precision</p>
      </div>

      {/* Brand Name */}
      <section className="space-y-4">
        <Label className="eyebrow-text">Brand Name</Label>
        <Input
          type="text"
          value={customization.brandName}
          onChange={(e) => handleChange('brandName', e.target.value)}
          className="w-full font-times"
          placeholder="Enter your brand name"
        />
      </section>

      {/* Color Palette Selection */}
      <section className="space-y-4">
        <Label className="eyebrow-text">Editorial Color Palette</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['editorial', 'luxury', 'minimalist', 'bold'].map((palette) => (
            <Card
              key={palette}
              className={`p-4 cursor-pointer transition-all duration-300 ${
                customization.colors.palette === palette ? 'ring-2 ring-luxury-black' : ''
              }`}
              onClick={() => handleChange('colors', { ...customization.colors, palette })}
            >
              <div className="space-y-2">
                <div className="h-20 bg-editorial-gray"></div>
                <p className="eyebrow-text text-center">{palette}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Typography */}
      <section className="space-y-4">
        <Label className="eyebrow-text">Typography</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Primary Font</Label>
            <select
              value={customization.fonts.primary}
              onChange={(e) => handleChange('fonts', { 
                ...customization.fonts, 
                primary: e.target.value 
              })}
              className="w-full p-2 border border-accent-line"
            >
              <option value="Times New Roman">Times New Roman</option>
              <option value="Georgia">Georgia</option>
              <option value="Playfair">Playfair Display</option>
            </select>
          </div>
          <div>
            <Label>Secondary Font</Label>
            <select
              value={customization.fonts.secondary}
              onChange={(e) => handleChange('fonts', {
                ...customization.fonts,
                secondary: e.target.value
              })}
              className="w-full p-2 border border-accent-line"
            >
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Proxima Nova">Proxima Nova</option>
            </select>
          </div>
        </div>
      </section>

      {/* Brand Vibe */}
      <section className="space-y-4">
        <Label className="eyebrow-text">Brand Vibe</Label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {['editorial', 'luxury', 'minimalist', 'modern', 'bold'].map((vibe) => (
            <Card
              key={vibe}
              className={`p-4 cursor-pointer transition-all duration-300 ${
                customization.vibe === vibe ? 'ring-2 ring-luxury-black' : ''
              }`}
              onClick={() => handleChange('vibe', vibe)}
            >
              <p className="eyebrow-text text-center">{vibe}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};