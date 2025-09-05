import React, { useState, useEffect } from "react";
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
                Start €47
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO - Clean & Focused */}
      <section className="relative min-h-screen bg-black text-white overflow-hidden">
        <div className="absolute inset-0 opacity-50">
          <img 
            src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/undefined/undefined_1756382691095.png"
            alt="Professional transformation through AI photography"
            className="w-full h-full object-cover object-center"
          />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center min-h-screen px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-5xl mx-auto">
            <div className="mb-12">
              <div className="w-24 h-px bg-white/30 mx-auto mb-8"></div>
            </div>
            
            <h1 
              className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light mb-16 tracking-[-0.02em] leading-none"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              Professional Photos<br />
              <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-[0.3em] text-white/80 font-light">
                FROM YOUR SELFIES
              </span>
            </h1>
            
            <div className="space-y-8">
              <button 
                onClick={handleGetStarted}
                className="bg-white text-black px-12 py-4 text-sm uppercase tracking-[0.3em] hover:bg-gray-100 transition-all font-medium"
              >
                GET PROFESSIONAL PHOTOS — €47
              </button>
              
              <p className="text-xs text-white/50 tracking-wide">
                Photos ready in 20 minutes • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM - Editorial Layout */}
      <section className="py-20 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-12 gap-8 lg:gap-16">
            {/* Problem Content */}
            <div className="col-span-12 lg:col-span-7 flex items-center">
              <div className="max-w-2xl">
                <div className="text-xs uppercase tracking-[0.4em] text-gray-400 mb-8">
                  The Current Reality
                </div>
                
                <h2 
                  className="font-serif text-3xl sm:text-4xl md:text-5xl font-light mb-12 text-black leading-tight"
                  style={{ fontFamily: "Times New Roman, serif" }}
                >
                  Hours creating content.<br />
                  Still looks unprofessional.
                </h2>
                
                <div className="space-y-8">
                  <div className="border-l-2 border-gray-200 pl-6">
                    <h3 className="text-lg font-medium mb-2 text-black">Time consumed</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Two hours trying to get one decent photo. Testing angles, fighting with lighting, 
                      taking 47 shots to get one you don't hate.
                    </p>
                  </div>
                  
                  <div className="border-l-2 border-gray-200 pl-6">
                    <h3 className="text-lg font-medium mb-2 text-black">Content shortage</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Scrolling through your camera roll like "what can I post today?" 
                      Using the same three photos over and over.
                    </p>
                  </div>
                  
                  <div className="border-l-2 border-gray-200 pl-6">
                    <h3 className="text-lg font-medium mb-2 text-black">Credibility gap</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Your content looks amateur next to competitors. People can tell. 
                      It's killing your confidence to show up online.
                    </p>
                  </div>
                </div>
                
                <div className="mt-12 p-6 bg-gray-50">
                  <p className="text-lg text-black font-medium italic" style={{ fontFamily: "Times New Roman, serif" }}>
                    "Meanwhile, other entrepreneurs post professional content daily"
                  </p>
                </div>
              </div>
            </div>
            
            {/* Problem Visual */}
            <div className="col-span-12 lg:col-span-5">
              <div className="relative h-[500px] overflow-hidden">
                <img
                  src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/42585527/maya_nxsdf9gfxdrma0crzzc87381t0_0_1756639025507.png"
                  alt="The struggle of content creation"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-white text-sm italic" style={{ fontFamily: "Times New Roman, serif" }}>
                    "Two hours for one usable photograph"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOLUTION - Editorial Process */}
      <section className="py-20 sm:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-20">
            <div className="text-xs uppercase tracking-[0.4em] text-gray-400 mb-8">
              The Solution
            </div>
            <h2 
              className="font-serif text-3xl sm:text-4xl md:text-5xl font-light mb-6 text-black"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              Professional photos in<br />
              <span className="italic text-gray-600">three simple steps</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
            {/* Step 1 */}
            <div className="text-center">
              <div className="relative h-64 mb-8 overflow-hidden">
                <img
                  src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/42585527/maya_nxsdf9gfxdrma0crzzc87381t0_0_1756639025507.png"
                  alt="Upload process"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-6 left-6 w-12 h-12 bg-black text-white flex items-center justify-center text-lg font-light">
                  01
                </div>
              </div>
              <h3 
                className="font-serif text-xl mb-4 text-black font-light"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                Upload your selfies
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Send 15-20 selfies from your phone. Mirror selfies, car selfies, 
                bathroom selfies. Whatever you have works.
              </p>
              <p className="text-sm text-gray-500 italic">
                "Any lighting, any background"
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="text-center">
              <div className="relative h-64 mb-8 overflow-hidden">
                <img
                  src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/42585527/maya_8r00hax7n1rm80cryjbs9enxam_0_1756450255292.png"
                  alt="AI creation process"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-6 left-6 w-12 h-12 bg-black text-white flex items-center justify-center text-lg font-light">
                  02
                </div>
              </div>
              <h3 
                className="font-serif text-xl mb-4 text-black font-light"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                AI creates professional photos
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Maya AI learns your face and creates professional photos 
                in different styles. Business, lifestyle, editorial, creative.
              </p>
              <p className="text-sm text-gray-500 italic">
                "Like having a personal photographer"
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="text-center">
              <div className="relative h-64 mb-8 overflow-hidden">
                <img
                  src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/42585527/maya_3hj19rf19xrmc0cryyz81tk7pg_0_1756503154230.png"
                  alt="Professional gallery"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-6 left-6 w-12 h-12 bg-black text-white flex items-center justify-center text-lg font-light">
                  03
                </div>
              </div>
              <h3 
                className="font-serif text-xl mb-4 text-black font-light"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                Get 100+ monthly photos
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Download professional photos for LinkedIn, Instagram, 
                your website, marketing materials. Fresh content every month.
              </p>
              <p className="text-sm text-gray-500 italic">
                "Never run out of content again"
              </p>
            </div>
          </div>
          
          <div className="text-center mt-16 bg-black text-white p-12">
            <p 
              className="text-xl font-light"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              100+ professional photos monthly for €47 vs €500+ per single photoshoot
            </p>
          </div>
        </div>
      </section>

      {/* SUCCESS - Editorial Benefits */}
      <section className="py-20 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="text-xs uppercase tracking-[0.4em] text-gray-400 mb-8">
              Your New Reality
            </div>
            <h2 
              className="font-serif text-3xl sm:text-4xl md:text-5xl font-light mb-6 text-black"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              Never lack content again
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Fresh professional imagery that tells your story across every platform
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Benefits */}
            <div className="space-y-8">
              <div className="flex items-start">
                <div className="w-1 h-8 bg-black mr-6 mt-1"></div>
                <div>
                  <h3 className="text-lg font-medium mb-2 text-black">Fresh imagery monthly</h3>
                  <p className="text-gray-600">
                    100+ professional photographs. Lifestyle, business, storytelling imagery beyond traditional headshots.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-1 h-8 bg-black mr-6 mt-1"></div>
                <div>
                  <h3 className="text-lg font-medium mb-2 text-black">Platform optimization</h3>
                  <p className="text-gray-600">
                    LinkedIn posts, Instagram stories, website headers, landing pages, marketing materials.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-1 h-8 bg-black mr-6 mt-1"></div>
                <div>
                  <h3 className="text-lg font-medium mb-2 text-black">Narrative photography</h3>
                  <p className="text-gray-600">
                    Professional brand moments that communicate your authentic story and values.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-1 h-8 bg-black mr-6 mt-1"></div>
                <div>
                  <h3 className="text-lg font-medium mb-2 text-black">Brand consistency</h3>
                  <p className="text-gray-600">
                    Your personal AI model ensures visual coherence across all touchpoints.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-1 h-8 bg-black mr-6 mt-1"></div>
                <div>
                  <h3 className="text-lg font-medium mb-2 text-black">Content confidence</h3>
                  <p className="text-gray-600">
                    Post daily without hesitation. Never scroll through camera roll searching for content.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Pricing */}
            <div className="space-y-8">
              {/* Individual Plan */}
              <div className="bg-gray-50 border border-gray-200 p-8">
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
                  <p className="text-3xl font-light text-black">120,000+</p>
                  <p className="text-gray-600 text-sm">Followers cultivated using this methodology</p>
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
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-xs uppercase tracking-[0.4em] text-white/70 mb-8">
            Your Transformation Begins Now
          </div>
          
          <h2 
            className="font-serif text-4xl sm:text-5xl md:text-6xl font-light mb-8 text-white"
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
              <p className="text-2xl font-light mb-2">24hrs</p>
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