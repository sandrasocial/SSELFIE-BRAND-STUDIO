import React, { useState, useEffect } from 'react';
import { HeroFullBleed } from '@/components/hero-full-bleed';
import { EditorialImageBreak } from '@/components/editorial-image-break';
import { MoodboardGallery } from '@/components/moodboard-gallery';
import { VictoriaChat } from './VictoriaChat';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface WebsiteData {
  businessName: string;
  businessType: string;
  businessDescription: string;
  targetAudience: string;
  keyFeatures: string[];
  brandPersonality: string;
  selectedImages: string[];
  flatlayImages: string[];
  pages: WebsitePage[];
}

interface WebsitePage {
  id: string;
  title: string;
  sections: WebsiteSection[];
}

interface WebsiteSection {
  type: 'hero' | 'editorial-break' | 'moodboard' | 'text-content' | 'services' | 'contact';
  content: any;
}

interface VictoriaEditorialBuilderProps {
  onWebsiteGenerated: (website: WebsiteData) => void;
}

export function VictoriaEditorialBuilder({ onWebsiteGenerated }: VictoriaEditorialBuilderProps) {
  const [currentPhase, setCurrentPhase] = useState<'setup' | 'chat' | 'preview' | 'customize'>('setup');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedFlatlays, setSelectedFlatlays] = useState<string[]>([]);
  const [websiteData, setWebsiteData] = useState<WebsiteData | null>(null);

  // Fetch user's gallery images
  const { data: galleryImages = [] } = useQuery({
    queryKey: ['/api/ai-images'],
  });

  // Fetch flatlay library
  const { data: flatlayLibrary = [] } = useQuery({
    queryKey: ['/api/flatlay-library'],
  });

  const handleImageSelection = (imageUrl: string) => {
    setSelectedImages(prev => 
      prev.includes(imageUrl) 
        ? prev.filter(img => img !== imageUrl)
        : [...prev, imageUrl]
    );
  };

  const handleFlatlaySelection = (imageUrl: string) => {
    setSelectedFlatlays(prev => 
      prev.includes(imageUrl) 
        ? prev.filter(img => img !== imageUrl)
        : [...prev, imageUrl]
    );
  };

  const handleVictoriaWebsiteGeneration = (generatedWebsite: any) => {
    const websiteWithImages: WebsiteData = {
      ...generatedWebsite,
      selectedImages,
      flatlayImages: selectedFlatlays,
      pages: generateEditorialPages(generatedWebsite, selectedImages, selectedFlatlays)
    };
    
    setWebsiteData(websiteWithImages);
    onWebsiteGenerated(websiteWithImages);
    setCurrentPhase('preview');
  };

  const generateEditorialPages = (businessData: any, images: string[], flatlays: string[]): WebsitePage[] => {
    return [
      {
        id: 'home',
        title: 'Home',
        sections: [
          {
            type: 'hero',
            content: {
              backgroundImage: images[0] || '/placeholder-hero.jpg',
              title: businessData.businessName,
              subtitle: businessData.businessDescription,
              tagline: businessData.brandPersonality,
              ctaText: 'Discover More',
              ctaLink: '#about'
            }
          },
          {
            type: 'editorial-break',
            content: {
              src: images[1] || flatlays[0],
              alt: 'Our Story',
              height: 'medium',
              overlay: true,
              overlayText: businessData.businessDescription
            }
          },
          {
            type: 'moodboard',
            content: {
              items: images.slice(0, 6).map((img, idx) => ({
                src: img,
                alt: `Gallery ${idx + 1}`,
                span: idx === 0 ? 6 : 3,
                aspectRatio: idx % 2 === 0 ? 'wide' : 'square'
              }))
            }
          }
        ]
      },
      {
        id: 'about',
        title: 'About',
        sections: [
          {
            type: 'hero',
            content: {
              backgroundImage: images[2] || '/placeholder-about.jpg',
              title: 'About',
              subtitle: 'Our Story',
              fullHeight: false
            }
          },
          {
            type: 'text-content',
            content: {
              title: businessData.businessName,
              description: businessData.businessDescription,
              targetAudience: businessData.targetAudience
            }
          }
        ]
      },
      {
        id: 'services',
        title: 'Services',
        sections: [
          {
            type: 'hero',
            content: {
              backgroundImage: flatlays[0] || images[3],
              title: 'Services',
              subtitle: 'What We Offer',
              fullHeight: false
            }
          },
          {
            type: 'services',
            content: {
              features: businessData.keyFeatures || []
            }
          }
        ]
      },
      {
        id: 'contact',
        title: 'Contact',
        sections: [
          {
            type: 'hero',
            content: {
              backgroundImage: images[4] || flatlays[1],
              title: 'Contact',
              subtitle: 'Get In Touch',
              fullHeight: false
            }
          },
          {
            type: 'contact',
            content: {
              businessName: businessData.businessName,
              businessType: businessData.businessType
            }
          }
        ]
      }
    ];
  };

  if (currentPhase === 'setup') {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto p-8">
          <div className="mb-12">
            <h1 className="text-5xl font-normal mb-6" style={{ fontFamily: 'Times New Roman' }}>
              Victoria Editorial Website Builder
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl">
              Select images from your gallery and flatlay library to create your editorial website foundation.
            </p>
          </div>

          {/* Gallery Selection */}
          <div className="mb-12">
            <h2 className="text-2xl font-normal mb-6" style={{ fontFamily: 'Times New Roman' }}>
              Choose Your Gallery Images ({selectedImages.length} selected)
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {galleryImages.map((image: any) => (
                <div 
                  key={image.id}
                  className={`aspect-square cursor-pointer border-2 transition-all ${
                    selectedImages.includes(image.imageUrl) 
                      ? 'border-black shadow-lg' 
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                  onClick={() => handleImageSelection(image.imageUrl)}
                >
                  <img 
                    src={image.imageUrl} 
                    alt="Gallery image"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Flatlay Selection */}
          <div className="mb-12">
            <h2 className="text-2xl font-normal mb-6" style={{ fontFamily: 'Times New Roman' }}>
              Choose Flatlay Styling ({selectedFlatlays.length} selected)
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {flatlayLibrary.slice(0, 12).map((image: string, index: number) => (
                <div 
                  key={index}
                  className={`aspect-square cursor-pointer border-2 transition-all ${
                    selectedFlatlays.includes(image) 
                      ? 'border-black shadow-lg' 
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                  onClick={() => handleFlatlaySelection(image)}
                >
                  <img 
                    src={image} 
                    alt="Flatlay styling"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <Button
              onClick={() => setCurrentPhase('chat')}
              disabled={selectedImages.length === 0}
              className="bg-black text-white hover:bg-gray-800 px-8 py-3"
            >
              Continue to Victoria Chat
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (currentPhase === 'chat') {
    return (
      <VictoriaChat 
        onWebsiteGenerated={handleVictoriaWebsiteGeneration}
        selectedImages={selectedImages}
        selectedFlatlays={selectedFlatlays}
      />
    );
  }

  if (currentPhase === 'preview' && websiteData) {
    return <VictoriaWebsitePreview website={websiteData} />;
  }

  return null;
}

function VictoriaWebsitePreview({ website }: { website: WebsiteData }) {
  const [currentPage, setCurrentPage] = useState(0);

  const renderSection = (section: WebsiteSection) => {
    switch (section.type) {
      case 'hero':
        return (
          <HeroFullBleed
            backgroundImage={section.content.backgroundImage}
            title={section.content.title}
            subtitle={section.content.subtitle}
            tagline={section.content.tagline}
            ctaText={section.content.ctaText}
            ctaLink={section.content.ctaLink}
            fullHeight={section.content.fullHeight !== false}
          />
        );
      
      case 'editorial-break':
        return (
          <EditorialImageBreak
            src={section.content.src}
            alt={section.content.alt}
            height={section.content.height}
            overlay={section.content.overlay}
            overlayText={section.content.overlayText}
          />
        );
      
      case 'moodboard':
        return (
          <MoodboardGallery
            items={section.content.items}
          />
        );
      
      case 'text-content':
        return (
          <div className="max-w-4xl mx-auto p-8">
            <h2 className="text-4xl font-normal mb-6" style={{ fontFamily: 'Times New Roman' }}>
              {section.content.title}
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              {section.content.description}
            </p>
            <p className="text-base text-gray-500">
              Serving: {section.content.targetAudience}
            </p>
          </div>
        );
      
      case 'services':
        return (
          <div className="max-w-4xl mx-auto p-8">
            <h2 className="text-4xl font-normal mb-8" style={{ fontFamily: 'Times New Roman' }}>
              Our Services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {section.content.features.map((feature: string, idx: number) => (
                <div key={idx} className="border border-gray-200 p-6">
                  <h3 className="text-xl font-normal mb-3" style={{ fontFamily: 'Times New Roman' }}>
                    {feature}
                  </h3>
                  <p className="text-gray-600">
                    Premium service tailored to your needs.
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'contact':
        return (
          <div className="max-w-4xl mx-auto p-8">
            <h2 className="text-4xl font-normal mb-8" style={{ fontFamily: 'Times New Roman' }}>
              Get In Touch
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-normal mb-4" style={{ fontFamily: 'Times New Roman' }}>
                  Contact Information
                </h3>
                <p className="text-gray-600 mb-2">
                  {section.content.businessName}
                </p>
                <p className="text-gray-600">
                  Specializing in {section.content.businessType}
                </p>
              </div>
              <div>
                <h3 className="text-xl font-normal mb-4" style={{ fontFamily: 'Times New Roman' }}>
                  Book a Consultation
                </h3>
                <Button className="w-full bg-black text-white hover:bg-gray-800">
                  Schedule Meeting
                </Button>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="max-w-6xl mx-auto px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-normal" style={{ fontFamily: 'Times New Roman' }}>
            {website.businessName}
          </h1>
          <div className="flex space-x-6">
            {website.pages.map((page, idx) => (
              <button
                key={page.id}
                onClick={() => setCurrentPage(idx)}
                className={`text-sm uppercase tracking-wide ${
                  currentPage === idx 
                    ? 'text-black border-b border-black' 
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                {page.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="pt-16">
        {website.pages[currentPage]?.sections.map((section, idx) => (
          <div key={idx}>
            {renderSection(section)}
          </div>
        ))}
      </div>
    </div>
  );
}