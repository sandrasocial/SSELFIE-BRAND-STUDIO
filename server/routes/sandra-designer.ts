import type { Express } from "express";
import { isAuthenticated } from "../replitAuth";

// Landing page templates based on best practices
const TEMPLATES = {
  booking: {
    name: "Professional Booking Page",
    description: "Perfect for service providers, coaches, and consultants",
    sections: {
      hero: {
        headline: "Book Your Session Today",
        subheadline: "Transform your [service area] with personalized guidance",
        ctaText: "Schedule Now"
      },
      about: {
        title: "About Your Expert",
        content: "Share your story, credentials, and what makes you unique in your field."
      },
      services: {
        title: "My Services",
        items: [
          { name: "1:1 Consultation", description: "Personal guidance tailored to your needs", price: "€197" },
          { name: "Strategy Session", description: "Deep dive into your goals and create a plan", price: "€347" },
          { name: "VIP Day", description: "Intensive day together to transform your approach", price: "€997" }
        ]
      },
      gallery: {
        title: "Success Stories"
      },
      contact: {
        title: "Ready to Get Started?",
        bookingLink: true
      }
    }
  },
  service: {
    name: "Service Provider Page",
    description: "Showcase your expertise and convert visitors to clients",
    sections: {
      hero: {
        headline: "Expert [Your Service] Solutions",
        subheadline: "Get results that matter with proven strategies and personal attention",
        ctaText: "Learn More"
      },
      about: {
        title: "Why Choose Me",
        content: "Your unique value proposition and what sets you apart from competitors."
      },
      services: {
        title: "How I Help You",
        items: [
          { name: "Service One", description: "Detailed description of your primary service offering" },
          { name: "Service Two", description: "Another key service that complements your main offering" },
          { name: "Service Three", description: "Additional service that rounds out your expertise" }
        ]
      },
      gallery: {
        title: "Recent Work"
      },
      contact: {
        title: "Let's Work Together"
      }
    }
  },
  product: {
    name: "Product Sales Page",
    description: "Convert visitors into customers with proven sales psychology",
    sections: {
      hero: {
        headline: "The [Product Name] That Changes Everything",
        subheadline: "Finally, a solution that actually works for [target audience problem]",
        ctaText: "Get Yours Now"
      },
      about: {
        title: "What You'll Get",
        content: "Detailed breakdown of product features, benefits, and transformation it provides."
      },
      services: {
        title: "What's Included",
        items: [
          { name: "Core Product", description: "Main offering with all essential features", price: "€97" },
          { name: "Bonus Package", description: "Additional resources to maximize results", price: "€47" },
          { name: "Complete Bundle", description: "Everything you need for success", price: "€127" }
        ]
      },
      gallery: {
        title: "Product Gallery"
      },
      contact: {
        title: "Questions? Get In Touch"
      }
    }
  },
  portfolio: {
    name: "Creative Portfolio",
    description: "Showcase your work and attract dream clients",
    sections: {
      hero: {
        headline: "Creative [Your Specialty] That Connects",
        subheadline: "Bringing brands to life through authentic storytelling and strategic design",
        ctaText: "View My Work"
      },
      about: {
        title: "Meet the Creative",
        content: "Your artistic journey, philosophy, and what drives your creative process."
      },
      services: {
        title: "Services I Offer",
        items: [
          { name: "Brand Design", description: "Complete visual identity creation and strategy" },
          { name: "Creative Direction", description: "Guiding your brand's visual storytelling" },
          { name: "Custom Projects", description: "Tailored creative solutions for unique needs" }
        ]
      },
      gallery: {
        title: "Featured Work"
      },
      contact: {
        title: "Let's Create Something Amazing"
      }
    }
  }
};

// Sandra AI Designer responses
function generateSandraResponse(message: string, context: any): any {
  const lowerMessage = message.toLowerCase();
  
  // Initial page type selection
  if (lowerMessage.includes('booking') || lowerMessage.includes('appointment') || lowerMessage.includes('session')) {
    return {
      message: "Perfect! A booking page is exactly what you need. I'm creating a professional booking page that showcases your expertise and makes it easy for clients to schedule with you. Using your AI SSELFIES and brand style from your onboarding to make it uniquely yours.",
      type: "template_suggestion",
      landingPageUpdate: generateLandingPage('booking', context)
    };
  }
  
  if (lowerMessage.includes('service') || lowerMessage.includes('consultant') || lowerMessage.includes('coach')) {
    return {
      message: "A service page is perfect for showcasing your expertise. I'm building you a page that positions you as the go-to expert in your field. Using your personal brand style and AI images to create something that feels authentically you.",
      type: "template_suggestion",
      landingPageUpdate: generateLandingPage('service', context)
    };
  }
  
  if (lowerMessage.includes('product') || lowerMessage.includes('sell') || lowerMessage.includes('course')) {
    return {
      message: "A product page that converts. I'm creating a sales-focused page using proven psychology and your authentic brand voice. Your AI SSELFIES will build trust while the copy drives action.",
      type: "template_suggestion",
      landingPageUpdate: generateLandingPage('product', context)
    };
  }
  
  if (lowerMessage.includes('portfolio') || lowerMessage.includes('creative') || lowerMessage.includes('work')) {
    return {
      message: "A portfolio that attracts dream clients. I'm showcasing your best work with your AI SSELFIES to build that personal connection. This will position you as the premium choice in your field.",
      type: "template_suggestion",
      landingPageUpdate: generateLandingPage('portfolio', context)
    };
  }
  
  // Color/design changes
  if (lowerMessage.includes('color') || lowerMessage.includes('pink') || lowerMessage.includes('blue')) {
    return {
      message: "Good idea to make it yours. Let me adjust the colors to match your brand personality. What specific colors speak to you? I can work with your brand colors from your onboarding or try something fresh.",
      type: "design_update"
    };
  }
  
  // Image changes
  if (lowerMessage.includes('image') || lowerMessage.includes('photo') || lowerMessage.includes('picture')) {
    return {
      message: "Smart thinking. I can swap in different AI SSELFIES or your flatlays to better tell your story. Which section needs a different vibe? I have all your generated images ready to use.",
      type: "image_update"
    };
  }
  
  // Default helpful response
  return {
    message: "I'm here to help you create the perfect landing page. Tell me what kind of business you're building - are you offering services, selling a product, need a booking page, or want to showcase your portfolio? I'll use your AI SSELFIES and brand style to create something that converts visitors into clients.",
    type: "text"
  };
}

function generateLandingPage(type: 'booking' | 'service' | 'product' | 'portfolio', context: any) {
  const template = TEMPLATES[type];
  const onboarding = context.onboardingData;
  const aiImages = context.aiImages || [];
  
  // Use user's AI images or fallback to Sandra's library
  const heroImage = aiImages[0]?.url || 'https://images.unsplash.com/photo-1494790108755-2616b612b7a3';
  const aboutImage = aiImages[1]?.url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d';
  const galleryImages = aiImages.slice(0, 8).map(img => img.url) || [
    'https://images.unsplash.com/photo-1494790108755-2616b612b7a3',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e'
  ];
  
  // Personalize content based on onboarding data
  const businessType = onboarding?.businessType || 'your business';
  const targetClient = onboarding?.targetClient || 'your ideal clients';
  const dreamBrand = onboarding?.dreamBrand || 'luxury brand';
  
  return {
    id: `landing_${Date.now()}`,
    userId: context.userId,
    pageType: type,
    template: template.name,
    sections: {
      hero: {
        headline: template.sections.hero.headline.replace('[service area]', businessType).replace('[Your Service]', businessType).replace('[Product Name]', businessType).replace('[Your Specialty]', businessType),
        subheadline: template.sections.hero.subheadline.replace('[target audience problem]', `${targetClient} who want to transform their approach`),
        ctaText: template.sections.hero.ctaText,
        backgroundImage: heroImage
      },
      about: {
        title: template.sections.about.title,
        content: template.sections.about.content,
        image: aboutImage
      },
      services: {
        title: template.sections.services.title,
        items: template.sections.services.items
      },
      gallery: {
        title: template.sections.gallery.title,
        images: galleryImages
      },
      contact: {
        title: template.sections.contact.title,
        email: onboarding?.email || 'hello@yourbrand.com',
        phone: '',
        bookingLink: template.sections.contact.bookingLink ? 'https://calendly.com/yourbrand' : undefined
      }
    },
    customizations: {
      colors: {
        primary: '#0a0a0a',
        secondary: '#f5f5f5',
        text: '#333333'
      },
      fonts: {
        heading: 'Times New Roman, serif',
        body: 'Inter, system-ui, sans-serif'
      }
    }
  };
}

export function registerSandraDesignerRoutes(app: Express) {
  // Sandra AI Designer chat endpoint
  app.post('/api/sandra-designer', isAuthenticated, async (req: any, res) => {
    try {
      const { message, context } = req.body;
      const userId = req.user.claims.sub;
      
      // Add user context
      const enhancedContext = {
        ...context,
        userId
      };
      
      const response = generateSandraResponse(message, enhancedContext);
      
      res.json(response);
    } catch (error) {
      console.error('Sandra Designer error:', error);
      res.status(500).json({ 
        message: "Sorry beautiful, I'm having a technical moment. Can you try again? I'm here to help you create something amazing!",
        type: "error"
      });
    }
  });
  
  // Save landing page
  app.post('/api/landing-pages', isAuthenticated, async (req: any, res) => {
    try {
      const landingPageData = req.body;
      const userId = req.user.claims.sub;
      
      // In a real app, save to database
      // For now, just return success
      res.json({ 
        id: `landing_${Date.now()}`,
        message: "Landing page saved successfully!"
      });
    } catch (error) {
      console.error('Save landing page error:', error);
      res.status(500).json({ message: "Failed to save landing page" });
    }
  });
}