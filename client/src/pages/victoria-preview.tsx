import React, { useState, useEffect, useRef } from 'react';
import { WorkspaceNavigation } from '@/components/workspace-navigation';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { COMPREHENSIVE_LANDING_TEMPLATE } from '@/components/comprehensive-landing-template';

export default function VictoriaPreview() {
  const [isFullScreen, setIsFullScreen] = useState(true); // Start in full-screen mode
  const previewRef = useRef<HTMLIFrameElement>(null);

  const { data: brandData } = useQuery({ queryKey: ['/api/onboarding'] });
  const { data: userGallery } = useQuery({ queryKey: ['/api/user-gallery'] });

  // Function to inject user photos into template
  const injectUserPhotos = (htmlTemplate: string): string => {
    if (!userGallery?.userSelfies?.length) return htmlTemplate;

    const userSelfies = userGallery.userSelfies;
    const flatLayUrls = [
      '/api/images/flatlays/luxury-minimal-1.jpg',
      '/api/images/flatlays/luxury-minimal-2.jpg',
      '/api/images/flatlays/luxury-minimal-3.jpg'
    ];

    let updatedHtml = htmlTemplate;

    // Use ALL user photos strategically throughout the template
    const photoCount = userSelfies.length;
    
    // 1. Hero background - Use first selfie
    if (photoCount >= 1) {
      updatedHtml = updatedHtml.replace(/{{USER_HERO_PHOTO}}/g, userSelfies[0].url);
    }
    
    // 2. About section image - Use second selfie  
    if (photoCount >= 2) {
      updatedHtml = updatedHtml.replace(/{{USER_ABOUT_PHOTO}}/g, userSelfies[1].url);
    } else {
      updatedHtml = updatedHtml.replace(/{{USER_ABOUT_PHOTO}}/g, userSelfies[0].url);
    }
    
    // 3. Editorial spread image - Use third selfie
    if (photoCount >= 3) {
      updatedHtml = updatedHtml.replace(/{{USER_EDITORIAL_PHOTO}}/g, userSelfies[2].url);
    } else {
      updatedHtml = updatedHtml.replace(/{{USER_EDITORIAL_PHOTO}}/g, userSelfies[0].url);
    }
    
    // 4. Portfolio images - Use fourth and fifth selfies (or repeat if needed)
    if (photoCount >= 4) {
      updatedHtml = updatedHtml.replace(/{{USER_PORTFOLIO_1}}/g, userSelfies[3].url);
    } else {
      updatedHtml = updatedHtml.replace(/{{USER_PORTFOLIO_1}}/g, userSelfies[1] ? userSelfies[1].url : userSelfies[0].url);
    }
    
    if (photoCount >= 5) {
      updatedHtml = updatedHtml.replace(/{{USER_PORTFOLIO_2}}/g, userSelfies[4].url);
    } else {
      updatedHtml = updatedHtml.replace(/{{USER_PORTFOLIO_2}}/g, userSelfies[2] ? userSelfies[2].url : userSelfies[0].url);
    }
    
    // 5. Freebie background - Use sixth selfie or cycle back
    if (photoCount >= 6) {
      updatedHtml = updatedHtml.replace(/{{USER_FREEBIE_BACKGROUND}}/g, userSelfies[5].url);
    } else {
      updatedHtml = updatedHtml.replace(/{{USER_FREEBIE_BACKGROUND}}/g, userSelfies[0].url);
    }

    // If we have more photos, use them in additional places
    if (photoCount >= 7) {
      // Add extra portfolio or testimonial images
      updatedHtml = updatedHtml.replace(/{{USER_EXTRA_PHOTO_1}}/g, userSelfies[6].url);
    }
    
    if (photoCount >= 8) {
      updatedHtml = updatedHtml.replace(/{{USER_EXTRA_PHOTO_2}}/g, userSelfies[7].url);
    }

    // Use flatlay images for service icons
    updatedHtml = updatedHtml.replace(/{{USER_FLATLAY_1}}/g, flatLayUrls[0]);
    updatedHtml = updatedHtml.replace(/{{USER_FLATLAY_2}}/g, flatLayUrls[1]);
    updatedHtml = updatedHtml.replace(/{{USER_FLATLAY_3}}/g, flatLayUrls[2]);

    return updatedHtml;
  };

  // Generate the populated template
  const currentHtml = React.useMemo(() => {
    if (!brandData) return COMPREHENSIVE_LANDING_TEMPLATE;

    const businessName = brandData.businessName || 'Your Business';
    const tagline = brandData.tagline || 'Build Your Empire';
    const personalStory = brandData.personalStory || 'Your story starts here.';
    const primaryOffer = brandData.primaryOffer || 'Brand Strategy';
    const primaryOfferPrice = brandData.primaryOfferPrice || '$497';
    const problemYouSolve = brandData.problemYouSolve || 'I help you find clarity in your brand message.';
    const uniqueApproach = brandData.uniqueApproach || 'My approach is authentic and strategic.';
    const email = brandData.email || 'hello@yourname.com';
    const instagramHandle = brandData.instagramHandle || '@yourname';
    const websiteUrl = brandData.websiteUrl || 'www.yourname.com';

    // Smart name display logic
    const nameparts = businessName.split(' ');
    const firstName = nameparts[0] || 'YOUR';
    const lastName = nameparts.slice(1).join(' ');
    
    const displayFirstName = firstName.toUpperCase();
    const displayLastName = lastName ? lastName.toUpperCase() : '';
    const heroNameHtml = lastName ? 
      `<div class="hero-name-stacked"><h1 class="hero-name-first">${displayFirstName}</h1><h1 class="hero-name-last">${displayLastName}</h1></div>` :
      `<div class="hero-name-stacked"><h1 class="hero-name-first">${displayFirstName}</h1></div>`;

    let updatedHtml = COMPREHENSIVE_LANDING_TEMPLATE;
    
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

    // Generate content
    const powerQuoteText = "Your story is your strategy. Your authenticity is your advantage. Your truth is your brand.";
    const editorialHeadline = `Why ${businessName.split(' ')[0]} Does Things Differently`;
    const editorialText1 = uniqueApproach || 'She believes in authentic connections over perfect presentations.';
    const editorialText2 = 'Every project starts with understanding your story, not following a template.';
    
    const service1Title = primaryOffer || 'Brand Strategy';
    const service2Title = 'Content Creation';
    const service3Title = 'Full Brand Package';
    
    const testimonialText = 'Working with her transformed not just my brand, but how I see myself as an entrepreneur. The clarity and confidence I gained was worth every penny.';
    const testimonialAuthor = 'Sarah M., Brand Strategist';
    
    const freebieTitle = 'Your Personal Brand Blueprint';
    const freebieDescription = 'Get the exact framework she uses to help entrepreneurs build authentic, profitable personal brands.';
    
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
    updatedHtml = updatedHtml.replace(/{{SERVICE_1_DESCRIPTION}}/g, `Complete ${service1Title.toLowerCase()} designed specifically for your vision and goals.`);
    updatedHtml = updatedHtml.replace(/{{SERVICE_2_DESCRIPTION}}/g, 'Professional content that tells your story authentically and converts.');
    updatedHtml = updatedHtml.replace(/{{SERVICE_3_DESCRIPTION}}/g, 'Everything you need to launch your brand with confidence and clarity.');
    updatedHtml = updatedHtml.replace(/{{TESTIMONIAL_TEXT}}/g, testimonialText);
    updatedHtml = updatedHtml.replace(/{{TESTIMONIAL_AUTHOR}}/g, testimonialAuthor);
    updatedHtml = updatedHtml.replace(/{{FREEBIE_TITLE}}/g, freebieTitle);
    updatedHtml = updatedHtml.replace(/{{FREEBIE_DESCRIPTION}}/g, freebieDescription);
    updatedHtml = updatedHtml.replace(/{{CONTACT_EMAIL}}/g, email);
    updatedHtml = updatedHtml.replace(/{{INSTAGRAM_HANDLE}}/g, instagramHandle);
    updatedHtml = updatedHtml.replace(/{{WEBSITE_URL}}/g, websiteUrl);

    return injectUserPhotos(updatedHtml);
  }, [brandData, userGallery]);

  // Update iframe when HTML changes
  useEffect(() => {
    if (previewRef.current && currentHtml) {
      previewRef.current.srcdoc = currentHtml;
    }
  }, [currentHtml]);

  return (
    <>
      <WorkspaceNavigation />
      
      {/* Full-Screen Preview Interface */}
      <div className="h-screen flex flex-col bg-black">
        {/* Top Bar */}
        <div className="bg-black text-white px-6 py-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-light" style={{ fontFamily: 'Times New Roman, serif' }}>
                Landing Page Preview
              </h1>
              {userGallery?.userSelfies?.length > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-300">
                    Using {userGallery.userSelfies.length} personal photos + 3 flatlays
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline"
                size="sm"
                className="text-white border-white/30 hover:bg-white hover:text-black"
              >
                Save Draft
              </Button>
              <Button 
                size="sm"
                className="bg-white text-black hover:bg-gray-200"
              >
                Publish Live at /yourname
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="text-white hover:bg-gray-800"
              >
                ← Back to Victoria
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
        
        {/* Bottom Action Bar */}
        <div className="bg-gray-900 text-white px-6 py-4 border-t border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">
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
              >
                Publish Live Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}