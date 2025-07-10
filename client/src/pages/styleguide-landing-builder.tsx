import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface StyleguideLandingPage {
  id?: number;
  userId: string;
  styleguideId: number;
  pageType: "booking" | "service" | "product" | "portfolio";
  title: string;
  subtitle: string;
  heroContent: string;
  sections: Array<{
    type: string;
    content: string;
    imageUrl?: string;
  }>;
  integrations: {
    calendly?: string;
    stripe?: string;
    email?: string;
  };
  customDomain?: string;
  isLive: boolean;
  styleConfig: {
    colorPalette: any;
    typography: any;
    layout: string;
  };
}

interface SandraMessage {
  role: "user" | "sandra";
  content: string;
  timestamp: Date;
}

export default function StyleguideLandingBuilder() {
  const [activeUserId] = useState("demo123");
  const [chatMessages, setChatMessages] = useState<SandraMessage[]>([
    {
      role: "sandra",
      content: "Hi! I'm SANDRA, your AI designer. I'll help you create a landing page that perfectly matches your personal styleguide. What type of page would you like - booking, service showcase, product sales, or portfolio?",
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  
  // Fetch user's styleguide
  const { data: styleguide } = useQuery({
    queryKey: ["/api/styleguide", activeUserId],
    enabled: !!activeUserId
  });

  // Mock landing page data that matches styleguide
  const [landingPage, setLandingPage] = useState<StyleguideLandingPage>({
    userId: activeUserId,
    styleguideId: 1,
    pageType: "service",
    title: "Transform Your Brand",
    subtitle: "Strategic Brand Consulting That Creates Impact",
    heroContent: "Ready to build an authentic, profitable brand that reflects your true essence? Let's create something extraordinary together.",
    sections: [
      {
        type: "about",
        content: "I'm Sarah Johnson, and I've spent over a decade helping ambitious women entrepreneurs transform their vision into thriving, authentic brands.",
        imageUrl: "https://i.postimg.cc/VLCFmXVr/1.png"
      },
      {
        type: "services",
        content: "Strategic Brand Consulting • Brand Identity Design • Marketing Strategy • Business Positioning"
      },
      {
        type: "testimonial",
        content: "\"Sarah transformed my entire business. Her strategic approach helped me triple my revenue while staying true to my authentic voice.\" - Client"
      },
      {
        type: "cta",
        content: "Ready to transform your brand? Book your strategic consultation today."
      }
    ],
    integrations: {
      calendly: "https://calendly.com/sarah-johnson/brand-consultation",
      stripe: "",
      email: "hello@sarahjohnson.com"
    },
    isLive: false,
    styleConfig: {
      colorPalette: styleguide?.colorPalette || {
        primary: "#0a0a0a",
        secondary: "#ffffff", 
        accent: "#f5f5f5",
        neutral: "#666666"
      },
      typography: styleguide?.typography || {
        headline: "Times New Roman",
        body: "System Sans-Serif"
      },
      layout: "refined-minimal"
    }
  });

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    const userMessage: SandraMessage = {
      role: "user",
      content: newMessage,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    
    // Simulate SANDRA AI response
    setTimeout(() => {
      const sandraResponse: SandraMessage = {
        role: "sandra", 
        content: generateSandraResponse(newMessage, landingPage),
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, sandraResponse]);
    }, 1000);
    
    setNewMessage("");
  };

  const generateSandraResponse = (message: string, currentPage: StyleguideLandingPage): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes("calendly") || lowerMessage.includes("booking")) {
      return "Perfect! I can help you connect Calendly for bookings. Just paste your Calendly link and I'll integrate it with a beautiful booking button that matches your styleguide colors.";
    }
    
    if (lowerMessage.includes("stripe") || lowerMessage.includes("payment")) {
      return "Great! I'll help you set up Stripe payments. We can add payment buttons for services, products, or consultations that match your brand style perfectly.";
    }
    
    if (lowerMessage.includes("color") || lowerMessage.includes("style")) {
      return "Your landing page automatically uses your styleguide colors and fonts! The refined minimal style with Times New Roman headlines and your personal color palette creates perfect brand consistency.";
    }
    
    if (lowerMessage.includes("content") || lowerMessage.includes("copy")) {
      return "I can help you write compelling copy that matches your brand voice. Based on your styleguide, I'll create warm, professional content that resonates with your target audience.";
    }
    
    if (lowerMessage.includes("live") || lowerMessage.includes("publish")) {
      return "When you're ready to go live, I'll help you set up your custom domain and publish your page. Everything will be perfectly optimized and ready for your clients!";
    }
    
    return "I love that idea! Your landing page will automatically match your personal styleguide - same colors, fonts, and aesthetic. What specific element would you like me to help you customize?";
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif text-black">STYLEGUIDE LANDING BUILDER</h1>
            <p className="text-sm text-gray-600 mt-1">Create landing pages that perfectly match your personal styleguide</p>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant={previewMode === "desktop" ? "default" : "outline"}
              onClick={() => setPreviewMode("desktop")}
              className="text-xs"
            >
              DESKTOP
            </Button>
            <Button 
              variant={previewMode === "mobile" ? "default" : "outline"}
              onClick={() => setPreviewMode("mobile")}
              className="text-xs"
            >
              MOBILE
            </Button>
            <Button className="bg-black text-white hover:bg-gray-800">
              PUBLISH LIVE
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-screen">
          
          {/* SANDRA AI Chat Interface */}
          <div className="flex flex-col">
            <Card className="flex-1 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">S</span>
                </div>
                <h2 className="text-lg font-serif text-black">SANDRA AI DESIGNER</h2>
              </div>
              
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 max-h-96">
                {chatMessages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-sm p-3 rounded-lg ${
                      message.role === "user" 
                        ? "bg-black text-white" 
                        : "bg-gray-100 text-black"
                    }`}>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Chat Input */}
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Ask SANDRA about integrations, content, styling..."
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  className="flex-1"
                />
                <Button onClick={sendMessage} className="bg-black text-white">
                  SEND
                </Button>
              </div>
            </Card>

            {/* Quick Actions */}
            <div className="mt-6 space-y-3">
              <h3 className="text-sm font-semibold text-black uppercase tracking-wide">QUICK INTEGRATIONS</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="text-xs">CONNECT CALENDLY</Button>
                <Button variant="outline" className="text-xs">SETUP STRIPE</Button>
                <Button variant="outline" className="text-xs">ADD TESTIMONIALS</Button>
                <Button variant="outline" className="text-xs">CUSTOM DOMAIN</Button>
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div className="flex flex-col">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-serif text-black">LIVE PREVIEW</h2>
              <span className="text-xs text-gray-600">Matches your styleguide automatically</span>
            </div>
            
            <Card className="flex-1 overflow-hidden">
              <div className={`h-full overflow-y-auto ${previewMode === "mobile" ? "max-w-sm mx-auto" : ""}`}>
                {/* Landing Page Preview */}
                <div 
                  className="min-h-full"
                  style={{
                    fontFamily: landingPage.styleConfig.typography.headline,
                    backgroundColor: landingPage.styleConfig.colorPalette.secondary
                  }}
                >
                  {/* Hero Section */}
                  <div 
                    className="relative h-96 flex items-center justify-center text-center p-8"
                    style={{
                      backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${styleguide?.imageSelections?.heroImage})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    <div className="text-white">
                      <h1 
                        className="text-4xl lg:text-6xl font-serif mb-4"
                        style={{ 
                          fontFamily: landingPage.styleConfig.typography.headline,
                          color: landingPage.styleConfig.colorPalette.secondary 
                        }}
                      >
                        {landingPage.title}
                      </h1>
                      <p 
                        className="text-xl mb-6"
                        style={{ color: landingPage.styleConfig.colorPalette.secondary }}
                      >
                        {landingPage.subtitle}
                      </p>
                      <p 
                        className="text-lg mb-8 max-w-2xl"
                        style={{ color: landingPage.styleConfig.colorPalette.secondary }}
                      >
                        {landingPage.heroContent}
                      </p>
                      <Button 
                        className="text-lg px-8 py-3"
                        style={{
                          backgroundColor: landingPage.styleConfig.colorPalette.primary,
                          color: landingPage.styleConfig.colorPalette.secondary
                        }}
                      >
                        BOOK CONSULTATION
                      </Button>
                    </div>
                  </div>

                  {/* Sections */}
                  {landingPage.sections.map((section, index) => (
                    <div key={index} className="p-8 border-b" style={{
                      borderColor: landingPage.styleConfig.colorPalette.accent
                    }}>
                      {section.type === "about" && (
                        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 items-center">
                          <div>
                            <h2 
                              className="text-3xl font-serif mb-4"
                              style={{ 
                                fontFamily: landingPage.styleConfig.typography.headline,
                                color: landingPage.styleConfig.colorPalette.primary
                              }}
                            >
                              ABOUT
                            </h2>
                            <p 
                              className="text-lg leading-relaxed"
                              style={{ color: landingPage.styleConfig.colorPalette.neutral }}
                            >
                              {section.content}
                            </p>
                          </div>
                          {section.imageUrl && (
                            <img 
                              src={section.imageUrl} 
                              alt="About" 
                              className="w-full h-64 object-cover"
                            />
                          )}
                        </div>
                      )}
                      
                      {section.type === "services" && (
                        <div className="max-w-4xl mx-auto text-center">
                          <h2 
                            className="text-3xl font-serif mb-6"
                            style={{ 
                              fontFamily: landingPage.styleConfig.typography.headline,
                              color: landingPage.styleConfig.colorPalette.primary
                            }}
                          >
                            SERVICES
                          </h2>
                          <p 
                            className="text-lg"
                            style={{ color: landingPage.styleConfig.colorPalette.neutral }}
                          >
                            {section.content}
                          </p>
                        </div>
                      )}
                      
                      {section.type === "cta" && (
                        <div className="max-w-2xl mx-auto text-center">
                          <h2 
                            className="text-3xl font-serif mb-6"
                            style={{ 
                              fontFamily: landingPage.styleConfig.typography.headline,
                              color: landingPage.styleConfig.colorPalette.primary
                            }}
                          >
                            {section.content}
                          </h2>
                          <Button 
                            className="text-lg px-8 py-3"
                            style={{
                              backgroundColor: landingPage.styleConfig.colorPalette.primary,
                              color: landingPage.styleConfig.colorPalette.secondary
                            }}
                          >
                            BOOK NOW
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}