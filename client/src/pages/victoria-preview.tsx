import React, { useState, useEffect, useRef } from 'react';
import { MemberNavigation } from '@/components/member-navigation';
import { HeroFullBleed } from '@/components/HeroFullBleed';
import { EditorialImageBreak } from '@/components/EditorialImageBreak';
import { EditorialStory } from '@/components/editorial-story';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { SandraImages } from '@/lib/sandra-images';
import { COMPREHENSIVE_LANDING_TEMPLATE } from '@/components/comprehensive-landing-template';
import { MULTI_PAGE_HOME_TEMPLATE, MULTI_PAGE_ABOUT_TEMPLATE, MULTI_PAGE_SERVICES_TEMPLATE, MULTI_PAGE_CONTACT_TEMPLATE, SINGLE_PAGE_TEMPLATE } from '@/components/multi-page-templates';
import { CompletionModal } from '@/components/completion-modal';

export default function VictoriaPreview() {
  const [isFullScreen, setIsFullScreen] = useState(true); // Start in full-screen mode
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState('');
  const [currentPage, setCurrentPage] = useState('home'); // Track current page preview
  const previewRef = useRef<HTMLIFrameElement>(null);

  const { data: brandData } = useQuery({ queryKey: ['/api/brand-onboarding'] });
  const { data: photoSelections } = useQuery({ queryKey: ['/api/photo-selections'] });
  const { data: userGallery } = useQuery({ queryKey: ['/api/user-gallery'] });

  // Function to inject ONLY SELECTED photos from photo-selection step
  const injectUserPhotos = (htmlTemplate: string): string => {
    // Use ONLY the 5 photos selected in photo-selection step
    if (!photoSelections?.selectedSelfies?.length) {
      console.log('No photo selections available:', photoSelections);
      return htmlTemplate;
    }

    const selectedSelfies = photoSelections.selectedSelfies;
    console.log('Injecting photos from selections:', selectedSelfies.length, 'photos');
    
    // Get flatlay collection chosen by user (not random)
    const flatlayCollection = photoSelections.flatlayCollection || 'Editorial Magazine';
    const flatLayUrls = getFlatLayUrls(flatlayCollection);

    let updatedHtml = htmlTemplate;
    
    // STRATEGIC PHOTO DISTRIBUTION - USE ONLY 5 SELECTED PHOTOS
    // 1. Hero background - Use first selected selfie
    updatedHtml = updatedHtml.replace(/{{USER_HERO_PHOTO}}/g, selectedSelfies[0].imageUrl);
    
    // 2. About section image - Use second selected selfie
    const aboutPhoto = selectedSelfies[1]?.imageUrl || selectedSelfies[0].imageUrl;
    updatedHtml = updatedHtml.replace(/{{USER_ABOUT_PHOTO}}/g, aboutPhoto);
    
    // 3. Editorial spread image - Use third selected selfie
    const editorialPhoto = selectedSelfies[2]?.imageUrl || selectedSelfies[0].imageUrl;
    updatedHtml = updatedHtml.replace(/{{USER_EDITORIAL_PHOTO}}/g, editorialPhoto);
    
    // 4. Portfolio gallery - Use 4th and 5th selected selfies
    const portfolio1 = selectedSelfies[3]?.imageUrl || selectedSelfies[1]?.imageUrl || selectedSelfies[0].imageUrl;
    const portfolio2 = selectedSelfies[4]?.imageUrl || selectedSelfies[2]?.imageUrl || selectedSelfies[0].imageUrl;
    const portfolio3 = selectedSelfies[0]?.imageUrl; // Reuse first photo for 3rd slot
    
    updatedHtml = updatedHtml.replace(/{{USER_PORTFOLIO_1}}/g, portfolio1);
    updatedHtml = updatedHtml.replace(/{{USER_PORTFOLIO_2}}/g, portfolio2);
    updatedHtml = updatedHtml.replace(/{{USER_PORTFOLIO_3}}/g, portfolio3);
    
    // 5. Freebie background - Use first selected photo as background
    updatedHtml = updatedHtml.replace(/{{USER_FREEBIE_BACKGROUND}}/g, selectedSelfies[0].imageUrl);
    
    // 6. Use selected flatlay collection instead of default
    updatedHtml = updatedHtml.replace(/{{FLATLAY_1}}/g, flatLayUrls[0]);
    updatedHtml = updatedHtml.replace(/{{FLATLAY_2}}/g, flatLayUrls[1]);
    updatedHtml = updatedHtml.replace(/{{FLATLAY_3}}/g, flatLayUrls[2]);

    return updatedHtml;
  };

  // Get flatlay URLs based on user's selected collection
  const getFlatLayUrls = (collection: string) => {
    switch (collection) {
      case 'Luxury Minimal':
        return [
          '/api/images/flatlays/luxury-minimal-1.jpg',
          '/api/images/flatlays/luxury-minimal-2.jpg',
          '/api/images/flatlays/luxury-minimal-3.jpg'
        ];
      case 'Editorial Magazine':
        return [
          '/api/images/flatlays/editorial-1.jpg',
          '/api/images/flatlays/editorial-2.jpg',
          '/api/images/flatlays/editorial-3.jpg'
        ];
      case 'Pink & Girly':
        return [
          '/api/images/flatlays/pink-1.jpg',
          '/api/images/flatlays/pink-2.jpg',
          '/api/images/flatlays/pink-3.jpg'
        ];
      case 'Business Professional':
        return [
          '/api/images/flatlays/business-1.jpg',
          '/api/images/flatlays/business-2.jpg',
          '/api/images/flatlays/business-3.jpg'
        ];
      default:
        return [
          '/api/images/flatlays/editorial-1.jpg',
          '/api/images/flatlays/editorial-2.jpg',
          '/api/images/flatlays/editorial-3.jpg'
        ];
    }
  };

  // Generate the populated template with REAL brand data
  const generatePageHtml = (template: string, pageType: string) => {
    if (!brandData) return template;

    // Use ACTUAL brand onboarding data
    const businessName = brandData.businessName || 'Your Business';
    const tagline = brandData.tagline || brandData.personalStory?.substring(0, 50) || 'Build Your Empire'; 
    const personalStory = brandData.personalStory || 'Your story starts here.';
    const whyStarted = brandData.whyStarted || '';
    const targetClient = brandData.targetClient || '';
    const primaryOffer = brandData.primaryOffer || 'Brand Strategy';
    const primaryOfferPrice = brandData.primaryOfferPrice || '$497';
    const secondaryOffer = brandData.secondaryOffer || 'Content Creation';
    const secondaryOfferPrice = brandData.secondaryOfferPrice || '$297';
    const problemYouSolve = brandData.problemYouSolve || 'I help you find clarity in your brand message.';
    const uniqueApproach = brandData.uniqueApproach || 'My approach is authentic and strategic.';
    const freeResource = brandData.freeResource || 'Brand Strategy Guide';
    const email = brandData.email || 'hello@yourname.com';
    const instagramHandle = brandData.instagramHandle || '@yourname';
    const websiteUrl = brandData.websiteUrl || 'www.yourname.com';
    const brandPersonality = brandData.brandPersonality || 'sophisticated';
    const brandValues = brandData.brandValues || '';

    // Smart name display logic
    const nameparts = businessName.split(' ');
    const firstName = nameparts[0] || 'YOUR';
    const lastName = nameparts.slice(1).join(' ');
    
    const displayFirstName = firstName.toUpperCase();
    const displayLastName = lastName ? lastName.toUpperCase() : '';
    const heroNameHtml = lastName ? 
      `<div class="hero-name-stacked"><h1 class="hero-name-first">${displayFirstName}</h1><h1 class="hero-name-last">${displayLastName}</h1></div>` :
      `<div class="hero-name-stacked"><h1 class="hero-name-first">${displayFirstName}</h1></div>`;

    let updatedHtml = template;
    
    // Replace basic variables
    updatedHtml = updatedHtml.replace(/{{BUSINESS_TITLE}}/g, businessName);
    updatedHtml = updatedHtml.replace(/{{USER_TAGLINE}}/g, tagline);
    updatedHtml = updatedHtml.replace(/{{USER_NAME}}/g, businessName);
    updatedHtml = updatedHtml.replace(/{{USER_FIRST_NAME}}/g, displayFirstName);
    updatedHtml = updatedHtml.replace(/{{USER_LAST_NAME}}/g, displayLastName);
    
    // Replace hero name section
    updatedHtml = updatedHtml.replace(
      /<div class="hero-name-stacked">\s*<h1 class="hero-name-first">{{USER_FIRST_NAME}}<\/h1>\s*<h1 class="hero-name-last">{{USER_LAST_NAME}}<\/h1>\s*<\/div>/g,
      heroNameHtml
    );

    // Generate POWERFUL landing page copy based on REAL brand data
    // Using existing firstName variable from line 112
    
    // Power quote based on their actual story
    const powerQuoteText = whyStarted ? 
      `"${whyStarted.replace(/['"]/g, '')}"` : 
      uniqueApproach ? 
        `"${uniqueApproach.replace(/['"]/g, '')}"` :
        "Your story is your strategy. Your authenticity is your advantage.";
    
    // Editorial headline based on their unique approach
    const editorialHeadline = uniqueApproach ? 
      `Why ${firstName}'s Approach Is Different` :
      `The ${firstName} Method`;
    
    // Editorial text based on their actual positioning
    const editorialText1 = problemYouSolve || `${firstName} knows that your story is what sets you apart from everyone else doing "the same thing."`;
    const editorialText2 = targetClient ? 
      `Working specifically with ${targetClient.toLowerCase()}, she doesn't believe in cookie-cutter approaches. Your business deserves strategy that's as unique as you are.` :
      `No templates, no copying what everyone else is doing. This is about building something that's unmistakably yours.`;
    
    // Services based on their actual offers
    const service1Title = primaryOffer || 'Brand Strategy';
    const service2Title = secondaryOffer || 'Content Creation';
    const service3Title = 'VIP Experience';
    
    const service1Description = problemYouSolve ? 
      `${problemYouSolve} Complete ${service1Title.toLowerCase()} designed for your vision.` :
      `Complete ${service1Title.toLowerCase()} designed specifically for your vision and goals.`;
    
    const service2Description = secondaryOffer ?
      `Professional ${secondaryOffer.toLowerCase()} that tells your story authentically.` :
      'Professional content that tells your story authentically and converts.';
    
    // Testimonial based on their target client
    const testimonialText = targetClient ?
      `I thought I knew what I was doing, but ${firstName} helped me see my business in a completely different way. Now I wake up excited about my work instead of constantly second-guessing myself.` :
      `I thought I knew what I was doing, but working with her helped me see my business in a completely different way. Now I wake up excited about my work instead of constantly second-guessing myself.`;
    
    const testimonialAuthor = targetClient ? `Sarah M., ${targetClient}` : 'Sarah M., Client';
    
    // Freebie based on their actual free resource
    const freebieTitle = freeResource || `Free: ${firstName}'s Brand Clarity Guide`;
    const freebieDescription = freeResource ?
      `Stop guessing and start growing. Get ${firstName}'s ${freeResource.toLowerCase()} and discover the one thing that will make everything else easier.` :
      `Stop guessing and start growing. Get the exact process ${firstName} uses with clients to go from "I don't know what I'm doing" to "I know exactly who I serve and how."`;
    
    // Replace all content variables
    updatedHtml = updatedHtml.replace(/{{PERSONAL_STORY}}/g, personalStory);
    updatedHtml = updatedHtml.replace(/{{PRIMARY_OFFER_PRICE}}/g, primaryOfferPrice);
    updatedHtml = updatedHtml.replace(/{{SECONDARY_OFFER_PRICE}}/g, 'Starting at $197');
    updatedHtml = updatedHtml.replace(/{{PROBLEM_YOU_SOLVE}}/g, problemYouSolve);
    updatedHtml = updatedHtml.replace(/{{UNIQUE_APPROACH}}/g, uniqueApproach);
    updatedHtml = updatedHtml.replace(/{{POWER_QUOTE_TEXT}}/g, powerQuoteText);
    updatedHtml = updatedHtml.replace(/{{EDITORIAL_HEADLINE}}/g, editorialHeadline);
    updatedHtml = updatedHtml.replace(/{{EDITORIAL_TEXT_1}}/g, editorialText1);
    updatedHtml = updatedHtml.replace(/{{EDITORIAL_TEXT_2}}/g, editorialText2);
    updatedHtml = updatedHtml.replace(/{{SERVICE_1_TITLE}}/g, service1Title);
    updatedHtml = updatedHtml.replace(/{{SERVICE_2_TITLE}}/g, service2Title);
    updatedHtml = updatedHtml.replace(/{{SERVICE_3_TITLE}}/g, service3Title);
    updatedHtml = updatedHtml.replace(/{{SERVICE_1_DESCRIPTION}}/g, service1Description);
    updatedHtml = updatedHtml.replace(/{{SERVICE_2_DESCRIPTION}}/g, service2Description);
    updatedHtml = updatedHtml.replace(/{{SERVICE_3_DESCRIPTION}}/g, 'Everything you need to launch your brand with confidence and clarity.');
    updatedHtml = updatedHtml.replace(/{{TESTIMONIAL_TEXT}}/g, testimonialText);
    updatedHtml = updatedHtml.replace(/{{TESTIMONIAL_AUTHOR}}/g, testimonialAuthor);
    updatedHtml = updatedHtml.replace(/{{FREEBIE_TITLE}}/g, freebieTitle);
    updatedHtml = updatedHtml.replace(/{{FREEBIE_DESCRIPTION}}/g, freebieDescription);
    updatedHtml = updatedHtml.replace(/{{CONTACT_EMAIL}}/g, email);
    updatedHtml = updatedHtml.replace(/{{INSTAGRAM_HANDLE}}/g, instagramHandle);
    updatedHtml = updatedHtml.replace(/{{WEBSITE_URL}}/g, websiteUrl);

    return injectUserPhotos(updatedHtml);
  };

  // Get current page template and HTML - USING SINGLE PAGE TO FIX NAVIGATION
  const getCurrentTemplate = () => {
    // Single page template eliminates routing issues completely
    return SINGLE_PAGE_TEMPLATE;
  };

  const currentHtml = React.useMemo(() => {
    if (!brandData) {
      console.log('No brand data available for preview');
      return '<html><body style="padding: 40px; font-family: Times New Roman;"><h1>Loading brand data...</h1><p>Please wait while we load your information.</p></body></html>';
    }
    
    const html = generatePageHtml(getCurrentTemplate(), currentPage);
    console.log('Generated HTML length:', html.length);
    console.log('Template used:', getCurrentTemplate().substring(0, 100) + '...');
    
    return html;
  }, [brandData, photoSelections, currentPage]);

  // Update iframe when HTML changes
  useEffect(() => {
    console.log('=== IFRAME UPDATE DEBUG ===');
    console.log('previewRef.current:', !!previewRef.current);
    console.log('currentHtml exists:', !!currentHtml);
    console.log('currentHtml length:', currentHtml?.length || 0);
    console.log('brandData exists:', !!brandData);
    console.log('photoSelections exists:', !!photoSelections);
    
    if (previewRef.current && currentHtml) {
      console.log('Setting iframe srcdoc with HTML:', currentHtml.substring(0, 500) + '...');
      previewRef.current.srcdoc = currentHtml;
      
      // Also try setting innerHTML as backup
      setTimeout(() => {
        if (previewRef.current?.contentDocument) {
          console.log('Iframe document available, checking content');
          const doc = previewRef.current.contentDocument;
          console.log('Iframe document body:', doc.body?.innerHTML?.substring(0, 200) || 'NO BODY');
        }
      }, 100);
    } else {
      console.log('❌ IFRAME NOT READY - Details:', { 
        hasRef: !!previewRef.current, 
        hasHtml: !!currentHtml,
        htmlLength: currentHtml?.length || 0,
        hasBrandData: !!brandData,
        hasPhotoSelections: !!photoSelections
      });
    }
  }, [currentHtml, brandData, photoSelections]);

  // Enhanced template selection interface
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('comprehensive');

  const templateOptions = [
    {
      id: 'comprehensive',
      name: 'Full Editorial',
      description: 'Complete magazine-style layout with all sections',
      preview: SandraImages.hero.pricing,
      template: COMPREHENSIVE_LANDING_TEMPLATE
    },
    {
      id: 'single-page',
      name: 'Single Page',
      description: 'Clean one-page layout with anchor navigation',
      preview: SandraImages.editorial.laptop1,
      template: SINGLE_PAGE_TEMPLATE
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <MemberNavigation />
      
      {/* Template Preview Hero */}
      <HeroFullBleed
        title="Your Landing Page"
        subtitle="Live preview with your brand story and photos"
        backgroundImage={SandraImages.hero.pricing}
        textPosition="center"
        ctaText="Customize Template"
        ctaAction={() => setShowTemplateSelector(true)}
      />

      {/* Template Selection Interface */}
      {showTemplateSelector && (
        <section className="py-16 sm:py-20 px-4 sm:px-6 md:px-8 bg-[#f5f5f5]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-times text-[clamp(2rem,6vw,4rem)] leading-[0.9] font-extralight tracking-[-0.02em] text-black mb-8">
                CHOOSE YOUR TEMPLATE
              </h2>
              <p className="text-base sm:text-lg font-light text-[#666666] max-w-2xl mx-auto">
                Professional templates designed for your brand story
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              {templateOptions.map((template) => (
                <div
                  key={template.id}
                  onClick={() => {
                    setSelectedTemplate(template.id);
                    setShowTemplateSelector(false);
                  }}
                  className={`cursor-pointer group transition-all duration-300 ${
                    selectedTemplate === template.id
                      ? 'ring-2 ring-black'
                      : 'hover:ring-1 hover:ring-gray-300'
                  }`}
                >
                  <div className="aspect-[4/3] overflow-hidden bg-[#f5f5f5]">
                    <img
                      src={template.preview}
                      alt={template.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-8 bg-white">
                    <h3 className="font-times text-xl sm:text-2xl font-light tracking-[-0.01em] text-black mb-4">
                      {template.name}
                    </h3>
                    <p className="text-sm font-light text-[#666666] leading-relaxed">
                      {template.description}
                    </p>
                    <div className="mt-6 text-[10px] tracking-[0.2em] uppercase text-black group-hover:tracking-[0.3em] transition-all duration-300">
                      Select Template →
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Live Preview Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-times text-[clamp(2rem,6vw,4rem)] leading-[0.9] font-extralight tracking-[-0.02em] text-black mb-8">
              LIVE PREVIEW
            </h2>
            <p className="text-base sm:text-lg font-light text-[#666666] max-w-2xl mx-auto">
              Your landing page with authentic brand data and personal photos
            </p>
          </div>

          {/* Preview Controls */}
          <div className="flex justify-center mb-12">
            <div className="flex items-center space-x-4 bg-[#f5f5f5] p-2 rounded">
              <button
                onClick={() => setIsFullScreen(false)}
                className={`px-4 py-2 text-sm transition-all ${
                  !isFullScreen
                    ? 'bg-black text-white'
                    : 'text-black hover:bg-white'
                }`}
              >
                Split View
              </button>
              <button
                onClick={() => setIsFullScreen(true)}
                className={`px-4 py-2 text-sm transition-all ${
                  isFullScreen
                    ? 'bg-black text-white'
                    : 'text-black hover:bg-white'
                }`}
              >
                Full Screen
              </button>
            </div>
          </div>

          {/* Split View vs Full Screen */}
          {!isFullScreen ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left: Editorial Story about the process */}
              <EditorialStory
                headline="Your Story, Elevated"
                paragraphs={[
                  "Using your brand onboarding data, we've created a landing page that authentically represents your business vision.",
                  "Every detail is pulled from your actual story - from your why to your offers to your unique approach.",
                  "This isn't a template filled with placeholder text. This is your business, ready to launch."
                ]}
                imageSrc={SandraImages.editorial.laptop1}
                imageAlt="Landing page creation process"
                backgroundColor="white"
                button={{
                  text: "Publish Your Page",
                  href: "#publish"
                }}
              />

              {/* Right: Live iframe preview */}
              <div className="space-y-8">
                <div className="aspect-[3/4] border border-gray-200 overflow-hidden">
                  {(() => {
                    const isProduction = window.location.hostname !== 'localhost' && !window.location.hostname.includes('replit.dev');
                    
                    if (isProduction) {
                      // Production: Safe preview placeholder
                      return (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50">
                          <div className="text-center p-6">
                            <div className="text-xl mb-3" style={{ fontFamily: 'Times New Roman, serif' }}>
                              Preview Ready
                            </div>
                            <div className="w-8 h-px bg-black mx-auto mb-3"></div>
                            <button
                              onClick={() => window.open('/', '_blank', 'width=1200,height=800')}
                              className="bg-black text-white px-3 py-2 hover:bg-gray-800 transition-colors font-light text-sm"
                            >
                              Open Preview
                            </button>
                          </div>
                        </div>
                      );
                    } else {
                      // Development: Actual iframe
                      return (
                        <iframe
                          ref={previewRef}
                          src="http://localhost:5000"
                          className="w-full h-full border-0"
                          title="Landing Page Preview"
                          sandbox="allow-same-origin"
                        />
                      );
                    }
                  })()}
                </div>
                
                <div className="text-center space-y-4">
                  <Button
                    onClick={() => setIsFullScreen(true)}
                    className="bg-black text-white hover:bg-gray-800 px-8 py-3"
                  >
                    View Full Screen
                  </Button>
                  <p className="text-sm text-gray-600">
                    Preview with your actual brand data and photos
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Full-Screen Preview Interface */
            <div className="h-screen flex flex-col bg-black rounded overflow-hidden">
              {/* Top Bar */}
              <div className="bg-white text-black px-6 py-4 border-b border-black">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <h1 className="text-xl font-light" style={{ fontFamily: 'Times New Roman, serif' }}>
                      Live Website Preview
                    </h1>
                    
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-black rounded-full"></div>
                      <span className="text-sm text-gray-600">
                        Ready to publish with your brand data
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setIsFullScreen(false)}
                      className="text-black border-black hover:bg-gray-50"
                    >
                      ← Split View
                    </Button>
                    <Link to="/victoria-chat">
                      <Button variant="outline">
                        Customize with Victoria
                      </Button>
                    </Link>
                    <Button 
                      className="bg-black text-white hover:bg-gray-800"
                      onClick={async () => {
                        try {
                          const brandName = brandData?.businessName || 'MyBusiness';
                          const pageName = brandName.toLowerCase().replace(/[^a-z0-9]/g, '');
                          
                          const selectedTemplateConfig = templateOptions.find(t => t.id === selectedTemplate);
                          const templateHtml = generatePageHtml(selectedTemplateConfig?.template || COMPREHENSIVE_LANDING_TEMPLATE, 'single');
                          
                          const response = await fetch('/api/publish-landing-page', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              pageName: pageName,
                              html: templateHtml
                            })
                          });
                          
                          const result = await response.json();
                          
                          if (result.success) {
                            setPublishedUrl(result.liveUrl);
                            setShowCompletionModal(true);
                          } else {
                            alert('Failed to publish website. Please try again.');
                          }
                        } catch (error) {
                          console.error('Publish error:', error);
                          alert('Failed to publish website. Please try again.');
                        }
                      }}
                    >
                      Publish Website
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Full Preview */}
              <div className="flex-1 bg-white">
                <iframe
                  ref={previewRef}
                  className="w-full h-full border-0"
                  title="Full Landing Page Preview"
                  sandbox="allow-same-origin"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Template Benefits Section */}
      <EditorialImageBreak
        imageUrl={SandraImages.editorial.aiSuccess}
        alt="Professional template creation"
        height="50vh"
        overlay={true}
        overlayContent={
          <div>
            <h2 className="font-times text-4xl sm:text-5xl font-light mb-6">
              YOUR STORY, PROFESSIONALLY TOLD
            </h2>
            <p className="text-lg sm:text-xl font-light max-w-2xl">
              Every template uses your authentic brand data to create a landing page that converts visitors into clients
            </p>
          </div>
        }
      />

      {/* Completion Modal */}
      {showCompletionModal && (
        <CompletionModal
          isOpen={showCompletionModal}
          onClose={() => setShowCompletionModal(false)}
          publishedUrl={publishedUrl}
          businessName={brandData?.businessName || 'Your Business'}
        />
      )}
    </div>
  );
}