import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Globe, Smartphone, Monitor } from 'lucide-react';

interface LivePreviewProps {
  websiteData?: any;
  onboardingData?: any;
  className?: string;
}

export function LivePreview({ websiteData, onboardingData, className = '' }: LivePreviewProps) {
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [currentPage, setCurrentPage] = useState('home');
  
  // Generate website template from onboarding data
  const generateWebsiteHTML = () => {
    const brandName = onboardingData?.personalBrandName || 'Your Brand';
    const businessType = onboardingData?.businessType || 'Business';
    const targetAudience = onboardingData?.targetAudience || 'clients';
    const userStory = onboardingData?.userStory || 'Your story here';
    const colorScheme = onboardingData?.selectedFlatlay || 'luxury-minimal';
    
    // Color schemes based on flatlay collections
    const colorSchemes = {
      'luxury-minimal': { bg: '#f8f7f4', text: '#2c2c2c', accent: '#d4c5b0' },
      'editorial-magazine': { bg: '#ffffff', text: '#000000', accent: '#f5f5f5' },
      'european-luxury': { bg: '#f5f5f5', text: '#1a1a1a', accent: '#e8e8e8' },
      'business-professional': { bg: '#ffffff', text: '#2d3748', accent: '#4a5568' },
      'pink-girly': { bg: '#fdf7f7', text: '#6b4e4e', accent: '#f7c6c7' },
      'wellness-mindset': { bg: '#f7f9f7', text: '#2d4a3d', accent: '#a8c9a8' }
    };
    
    const colors = colorSchemes[colorScheme as keyof typeof colorSchemes] || colorSchemes['luxury-minimal'];
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${brandName}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Times New Roman', serif;
            line-height: 1.6;
            color: ${colors.text};
            background: ${colors.bg};
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        
        nav {
            padding: 20px 0;
            border-bottom: 1px solid ${colors.accent};
        }
        
        nav .container {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo {
            font-size: 24px;
            font-weight: bold;
            font-family: 'Times New Roman', serif;
        }
        
        .nav-links {
            display: flex;
            gap: 30px;
            list-style: none;
        }
        
        .nav-links a {
            text-decoration: none;
            color: ${colors.text};
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
            cursor: pointer;
        }
        
        .hero {
            padding: 80px 0;
            text-align: center;
            background: ${colors.bg};
        }
        
        .hero h1 {
            font-size: 48px;
            margin-bottom: 20px;
            font-family: 'Times New Roman', serif;
        }
        
        .hero p {
            font-size: 18px;
            margin-bottom: 30px;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
            color: ${colors.text};
            opacity: 0.8;
        }
        
        .cta-button {
            display: inline-block;
            padding: 15px 30px;
            background: ${colors.text};
            color: ${colors.bg};
            text-decoration: none;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-size: 12px;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .cta-button:hover {
            background: ${colors.accent};
            color: ${colors.text};
        }
        
        .section {
            padding: 60px 0;
        }
        
        .section-title {
            font-size: 36px;
            text-align: center;
            margin-bottom: 40px;
            font-family: 'Times New Roman', serif;
        }
        
        .about-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 60px;
            align-items: center;
        }
        
        .services-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 40px;
            margin-top: 40px;
        }
        
        .service-card {
            padding: 40px;
            background: ${colors.accent};
            text-align: center;
            border: 1px solid ${colors.accent};
        }
        
        .service-card h3 {
            font-family: 'Times New Roman', serif;
            font-size: 24px;
            margin-bottom: 20px;
        }
        
        .contact-section {
            background: ${colors.accent};
            text-align: center;
        }
        
        footer {
            padding: 40px 0;
            text-align: center;
            border-top: 1px solid ${colors.accent};
            font-size: 14px;
            color: ${colors.text};
            opacity: 0.7;
        }
        
        @media (max-width: 768px) {
            .hero h1 { font-size: 32px; }
            .about-grid { grid-template-columns: 1fr; gap: 30px; }
            .nav-links { display: none; }
        }
    </style>
</head>
<body>
    <nav>
        <div class="container">
            <div class="logo">${brandName}</div>
            <ul class="nav-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#services">Services</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </div>
    </nav>
    
    <section class="hero" id="home">
        <div class="container">
            <h1>${brandName}</h1>
            <p>Transforming ${targetAudience} through ${businessType.toLowerCase()} that creates real, lasting change</p>
            <a href="#contact" class="cta-button">Work With Me</a>
        </div>
    </section>
    
    <section class="section" id="about">
        <div class="container">
            <h2 class="section-title">About</h2>
            <div class="about-grid">
                <div>
                    <h3 style="font-family: 'Times New Roman', serif; font-size: 24px; margin-bottom: 20px;">My Story</h3>
                    <p>${userStory}</p>
                </div>
                <div>
                    <h3 style="font-family: 'Times New Roman', serif; font-size: 24px; margin-bottom: 20px;">My Mission</h3>
                    <p>I help ${targetAudience} achieve their goals through personalized ${businessType.toLowerCase()} that creates meaningful transformation.</p>
                </div>
            </div>
        </div>
    </section>
    
    <section class="section" id="services">
        <div class="container">
            <h2 class="section-title">Services</h2>
            <div class="services-grid">
                <div class="service-card">
                    <h3>1:1 ${businessType}</h3>
                    <p>Personalized sessions designed specifically for ${targetAudience}</p>
                </div>
                <div class="service-card">
                    <h3>Group Programs</h3>
                    <p>Comprehensive programs for shared growth and transformation</p>
                </div>
                <div class="service-card">
                    <h3>Resources</h3>
                    <p>Tools and materials to support your journey</p>
                </div>
            </div>
        </div>
    </section>
    
    <section class="section contact-section" id="contact">
        <div class="container">
            <h2 class="section-title">Ready to Get Started?</h2>
            <p style="margin-bottom: 30px;">Let's work together to create the transformation you're looking for</p>
            <a href="mailto:hello@${brandName.toLowerCase().replace(/\s+/g, '')}.com" class="cta-button">Contact Me</a>
        </div>
    </section>
    
    <footer>
        <div class="container">
            <p>&copy; 2025 ${brandName}. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>`;
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Preview Controls */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-4">
          <h3 className="font-serif text-lg text-black">Live Preview</h3>
          <div className="flex items-center space-x-2">
            <Button
              variant={previewMode === 'desktop' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPreviewMode('desktop')}
              className="h-8"
            >
              <Monitor className="w-4 h-4" />
            </Button>
            <Button
              variant={previewMode === 'mobile' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPreviewMode('mobile')}
              className="h-8"
            >
              <Smartphone className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Globe className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-500">
            {onboardingData?.personalBrandName?.toLowerCase().replace(/\s+/g, '') || 'yoursite'}.sselfie.ai
          </span>
        </div>
      </div>

      {/* Preview Iframe */}
      <div className="flex-1 bg-gray-100 p-4">
        <div 
          className={`mx-auto bg-white shadow-lg transition-all duration-300 ${
            previewMode === 'mobile' 
              ? 'max-w-sm' 
              : 'w-full'
          }`}
          style={{ 
            height: previewMode === 'mobile' ? '600px' : '100%',
            minHeight: '500px'
          }}
        >
          <iframe
            src={`data:text/html,${encodeURIComponent(generateWebsiteHTML())}`}
            className="w-full h-full border-0"
            title="Website Preview"
          />
        </div>
      </div>
    </div>
  );
}