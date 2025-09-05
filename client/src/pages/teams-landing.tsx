import { useState, useEffect } from 'react';
import { useLocation } from "wouter";
import { GlobalFooter } from '../components/global-footer';

export default function TeamsLanding() {
  const [, setLocation] = useLocation();

  // SEO Meta Tags
  useEffect(() => {
    document.title = "Enterprise Photography Solution | SSELFIE Teams - Single Mom Built Solution";
    
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Enterprise photography solution built by single mother Sandra. Replace traditional photoshoot budgets with AI-generated professional team photos. Timeline varies by company size.');
  }, []);

  const handleContactSales = () => {
    window.open('https://calendly.com/sselfie-enterprise', '_blank');
  };

  const handleGetStarted = () => {
    setLocation("/simple-checkout");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div 
              className="font-serif text-xl font-light tracking-wide text-white cursor-pointer"
              style={{ fontFamily: "Times New Roman, serif" }}
              onClick={() => setLocation("/")}
            >
              SSELFIE<span className="text-sm ml-2 opacity-70">TEAMS</span>
            </div>
            <div className="flex items-center space-x-6">
              <button
                onClick={() => setLocation("/login")}
                className="text-white hover:text-gray-300 transition-colors text-sm"
              >
                Login
              </button>
              <button
                onClick={handleContactSales}
                className="text-white border border-white/30 hover:bg-white hover:text-black transition-colors duration-300 text-xs tracking-[0.3em] uppercase px-6 py-2 font-light"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO - Authentic Story */}
      <section className="relative min-h-screen flex items-center justify-center bg-black text-white overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <img 
            src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/42585527/maya_g826ygf2d9rm80crzjkvnvmpyr_0_1756585536824.png"
            alt="Professional team photography solution"
            className="w-full h-full object-cover object-center"
          />
        </div>
        
        <div className="relative z-10 text-center max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-xs uppercase tracking-[0.4em] text-white/70 mb-8">
            Enterprise Photography
          </div>
          
          <h1 
            className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light mb-8 tracking-[-0.02em] leading-none"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Replace Traditional<br />
            <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-[0.3em] text-white/80 font-light">
              PHOTOSHOOT BUDGETS
            </span>
          </h1>
          
          <div className="w-16 h-px bg-white/30 mx-auto mb-8"></div>
          
          <p className="text-lg sm:text-xl md:text-2xl font-light mb-12 max-w-4xl mx-auto leading-relaxed">
            Professional team photos generated in 20 minutes.<br />
            Built by single mother who needed this solution herself.
          </p>
          
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-8 mb-12 max-w-3xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-light mb-2">Traditional</div>
                <div className="text-sm text-white/70">Weeks of coordination</div>
              </div>
              <div>
                <div className="text-2xl font-light mb-2">vs SSELFIE</div>
                <div className="text-sm text-white/70">20 minutes per employee</div>
              </div>
              <div>
                <div className="text-2xl font-light mb-2">Cost Savings</div>
                <div className="text-sm text-white/70">Significant reduction</div>
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleContactSales}
            className="group inline-block mb-8"
          >
            <span className="text-sm uppercase tracking-[0.3em] text-white border border-white/30 px-12 py-4 group-hover:bg-white group-hover:text-black transition-all duration-300 font-light">
              Discuss Your Requirements
            </span>
          </button>
          
          <p className="text-xs text-white/50 mt-6 tracking-wide">
            Timeline varies by company size and employee count
          </p>
        </div>
      </section>

      {/* REAL COST COMPARISON */}
      <section className="py-20 sm:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="text-xs uppercase tracking-[0.4em] text-gray-400 mb-8">
              Cost Analysis
            </div>
            <h2 
              className="font-serif text-3xl sm:text-4xl md:text-5xl font-light mb-8 text-black"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              Traditional vs AI<br />
              <span className="italic text-gray-600">photography costs</span>
            </h2>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Traditional Costs */}
            <div className="bg-gray-50 p-8 border-l-4 border-gray-400">
              <h3 className="text-xl font-medium mb-6 text-black">Traditional Photography Process</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Photographer booking and coordination</span>
                  <span className="font-medium">Time intensive</span>
                </div>
                <div className="flex justify-between">
                  <span>Location setup and scheduling</span>
                  <span className="font-medium">Multiple days</span>
                </div>
                <div className="flex justify-between">
                  <span>Employee time away from work</span>
                  <span className="font-medium">Productivity loss</span>
                </div>
                <div className="flex justify-between">
                  <span>Post-processing and delivery delays</span>
                  <span className="font-medium">2-3 weeks</span>
                </div>
                <div className="flex justify-between">
                  <span>Inconsistent results across sessions</span>
                  <span className="font-medium">Brand challenges</span>
                </div>
              </div>
            </div>
            
            {/* SSELFIE Approach */}
            <div className="bg-gray-50 p-8 border-l-4 border-black">
              <h3 className="text-xl font-medium mb-6 text-black">SSELFIE Teams Process</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Employee uploads selfies remotely</span>
                  <span className="font-medium">5 minutes</span>
                </div>
                <div className="flex justify-between">
                  <span>AI training per employee</span>
                  <span className="font-medium">Automated</span>
                </div>
                <div className="flex justify-between">
                  <span>Professional photos generated</span>
                  <span className="font-medium">20 minutes</span>
                </div>
                <div className="flex justify-between">
                  <span>Consistent brand style</span>
                  <span className="font-medium">Guaranteed</span>
                </div>
                <div className="flex justify-between">
                  <span>New employee onboarding</span>
                  <span className="font-medium">Same day</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <button 
              onClick={handleContactSales}
              className="bg-black text-white px-8 py-3 hover:bg-gray-800 transition-all text-sm uppercase tracking-[0.3em] font-light"
            >
              Get Custom Quote
            </button>
          </div>
        </div>
      </section>

      {/* FOUNDER STORY - Authentic */}
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
                Built by a single mother<br />
                <span className="italic text-gray-600">who needed this solution</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="text-3xl font-light text-black">3 Children</p>
                  <p className="text-gray-600 text-sm">Single mother building this startup</p>
                </div>
                
                <div>
                  <p className="text-3xl font-light text-black">Kitchen Table</p>
                  <p className="text-gray-600 text-sm">Where this enterprise solution began</p>
                </div>
              </div>
              
              <blockquote 
                className="text-xl italic text-black mb-8 border-l-2 border-gray-300 pl-6"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                "I built this because professional team photography was financially impossible for my startup, yet we needed professional imagery to compete. Now I'm enabling other companies to solve the same challenge."
              </blockquote>
              
              <div className="bg-white p-6 border-l-4 border-black">
                <p className="text-gray-700 leading-relaxed">
                  <span className="font-medium">Started with zero enterprise experience.</span> Built this solution out of necessity while raising three children alone. Now serving companies who face the same budget constraints we overcame.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REALISTIC IMPLEMENTATION */}
      <section className="py-20 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="text-xs uppercase tracking-[0.4em] text-gray-400 mb-8">
              Implementation
            </div>
            <h2 
              className="font-serif text-3xl sm:text-4xl md:text-5xl font-light mb-8 text-black"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              Timeline depends on<br />
              <span className="italic text-gray-600">your company size</span>
            </h2>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We don't make unrealistic promises. Implementation time varies based on employee count, security requirements, and AI training needs.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {/* Small Companies */}
              <div className="flex items-start">
                <div className="w-32 h-24 bg-gray-100 border border-gray-300 flex items-center justify-center text-lg font-light mr-8 flex-shrink-0">
                  <div className="text-center">
                    <div className="text-sm">5-25</div>
                    <div className="text-xs text-gray-600">employees</div>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-medium mb-3 text-black">Small Team Setup</h3>
                  <p className="text-gray-600 mb-4">Typically 1-2 weeks depending on security review requirements and employee photo collection speed.</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Security assessment</li>
                    <li>• Employee photo collection</li>
                    <li>• AI model training</li>
                    <li>• Admin training</li>
                  </ul>
                </div>
              </div>
              
              {/* Medium Companies */}
              <div className="flex items-start">
                <div className="w-32 h-24 bg-gray-100 border border-gray-300 flex items-center justify-center text-lg font-light mr-8 flex-shrink-0">
                  <div className="text-center">
                    <div className="text-sm">25-100</div>
                    <div className="text-xs text-gray-600">employees</div>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-medium mb-3 text-black">Medium Enterprise</h3>
                  <p className="text-gray-600 mb-4">Usually 2-4 weeks with additional coordination for larger teams and more complex security requirements.</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Extended security review</li>
                    <li>• Department-by-department rollout</li>
                    <li>• Multiple AI model training sessions</li>
                    <li>• Comprehensive admin training</li>
                  </ul>
                </div>
              </div>
              
              {/* Large Companies */}
              <div className="flex items-start">
                <div className="w-32 h-24 bg-gray-100 border border-gray-300 flex items-center justify-center text-lg font-light mr-8 flex-shrink-0">
                  <div className="text-center">
                    <div className="text-sm">100+</div>
                    <div className="text-xs text-gray-600">employees</div>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-medium mb-3 text-black">Large Enterprise</h3>
                  <p className="text-gray-600 mb-4">Timeline varies significantly based on IT policies, compliance requirements, and integration needs. We work with your timeline.</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Comprehensive security audit</li>
                    <li>• Phased rollout by division</li>
                    <li>• Custom integration development</li>
                    <li>• Ongoing support planning</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="mt-12 p-8 bg-gray-50 border border-gray-200">
              <div className="text-center">
                <h4 className="text-lg font-medium mb-4">Honest Timeline Discussion</h4>
                <p className="text-gray-600 mb-6">
                  During our initial call, we'll give you a realistic timeline based on your specific situation. No false promises or unrealistic guarantees.
                </p>
                <button 
                  onClick={handleContactSales}
                  className="bg-black text-white px-8 py-3 hover:bg-gray-800 transition-all text-sm uppercase tracking-[0.3em] font-light"
                >
                  Discuss Your Timeline
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA - Authentic Call to Action */}
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
            Built by entrepreneurs,<br />
            <span className="italic text-white/70">for entrepreneurs</span>
          </h2>
          
          <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
            Let's discuss your team photography needs honestly. No sales pressure, just real solutions for real budget constraints.
          </p>
          
          <button 
            onClick={handleContactSales}
            className="group inline-block mb-8"
          >
            <span className="text-sm uppercase tracking-[0.3em] text-white border border-white/30 px-12 py-4 group-hover:bg-white group-hover:text-black transition-all duration-300 font-light">
              Start Conversation
            </span>
          </button>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-2xl font-light mb-2">20min</p>
              <p className="text-xs text-white/70 uppercase tracking-wide">Per Employee</p>
            </div>
            <div>
              <p className="text-2xl font-light mb-2">Varies</p>
              <p className="text-xs text-white/70 uppercase tracking-wide">Timeline</p>
            </div>
            <div>
              <p className="text-2xl font-light mb-2">Honest</p>
              <p className="text-xs text-white/70 uppercase tracking-wide">Approach</p>
            </div>
            <div>
              <p className="text-2xl font-light mb-2">Real</p>
              <p className="text-xs text-white/70 uppercase tracking-wide">Solutions</p>
            </div>
          </div>
        </div>
      </section>

      <GlobalFooter />
    </div>
  );
}