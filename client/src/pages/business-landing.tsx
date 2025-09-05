import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { GlobalFooter } from "../components/global-footer";

export default function BusinessLanding() {
  const [, setLocation] = useLocation();

  // SEO Meta Tags
  useEffect(() => {
    document.title = "SSELFIE Studio - Professional Photos From Your Selfies | AI Personal Branding";
    
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Upload selfies, get professional brand photos monthly. AI photographer for LinkedIn, Instagram, websites. €47/month vs €500+ photoshoots.');
  }, []);

  const handleGetStarted = () => {
    localStorage.setItem('selectedPlan', 'sselfie-studio');
    setLocation('/simple-checkout');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Business Navigation with Mobile Support */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div 
              className="font-serif text-xl font-light tracking-wide text-white cursor-pointer"
              style={{ fontFamily: "Times New Roman, serif" }}
              onClick={() => setLocation("/")}
            >
              SSELFIE
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => setLocation("/editorial-landing")}
                className="text-xs uppercase tracking-[0.3em] text-white/70 hover:text-white transition-all duration-300"
              >
                Personal
              </button>
              <button 
                onClick={() => setLocation("/teams")}
                className="text-xs uppercase tracking-[0.3em] text-white/70 hover:text-white transition-all duration-300"
              >
                Teams
              </button>
              <button
                onClick={() => setLocation("/api/login")}
                className="text-xs uppercase tracking-[0.3em] text-white/70 hover:text-white transition-all duration-300"
              >
                Login
              </button>
              <button
                onClick={handleGetStarted}
                className="text-white border border-white/30 hover:bg-white hover:text-black transition-colors duration-300 text-xs tracking-[0.3em] uppercase px-8 py-3 font-light"
              >
                Start €47
              </button>
            </div>
            
            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center space-x-4">
              <button
                onClick={() => setLocation("/api/login")}
                className="text-xs uppercase tracking-[0.3em] text-white/70 hover:text-white transition-all duration-300"
              >
                Login
              </button>
              <button
                onClick={handleGetStarted}
                className="text-white border border-white/30 hover:bg-white hover:text-black transition-colors duration-300 text-xs tracking-[0.3em] uppercase px-6 py-2 font-light"
              >
                Start
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO - Business Professional */}
      <section className="relative min-h-screen flex items-center justify-center bg-black text-white overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <img 
            src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/42585527/maya_rr4fnv2rb5rm80crzyd87jm48g_0_1756634973175.png"
            alt="Professional business transformation"
            className="w-full h-full object-cover object-center"
          />
        </div>
        
        <div className="relative z-10 text-center max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-xs uppercase tracking-[0.4em] text-white/70 mb-8">
            Professional Photography
          </div>
          
          <h1 
            className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light mb-8 tracking-[-0.02em] leading-none"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Professional Photos<br />
            <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-[0.3em] text-white/80 font-light">
              FROM YOUR SELFIES
            </span>
          </h1>
          
          <div className="w-16 h-px bg-white/30 mx-auto mb-8"></div>
          
          <p className="text-lg sm:text-xl md:text-2xl font-light mb-12 max-w-4xl mx-auto leading-relaxed">
            Upload selfies, receive 100+ professional brand photographs.<br />
            Monthly delivery for €47 versus €500+ traditional photoshoots.
          </p>
          
          <button 
            onClick={handleGetStarted}
            className="group inline-block mb-8"
          >
            <span className="text-sm uppercase tracking-[0.3em] text-white border border-white/30 px-12 py-4 group-hover:bg-white group-hover:text-black transition-all duration-300 font-light">
              Transform Your Brand — €47
            </span>
          </button>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-2xl font-light mb-2">20min</p>
              <p className="text-xs text-white/70 uppercase tracking-wide">Delivery</p>
            </div>
            <div>
              <p className="text-2xl font-light mb-2">100+</p>
              <p className="text-xs text-white/70 uppercase tracking-wide">Images</p>
            </div>
            <div>
              <p className="text-2xl font-light mb-2">Monthly</p>
              <p className="text-xs text-white/70 uppercase tracking-wide">Delivery</p>
            </div>
            <div>
              <p className="text-2xl font-light mb-2">€47</p>
              <p className="text-xs text-white/70 uppercase tracking-wide">Cost</p>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM - Business Pain Points */}
      <section className="py-20 sm:py-32 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-xs uppercase tracking-[0.4em] text-gray-400 mb-8">
            The Reality
          </div>
          
          <h2 
            className="font-serif text-3xl sm:text-4xl md:text-5xl font-light mb-8 text-black leading-tight"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Professional photography<br />
            <span className="italic text-gray-600">breaks startup budgets</span>
          </h2>
          
          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
            €500+ per session. Weeks of scheduling. Inconsistent results. 
            Meanwhile, your business needs fresh content across LinkedIn, Instagram, websites, and marketing materials.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="bg-gray-50 p-6 border-l-4 border-gray-300">
              <h3 className="font-medium mb-3 text-black">Traditional Photography</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• €500-1500 per session</li>
                <li>• 2-3 weeks scheduling</li>
                <li>• Limited shot variations</li>
                <li>• Expensive reshoots</li>
              </ul>
            </div>
            
            <div className="bg-gray-50 p-6 border-l-4 border-gray-300">
              <h3 className="font-medium mb-3 text-black">Business Impact</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Outdated LinkedIn photos</li>
                <li>• Inconsistent brand imagery</li>
                <li>• Limited marketing materials</li>
                <li>• Delayed campaign launches</li>
              </ul>
            </div>
            
            <div className="bg-gray-50 p-6 border-l-4 border-gray-300">
              <h3 className="font-medium mb-3 text-black">Budget Reality</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Photography = luxury expense</li>
                <li>• DIY photos look unprofessional</li>
                <li>• Inconsistent quality</li>
                <li>• Time away from business</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SOLUTION - Clean Value Proposition */}
      <section className="py-20 sm:py-32 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="text-xs uppercase tracking-[0.4em] text-gray-400 mb-8">
              The Solution
            </div>
            <h2 
              className="font-serif text-3xl sm:text-4xl md:text-5xl font-light mb-8 text-black"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              AI photographer in your pocket.<br />
              <span className="italic text-gray-600">Professional results, startup budget.</span>
            </h2>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h3 
                className="font-serif text-2xl sm:text-3xl font-light mb-6 text-black"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                How it works
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-black text-white flex items-center justify-center text-sm font-light mr-4 flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 text-black">Upload 10-15 selfies</h4>
                    <p className="text-gray-600 text-sm">Different angles, expressions, lighting. Takes 5 minutes on your phone.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-black text-white flex items-center justify-center text-sm font-light mr-4 flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 text-black">AI learns your face</h4>
                    <p className="text-gray-600 text-sm">Custom AI model trained specifically on your features and expressions.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-black text-white flex items-center justify-center text-sm font-light mr-4 flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 text-black">Receive 100+ photos monthly</h4>
                    <p className="text-gray-600 text-sm">Professional headshots, lifestyle shots, branded content. Ready in 20 minutes.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative h-[400px] overflow-hidden">
              <img
                src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/42585527/maya_g826ygf2d9rm80crzjkvnvmpyr_0_1756585536824.png"
                alt="Professional AI-generated photos"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          <div className="text-center mt-16">
            <p 
              className="text-xl italic text-black"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              100+ professional photos monthly for €47 vs €500+ per single photoshoot
            </p>
          </div>
        </div>
      </section>

      {/* SUCCESS - Simplified */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-xs uppercase tracking-[0.4em] text-gray-400 mb-8">
            Your New Reality
          </div>
          
          <h2 
            className="font-serif text-3xl sm:text-4xl md:text-5xl font-light mb-8 text-black leading-tight"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            100+ professional photos monthly.<br />
            <span className="italic text-gray-600">Never run out of content.</span>
          </h2>
          
          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
            LinkedIn posts, Instagram stories, website headers, marketing materials. 
            Fresh professional imagery that tells your story across every platform.
          </p>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-20 sm:py-32 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {/* Individual Plan */}
            <div className="bg-white border border-gray-200 p-8">
              <div className="text-center border-b border-gray-200 pb-6 mb-6">
                <h3 
                  className="font-serif text-2xl font-light mb-2 text-black"
                  style={{ fontFamily: "Times New Roman, serif" }}
                >
                  Personal Brand Studio
                </h3>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-light text-black">€47</span>
                  <span className="text-lg text-gray-600 ml-2">monthly</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">versus €500+ traditional photoshoots</p>
              </div>
              <button 
                onClick={handleGetStarted}
                className="w-full bg-black text-white py-4 text-sm uppercase tracking-[0.3em] hover:bg-gray-800 transition-all font-light"
              >
                Begin Transformation
              </button>
              <p className="text-xs text-gray-500 text-center mt-4">30-day money-back guarantee</p>
            </div>
            
            {/* Team Option */}
            <div className="border-2 border-black p-8">
              <div className="text-center border-b border-gray-200 pb-6 mb-6">
                <h3 
                  className="font-serif text-2xl font-light mb-2 text-black"
                  style={{ fontFamily: "Times New Roman, serif" }}
                >
                  Enterprise Solutions
                </h3>
                <p className="text-gray-600">Professional photography for teams and organizations</p>
              </div>
              <button 
                onClick={() => setLocation('/teams')}
                className="w-full border border-black text-black py-4 text-sm uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-all font-light"
              >
                Request Custom Proposal
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF - Editorial Portrait */}
      <section className="py-20 sm:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Sandra's Portrait */}
            <div className="relative h-[500px] overflow-hidden">
              <img
                src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/42585527/maya_g826ygf2d9rm80crzjkvnvmpyr_0_1756585536824.png"
                alt="Sandra Sigurjónsdóttir, Founder"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-white text-sm font-light">Sandra Sigurjónsdóttir</p>
                <p className="text-white/80 text-sm italic">Founder, SSELFIE Studio</p>
              </div>
            </div>
            
            {/* Content */}
            <div>
              <div className="text-xs uppercase tracking-[0.4em] text-gray-400 mb-8">
                The Creator
              </div>
              
              <h3 
                className="font-serif text-3xl sm:text-4xl font-light mb-8 text-black"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                Built by Sandra Sigurjónsdóttir
              </h3>
              
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="text-3xl font-light text-black">3 Children</p>
                  <p className="text-gray-600 text-sm">Single mother building this solution</p>
                </div>
                
                <div>
                  <p className="text-3xl font-light text-black">€12 → Empire</p>
                  <p className="text-gray-600 text-sm">Built from modest beginnings</p>
                </div>
              </div>
              
              <blockquote 
                className="text-xl italic text-black mb-8 border-l-2 border-gray-300 pl-6"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                "I created this because traditional photoshoots were financially impossible, yet professional imagery was essential for brand development."
              </blockquote>
              
              <div className="bg-white p-6 border-l-4 border-black">
                <p className="text-gray-700 leading-relaxed">
                  <span className="font-medium">Single mother, three children, minimal capital.</span> Built from kitchen table using mobile photography and this precise system. Now enabling entrepreneurs globally to achieve similar transformation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA - Editorial Call to Action */}
      <section className="relative py-24 sm:py-32 bg-black text-white overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img
            src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/42585527/maya_rr4fnv2rb5rm80crzyd87jm48g_0_1756634973175.png"
            alt="Professional transformation"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 
            className="font-serif text-3xl sm:text-4xl md:text-5xl font-light mb-8"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Professional photography.<br />
            <span className="italic">Monthly delivery.</span>
          </h2>
          
          <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
            Upload selfies today. Receive 100+ professional brand photographs within 20 minutes.
          </p>
          
          <button 
            onClick={handleGetStarted}
            className="group inline-block mb-8"
          >
            <span className="text-sm uppercase tracking-[0.3em] text-white border border-white/30 px-12 py-4 group-hover:bg-white group-hover:text-black transition-all duration-300 font-light">
              Transform Your Brand — €47
            </span>
          </button>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-2xl font-light mb-2">20min</p>
              <p className="text-xs text-white/70 uppercase tracking-wide">Delivery</p>
            </div>
            <div>
              <p className="text-2xl font-light mb-2">100+</p>
              <p className="text-xs text-white/70 uppercase tracking-wide">Images</p>
            </div>
            <div>
              <p className="text-2xl font-light mb-2">∞</p>
              <p className="text-xs text-white/70 uppercase tracking-wide">Content</p>
            </div>
            <div>
              <p className="text-2xl font-light mb-2">€47</p>
              <p className="text-xs text-white/70 uppercase tracking-wide">Monthly</p>
            </div>
          </div>
        </div>
      </section>

      <GlobalFooter />
    </div>
  );
}