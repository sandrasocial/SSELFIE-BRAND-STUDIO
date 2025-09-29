import React from 'react';

interface StudioTheme {
  id: string;
  name: string;
  description: string;
  previewImage: string;
  backgroundImages: string[];
}

interface StudioThemeSelectorProps {
  currentTheme: string;
  onThemeChange: (themeId: string) => void;
}

export const studioThemes: StudioTheme[] = [
  {
    id: 'luxury-minimal',
    name: 'Luxury Minimal',
    description: 'Clean, sophisticated workspace with neutral tones',
    previewImage: 'https://i.postimg.cc/QtnSw23T/1.png',
    backgroundImages: [
      'https://i.postimg.cc/QtnSw23T/1.png',
      'https://i.postimg.cc/FKrM4X2W/10.png',
      'https://i.postimg.cc/HnMYyCW0/100.png',
      'https://i.postimg.cc/tTwRJgbC/101.png',
      'https://i.postimg.cc/c1t4jf7K/102.png'
    ]
  },
  {
    id: 'editorial-magazine',
    name: 'Editorial Magazine',
    description: 'Magazine-style layouts with typography focus',
    previewImage: 'https://i.postimg.cc/wv3n1cxD/12.png',
    backgroundImages: [
      'https://i.postimg.cc/wv3n1cxD/12.png',
      'https://i.postimg.cc/63Sgn2Tg/13.png',
      'https://i.postimg.cc/nrD5kFDz/14.png',
      'https://i.postimg.cc/59YZ13RV/15.png',
      'https://i.postimg.cc/3rszwvsD/16.png'
    ]
  },
  {
    id: 'feminine-soft',
    name: 'Feminine Soft',
    description: 'Soft pastels and romantic aesthetics',
    previewImage: 'https://i.postimg.cc/YCkV6wqr/18.png',
    backgroundImages: [
      'https://i.postimg.cc/YCkV6wqr/18.png',
      'https://i.postimg.cc/Z5cQjDCr/19.png',
      'https://i.postimg.cc/vmh0L12X/2.png',
      'https://i.postimg.cc/DzwMNdXR/20.png',
      'https://i.postimg.cc/tgvMGZdJ/21.png'
    ]
  },
  {
    id: 'business-professional',
    name: 'Business Professional',
    description: 'Corporate elegance with sophisticated layouts',
    previewImage: 'https://i.postimg.cc/TwyHddQ9/22.png',
    backgroundImages: [
      'https://i.postimg.cc/TwyHddQ9/22.png',
      'https://i.postimg.cc/x8Mxm6wN/23.png',
      'https://i.postimg.cc/ydwpWMbz/24.png',
      'https://i.postimg.cc/tCdvCmdL/25.png',
      'https://i.postimg.cc/3JQbhHGX/26.png'
    ]
  }
];

export function StudioThemeSelector({ currentTheme, onThemeChange }: StudioThemeSelectorProps) {
  return (
    <div className="p-6 bg-white border border-[#e5e5e5]">
      <h3 className="text-lg font-light mb-4 tracking-[-0.01em]" style={{ fontFamily: 'Times New Roman, serif' }}>
        Choose Your STUDIO Theme
      </h3>
      <p className="text-sm text-gray-600 mb-6 font-light">
        Select a pre-designed aesthetic theme for your STUDIO workspace. You can change this anytime.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {studioThemes.map((theme) => (
          <div
            key={theme.id}
            onClick={() => onThemeChange(theme.id)}
            className={`relative aspect-[4/3] cursor-pointer border-2 transition-all ${
              currentTheme === theme.id 
                ? 'border-[#0a0a0a] shadow-lg' 
                : 'border-[#e5e5e5] hover:border-[#ccc]'
            }`}
          >
            <img 
              src={theme.previewImage}
              alt={theme.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/80 via-[#0a0a0a]/40 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h4 className="text-white font-light text-sm mb-1" style={{ fontFamily: 'Times New Roman, serif' }}>
                {theme.name}
              </h4>
              <p className="text-white/80 text-xs font-light">
                {theme.description}
              </p>
            </div>
            {currentTheme === theme.id && (
              <div className="absolute top-3 right-3 w-6 h-6 bg-[#0a0a0a] rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}