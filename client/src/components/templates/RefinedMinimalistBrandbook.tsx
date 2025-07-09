import React, { useState, useEffect } from 'react';
import { SandraImages } from '@/lib/sandra-images';

// TypeScript interfaces
interface BrandbookProps {
  brandbook: {
    name: string;
    tagline: string;
    logo: string;
    story: string;
    voice: {
      tone: string;
      personality: string[];
      dosDonts: {
        dos: string[];
        donts: string[];
      };
    };
    fonts: {
      primary: {
        name: string;
        weight: string;
        usage: string;
      };
      secondary: {
        name: string;
        weight: string;
        usage: string;
      };
    };
    colors: {
      primary: {
        name: string;
        hex: string;
        code: string;
        usage: string;
      }[];
      secondary: {
        name: string;
        hex: string;
        code: string;
        usage: string;
      }[];
    };
    applications: {
      businessCard: string;
      socialMedia: string;
      letterhead: string;
      instagram: string;
    };
  };
  userImages: {
    portraits: string[];
    flatlays: string[];
  };
}

export function RefinedMinimalistBrandbook({ brandbook, userImages }: BrandbookProps) {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredLogo, setHoveredLogo] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('colors');

  // Use Sandra's luxury minimal flatlays
  const designImages = userImages?.flatlays || SandraImages.flatlays.luxuryMinimal;
  const portraitImages = userImages?.portraits || SandraImages.portraits.professional;

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedColor(text);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const downloadAsset = (assetName: string) => {
    // In real implementation, this would trigger asset download
    console.log(`Downloading ${assetName}`);
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header with Subtle Animation */}
      <div className={`bg-gradient-to-b from-white to-[#f5f5f5] py-24 px-8 relative overflow-hidden transition-all duration-1500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        {/* Subtle background texture */}
        <div className="absolute inset-0 opacity-[0.03]">
          <img 
            src={designImages[0]} 
            alt="Background texture"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="text-8xl font-thin mb-6 tracking-[0.1em] text-[#0a0a0a] hover:tracking-[0.15em] transition-all duration-700" style={{ fontFamily: 'Times New Roman, serif' }}>
            {brandbook.name}
          </div>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#e5e5e5] to-transparent mx-auto mb-6"></div>
          <div className="text-lg font-light text-[#666] italic">
            {brandbook.story}
          </div>
        </div>
      </div>

      {/* Brand Philosophy Section */}
      <div className={`py-20 px-8 bg-white relative transition-all duration-1500 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-thin mb-12 tracking-wide text-[#0a0a0a]" style={{ fontFamily: 'Times New Roman, serif' }}>
            Brand Philosophy
          </h2>
          <div className="text-xl font-light leading-relaxed text-[#666] italic mb-8">
            "{brandbook.voice.tone}"
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {brandbook.voice.personality.map((trait, index) => (
              <div key={index} className="text-center p-4 bg-[#f5f5f5] hover:bg-[#e5e5e5] transition-colors duration-300 group">
                <div className="w-4 h-4 mx-auto mb-2 bg-[#666] group-hover:bg-[#0a0a0a] transition-colors duration-300"></div>
                <div className="text-sm text-[#666]">{trait}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Color Palette Section */}
      <div className={`py-24 px-8 bg-white relative transition-all duration-1500 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        {/* Corner accents */}
        <div className="absolute top-12 right-12 w-20 h-20 opacity-[0.08]">
          <img 
            src={designImages[1]} 
            alt="Corner accent"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute bottom-12 left-12 w-16 h-16 opacity-[0.06]">
          <img 
            src={designImages[2]} 
            alt="Corner accent"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl font-thin mb-20 tracking-wide text-[#0a0a0a]" style={{ fontFamily: 'Times New Roman, serif' }}>
            Colour Palette
          </h2>
          
          {/* Primary Colors */}
          <div className="mb-16">
            <h3 className="text-lg font-medium mb-12 tracking-wide text-[#0a0a0a] flex items-center justify-center">
              <div className="w-5 h-5 mr-3 bg-[#666]"></div>
              Primary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-3xl mx-auto">
              {brandbook.colors.primary.map((color, index) => (
                <div key={index} className="text-center group">
                  <div 
                    className="w-32 h-32 mx-auto mb-6 cursor-pointer hover:scale-110 transition-all duration-500 relative border border-[#e5e5e5] hover:border-[#0a0a0a]"
                    style={{ backgroundColor: color.hex }}
                    onClick={() => copyToClipboard(color.hex)}
                  >
                    <div className="absolute inset-0 bg-white bg-opacity-0 hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
                      {copiedColor === color.hex ? (
                        <div className="text-white opacity-90 text-sm">✓</div>
                      ) : (
                        <div className="text-white opacity-0 group-hover:opacity-90 transition-opacity duration-300 text-sm">COPY</div>
                      )}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-[#0a0a0a] mb-2 tracking-wide">
                    {color.name}
                  </div>
                  <div className="text-xs text-[#666] font-mono mb-2">
                    {color.code}
                  </div>
                  <div className="text-xs text-[#666] italic">
                    {color.usage}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Secondary Colors */}
          <div>
            <h3 className="text-lg font-medium mb-12 tracking-wide text-[#0a0a0a] flex items-center justify-center">
              <div className="w-5 h-5 mr-3 bg-[#666]"></div>
              Secondary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-3xl mx-auto">
              {brandbook.colors.secondary.map((color, index) => (
                <div key={index} className="text-center group">
                  <div 
                    className="w-32 h-32 mx-auto mb-6 cursor-pointer hover:scale-110 transition-all duration-500 relative border border-[#e5e5e5] hover:border-[#0a0a0a]"
                    style={{ backgroundColor: color.hex }}
                    onClick={() => copyToClipboard(color.hex)}
                  >
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
                      {copiedColor === color.hex ? (
                        <div className="text-[#0a0a0a] opacity-90 text-sm">✓</div>
                      ) : (
                        <div className="text-[#0a0a0a] opacity-0 group-hover:opacity-90 transition-opacity duration-300 text-sm">COPY</div>
                      )}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-[#0a0a0a] mb-2 tracking-wide">
                    {color.name}
                  </div>
                  <div className="text-xs text-[#666] font-mono mb-2">
                    {color.code}
                  </div>
                  <div className="text-xs text-[#666] italic">
                    {color.usage}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Logo Variations */}
      <div className={`py-24 px-8 bg-[#f5f5f5] relative overflow-hidden transition-all duration-1500 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        {/* Background texture */}
        <div className="absolute inset-0 opacity-[0.04]">
          <img 
            src={designImages[3]} 
            alt="Background texture"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h2 className="text-3xl font-thin mb-20 tracking-wide text-[#0a0a0a]" style={{ fontFamily: 'Times New Roman, serif' }}>
            Logo Variations
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {/* Primary Logo */}
            <div className="text-center">
              <h3 className="text-lg font-medium mb-12 tracking-wide text-[#0a0a0a]">Primary</h3>
              <div 
                className="bg-white p-16 border border-[#e5e5e5] hover:border-[#0a0a0a] transition-all duration-500 hover:scale-105 group relative overflow-hidden"
                onMouseEnter={() => setHoveredLogo('primary')}
                onMouseLeave={() => setHoveredLogo(null)}
              >
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div 
                    className="text-[#666] hover:text-[#0a0a0a] cursor-pointer text-sm" 
                    onClick={() => downloadAsset('primary-logo')}
                  >
                    ↓
                  </div>
                </div>
                <div className="text-4xl font-thin tracking-wider text-[#0a0a0a] transition-all duration-300 group-hover:tracking-wide" style={{ fontFamily: 'Times New Roman, serif' }}>
                  {brandbook.name}
                </div>
              </div>
            </div>
            
            {/* Secondary Logo */}
            <div className="text-center">
              <h3 className="text-lg font-medium mb-12 tracking-wide text-[#0a0a0a]">Secondary</h3>
              <div 
                className="bg-white p-16 border border-[#e5e5e5] hover:border-[#0a0a0a] transition-all duration-500 hover:scale-105 group relative overflow-hidden"
                onMouseEnter={() => setHoveredLogo('secondary')}
                onMouseLeave={() => setHoveredLogo(null)}
              >
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div 
                    className="text-[#666] hover:text-[#0a0a0a] cursor-pointer text-sm"
                    onClick={() => downloadAsset('secondary-logo')}
                  >
                    ↓
                  </div>
                </div>
                <div className="text-6xl font-thin tracking-wider text-[#0a0a0a] transition-all duration-300 group-hover:scale-110" style={{ fontFamily: 'Times New Roman, serif' }}>
                  {brandbook.logo}
                </div>
              </div>
            </div>
            
            {/* Elements */}
            <div className="text-center">
              <h3 className="text-lg font-medium mb-12 tracking-wide text-[#0a0a0a]">Elements</h3>
              <div 
                className="bg-white p-16 border border-[#e5e5e5] hover:border-[#0a0a0a] transition-all duration-500 hover:scale-105 group relative overflow-hidden"
                onMouseEnter={() => setHoveredLogo('elements')}
                onMouseLeave={() => setHoveredLogo(null)}
              >
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div 
                    className="text-[#666] hover:text-[#0a0a0a] cursor-pointer text-sm"
                    onClick={() => downloadAsset('logo-elements')}
                  >
                    ↓
                  </div>
                </div>
                <div className="text-6xl font-thin tracking-wider text-[#0a0a0a] transition-all duration-300" style={{ fontFamily: 'Times New Roman, serif' }}>
                  {brandbook.logo.charAt(0)}.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Typography Section */}
      <div className={`py-24 px-8 bg-white relative transition-all duration-1500 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-thin mb-20 tracking-wide text-[#0a0a0a]" style={{ fontFamily: 'Times New Roman, serif' }}>
            Typography
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {/* Primary Font */}
            <div className="text-center">
              <h3 className="text-lg font-medium mb-8 tracking-wide text-[#0a0a0a]">Primary</h3>
              <div className="bg-[#f5f5f5] p-12 border border-[#e5e5e5]">
                <div className="text-5xl font-thin mb-6 text-[#0a0a0a]" style={{ fontFamily: brandbook.fonts.primary.name }}>
                  Aa
                </div>
                <div className="text-sm text-[#666] mb-2">
                  {brandbook.fonts.primary.name}
                </div>
                <div className="text-xs text-[#666] mb-4">
                  {brandbook.fonts.primary.weight}
                </div>
                <div className="text-xs text-[#666] italic">
                  {brandbook.fonts.primary.usage}
                </div>
              </div>
            </div>
            
            {/* Secondary Font */}
            <div className="text-center">
              <h3 className="text-lg font-medium mb-8 tracking-wide text-[#0a0a0a]">Secondary</h3>
              <div className="bg-[#f5f5f5] p-12 border border-[#e5e5e5]">
                <div className="text-5xl font-normal mb-6 text-[#0a0a0a]" style={{ fontFamily: brandbook.fonts.secondary.name }}>
                  Aa
                </div>
                <div className="text-sm text-[#666] mb-2">
                  {brandbook.fonts.secondary.name}
                </div>
                <div className="text-xs text-[#666] mb-4">
                  {brandbook.fonts.secondary.weight}
                </div>
                <div className="text-xs text-[#666] italic">
                  {brandbook.fonts.secondary.usage}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Applications */}
      <div className={`py-24 px-8 bg-[#f5f5f5] relative transition-all duration-1500 delay-900 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-thin mb-20 tracking-wide text-[#0a0a0a] text-center" style={{ fontFamily: 'Times New Roman, serif' }}>
            Brand Applications
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Business Card */}
            <div className="text-center">
              <h3 className="text-lg font-medium mb-8 tracking-wide text-[#0a0a0a]">Business Card</h3>
              <div className="bg-white p-8 border border-[#e5e5e5] aspect-[1.6/1] flex items-center justify-center hover:border-[#0a0a0a] transition-colors duration-300">
                <div className="text-center">
                  <div className="text-xl font-thin mb-2 text-[#0a0a0a]" style={{ fontFamily: 'Times New Roman, serif' }}>
                    {brandbook.name}
                  </div>
                  <div className="text-xs text-[#666]">
                    {brandbook.tagline}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Social Media */}
            <div className="text-center">
              <h3 className="text-lg font-medium mb-8 tracking-wide text-[#0a0a0a]">Social Media</h3>
              <div className="bg-white p-8 border border-[#e5e5e5] aspect-square flex items-center justify-center hover:border-[#0a0a0a] transition-colors duration-300">
                <div className="text-center">
                  <div className="text-2xl font-thin mb-2 text-[#0a0a0a]" style={{ fontFamily: 'Times New Roman, serif' }}>
                    {brandbook.logo}
                  </div>
                  <div className="text-xs text-[#666]">
                    @{brandbook.name.toLowerCase()}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Letterhead */}
            <div className="text-center">
              <h3 className="text-lg font-medium mb-8 tracking-wide text-[#0a0a0a]">Letterhead</h3>
              <div className="bg-white p-8 border border-[#e5e5e5] aspect-[1/1.3] flex flex-col justify-between hover:border-[#0a0a0a] transition-colors duration-300">
                <div className="text-center">
                  <div className="text-lg font-thin text-[#0a0a0a] mb-1" style={{ fontFamily: 'Times New Roman, serif' }}>
                    {brandbook.name}
                  </div>
                  <div className="text-xs text-[#666]">
                    {brandbook.tagline}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-px bg-[#e5e5e5]"></div>
                  <div className="w-3/4 h-px bg-[#e5e5e5]"></div>
                  <div className="w-1/2 h-px bg-[#e5e5e5]"></div>
                </div>
              </div>
            </div>
            
            {/* Instagram */}
            <div className="text-center">
              <h3 className="text-lg font-medium mb-8 tracking-wide text-[#0a0a0a]">Instagram</h3>
              <div className="bg-white p-8 border border-[#e5e5e5] aspect-square flex items-center justify-center hover:border-[#0a0a0a] transition-colors duration-300 relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.1]">
                  <img 
                    src={portraitImages[0]} 
                    alt="Instagram background"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-center relative z-10">
                  <div className="text-xl font-thin text-[#0a0a0a]" style={{ fontFamily: 'Times New Roman, serif' }}>
                    {brandbook.logo}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Guidelines */}
      <div className={`py-24 px-8 bg-white relative transition-all duration-1500 delay-1100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-thin mb-20 tracking-wide text-[#0a0a0a] text-center" style={{ fontFamily: 'Times New Roman, serif' }}>
            Brand Guidelines
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {/* Do's */}
            <div>
              <h3 className="text-xl font-medium mb-8 tracking-wide text-[#0a0a0a]">Do's</h3>
              <div className="space-y-4">
                {brandbook.voice.dosDonts.dos.map((item, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[#0a0a0a] mt-2 flex-shrink-0"></div>
                    <div className="text-[#666] leading-relaxed">{item}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Don'ts */}
            <div>
              <h3 className="text-xl font-medium mb-8 tracking-wide text-[#0a0a0a]">Don'ts</h3>
              <div className="space-y-4">
                {brandbook.voice.dosDonts.donts.map((item, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[#666] mt-2 flex-shrink-0"></div>
                    <div className="text-[#666] leading-relaxed">{item}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-16 px-8 bg-[#0a0a0a] text-center">
        <div className="text-white text-lg font-thin tracking-wide" style={{ fontFamily: 'Times New Roman, serif' }}>
          {brandbook.name}
        </div>
        <div className="text-[#666] text-sm mt-2">
          Brand Guidelines · {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}