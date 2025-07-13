import React, { useState, useEffect, useRef } from 'react';
import { WorkspaceNavigation } from '@/components/workspace-navigation';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
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

  // Get current page template and HTML - TEMPORARILY USING SINGLE PAGE
  const getCurrentTemplate = () => {
    // Use single page template for all navigation to avoid routing issues
    return SINGLE_PAGE_TEMPLATE;
  };

  const currentHtml = React.useMemo(() => {
    return generatePageHtml(getCurrentTemplate(), currentPage);
  }, [brandData, photoSelections, currentPage]);

  // Update iframe when HTML changes
  useEffect(() => {
    if (previewRef.current && currentHtml) {
      console.log('Updating iframe with HTML length:', currentHtml.length);
      console.log('Current HTML preview:', currentHtml.substring(0, 200));
      previewRef.current.srcdoc = currentHtml;
    } else {
      console.log('Preview not ready - missing ref or HTML:', { 
        hasRef: !!previewRef.current, 
        hasHtml: !!currentHtml,
        htmlLength: currentHtml?.length || 0
      });
    }
  }, [currentHtml]);

  return (
    <>
      {/* Full-Screen Preview Interface - NO NAVIGATION CONFLICT */}
      <div className="h-screen flex flex-col bg-black">
        {/* Top Bar - BRAND STYLING APPLIED */}
        <div className="bg-white text-black px-6 py-4 border-b border-black">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h1 className="text-xl font-light" style={{ fontFamily: 'Times New Roman, serif' }}>
                Multi-Page Website Preview
              </h1>
              
              {/* Page Navigation */}
              <div className="flex items-center space-x-2">
                {[
                  { key: 'home', label: 'HOME' },
                  { key: 'about', label: 'ABOUT' },
                  { key: 'services', label: 'SERVICES' },
                  { key: 'contact', label: 'CONTACT' }
                ].map((page) => (
                  <button
                    key={page.key}
                    onClick={() => setCurrentPage(page.key)}
                    className={`px-3 py-1 text-[10px] tracking-[0.3em] uppercase transition-all border ${
                      currentPage === page.key
                        ? 'bg-[#0a0a0a] text-white border-[#0a0a0a]'
                        : 'bg-white text-[#666] border-[#e5e5e5] hover:text-[#0a0a0a] hover:border-[#0a0a0a]'
                    }`}
                    style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                  >
                    {page.label}
                  </button>
                ))}
              </div>
              
              {userGallery?.userSelfies?.length > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    Using {userGallery.userSelfies.length} personal photos • All pages ready
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <Link to="/victoria-chat">
                <button 
                  className="px-4 py-2 text-black border border-black text-sm hover:bg-gray-50 transition-colors"
                  style={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}
                >
                  Customize with Victoria
                </button>
              </Link>
              <button 
                className="px-4 py-2 bg-black text-white text-sm hover:bg-gray-800 transition-colors"
                style={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}
                onClick={async () => {
                  try {
                    // Get user's brand data for page name
                    const brandName = brandData?.businessName || brandData?.fullName || 'MyBusiness';
                    const pageName = brandName.toLowerCase().replace(/[^a-z0-9]/g, '');
                    
                    // Generate all four pages
                    const homeHtml = generatePageHtml(MULTI_PAGE_HOME_TEMPLATE, 'home');
                    const aboutHtml = generatePageHtml(MULTI_PAGE_ABOUT_TEMPLATE, 'about');
                    const servicesHtml = generatePageHtml(MULTI_PAGE_SERVICES_TEMPLATE, 'services');
                    const contactHtml = generatePageHtml(MULTI_PAGE_CONTACT_TEMPLATE, 'contact');
                    
                    const response = await fetch('/api/publish-multi-page-website', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        pageName: pageName,
                        pages: {
                          home: homeHtml,
                          about: aboutHtml,
                          services: servicesHtml,
                          contact: contactHtml
                        }
                      })
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                      // Show success message with live URL
                      alert(`🎉 Your multi-page website is now live at:\n${result.liveUrl}\n\nShare this URL with your audience!`);
                      // Open the live website
                      window.open(result.liveUrl, '_blank');
                    } else {
                      alert('Failed to publish website. Please try again.');
                    }
                  } catch (error) {
                    console.error('Publish error:', error);
                    alert('Failed to publish website. Please try again.');
                  }
                }}
              >
                Publish Multi-Page Website
              </button>
              <Link to="/victoria">
                <button
                  className="px-4 py-2 text-black hover:bg-gray-50 text-sm transition-colors"
                  style={{ letterSpacing: '0.1em' }}
                >
                  ← Back to Victoria
                </button>
              </Link>
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
        
        {/* Bottom Action Bar - BRAND STYLING APPLIED */}
        <div className="bg-white text-black px-6 py-4 border-t border-black">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Perfect preview with all your photos • Ready to publish or customize
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline"
                size="sm"
                className="text-white border-white/30 hover:bg-white hover:text-black"
                onClick={() => window.location.href = '/victoria-builder'}
              >
                Customize with Victoria
              </Button>
              <Button 
                size="sm"
                className="bg-green-600 text-white hover:bg-green-700"
                onClick={async () => {
                  if (!currentHtml) return;
                  
                  try {
                    // Get user's brand data for page name
                    const brandName = brandData?.businessName || brandData?.fullName || 'MyBusiness';
                    const pageName = brandName.toLowerCase().replace(/[^a-z0-9]/g, '');
                    
                    const response = await fetch('/api/publish-landing-page', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        htmlContent: currentHtml,
                        pageName: pageName
                      })
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                      // Show completion modal with live URL
                      setPublishedUrl(result.liveUrl);
                      setShowCompletionModal(true);
                    } else {
                      alert('Failed to publish page. Please try again.');
                    }
                  } catch (error) {
                    console.error('Publish error:', error);
                    alert('Failed to publish page. Please try again.');
                  }
                }}
              >
                Publish Live Now
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Completion Modal */}
      <CompletionModal 
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        liveUrl={publishedUrl}
        brandName={brandData?.businessName || brandData?.fullName || 'Your Business'}
      />
    </>
  );
}