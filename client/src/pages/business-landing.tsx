/**
 * Business Landing Page - Maya-Only Architecture
 * Clean, modern landing page for SSELFIE Studio subscription
 */

import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../hooks/use-auth.js";
import { MemberNavigation } from "../components/member-navigation.js";
import { GlobalFooter } from "../components/global-footer.js";
import { Button } from "../components/ui/button.js";
import { Loader2, Check, Star, Users, Shield, Zap } from "lucide-react";
import type { StackAuthUser } from "../../shared/types/auth.js";

interface PricingFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const PRICING_FEATURES: PricingFeature[] = [
  {
    icon: <Zap className="h-5 w-5" />,
    title: "AI Professional Photos",
    description: "Transform selfies into stunning professional photos monthly"
  },
  {
    icon: <Users className="h-5 w-5" />,
    title: "Maya AI Stylist",
    description: "Personal AI creative director for your brand identity"
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: "Multiple Styles",
    description: "Business, lifestyle, editorial, luxury, and creative looks"
  },
  {
    icon: <Check className="h-5 w-5" />,
    title: "Unlimited Generations",
    description: "No limits on photo creation within your monthly package"
  }
];

export default function BusinessLanding() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  // SEO Meta Tags
  useEffect(() => {
    // Primary SEO tags
    document.title = "SSELFIE Studio - AI Professional Photos From Selfies | €47/month";
    
    const metaTags = [
      { name: 'description', content: 'Transform selfies into professional brand photos with AI. LinkedIn headshots, Instagram content, website photos. €47/month vs €1500+ photoshoots. Upload selfies, get professional photos monthly.' },
      { name: 'keywords', content: 'AI headshots, professional photos from selfies, LinkedIn headshots, personal branding photos, AI photographer, Maya AI stylist, professional selfies, business headshots' },
      { name: 'author', content: 'SSELFIE Studio' },
      { name: 'robots', content: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0, viewport-fit=cover' },
      { name: 'theme-color', content: '#000000' },
      
      // Open Graph tags
      { property: 'og:title', content: 'SSELFIE Studio - AI Professional Photos From Selfies' },
      { property: 'og:description', content: 'Transform selfies into professional brand photos with AI. €47/month vs €1500+ photoshoots.' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://sselfie.ai/business' },
      { property: 'og:image', content: 'https://sselfie.ai/og-business.jpg' },
      { property: 'og:site_name', content: 'SSELFIE Studio' },
      
      // Twitter Card tags
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'SSELFIE Studio - AI Professional Photos From Selfies' },
      { name: 'twitter:description', content: 'Transform selfies into professional brand photos with AI. €47/month vs €1500+ photoshoots.' },
      { name: 'twitter:image', content: 'https://sselfie.ai/twitter-business.jpg' },
    ];

    // Apply meta tags
    metaTags.forEach(tag => {
      const selector = tag.name ? `meta[name="${tag.name}"]` : `meta[property="${tag.property}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        if (tag.name) meta.setAttribute('name', tag.name);
        if (tag.property) meta.setAttribute('property', tag.property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', tag.content);
    });

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', 'https://sselfie.ai/business');

    // Structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "SSELFIE Studio",
      "description": "AI-powered professional photo generation from selfies for personal branding",
      "provider": {
        "@type": "Organization",
        "name": "SSELFIE Studio",
        "url": "https://sselfie.ai"
      },
      "serviceType": "Photography Service",
      "areaServed": "Worldwide",
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Professional Photo Packages",
        "itemListElement": [{
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "SSELFIE Studio Monthly Subscription",
            "description": "Monthly professional photos from selfies with Maya AI stylist"
          },
          "price": "47",
          "priceCurrency": "EUR"
        }]
      }
    };

    let script = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(structuredData);
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      setLocation('/maya');
    } else {
      setLocation('/auth/signup');
    }
  };

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      setLocation('/auth/signin');
    } catch (error) {
      console.error('Sign in redirect failed:', error);
    } finally {
      setIsSigningIn(false);
    }
  };

  // Hero Section
  const HeroSection = () => (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-20">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-light tracking-tight text-gray-900">
              Professional Photos
              <br />
              <span className="italic">From Your Selfies</span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
              Meet Maya, your AI creative director. Transform selfies into professional brand photos 
              monthly for €47 – instead of €1500+ photoshoots.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={handleGetStarted}
              size="lg"
              className="bg-black text-white hover:bg-gray-800 px-8 py-4 text-lg font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Zap className="w-5 h-5 mr-2" />
              )}
              {isAuthenticated ? 'Continue to Maya' : 'Start Your Journey'}
            </Button>
            
            {!isAuthenticated && (
              <Button 
                onClick={handleSignIn}
                variant="outline"
                size="lg"
                className="px-8 py-4 text-lg font-medium"
                disabled={isSigningIn}
              >
                {isSigningIn ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : null}
                Sign In
              </Button>
            )}
          </div>

          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span>4.8/5 from 127 creators</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>500+ professionals trust SSELFIE</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  // Features Section
  const FeaturesSection = () => (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-serif font-light text-gray-900">
            Everything You Need for Professional Branding
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Maya AI understands your brand and creates photos that reflect your professional identity
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {PRICING_FEATURES.map((feature, index) => (
            <div key={index} className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-black text-white rounded-full">
                {feature.icon}
              </div>
              <h3 className="text-lg font-medium text-gray-900">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  // Pricing Section
  const PricingSection = () => (
    <section className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-serif font-light text-gray-900">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-600">
            One plan. Everything included. No hidden fees.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-12 relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <span className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium">
              Most Popular
            </span>
          </div>
          
          <div className="text-center space-y-6">
            <div>
              <h3 className="text-2xl font-medium text-gray-900 mb-2">SSELFIE Studio</h3>
              <div className="flex items-baseline justify-center space-x-2">
                <span className="text-5xl font-light text-gray-900">€47</span>
                <span className="text-lg text-gray-600">/month</span>
              </div>
            </div>

            <div className="space-y-4">
              {PRICING_FEATURES.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{feature.title}: {feature.description}</span>
                </div>
              ))}
            </div>

            <Button 
              onClick={handleGetStarted}
              size="lg"
              className="w-full bg-black text-white hover:bg-gray-800 py-4 text-lg font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Zap className="w-5 h-5 mr-2" />
              )}
              {isAuthenticated ? 'Access Maya AI' : 'Start Creating Today'}
            </Button>

            <p className="text-sm text-gray-500">
              Cancel anytime. No long-term contracts.
            </p>
          </div>
        </div>
      </div>
    </section>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-600" />
          <p className="text-gray-600">Loading SSELFIE Studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <MemberNavigation />
      
      <main>
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
      </main>

      <GlobalFooter />
    </div>
  );
}