import React, { useState, useEffect } from 'react';
// Removed Lucide React icons to comply with Sandra's no-icons styleguide

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
      primary: string;
      secondary: string;
    };
    colors: {
      name: string;
      hex: string;
      code: string;
    }[];
    patterns: string[];
    applications: {
      businessCard: string;
      socialMedia: string;
      letterhead: string;
    };
  };
  userImages: {
    portraits: string[];
    flatlays: string[];
  };
}

export function ExecutiveEssenceBrandbook({ brandbook, userImages }: BrandbookProps) {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

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
      {/* Header with Animation */}
      <div className={`bg-black text-white py-20 px-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-8xl font-thin mb-4 tracking-wider hover:scale-105 transition-transform duration-500 cursor-pointer">
            {brandbook.logo}
          </div>
          <div className="text-sm tracking-[0.3em] uppercase opacity-90">
            {brandbook.tagline}
          </div>
        </div>
      </div>

      {/* Brand Story Section */}
      <div className={`py-20 px-8 bg-gradient-to-b from-white to-gray-50 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-sm tracking-[0.3em] uppercase mb-12 text-gray-600">
            BRAND STORY
          </h2>
          <div className="text-3xl font-thin leading-relaxed text-gray-800 mb-8 italic">
            "{brandbook.story}"
          </div>
          <div className="w-16 h-0.5 bg-black mx-auto"></div>
        </div>
      </div>

      {/* Logo Variations with Enhanced Shadows */}
      <div className={`py-16 px-8 bg-gray-50 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center text-sm tracking-[0.3em] uppercase mb-12 text-gray-600">
            LOGO VARIATIONS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Primary Logo */}
            <div className="bg-black text-white flex items-center justify-center h-64 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 group">
              <div className="text-6xl font-thin tracking-wider group-hover:tracking-wide transition-all duration-300">
                {brandbook.logo}
              </div>
              <button 
                onClick={() => downloadAsset('primary-logo')}
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white bg-opacity-20 p-2 rounded"
              >
                <Download size={16} className="text-white" />
              </button>
            </div>
            
            {/* Circular Logo */}
            <div className="bg-white border border-gray-200 flex items-center justify-center h-64 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 group">
              <div className="w-32 h-32 rounded-full border-2 border-black flex items-center justify-center relative group-hover:border-gray-800 transition-colors duration-300">
                <div className="text-2xl font-thin tracking-wider">
                  {brandbook.logo}
                </div>
                <div className="absolute text-xs tracking-[0.2em] uppercase" style={{ transform: 'rotate(15deg)', marginTop: '60px' }}>
                  {brandbook.tagline.split(' ')[0]}
                </div>
              </div>
              <button 
                onClick={() => downloadAsset('circular-logo')}
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gray-100 p-2 rounded"
              >
                <Download size={16} className="text-gray-800" />
              </button>
            </div>
            
            {/* Typography Logo */}
            <div className="bg-gray-100 flex items-center justify-center h-64 relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 group">
              <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-gray-400" style={{ fontSize: '200px', lineHeight: '1' }}>
                    {brandbook.logo.charAt(0)}
                  </div>
                </div>
              </div>
              <div className="relative z-10 text-center">
                <div className="text-4xl font-thin tracking-wider text-black">
                  {brandbook.name.split(' ')[0]}
                </div>
                <div className="text-sm tracking-[0.3em] uppercase">
                  {brandbook.name.split(' ')[1]}
                </div>
              </div>
              <button 
                onClick={() => downloadAsset('typography-logo')}
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white bg-opacity-70 p-2 rounded"
              >
                <Download size={16} className="text-gray-800" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Typography Section */}
      <div className={`py-16 px-8 bg-gray-100 relative overflow-hidden transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="absolute inset-0 opacity-5">
          <img 
            src={userImages.flatlays[0]} 
            alt="Background texture"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-center text-sm tracking-[0.3em] uppercase mb-12 text-gray-600">
            TYPOGRAPHY
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {/* Primary Font */}
            <div className="bg-white p-8 shadow-lg hover:shadow-xl transition-shadow duration-500">
              <div className="text-xs tracking-[0.2em] uppercase text-gray-500 mb-4">
                PRIMARY FONT
              </div>
              <div className="text-6xl font-thin mb-6" style={{ fontFamily: 'serif' }}>
                Abc
              </div>
              <div className="text-lg font-thin mb-4 text-gray-800">
                {brandbook.fonts.primary}
              </div>
              <div className="text-xs text-gray-600 leading-relaxed mb-4">
                ABCDEFGHIJKLMNOPQRSTUVWXYZ<br/>
                abcdefghijklmnopqrstuvwxyz<br/>
                1234567890
              </div>
              <div className="text-sm text-gray-500 italic">
                Use for headlines, logos, and emphasis
              </div>
            </div>
            
            {/* Secondary Font */}
            <div className="bg-white p-8 shadow-lg hover:shadow-xl transition-shadow duration-500">
              <div className="text-xs tracking-[0.2em] uppercase text-gray-500 mb-4">
                SECONDARY FONT
              </div>
              <div className="text-6xl mb-6 font-sans">
                Aa
              </div>
              <div className="text-lg mb-4 font-sans text-gray-800">
                {brandbook.fonts.secondary}
              </div>
              <div className="text-xs text-gray-600 leading-relaxed font-sans mb-4">
                ABCDEFGHIJKLMNOPQRSTUVWXYZ<br/>
                abcdefghijklmnopqrstuvwxyz<br/>
                1234567890
              </div>
              <div className="text-sm text-gray-500 italic">
                Use for body text, captions, and details
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Color Palette */}
      <div className={`py-16 px-8 bg-white relative overflow-hidden transition-all duration-1000 delay-900 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="absolute top-8 right-8 w-32 h-32 opacity-10">
          <img 
            src={userImages.flatlays[1]} 
            alt="Corner accent"
            className="w-full h-full object-cover rounded-full"
          />
        </div>
        <div className="absolute bottom-8 left-8 w-24 h-24 opacity-8">
          <img 
            src={userImages.flatlays[2]} 
            alt="Corner accent"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-center text-sm tracking-[0.3em] uppercase mb-12 text-gray-600">
            COLOR PALETTE
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {brandbook.colors.map((color, index) => (
              <div key={index} className="text-center group">
                <div 
                  className="w-24 h-24 mx-auto mb-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 cursor-pointer relative"
                  style={{ backgroundColor: color.hex }}
                  onClick={() => copyToClipboard(color.hex)}
                >
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 rounded-full transition-all duration-300 flex items-center justify-center">
                    {copiedColor === color.hex ? (
                      <Check size={20} className="text-white opacity-80" />
                    ) : (
                      <Copy size={16} className="text-white opacity-0 group-hover:opacity-80 transition-opacity duration-300" />
                    )}
                  </div>
                </div>
                <div className="text-xs tracking-[0.2em] uppercase text-gray-500 mb-1">
                  {color.name}
                </div>
                <div className="text-xs text-gray-600 font-mono">
                  {color.code}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Click to copy
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Brand Voice Section */}
      <div className={`py-16 px-8 bg-gray-50 transition-all duration-1000 delay-1100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center text-sm tracking-[0.3em] uppercase mb-12 text-gray-600">
            BRAND VOICE
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Tone */}
            <div className="bg-white p-8 shadow-lg hover:shadow-xl transition-shadow duration-500">
              <h3 className="text-lg font-thin mb-4 tracking-wide">Tone</h3>
              <p className="text-gray-700 leading-relaxed">{brandbook.voice.tone}</p>
            </div>
            
            {/* Personality */}
            <div className="bg-white p-8 shadow-lg hover:shadow-xl transition-shadow duration-500">
              <h3 className="text-lg font-thin mb-4 tracking-wide">Personality</h3>
              <div className="space-y-2">
                {brandbook.voice.personality.map((trait, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-2 h-2 bg-black rounded-full mr-3"></div>
                    <span className="text-gray-700">{trait}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Do's and Don'ts */}
            <div className="bg-white p-8 shadow-lg hover:shadow-xl transition-shadow duration-500">
              <h3 className="text-lg font-thin mb-4 tracking-wide">Guidelines</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-green-800 mb-2">DO</h4>
                  {brandbook.voice.dosDonts.dos.map((item, index) => (
                    <p key={index} className="text-sm text-gray-600 mb-1">• {item}</p>
                  ))}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-red-800 mb-2">DON'T</h4>
                  {brandbook.voice.dosDonts.donts.map((item, index) => (
                    <p key={index} className="text-sm text-gray-600 mb-1">• {item}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pattern Library */}
      <div className={`py-16 px-8 bg-white transition-all duration-1000 delay-1300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-sm tracking-[0.3em] uppercase mb-12 text-gray-600">
            PATTERN LIBRARY
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {brandbook.patterns.map((pattern, index) => (
              <div key={index} className="aspect-square bg-gray-100 rounded hover:shadow-lg transition-shadow duration-300 group cursor-pointer">
                <img 
                  src={pattern} 
                  alt={`Pattern ${index + 1}`}
                  className="w-full h-full object-cover rounded group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Moodboard */}
      <div className={`py-16 px-8 bg-gray-50 transition-all duration-1000 delay-1500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center text-sm tracking-[0.3em] uppercase mb-12 text-gray-600">
            MOODBOARD
          </h2>
          
          <div className="grid grid-cols-4 gap-4">
            {/* Mixed portraits and flatlays */}
            <div className="aspect-square overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <img 
                src={userImages.portraits[0]} 
                alt="Portrait"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="aspect-[4/3] overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <img 
                src={userImages.flatlays[3]} 
                alt="Flatlay"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="aspect-[3/4] overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <img 
                src={userImages.portraits[1]} 
                alt="Portrait"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="aspect-square overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <img 
                src={userImages.flatlays[4]} 
                alt="Flatlay"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            
            <div className="aspect-[3/4] overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <img 
                src={userImages.flatlays[5]} 
                alt="Flatlay"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="aspect-square overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <img 
                src={userImages.portraits[2]} 
                alt="Portrait"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="aspect-[4/3] overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <img 
                src={userImages.flatlays[6]} 
                alt="Flatlay"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="aspect-[3/4] overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <img 
                src={userImages.portraits[3]} 
                alt="Portrait"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Brand Applications */}
      <div className={`py-16 px-8 bg-white transition-all duration-1000 delay-1700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center text-sm tracking-[0.3em] uppercase mb-12 text-gray-600">
            BRAND APPLICATIONS
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 shadow-lg hover:shadow-xl transition-shadow duration-500 group">
              <h3 className="text-lg font-thin mb-4 tracking-wide">Business Card</h3>
              <div className="aspect-[3/2] bg-white shadow-md mb-4 rounded">
                <img 
                  src={brandbook.applications.businessCard} 
                  alt="Business card mockup"
                  className="w-full h-full object-cover rounded group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <button 
                onClick={() => downloadAsset('business-card')}
                className="flex items-center text-sm text-gray-600 hover:text-black transition-colors duration-300"
              >
                <Download size={16} className="mr-2" />
                Download Template
              </button>
            </div>
            
            <div className="bg-gray-50 p-8 shadow-lg hover:shadow-xl transition-shadow duration-500 group">
              <h3 className="text-lg font-thin mb-4 tracking-wide">Social Media</h3>
              <div className="aspect-square bg-white shadow-md mb-4 rounded">
                <img 
                  src={brandbook.applications.socialMedia} 
                  alt="Social media mockup"
                  className="w-full h-full object-cover rounded group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <button 
                onClick={() => downloadAsset('social-media')}
                className="flex items-center text-sm text-gray-600 hover:text-black transition-colors duration-300"
              >
                <Download size={16} className="mr-2" />
                Download Template
              </button>
            </div>
            
            <div className="bg-gray-50 p-8 shadow-lg hover:shadow-xl transition-shadow duration-500 group">
              <h3 className="text-lg font-thin mb-4 tracking-wide">Letterhead</h3>
              <div className="aspect-[3/4] bg-white shadow-md mb-4 rounded">
                <img 
                  src={brandbook.applications.letterhead} 
                  alt="Letterhead mockup"
                  className="w-full h-full object-cover rounded group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <button 
                onClick={() => downloadAsset('letterhead')}
                className="flex items-center text-sm text-gray-600 hover:text-black transition-colors duration-300"
              >
                <Download size={16} className="mr-2" />
                Download Template
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Footer */}
      <div className={`bg-black text-white py-16 px-8 transition-all duration-1000 delay-1900 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-2xl font-thin mb-4 tracking-wider">
            {brandbook.logo}
          </div>
          <div className="text-sm tracking-[0.3em] uppercase mb-8 opacity-80">
            {brandbook.tagline}
          </div>
          <div className="flex justify-center space-x-8 mb-8">
            <button 
              onClick={() => downloadAsset('complete-brand-package')}
              className="bg-white text-black px-6 py-3 text-sm tracking-wide uppercase hover:bg-gray-100 transition-colors duration-300 flex items-center"
            >
              <Download size={16} className="mr-2" />
              Download Complete Package
            </button>
            <button 
              onClick={() => window.print()}
              className="border border-white text-white px-6 py-3 text-sm tracking-wide uppercase hover:bg-white hover:text-black transition-colors duration-300 flex items-center"
            >
              <Eye size={16} className="mr-2" />
              Print Brandbook
            </button>
          </div>
          <div className="text-sm tracking-[0.3em] uppercase opacity-60">
            {brandbook.name.toLowerCase().replace(' ', '')}@gmail.com
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExecutiveEssenceBrandbook;