import { useState, useEffect } from 'react';
import { useLocation } from "wouter";
import { GlobalFooter } from '../components/global-footer';

export default function TeamsLanding() {
  const [, setLocation] = useLocation();

  // SEO Meta Tags
  useEffect(() => {
    document.title = "Professional Team Photos From Phone Selfies | SSELFIE Teams";
    
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Professional team photos from phone selfies. Stop coordinating expensive photoshoots. Get consistent brand photos for your entire team monthly.');
  }, []);

  const handleContactSales = () => {
    window.open('https://calendly.com/sselfie-enterprise', '_blank');
  };

  const handleGetStarted = () => {
    setLocation('/business');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
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
                onClick={() => setLocation("/business")}
                className="text-xs uppercase tracking-[0.3em] text-white/70 hover:text-white transition-all duration-300"
              >
                Business
              </button>
              <button
                onClick={() => setLocation("/api/login")}
                className="text-xs uppercase tracking-[0.3em] text-white/70 hover:text-white transition-all duration-300"
              >
                Login
              </button>
              <button
                onClick={handleContactSales}
                className="text-white border border-white/30 hover:bg-white hover:text-black transition-colors duration-300 text-xs tracking-[0.3em] uppercase px-8 py-3 font-light"
              >
                Contact Sales
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
                onClick={handleContactSales}
                className="text-white border border-white/30 hover:bg-white hover:text-black transition-colors duration-300 text-xs tracking-[0.3em] uppercase px-6 py-2 font-light"
              >
                Contact
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO - IMMEDIATE CLARITY */}
      <section className="relative min-h-screen flex items-center justify-center bg-black text-white overflow-hidden">
        <div className="absolute inset-0 opacity-50">
          <img 
            src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/undefined/undefined_1756382691095.png"
            alt="Professional team photos from phone selfies"
            className="w-full h-full object-cover object-center"
          />
        </div>
        
        <div className="relative z-10 text-center max-w-5xl px-4 sm:px-6 lg:px-8">
          
          <h1 
            className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light mb-6 tracking-[-0.02em] leading-none"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Professional Team Photos<br />
            <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-[0.3em] text-white/80 font-light">
              FROM PHONE SELFIES
            </span>
          </h1>
          
          <div className="w-16 h-px bg-white/30 mx-auto mb-8"></div>
          
          <p className="text-lg sm:text-xl md:text-2xl font-light mb-8 max-w-3xl mx-auto leading-relaxed">
            Stop coordinating expensive photoshoots.<br />
            Get consistent brand photos for your entire team monthly.
          </p>
          
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 mb-12 max-w-2xl mx-auto">
            <p className="text-base text-white/90 mb-2">Professional team photos vs coordinating photographers</p>
            <p className="text-sm text-white/70">Used by growing companies who got tired of the photoshoot circus</p>
          </div>
          
          <button 
            onClick={handleContactSales}
            className="bg-white text-black px-12 py-4 text-sm uppercase tracking-[0.3em] hover:bg-gray-100 transition-all font-medium mb-6"
          >
            GET TEAM PRICING
          </button>
          
          <p className="text-xs text-white/50 mt-6 tracking-wide">
            Custom setup for teams • Implementation in 2 weeks
          </p>
        </div>
      </section>

      {/* PROBLEM - Team Photo Pain Points */}
      <section className="py-20 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-12 gap-8 lg:gap-16">
            <div className="col-span-12 lg:col-span-7 flex items-center">
              <div className="max-w-2xl">
                <div className="text-xs uppercase tracking-[0.4em] text-gray-400 mb-8">
                  The Team Photo Reality
                </div>
                
                <h2 
                  className="font-serif text-3xl sm:text-4xl md:text-5xl font-light mb-12 text-black leading-tight"
                  style={{ fontFamily: "Times New Roman, serif" }}
                >
                  Coordinating team photoshoots<br />
                  is a nightmare.
                </h2>
                
                <div className="space-y-8">
                  <div className="border-l-2 border-gray-200 pl-6">
                    <h3 className="text-lg font-medium mb-2 text-black">Scheduling chaos</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Trying to coordinate 20+ people for one day. Someone's always traveling, sick, 
                      or just started. The photographer costs more than your marketing budget.
                    </p>
                  </div>
                  
                  <div className="border-l-2 border-gray-200 pl-6">
                    <h3 className="text-lg font-medium mb-2 text-black">Brand inconsistency</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Different departments hire different photographers. Website photos don't match 
                      LinkedIn photos. New hires use old selfies for months.
                    </p>
                  </div>
                  
                  <div className="border-l-2 border-gray-200 pl-6">
                    <h3 className="text-lg font-medium mb-2 text-black">Hidden costs</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Photographer fees, studio rental, employee time, retakes, rush orders for new hires. 
                      Suddenly you've spent more than payroll.
                    </p>
                  </div>
                </div>
                
                <div className="mt-12 p-6 bg-gray-50">
                  <p className="text-lg text-black font-medium italic" style={{ fontFamily: "Times New Roman, serif" }}>
                    "Meanwhile, your team avoids posting content because they hate their photos"
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-span-12 lg:col-span-5">
              <div className="relative h-[500px] overflow-hidden">
                <img
                  src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/42585527/maya_nxsdf9gfxdrma0crzzc87381t0_0_1756639025507.png"
                  alt="Team photo coordination struggles"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-white text-sm italic" style={{ fontFamily: "Times New Roman, serif" }}>
                    "Can everyone be here Thursday at 2pm?"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOLUTION - Clear Process */}
      <section className="py-20 sm:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-20">
            <div className="text-xs uppercase tracking-[0.4em] text-gray-400 mb-8">
              How it works for teams
            </div>
            <h2 
              className="font-serif text-3xl sm:text-4xl md:text-5xl font-light mb-6 text-black"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              Professional team photos<br />
              <span className="italic text-gray-600">without the coordination circus</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
            {/* Step 1 */}
            <div className="text-center">
              <div className="relative h-64 mb-8 overflow-hidden">
                <img
                  src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/42585527/maya_nxsdf9gfxdrma0crzzc87381t0_0_1756639025507.png"
                  alt="Team members upload selfies"
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
                Everyone uploads selfies
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Team members upload 15-20 phone selfies on their own time. 
                Home office, coffee shop, wherever they are.
              </p>
              <p className="text-sm text-gray-500 italic">
                "No scheduling required"
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="text-center">
              <div className="relative h-64 mb-8 overflow-hidden">
                <img
                  src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/42585527/maya_8r00hax7n1rm80cryjbs9enxam_0_1756450255292.png"
                  alt="AI creates consistent professional photos"
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
                AI creates consistent photos
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Everyone gets professional photos in the same style. 
                Same lighting, same background, same quality.
              </p>
              <p className="text-sm text-gray-500 italic">
                "Brand consistency automatically"
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="text-center">
              <div className="relative h-64 mb-8 overflow-hidden">
                <img
                  src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/42585527/maya_3hj19rf19xrmc0cryyz81tk7pg_0_1756503154230.png"
                  alt="Team gets fresh photos monthly"
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
                Fresh photos every month
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                New variations monthly. Website headers, LinkedIn profiles, 
                marketing materials. Everyone always has current photos.
              </p>
              <p className="text-sm text-gray-500 italic">
                "New hires get photos on day one"
              </p>
            </div>
          </div>
          
          <div className="text-center mt-16 bg-black text-white p-12">
            <p 
              className="text-xl font-light"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              Professional team photos monthly vs coordinating annual photoshoots
            </p>
          </div>
        </div>
      </section>

      {/* CREDIBILITY - Sandra's Story for Teams */}
      <section className="py-20 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative h-[500px] overflow-hidden">
              <img
                src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/42585527/maya_g826ygf2d9rm80crzjkvnvmpyr_0_1756585536824.png"
                alt="Sandra Sigurjónsdóttir"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-white text-sm font-light">Sandra Sigurjónsdóttir</p>
                <p className="text-white/80 text-sm italic">Built this from kitchen table</p>
              </div>
            </div>
            
            <div>
              <div className="text-xs uppercase tracking-[0.4em] text-gray-400 mb-8">
                Who built this
              </div>
              
              <h3 
                className="font-serif text-3xl sm:text-4xl font-light mb-8 text-black"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                Sandra Sigurjonsdottir
              </h3>
              <p className="text-lg text-gray-600 mb-8">Founder & Creator</p>
              
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="text-3xl font-light text-black">120K</p>
                  <p className="text-gray-600 text-sm">Built using this exact method</p>
                </div>
                
                <div>
                  <p className="text-3xl font-light text-black">3 kids</p>
                  <p className="text-gray-600 text-sm">Single mom when I started</p>
                </div>
              </div>
              
              <div className="space-y-6 text-gray-700 leading-relaxed">
                <p>
                  Started as a team of one. Me, building a business from my kitchen table. 
                  Needed professional photos but couldn't afford them.
                </p>
                
                <p>
                  Now I'm watching companies spend thousands coordinating photoshoots 
                  when their teams could have perfect photos from their phones.
                </p>
                
                <p className="font-medium text-black">
                  Your team doesn't need another complicated process.
                </p>
              </div>
              
              <div className="mt-8 p-6 bg-gray-50 border-l-4 border-black">
                <p className="text-black italic" style={{ fontFamily: "Times New Roman, serif" }}>
                  "Professional photos shouldn't require a professional photographer."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT THIS MEANS FOR TEAMS */}
      <section className="py-20 sm:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="text-xs uppercase tracking-[0.4em] text-gray-400 mb-8">
              What this means for your team
            </div>
            <h2 
              className="font-serif text-3xl sm:text-4xl md:text-5xl font-light mb-6 text-black"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              Never coordinate another<br />
              photoshoot
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional photos that actually look like your people
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="flex items-start">
                <div className="w-1 h-8 bg-black mr-6 mt-1"></div>
                <div>
                  <h3 className="text-lg font-medium mb-2 text-black">Brand consistency</h3>
                  <p className="text-gray-600">
                    Everyone's photos match. Same quality, same style, same professional look. 
                    Your brand looks cohesive across all platforms.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-1 h-8 bg-black mr-6 mt-1"></div>
                <div>
                  <h3 className="text-lg font-medium mb-2 text-black">New hires ready immediately</h3>
                  <p className="text-gray-600">
                    Fresh photos on day one. No waiting weeks for photographer availability. 
                    New team members look professional from the start.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-1 h-8 bg-black mr-6 mt-1"></div>
                <div>
                  <h3 className="text-lg font-medium mb-2 text-black">Team actually wants to post</h3>
                  <p className="text-gray-600">
                    When people have great photos, they use them. More LinkedIn posts, 
                    more conference speakers, more confident online presence.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-1 h-8 bg-black mr-6 mt-1"></div>
                <div>
                  <h3 className="text-lg font-medium mb-2 text-black">Zero coordination required</h3>
                  <p className="text-gray-600">
                    No scheduling, no studio bookings, no herding cats. 
                    People upload selfies whenever works for them.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="bg-white border-2 border-black p-8">
                <div className="text-center border-b border-gray-200 pb-6 mb-6">
                  <h3 
                    className="font-serif text-2xl font-light mb-2 text-black"
                    style={{ fontFamily: "Times New Roman, serif" }}
                  >
                    Team Photography
                  </h3>
                  <p className="text-gray-600 mb-4">Custom pricing based on team size</p>
                  <p className="text-sm text-gray-500">vs coordinating expensive annual photoshoots</p>
                </div>
                <button 
                  onClick={handleContactSales}
                  className="w-full bg-black text-white py-4 text-sm uppercase tracking-[0.3em] hover:bg-gray-800 transition-all font-light"
                >
                  GET TEAM PRICING
                </button>
                <p className="text-xs text-gray-500 text-center mt-4">Custom setup • Implementation in 2 weeks</p>
              </div>
              
              <div className="bg-gray-100 border border-gray-200 p-8">
                <div className="text-center border-b border-gray-200 pb-6 mb-6">
                  <h3 
                    className="font-serif text-2xl font-light mb-2 text-black"
                    style={{ fontFamily: "Times New Roman, serif" }}
                  >
                    Individual Plans
                  </h3>
                  <p className="text-gray-600">For entrepreneurs and solopreneurs</p>
                </div>
                <button 
                  onClick={handleGetStarted}
                  className="w-full border border-black text-black py-4 text-sm uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-all font-light"
                >
                  See Individual Plans
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative py-24 sm:py-32 bg-black text-white overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img
            src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/42585527/maya_rr4fnv2rb5rm80crzyd87jm48g_0_1756634973175.png"
            alt="Professional team transformation"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-xs uppercase tracking-[0.4em] text-white/70 mb-8">
            Professional Team Photos
          </div>
          
          <h2 
            className="font-serif text-4xl sm:text-5xl md:text-6xl font-light mb-8 text-white"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Stop coordinating.<br />
            <span className="italic">Start getting photos.</span>
          </h2>
          
          <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
            Professional team photos from phone selfies. Custom setup for your company size.
          </p>
          
          <button 
            onClick={handleContactSales}
            className="bg-white text-black px-12 py-4 text-sm uppercase tracking-[0.3em] hover:bg-gray-100 transition-all font-medium"
          >
            GET TEAM PRICING
          </button>
          
          <p className="text-xs text-white/50 mt-6 tracking-wide">
            Custom implementation • Team setup in 2 weeks
          </p>
        </div>
      </section>

      <GlobalFooter />
    </div>
  );
}