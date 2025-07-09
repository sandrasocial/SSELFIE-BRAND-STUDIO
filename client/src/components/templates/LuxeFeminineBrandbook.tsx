// LUXE FEMININE - COMPLETE BRANDBOOK TEMPLATE
import React, { useState, useEffect } from 'react';

// TypeScript interfaces
interface BrandbookProps {
  brandbook: {
    businessName: string;
    tagline: string;
    script?: string;
    monogram?: string;
    story: string;
    manifesto?: string;
    voiceTone?: string;
    keyPhrases?: string[];
    primaryColor: string;
    secondaryColor: string;
    accentColor?: string;
    primaryFont: string;
    secondaryFont: string;
  };
}

export function LuxeFeminineBrandbook({ brandbook }: BrandbookProps) {
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

  // Define brand data with proper structure
  const brandData = {
    name: brandbook.businessName || 'Your Business',
    tagline: brandbook.tagline || 'Luxe Elegance',
    script: brandbook.script || brandbook.businessName || 'Your Business',
    monogram: brandbook.monogram || brandbook.businessName?.charAt(0) || 'Y',
    story: brandbook.story || 'A story of elegance, sophistication, and feminine power.',
    manifesto: brandbook.manifesto || brandbook.voiceTone || 'Embracing femininity as strength, creating beauty with purpose.',
    voice: {
      tone: brandbook.voiceTone || 'Sophisticated, Elegant, Empowering',
      personality: brandbook.keyPhrases || ['Sophisticated', 'Elegant', 'Feminine', 'Powerful'],
      dosDonts: {
        dos: [
          'Use elegant, flowing language',
          'Embrace feminine power',
          'Maintain sophistication',
          'Create emotional connections'
        ],
        donts: [
          'Be overly corporate',
          'Ignore emotional impact',
          'Use harsh language',
          'Compromise on quality'
        ]
      }
    },
    fonts: {
      primary: {
        name: brandbook.primaryFont || 'Times New Roman',
        usage: 'Headlines, brand name, important text',
        weight: 'Light, Regular'
      },
      script: {
        name: 'Dancing Script',
        usage: 'Signature elements, special quotes',
        weight: 'Regular'
      },
      body: {
        name: brandbook.secondaryFont || 'Inter',
        usage: 'Body text, captions, user interface',
        weight: 'Regular, Medium'
      }
    },
    colors: {
      primary: [
        { name: 'Burgundy', hex: brandbook.primaryColor || '#6B2D5C', code: brandbook.primaryColor || '#6B2D5C', usage: 'Primary brand color' },
        { name: 'Plum', hex: brandbook.secondaryColor || '#4A1E3A', code: brandbook.secondaryColor || '#4A1E3A', usage: 'Secondary brand color' },
        { name: 'Deep Rose', hex: '#8B4B6B', code: '#8B4B6B', usage: 'Accent color' }
      ],
      neutral: [
        { name: 'Blush', hex: brandbook.accentColor || '#E8C4B8', code: brandbook.accentColor || '#E8C4B8', usage: 'Background, subtle accents' },
        { name: 'Pearl', hex: '#F5E6D3', code: '#F5E6D3', usage: 'Light backgrounds' },
        { name: 'Soft Gray', hex: '#F8F8F8', code: '#F8F8F8', usage: 'Text, borders' }
      ]
    },
    applications: {
      businessCard: 'https://via.placeholder.com/400x250/6B2D5C/ffffff?text=Business+Card',
      socialMedia: 'https://via.placeholder.com/400x400/E8C4B8/6B2D5C?text=Social+Media',
      packaging: 'https://via.placeholder.com/400x300/4A1E3A/ffffff?text=Packaging',
      website: 'https://via.placeholder.com/400x300/F5E6D3/6B2D5C?text=Website',
      stationery: 'https://via.placeholder.com/400x300/6B2D5C/ffffff?text=Stationery'
    }
  };

  // Mock user images for template demo
  const userImages = {
    portraits: [
      'https://via.placeholder.com/400x500/6B2D5C/ffffff?text=Portrait+1',
      'https://via.placeholder.com/400x500/E8C4B8/6B2D5C?text=Portrait+2',
      'https://via.placeholder.com/400x500/4A1E3A/ffffff?text=Portrait+3',
      'https://via.placeholder.com/400x500/F5E6D3/6B2D5C?text=Portrait+4'
    ],
    flatlays: [
      'https://via.placeholder.com/400x400/E8C4B8/6B2D5C?text=Flatlay+1',
      'https://via.placeholder.com/400x400/F5E6D3/4A1E3A?text=Flatlay+2',
      'https://via.placeholder.com/400x400/6B2D5C/ffffff?text=Flatlay+3',
      'https://via.placeholder.com/400x400/4A1E3A/ffffff?text=Flatlay+4'
    ]
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Hero Section with Burgundy Background */}
      <div 
        className={`min-h-screen flex items-center justify-center relative overflow-hidden transition-all duration-2000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        style={{ backgroundColor: brandData.colors.primary[0].hex }}
      >
        <div 
          className="absolute inset-0 opacity-10"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        >
          <img 
            src={userImages.flatlays[0]} 
            alt="Luxury background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="text-center relative z-10 group">
          <div 
            className="text-8xl font-thin mb-4 tracking-[0.2em] text-white hover:tracking-[0.3em] transition-all duration-700 cursor-pointer" 
            style={{ fontFamily: 'serif' }}
            onMouseEnter={() => setHoveredElement('main-logo')}
            onMouseLeave={() => setHoveredElement(null)}
          >
            {brandData.name}
          </div>
          <div className="text-2xl tracking-[0.3em] uppercase text-white opacity-80 mb-8">
            {brandData.tagline}
          </div>
          <div className={`w-32 h-0.5 bg-white bg-opacity-60 mx-auto transition-all duration-500 ${hoveredElement === 'main-logo' ? 'w-48 bg-opacity-100' : ''}`}></div>
          <div className="mt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <span 
              className="text-white hover:text-pink-200 cursor-pointer mx-auto block w-6 h-6"
              onClick={() => downloadAsset('primary-logo')}
            >
              ↓
            </span>
          </div>
        </div>
      </div>

      {/* Brand Philosophy */}
      <div className={`py-20 px-8 bg-white transition-all duration-1500 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-thin mb-12 tracking-wide" style={{ fontFamily: 'serif', color: brandData.colors.primary[0].hex }}>
            Brand Philosophy
          </h2>
          <div className="text-xl font-light leading-relaxed text-gray-700 italic mb-8">
            "{brandData.manifesto}"
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {brandData.voice.personality.map((trait, index) => (
              <div key={index} className="text-center p-4 bg-pink-50 hover:bg-pink-100 transition-colors duration-300 group">
                <div className="w-4 h-4 mx-auto mb-2 bg-pink-400 group-hover:bg-pink-600 transition-colors duration-300"></div>
                <div className="text-sm text-gray-700">{trait}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Logo Variations Grid */}
      <div className={`py-24 px-8 bg-gradient-to-b from-white to-pink-50 relative transition-all duration-1500 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <div className="absolute inset-0 opacity-3">
          <img 
            src={userImages.flatlays[1]} 
            alt="Background texture"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <h2 className="text-center text-4xl font-thin mb-20 tracking-wide text-gray-800 flex items-center justify-center" style={{ fontFamily: 'serif' }}>
            <span className="mr-4" style={{ color: brandData.colors.primary[0].hex }}>♔</span>
            Logo Variations
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* Main Logo on Burgundy */}
            <div 
              className="p-16 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 group relative overflow-hidden"
              style={{ backgroundColor: brandData.colors.primary[0].hex }}
            >
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span 
                  className="text-white hover:text-pink-200 cursor-pointer text-sm" 
                  onClick={() => downloadAsset('primary-logo')}
                >
                  ↓
                </span>
              </div>
              <div className="text-center">
                <div className="text-5xl font-thin text-white mb-2 group-hover:scale-105 transition-transform duration-300" style={{ fontFamily: 'serif' }}>
                  {brandData.name}
                </div>
                <div className="text-lg tracking-[0.2em] uppercase text-white opacity-80">
                  {brandData.tagline}
                </div>
              </div>
            </div>
            
            {/* Script Logo on Blush */}
            <div 
              className="p-16 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 group relative overflow-hidden"
              style={{ backgroundColor: brandData.colors.neutral[0].hex }}
            >
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span 
                  className="text-gray-600 hover:text-gray-800 cursor-pointer text-sm"
                  onClick={() => downloadAsset('script-logo')}
                >
                  ↓
                </span>
              </div>
              <div className="text-center">
                <div className="text-6xl font-light italic group-hover:scale-105 transition-transform duration-300" style={{ fontFamily: 'cursive', color: brandData.colors.primary[0].hex }}>
                  {brandData.script}
                </div>
                <div className="text-sm tracking-[0.2em] uppercase mt-2" style={{ color: brandData.colors.primary[0].hex }}>
                  {brandData.tagline}
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Logos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Monogram */}
            <div className="bg-white p-12 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 group border border-pink-100 relative">
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span 
                  className="text-gray-400 hover:text-gray-600 cursor-pointer text-sm"
                  onClick={() => downloadAsset('monogram')}
                >
                  ↓
                </span>
              </div>
              <div className="text-center">
                <div className="text-6xl font-thin group-hover:scale-110 transition-transform duration-300" style={{ fontFamily: 'serif', color: brandData.colors.primary[0].hex }}>
                  {brandData.monogram}
                </div>
              </div>
            </div>
            
            {/* Icon Mark */}
            <div className="bg-white p-12 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 group border border-pink-100">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: brandData.colors.primary[0].hex }}>
                  <span className="text-white text-2xl">♥</span>
                </div>
              </div>
            </div>
            
            {/* Circular Logo */}
            <div className="bg-white p-12 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 group border border-pink-100">
              <div className="text-center">
                <div 
                  className="w-20 h-20 mx-auto rounded-full border-2 flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                  style={{ borderColor: brandData.colors.primary[0].hex }}
                >
                  <div className="text-2xl font-thin" style={{ fontFamily: 'serif', color: brandData.colors.primary[0].hex }}>
                    {brandData.name.charAt(0)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Color Palette with Circles */}
      <div className={`py-24 px-8 bg-white relative transition-all duration-1500 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <div className="absolute top-12 right-12 w-24 h-24 opacity-8">
          <img 
            src={userImages.flatlays[2]} 
            alt="Corner accent"
            className="w-full h-full object-cover rounded-full"
          />
        </div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h2 className="text-4xl font-thin mb-20 tracking-wide text-gray-800 flex items-center justify-center" style={{ fontFamily: 'serif' }}>
            <span className="mr-4" style={{ color: brandData.colors.primary[0].hex }}>♥</span>
            Color Palette
          </h2>
          
          {/* Color Circles */}
          <div className="flex justify-center items-center space-x-8 mb-16">
            {[...brandData.colors.primary, ...brandData.colors.neutral].map((color, index) => (
              <div key={index} className="text-center group">
                <div 
                  className="w-24 h-24 rounded-full cursor-pointer hover:scale-110 transition-all duration-500 relative shadow-lg hover:shadow-xl"
                  style={{ backgroundColor: color.hex }}
                  onClick={() => copyToClipboard(color.hex)}
                >
                  <div className="absolute inset-0 bg-white bg-opacity-0 hover:bg-opacity-10 rounded-full transition-all duration-300 flex items-center justify-center">
                    {copiedColor === color.hex ? (
                      <span className="text-white opacity-90 text-xl">✓</span>
                    ) : (
                      <span className="text-white opacity-0 group-hover:opacity-90 transition-opacity duration-300 text-sm">copy</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Color Details */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
            {[...brandData.colors.primary, ...brandData.colors.neutral].map((color, index) => (
              <div key={index} className="text-center">
                <div className="text-lg font-medium mb-2 tracking-wide" style={{ color: brandData.colors.primary[0].hex }}>
                  {color.name}
                </div>
                <div className="text-sm text-gray-600 font-mono mb-2">
                  {color.code}
                </div>
                <div className="text-sm text-gray-500 italic">
                  {color.usage}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Brand Story Section */}
      <div className={`py-24 px-8 bg-gradient-to-b from-pink-50 to-white transition-all duration-1500 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* Portrait with Overlay */}
          <div className="relative group">
            <div className="aspect-[4/5] overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-700">
              <img 
                src={userImages.portraits[0]} 
                alt="Brand portrait"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div 
              className="absolute -bottom-8 -right-8 p-8 shadow-xl hover:shadow-2xl transition-all duration-500"
              style={{ backgroundColor: brandData.colors.primary[0].hex }}
            >
              <div className="text-3xl font-thin text-white italic" style={{ fontFamily: 'cursive' }}>
                {brandData.script}
              </div>
            </div>
          </div>
          
          {/* Brand Story */}
          <div>
            <h2 className="text-4xl font-thin mb-8 tracking-wide flex items-center" style={{ fontFamily: 'serif', color: brandData.colors.primary[0].hex }}>
              <span className="mr-4 text-pink-400">♥</span>
              Brand Story
            </h2>
            <div className="text-2xl font-light leading-relaxed text-gray-700 mb-8 italic">
              "{brandData.story}"
            </div>
            <div className="flex items-center space-x-4 mb-8">
              {brandData.voice.personality.map((trait, index) => (
                <div key={index} className="px-4 py-2 bg-pink-100 text-pink-800 text-sm hover:bg-pink-200 transition-colors duration-300">
                  {trait}
                </div>
              ))}
            </div>
            <div className="w-24 h-1 hover:w-32 transition-all duration-500" style={{ backgroundColor: brandData.colors.primary[0].hex }}></div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={`bg-gradient-to-b from-pink-50 to-white py-20 px-8 relative transition-all duration-1500 delay-1500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="flex justify-center space-x-4 mb-12">
            {[...brandData.colors.primary, ...brandData.colors.neutral].map((color, index) => (
              <div 
                key={index} 
                className="w-16 h-16 rounded-full hover:scale-110 transition-transform duration-300 cursor-pointer shadow-lg" 
                style={{ backgroundColor: color.hex }}
                onClick={() => copyToClipboard(color.hex)}
              ></div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8 mb-12">
            <button 
              onClick={() => downloadAsset('complete-brand-package')}
              className="px-8 py-4 text-sm tracking-wide uppercase hover:scale-105 transition-all duration-300 flex items-center shadow-lg hover:shadow-xl text-white"
              style={{ backgroundColor: brandData.colors.primary[0].hex }}
            >
              <span className="mr-3">↓</span>
              Download Brand Package
            </button>
            <button 
              onClick={() => window.print()}
              className="border-2 px-8 py-4 text-sm tracking-wide uppercase hover:bg-pink-50 transition-colors duration-300 flex items-center"
              style={{ borderColor: brandData.colors.primary[0].hex, color: brandData.colors.primary[0].hex }}
            >
              <span className="mr-3">👁</span>
              Print Brandbook
            </button>
          </div>
          <div className="text-sm tracking-[0.2em] uppercase text-gray-500">
            Created with SSELFIE Studio
          </div>
        </div>
      </div>
    </div>
  );
}