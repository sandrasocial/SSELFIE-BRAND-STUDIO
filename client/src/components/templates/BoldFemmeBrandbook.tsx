import React, { useState, useEffect } from 'react';
// Removed Lucide React icons to comply with Sandra's no-icons styleguide
import { SandraImages } from '@/lib/sandra-images';

interface BrandbookProps {
  brandbook: {
    businessName: string;
    tagline: string;
    primaryFont: string;
    secondaryFont: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    voiceTone?: string;
    keyPhrases?: string;
    story?: string;
  };
}

export function BoldFemmeBrandbook({ brandbook }: BrandbookProps) {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedColor(text);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const downloadAsset = (assetName: string) => {
    console.log(`Downloading ${assetName}`);
  };

  // Bold Femme Color Palette - Emerald/Sage theme
  const colorPalette = {
    primary: [
      { name: 'Deep Emerald', hex: '#2F4A3D', usage: 'Primary brand color' },
      { name: 'Forest Green', hex: '#1A3329', usage: 'Dark accents' },
      { name: 'Sage Green', hex: '#6B8A74', usage: 'Secondary green' }
    ],
    neutral: [
      { name: 'Warm White', hex: '#FEFEFE', usage: 'Background' },
      { name: 'Stone Gray', hex: '#8B8680', usage: 'Text secondary' },
      { name: 'Charcoal', hex: '#2C2C2C', usage: 'Primary text' }
    ]
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Split Layout */}
      <div className={`min-h-screen grid grid-cols-1 md:grid-cols-2 transition-all duration-2000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        {/* Left Side - Monogram */}
        <div className="bg-[#f5f5f5] flex items-center justify-center p-8 relative overflow-hidden">
          <div className="text-center relative z-10 group">
            <div 
              className="text-8xl font-light mb-4 tracking-wider text-[#8B8680] hover:text-[#2F4A3D] transition-all duration-700 hover:scale-110 cursor-pointer" 
              style={{ fontFamily: 'Times New Roman, serif' }}
              onMouseEnter={() => setHoveredElement('logo')}
              onMouseLeave={() => setHoveredElement(null)}
            >
              {brandbook.businessName.charAt(0)}
            </div>
            <div className={`w-16 h-0.5 bg-[#8B8680] mx-auto transition-all duration-500 ${hoveredElement === 'logo' ? 'w-24 bg-[#2F4A3D]' : ''}`}></div>
          </div>
        </div>
        
        {/* Right Side - Script with Emerald Background */}
        <div 
          className="flex items-center justify-center p-8 relative overflow-hidden"
          style={{ backgroundColor: '#2F4A3D' }}
        >
          <div className="text-center relative z-10 group">
            <div 
              className="text-6xl text-white mb-4 font-light italic hover:scale-105 transition-all duration-700 cursor-pointer" 
              style={{ fontFamily: 'Times New Roman, serif' }}
              onMouseEnter={() => setHoveredElement('script')}
              onMouseLeave={() => setHoveredElement(null)}
            >
              {brandbook.businessName}
            </div>
            <p className="text-xl text-white opacity-90 tracking-wide">
              {brandbook.tagline}
            </p>
          </div>
        </div>
      </div>

      {/* Brand Story Section */}
      <div className={`py-24 px-8 bg-white relative transition-all duration-1500 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* Portrait */}
          <div className="relative group">
            <div className="aspect-[4/5] overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-700">
              <img 
                src={SandraImages.editorial.woman3} 
                alt="Brand portrait"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div 
              className="absolute -bottom-8 -right-8 p-8 shadow-xl hover:shadow-2xl transition-all duration-500 group-hover:scale-105"
              style={{ backgroundColor: '#2F4A3D' }}
            >
              <div className="text-sm tracking-wider uppercase text-white opacity-80">EST. 2024</div>
              <div className="text-4xl font-light text-white" style={{ fontFamily: 'Times New Roman, serif' }}>
                {brandbook.businessName}
              </div>
              <div className="text-lg italic text-white opacity-90">
                {brandbook.tagline}
              </div>
            </div>
          </div>
          
          {/* Brand Story */}
          <div>
            <h2 className="text-4xl font-light mb-8 tracking-wide text-[#2F4A3D]" style={{ fontFamily: 'Times New Roman, serif' }}>
              Brand Manifesto
            </h2>
            <div className="text-2xl font-light leading-relaxed text-[#666] mb-8 italic hover:text-[#2F4A3D] transition-colors duration-500">
              "{brandbook.story || 'Crafting authentic experiences through bold, feminine design that empowers and inspires.'}"
            </div>
            {brandbook.voiceTone && (
              <div className="flex items-center space-x-4 mb-8">
                {brandbook.voiceTone.split(',').map((trait, index) => (
                  <div key={index} className="px-4 py-2 bg-[#6B8A74] bg-opacity-20 text-[#2F4A3D] text-sm hover:bg-opacity-30 transition-colors duration-300">
                    {trait.trim()}
                  </div>
                ))}
              </div>
            )}
            <div className="w-24 h-1 bg-[#2F4A3D] hover:w-32 transition-all duration-500"></div>
          </div>
        </div>
      </div>

      {/* Logo Variations */}
      <div className={`py-24 px-8 bg-[#f5f5f5] relative transition-all duration-1500 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <div className="max-w-6xl mx-auto relative z-10">
          <h2 className="text-center text-4xl font-light mb-20 tracking-wide text-[#2F4A3D]" style={{ fontFamily: 'Times New Roman, serif' }}>
            Logo Variations
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {/* Primary Logo */}
            <div className="text-center">
              <h3 className="text-xl font-medium mb-12 tracking-wide text-[#2F4A3D]">Primary</h3>
              <div className="bg-white p-16 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#6B8A74] from-transparent to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                <div className="relative z-10 mb-4">
                  <div className="text-sm tracking-wider uppercase text-[#2F4A3D] mb-2">EST. 2024</div>
                  <div className="text-5xl font-light text-[#2F4A3D] group-hover:scale-105 transition-transform duration-300" style={{ fontFamily: 'Times New Roman, serif' }}>
                    {brandbook.businessName}
                  </div>
                  <div className="text-2xl italic text-[#6B8A74] group-hover:text-[#2F4A3D] transition-colors duration-300">
                    {brandbook.tagline}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Script Logo with Emerald Background */}
            <div className="text-center">
              <h3 className="text-xl font-medium mb-12 tracking-wide text-[#2F4A3D]">Script</h3>
              <div 
                className="p-16 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 group relative overflow-hidden"
                style={{ backgroundColor: '#2F4A3D' }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white from-transparent to-black to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                <div className="text-5xl text-white italic group-hover:scale-105 transition-transform duration-300" style={{ fontFamily: 'Times New Roman, serif' }}>
                  {brandbook.businessName}
                </div>
              </div>
            </div>
            
            {/* Monogram with Sage Accent */}
            <div className="text-center">
              <h3 className="text-xl font-medium mb-12 tracking-wide text-[#2F4A3D]">Monogram</h3>
              <div className="bg-white p-16 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 group relative border border-[#6B8A74] border-opacity-20 overflow-hidden">
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                  style={{ backgroundColor: '#6B8A74' }}
                ></div>
                <div className="relative z-10">
                  <div className="text-8xl font-light text-[#2F4A3D] group-hover:text-[#6B8A74] transition-colors duration-300" style={{ fontFamily: 'Times New Roman, serif' }}>
                    {brandbook.businessName.charAt(0)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Typography System */}
      <div className={`py-24 px-8 bg-white transition-all duration-1500 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center text-4xl font-light mb-20 tracking-wide text-[#2F4A3D]" style={{ fontFamily: 'Times New Roman, serif' }}>
            Typography System
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {/* Primary Typography */}
            <div className="space-y-12">
              <div>
                <h3 className="text-2xl font-medium mb-8 text-[#2F4A3D]">Primary Typography</h3>
                <div className="space-y-6">
                  <div className="p-8 bg-[#f5f5f5] hover:bg-white hover:shadow-lg transition-all duration-300">
                    <div className="text-sm uppercase tracking-wider text-[#666] mb-2">Times New Roman</div>
                    <div className="text-6xl font-light text-[#2F4A3D]" style={{ fontFamily: 'Times New Roman, serif' }}>
                      Elegant
                    </div>
                    <div className="text-sm text-[#666] mt-2">Headlines & Brand Names</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Secondary Typography */}
            <div className="space-y-12">
              <div>
                <h3 className="text-2xl font-medium mb-8 text-[#2F4A3D]">Secondary Typography</h3>
                <div className="space-y-6">
                  <div className="p-8 bg-[#f5f5f5] hover:bg-white hover:shadow-lg transition-all duration-300">
                    <div className="text-sm uppercase tracking-wider text-[#666] mb-2">Inter</div>
                    <div className="text-4xl font-normal text-[#2F4A3D]">
                      Modern & Clean
                    </div>
                    <div className="text-sm text-[#666] mt-2">Body Text & Navigation</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Color Palette */}
      <div className={`py-24 px-8 bg-[#f5f5f5] transition-all duration-1500 delay-900 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center text-4xl font-light mb-20 tracking-wide text-[#2F4A3D]" style={{ fontFamily: 'Times New Roman, serif' }}>
            Color Palette
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {/* Primary Colors */}
            <div>
              <h3 className="text-2xl font-medium mb-8 text-[#2F4A3D]">Primary Colors</h3>
              <div className="space-y-4">
                {colorPalette.primary.map((color, index) => (
                  <div 
                    key={index} 
                    className="flex items-center p-6 bg-white hover:shadow-lg transition-all duration-300 group cursor-pointer"
                    onClick={() => copyToClipboard(color.hex)}
                  >
                    <div 
                      className="w-16 h-16 mr-6 group-hover:scale-110 transition-transform duration-300 shadow-lg" 
                      style={{ backgroundColor: color.hex }}
                    ></div>
                    <div className="flex-1">
                      <div className="font-medium text-[#2C2C2C] group-hover:text-[#2F4A3D] transition-colors">
                        {color.name}
                      </div>
                      <div className="text-sm text-[#666] font-mono">{color.hex}</div>
                      <div className="text-xs text-[#8B8680]">{color.usage}</div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      {copiedColor === color.hex ? (
                        <Check size={20} className="text-[#2F4A3D]" />
                      ) : (
                        <Copy size={20} className="text-[#666]" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Neutral Colors */}
            <div>
              <h3 className="text-2xl font-medium mb-8 text-[#2F4A3D]">Neutral Colors</h3>
              <div className="space-y-4">
                {colorPalette.neutral.map((color, index) => (
                  <div 
                    key={index} 
                    className="flex items-center p-6 bg-white hover:shadow-lg transition-all duration-300 group cursor-pointer"
                    onClick={() => copyToClipboard(color.hex)}
                  >
                    <div 
                      className="w-16 h-16 mr-6 group-hover:scale-110 transition-transform duration-300 shadow-lg" 
                      style={{ backgroundColor: color.hex }}
                    ></div>
                    <div className="flex-1">
                      <div className="font-medium text-[#2C2C2C] group-hover:text-[#2F4A3D] transition-colors">
                        {color.name}
                      </div>
                      <div className="text-sm text-[#666] font-mono">{color.hex}</div>
                      <div className="text-xs text-[#8B8680]">{color.usage}</div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      {copiedColor === color.hex ? (
                        <Check size={20} className="text-[#2F4A3D]" />
                      ) : (
                        <Copy size={20} className="text-[#666]" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Applications */}
      <div className={`py-24 px-8 bg-white transition-all duration-1500 delay-1100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center text-4xl font-light mb-20 tracking-wide text-[#2F4A3D]" style={{ fontFamily: 'Times New Roman, serif' }}>
            Brand Applications
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {/* Business Card Preview */}
            <div className="group">
              <h3 className="text-2xl font-medium mb-8 text-[#2F4A3D]">Business Card</h3>
              <div className="aspect-[1.75/1] bg-white shadow-2xl hover:shadow-3xl transition-all duration-500 relative overflow-hidden group-hover:scale-105">
                <div 
                  className="absolute inset-0 opacity-5"
                  style={{ backgroundColor: '#2F4A3D' }}
                ></div>
                <div className="p-8 h-full flex flex-col justify-between relative z-10">
                  <div>
                    <div className="text-3xl font-light text-[#2F4A3D]" style={{ fontFamily: 'Times New Roman, serif' }}>
                      {brandbook.businessName}
                    </div>
                    <div className="text-sm italic text-[#6B8A74]">{brandbook.tagline}</div>
                  </div>
                  <div className="text-xs text-[#8B8680] space-y-1">
                    <div>hello@{brandbook.businessName.toLowerCase().replace(/\s+/g, '')}.com</div>
                    <div>www.{brandbook.businessName.toLowerCase().replace(/\s+/g, '')}.com</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Social Media Preview */}
            <div className="group">
              <h3 className="text-2xl font-medium mb-8 text-[#2F4A3D]">Social Media</h3>
              <div className="aspect-square bg-white shadow-2xl hover:shadow-3xl transition-all duration-500 relative overflow-hidden group-hover:scale-105">
                <div 
                  className="absolute inset-0"
                  style={{ backgroundColor: '#2F4A3D' }}
                ></div>
                <img 
                  src={SandraImages.editorial.flatlay1} 
                  alt="Social media background"
                  className="absolute inset-0 w-full h-full object-cover opacity-20"
                />
                <div className="absolute inset-0 flex items-center justify-center text-center p-8">
                  <div>
                    <div className="text-4xl font-light text-white mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
                      {brandbook.businessName}
                    </div>
                    <div className="text-lg italic text-white opacity-90">
                      {brandbook.tagline}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Guidelines */}
      <div className={`py-24 px-8 bg-[#f5f5f5] transition-all duration-1500 delay-1300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center text-4xl font-light mb-20 tracking-wide text-[#2F4A3D]" style={{ fontFamily: 'Times New Roman, serif' }}>
            Usage Guidelines
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="bg-white p-12 shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="text-2xl font-medium mb-8 text-[#2F4A3D]">Do</h3>
              <ul className="space-y-4 text-[#666]">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-[#2F4A3D] rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  Use emerald green as the primary brand color
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-[#2F4A3D] rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  Maintain elegant typography hierarchy
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-[#2F4A3D] rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  Keep generous whitespace for luxury feel
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-[#2F4A3D] rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  Use high-quality, editorial-style photography
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-12 shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="text-2xl font-medium mb-8 text-[#2F4A3D]">Don't</h3>
              <ul className="space-y-4 text-[#666]">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-[#666] rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  Use bright or neon colors
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-[#666] rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  Overcrowd design elements
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-[#666] rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  Mix fonts outside the typography system
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-[#666] rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  Use low-resolution or pixelated images
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}