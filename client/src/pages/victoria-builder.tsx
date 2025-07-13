import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: number;
  role: 'user' | 'victoria';
  content: string;
  artifactHtml?: string;
  artifactCss?: string;
  timestamp?: string;
}

interface VictoriaChat {
  id: number;
  title: string;
  landingPageHtml?: string;
  landingPageCss?: string;
  templateUsed?: string;
}

// Full-bleed hero template using user's personal photos
const FULL_BLEED_HERO_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{USER_NAME}} | {{BUSINESS_TITLE}}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #0a0a0a;
            color: white;
        }
        
        /* Full-bleed Hero with User Photo */
        .hero {
            height: 100vh;
            background: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('{{USER_HERO_PHOTO}}') center/cover;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            align-items: center;
            text-align: center;
            padding: 80px 40px;
            position: relative;
        }
        
        .hero-tagline {
            font-size: 11px;
            letter-spacing: 0.4em;
            text-transform: uppercase;
            color: rgba(255,255,255,0.7);
            margin-bottom: 24px;
        }
        
        .hero-name {
            margin-bottom: 40px;
        }
        
        .hero-name-first {
            font-size: clamp(4rem, 10vw, 9rem);
            line-height: 1;
            font-weight: 200;
            color: white;
            font-family: 'Times New Roman', serif;
            letter-spacing: 0.5em;
            margin-bottom: -10px;
        }
        
        .hero-name-last {
            font-size: clamp(2.5rem, 6vw, 5rem);
            line-height: 1;
            font-weight: 200;
            color: white;
            font-family: 'Times New Roman', serif;
            letter-spacing: 0.3em;
        }
        
        .cta-minimal {
            display: inline-block;
            color: white;
            text-decoration: none;
            font-size: 12px;
            letter-spacing: 0.3em;
            text-transform: uppercase;
            font-weight: 300;
            padding-bottom: 8px;
            border-bottom: 1px solid rgba(255,255,255,0.3);
            transition: all 0.3s ease;
        }
        
        .cta-minimal:hover {
            border-bottom-color: white;
        }
        
        /* About Section with User Photos */
        .about-section {
            padding: 120px 40px;
            background: white;
            color: #0a0a0a;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 80px;
            align-items: center;
        }
        
        .about-content h2 {
            font-family: 'Times New Roman', serif;
            font-size: clamp(2.5rem, 5vw, 4rem);
            font-weight: 300;
            line-height: 1.2;
            margin-bottom: 32px;
        }
        
        .about-content p {
            font-size: 18px;
            line-height: 1.6;
            margin-bottom: 24px;
            color: #333;
        }
        
        .about-image {
            background: url('{{USER_ABOUT_PHOTO}}') center/cover;
            height: 600px;
        }
        
        /* Services Section with Flatlay */
        .services-section {
            padding: 120px 40px;
            background: #f5f5f5;
        }
        
        .services-grid {
            max-width: 1200px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 60px;
        }
        
        .service-card {
            text-align: center;
        }
        
        .service-icon {
            width: 200px;
            height: 200px;
            background: url('{{USER_FLATLAY_1}}') center/cover;
            margin: 0 auto 32px;
        }
        
        .service-card h3 {
            font-family: 'Times New Roman', serif;
            font-size: 24px;
            font-weight: 300;
            margin-bottom: 16px;
            color: #0a0a0a;
        }
        
        .service-card p {
            color: #666;
            line-height: 1.6;
        }
        
        @media (max-width: 768px) {
            .container {
                grid-template-columns: 1fr;
                gap: 40px;
            }
            
            .services-grid {
                grid-template-columns: 1fr;
                gap: 40px;
            }
            
            .hero {
                padding: 40px 20px;
            }
        }
    </style>
</head>
<body>
    <div class="hero">
        <p class="hero-tagline">{{USER_TAGLINE}}</p>
        <div class="hero-name">
            <h1 class="hero-name-first">{{USER_FIRST_NAME}}</h1>
            <h1 class="hero-name-last">{{USER_LAST_NAME}}</h1>
        </div>
        <a href="#about" class="cta-minimal">DISCOVER MY STORY</a>
    </div>
    
    <div class="about-section" id="about">
        <div class="container">
            <div class="about-content">
                <h2>{{ABOUT_TITLE}}</h2>
                <p>{{ABOUT_DESCRIPTION}}</p>
                <p>{{ABOUT_MISSION}}</p>
            </div>
            <div class="about-image"></div>
        </div>
    </div>
    
    <div class="services-section">
        <div class="services-grid">
            <div class="service-card">
                <div class="service-icon"></div>
                <h3>{{SERVICE_1_TITLE}}</h3>
                <p>{{SERVICE_1_DESCRIPTION}}</p>
            </div>
            <div class="service-card">
                <div class="service-icon" style="background-image: url('{{USER_FLATLAY_2}}');"></div>
                <h3>{{SERVICE_2_TITLE}}</h3>
                <p>{{SERVICE_2_DESCRIPTION}}</p>
            </div>
            <div class="service-card">
                <div class="service-icon" style="background-image: url('{{USER_FLATLAY_3}}');"></div>
                <h3>{{SERVICE_3_TITLE}}</h3>
                <p>{{SERVICE_3_DESCRIPTION}}</p>
            </div>
        </div>
    </div>
    
    <!-- Portfolio Section with User Photos -->
    <div class="portfolio-section" style="padding: 120px 40px; background: white;">
        <div style="max-width: 1200px; margin: 0 auto; text-align: center; margin-bottom: 60px;">
            <h2 style="font-family: 'Times New Roman', serif; font-size: clamp(2rem, 4vw, 3rem); font-weight: 300; color: #0a0a0a;">Portfolio</h2>
        </div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 40px; max-width: 800px; margin: 0 auto;">
            <div style="background: url('{{USER_PORTFOLIO_1}}') center/cover; height: 400px;"></div>
            <div style="background: url('{{USER_PORTFOLIO_2}}') center/cover; height: 400px;"></div>
        </div>
    </div>
    
    <!-- Contact Section with User Photo -->
    <div class="contact-section" style="padding: 120px 40px; background: #0a0a0a; color: white; text-align: center;">
        <div style="max-width: 600px; margin: 0 auto;">
            <div style="width: 200px; height: 200px; background: url('{{USER_CONTACT_PHOTO}}') center/cover; border-radius: 50%; margin: 0 auto 40px;"></div>
            <h2 style="font-family: 'Times New Roman', serif; font-size: clamp(2rem, 4vw, 3rem); font-weight: 300; margin-bottom: 24px;">Let's Work Together</h2>
            <p style="font-size: 18px; line-height: 1.6; margin-bottom: 32px;">Ready to transform your brand? Get in touch.</p>
            <div style="display: flex; justify-content: center; gap: 32px; margin-top: 32px;">
                <a href="mailto:{{CONTACT_EMAIL}}" style="color: white; text-decoration: none; font-size: 16px; letter-spacing: 0.1em; border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 4px;">{{CONTACT_EMAIL}}</a>
                <a href="https://instagram.com/{{INSTAGRAM_HANDLE}}" style="color: white; text-decoration: none; font-size: 16px; letter-spacing: 0.1em; border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 4px;">{{INSTAGRAM_HANDLE}}</a>
            </div>
        </div>
    </div>
</body>
</html>`;

export default function VictoriaBuilder() {
  // Function to improve brand content for landing page copy
  const improveForLandingPage = (originalText: string | undefined | null): string | undefined => {
    if (!originalText) return undefined;
    
    // Simple text improvements for better landing page copy
    return originalText
      .replace(/^I\s+/, 'She ') // Change "I help" to "She helps" for third person
      .replace(/\bI\b/g, 'she') // Replace other instances of "I" with "she"
      .replace(/\bmy\b/gi, 'her') // Replace "my" with "her"
      .replace(/\bme\b/gi, 'her') // Replace "me" with "her"
      .trim();
  };
  const [location] = useLocation();
  const chatId = new URLSearchParams(location.split('?')[1] || '').get('chat');
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentHtml, setCurrentHtml] = useState(FULL_BLEED_HERO_TEMPLATE);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentCss, setCurrentCss] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLIFrameElement>(null);

  // Fetch user's personal photo gallery
  const { data: userGallery } = useQuery({
    queryKey: ['/api/user-gallery'],
    retry: false,
  });

  // Function to inject user photos into template using all 5 selected selfies
  const injectUserPhotos = (htmlTemplate: string) => {
    if (!userGallery?.userSelfies?.length) return htmlTemplate;
    
    // Get user's selected selfies and flatlay collection
    const selectedSelfies = userGallery.userSelfies || [];
    const allFlatlays = userGallery.flatlayCollections?.flatMap(col => col.images) || [];
    
    // Use all available selected selfies across different sections
    const heroPhoto = selectedSelfies[0]?.url || ''; // Best selfie for hero
    const aboutPhoto = selectedSelfies[1]?.url || selectedSelfies[0]?.url || ''; // Second or fallback to first
    const portfolioPhoto1 = selectedSelfies[2]?.url || selectedSelfies[0]?.url || ''; // Third or fallback
    const portfolioPhoto2 = selectedSelfies[3]?.url || selectedSelfies[1]?.url || selectedSelfies[0]?.url || ''; // Fourth or fallback  
    const contactPhoto = selectedSelfies[4]?.url || selectedSelfies[2]?.url || selectedSelfies[0]?.url || ''; // Fifth or fallback
    const flatlay1 = allFlatlays[0] || '';
    const flatlay2 = allFlatlays[1] || '';
    const flatlay3 = allFlatlays[2] || '';
    
    // Replace all photo placeholders with user photos
    let updatedHtml = htmlTemplate;
    
    // Replace all photo placeholders with user's selected photos
    updatedHtml = updatedHtml.replace(/{{USER_HERO_PHOTO}}/g, heroPhoto);
    updatedHtml = updatedHtml.replace(/{{USER_ABOUT_PHOTO}}/g, aboutPhoto);
    updatedHtml = updatedHtml.replace(/{{USER_PORTFOLIO_1}}/g, portfolioPhoto1);
    updatedHtml = updatedHtml.replace(/{{USER_PORTFOLIO_2}}/g, portfolioPhoto2);
    updatedHtml = updatedHtml.replace(/{{USER_CONTACT_PHOTO}}/g, contactPhoto);
    updatedHtml = updatedHtml.replace(/{{USER_FLATLAY_1}}/g, flatlay1);
    updatedHtml = updatedHtml.replace(/{{USER_FLATLAY_2}}/g, flatlay2);
    updatedHtml = updatedHtml.replace(/{{USER_FLATLAY_3}}/g, flatlay3);
    
    // Use real brand data from onboarding or fallback to defaults
    const businessName = brandData?.businessName || 'Your Name';
    const tagline = brandData?.tagline || 'Building Something Beautiful';
    // Enhanced brand content with Claude rewriting for landing page optimization
    const personalStory = improveForLandingPage(brandData?.personalStory) || 'I help ambitious women build their personal brand and launch their dreams.';
    const primaryOffer = brandData?.primaryOffer || 'Strategy';
    const primaryOfferPrice = brandData?.primaryOfferPrice || '$47/month';
    const problemYouSolve = improveForLandingPage(brandData?.problemYouSolve) || 'Personal brand strategy and positioning';
    const uniqueApproach = improveForLandingPage(brandData?.uniqueApproach) || 'My mission is to make personal branding accessible and authentic.';
    const email = brandData?.email || 'hello@yourname.com';
    const instagramHandle = brandData?.instagramHandle || '@yourname';
    const websiteUrl = brandData?.websiteUrl || 'www.yourname.com';

    // Smart name display logic for hero section
    const nameparts = businessName.split(' ');
    const firstName = nameparts[0] || 'YOUR';
    const lastName = nameparts.slice(1).join(' ');
    
    // For single word names, show only first name and hide last name line
    const displayFirstName = firstName.toUpperCase();
    const displayLastName = lastName ? lastName.toUpperCase() : '';
    const heroNameHtml = lastName ? 
      `<div class="hero-name-first">${displayFirstName}</div><div class="hero-name-last">${displayLastName}</div>` :
      `<div class="hero-name-first">${displayFirstName}</div>`;
    
    // Replace content with actual brand data
    updatedHtml = updatedHtml.replace(/{{USER_NAME}}/g, businessName);
    updatedHtml = updatedHtml.replace(/{{BUSINESS_TITLE}}/g, businessName);
    updatedHtml = updatedHtml.replace(/{{USER_TAGLINE}}/g, tagline);
    updatedHtml = updatedHtml.replace(/{{USER_FIRST_NAME}}/g, displayFirstName);
    updatedHtml = updatedHtml.replace(/{{USER_LAST_NAME}}/g, displayLastName);
    // Replace entire hero name section for smart display
    updatedHtml = updatedHtml.replace(
      /<div class="hero-name-first">{{USER_FIRST_NAME}}<\/div>\s*<div class="hero-name-last">{{USER_LAST_NAME}}<\/div>/g,
      heroNameHtml
    );
    updatedHtml = updatedHtml.replace(/{{ABOUT_TITLE}}/g, 'About Me');
    updatedHtml = updatedHtml.replace(/{{ABOUT_DESCRIPTION}}/g, personalStory);
    updatedHtml = updatedHtml.replace(/{{ABOUT_MISSION}}/g, uniqueApproach);
    updatedHtml = updatedHtml.replace(/{{SERVICE_1_TITLE}}/g, primaryOffer);
    updatedHtml = updatedHtml.replace(/{{SERVICE_1_DESCRIPTION}}/g, problemYouSolve);
    updatedHtml = updatedHtml.replace(/{{SERVICE_2_TITLE}}/g, 'Personal Brand Photos');
    updatedHtml = updatedHtml.replace(/{{SERVICE_2_DESCRIPTION}}/g, 'AI-generated professional photos for your brand');
    updatedHtml = updatedHtml.replace(/{{SERVICE_3_TITLE}}/g, 'Business Growth');
    updatedHtml = updatedHtml.replace(/{{SERVICE_3_DESCRIPTION}}/g, 'Complete business setup and launch support');
    updatedHtml = updatedHtml.replace(/{{CONTACT_EMAIL}}/g, email);
    updatedHtml = updatedHtml.replace(/{{INSTAGRAM_HANDLE}}/g, instagramHandle);
    updatedHtml = updatedHtml.replace(/{{WEBSITE_URL}}/g, websiteUrl);
    
    return updatedHtml;
  };

  // Fetch user's brand onboarding data for template auto-population
  const { data: brandData } = useQuery({
    queryKey: ['/api/brand-onboarding'],
    retry: false,
  });

  // Get chat history
  const { data: chatData } = useQuery({
    queryKey: ['/api/victoria-chat-history', chatId],
    enabled: !!chatId,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['/api/victoria-chat-messages', chatId],
    enabled: !!chatId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest('POST', '/api/victoria-chat', {
        message,
        chatHistory: messages,
        conversationId: chatId ? parseInt(chatId) : undefined,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/victoria-chat-messages'] });
      setCurrentMessage('');
      setIsTyping(false);
    },
    onError: (error) => {
      toast({
        title: "Message failed",
        description: "Could not send message to Victoria",
        variant: "destructive",
      });
      setIsTyping(false);
    },
  });

  // Update preview with user photos and brand data when HTML changes
  useEffect(() => {
    if (previewRef.current && currentHtml) {
      const htmlWithUserPhotos = injectUserPhotos(currentHtml);
      const doc = previewRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(htmlWithUserPhotos);
        doc.close();
      }
    }
  }, [currentHtml, userGallery, brandData]);

  // Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || sendMessageMutation.isPending) return;
    
    setIsTyping(true);
    sendMessageMutation.mutate(currentMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen flex bg-white" style={{ fontFamily: 'Times New Roman, serif' }}>
      {/* Live Preview - Left Side (60%) */}
      <div className="w-3/5 border-r border-gray-200 flex flex-col">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-light text-black">Live Preview</h2>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 font-light">Your landing page updates in real-time</p>
            {userGallery?.userSelfies?.length > 0 && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-500">
                  Using {userGallery.totalSelfies} personal photos + {userGallery.totalFlatlays} flatlays
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1 bg-white">
          <iframe
            ref={previewRef}
            className="w-full h-full border-0"
            title="Landing Page Preview"
            sandbox="allow-same-origin"
          />
        </div>
        
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm"
                className="text-black border-black hover:bg-black hover:text-white"
              >
                Desktop
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-gray-500"
              >
                Mobile
              </Button>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline"
                size="sm"
                className="text-black border-black hover:bg-black hover:text-white"
                onClick={() => setIsFullScreen(true)}
              >
                Full Preview
              </Button>
              <Button 
                variant="outline"
                size="sm"
                className="text-black border-black hover:bg-black hover:text-white"
              >
                Save Draft
              </Button>
              <Button 
                size="sm"
                className="bg-black text-white hover:bg-gray-800"
              >
                Publish Live
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Victoria Chat - Right Side (40%) */}
      <div className="w-2/5 flex flex-col">
        <div className="bg-black text-white px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-black text-sm font-medium">V</span>
            </div>
            <div>
              <h3 className="font-medium">Victoria</h3>
              <p className="text-sm text-gray-300">Brand Strategist & Landing Page Expert</p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {!messages.length && (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                Hi gorgeous! I'm Victoria, your brand strategist and landing page expert. 
                I'll help you create a stunning business website that converts visitors into clients.
              </p>
              <p className="text-gray-400 text-sm">
                Tell me about your business and let's build something amazing together!
              </p>
            </div>
          )}
          
          {messages.map((message: ChatMessage) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user' 
                  ? 'bg-black text-white' 
                  : 'bg-gray-100 text-black'
              }`}>
                <p className="text-sm leading-relaxed">{message.content}</p>
                {message.artifactHtml && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                    ✓ Landing page code generated
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-black rounded-lg px-4 py-2 max-w-[80%]">
                <div className="flex items-center space-x-1">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-xs text-gray-500 ml-2">Victoria is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-3">
            <Textarea
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Describe your business and vision for your landing page..."
              className="flex-1 min-h-[60px] max-h-32 resize-none border-gray-300 focus:border-black focus:ring-black"
              disabled={sendMessageMutation.isPending}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!currentMessage.trim() || sendMessageMutation.isPending}
              className="bg-black text-white hover:bg-gray-800 px-6"
            >
              Send
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>

      {/* Full-Screen Preview Modal */}
      {isFullScreen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
          <div className="w-full h-full max-w-6xl max-h-full p-8 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-xl font-light">Full-Screen Preview</h2>
              <div className="flex items-center space-x-4">
                <Button 
                  variant="outline"
                  size="sm"
                  className="text-white border-white hover:bg-white hover:text-black"
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
                  onClick={() => setIsFullScreen(false)}
                  className="text-white hover:bg-gray-800"
                >
                  × Close
                </Button>
              </div>
            </div>
            
            <div className="flex-1 bg-white border border-gray-300">
              <iframe
                className="w-full h-full border-0"
                title="Full-Screen Landing Page Preview"
                srcDoc={injectUserPhotos(currentHtml)}
                sandbox="allow-same-origin"
              />
            </div>
            
            <p className="text-gray-300 text-sm mt-4 text-center">
              Preview your landing page before publishing live • Uses your personal photos: {userGallery?.totalSelfies || 0} selfies + {userGallery?.totalFlatlays || 0} flatlays
            </p>
          </div>
        </div>
      )}
    </div>
  );
}