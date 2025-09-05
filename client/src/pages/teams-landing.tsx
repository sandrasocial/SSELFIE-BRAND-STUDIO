import { useState, useEffect } from 'react';
import { useLocation } from "wouter";
import { GlobalFooter } from '../components/global-footer';

export default function TeamsLanding() {
  const [, setLocation] = useLocation();

  // SEO Meta Tags
  useEffect(() => {
    document.title = "SSELFIE Studio for Teams - Enterprise AI Photography Solutions";
    
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Professional AI photography for your entire team. Custom branded dashboard, trained models for all employees, done-for-you service. Replace €10K+ photoshoot budgets.');
  }, []);

  const handleContactSales = () => {
    // For now, redirect to a contact form or calendar booking
    window.open('https://calendly.com/sselfie-teams', '_blank');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Enterprise Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div 
              className="font-serif text-xl font-light tracking-wide text-white cursor-pointer"
              style={{ fontFamily: "Times New Roman, serif" }}
              onClick={() => setLocation("/")}
            >
              SSELFIE<span className="text-sm ml-2 opacity-70">FOR TEAMS</span>
            </div>
            <button
              onClick={handleContactSales}
              className="text-white border border-white/30 hover:bg-white hover:text-black transition-colors duration-300 text-xs tracking-[0.3em] uppercase px-8 py-3 font-light"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </nav>

      {/* HERO - Enterprise Focus */}
      <section className="relative min-h-screen flex items-center justify-center bg-black text-white overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <img 
            src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/undefined/undefined_1756382691095.png"
            alt="Professional team photography solutions"
            className="w-full h-full object-cover object-center"
          />
        </div>
        
        <div className="relative z-10 text-center max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-xs uppercase tracking-[0.4em] text-white/70 mb-8 font-light">
            Done-For-You Enterprise Service
          </div>
          
          <h1 
            className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light mb-8 tracking-[-0.02em] leading-none"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Professional Photos<br />
            <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-[0.3em] text-white/80 font-light">
              FOR YOUR ENTIRE TEAM
            </span>
          </h1>
          
          <div className="w-16 h-px bg-white/30 mx-auto mb-8"></div>
          
          <p className="text-lg sm:text-xl md:text-2xl font-light mb-12 max-w-4xl mx-auto leading-relaxed">
            We train AI models for every employee.<br />
            Custom company dashboard with your brand guidelines.<br />
            <span className="text-white/80">You get unlimited professional photos. We handle everything.</span>
          </p>
          
          <div className="space-y-6 mb-12">
            <div className="flex items-center justify-center space-x-8 text-sm text-white/60">
              <span>Replace €10K+ Annual Budgets</span>
              <span>•</span>
              <span>Done-For-You Service</span>
              <span>•</span>
              <span>Custom Implementation</span>
            </div>
          </div>
          
          <button 
            onClick={handleContactSales}
            className="group inline-block mb-6"
          >
            <span className="text-xs uppercase tracking-[0.3em] text-white border-b border-white/30 pb-2 group-hover:border-white transition-all duration-300 font-light">
              Schedule Enterprise Consultation
            </span>
          </button>
          
          <p className="text-xs text-white/50 mt-6 tracking-wide">
            Custom pricing from €500/month • Full-service implementation
          </p>
        </div>
      </section>

      {/* WHAT YOU GET - Clear Value */}
      <section className="py-20 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="text-xs uppercase tracking-[0.4em] text-gray-400 mb-8">
              What You Get
            </div>
            <h2 
              className="font-serif text-3xl sm:text-4xl md:text-5xl font-light mb-8 text-black"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              Everything handled for you.<br />
              <span className="italic text-gray-600">Professional results guaranteed.</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
            {/* Service 1 */}
            <div className="text-center">
              <div className="relative h-64 mb-8 overflow-hidden">
                <img
                  src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/42585527/maya_nxsdf9gfxdrma0crzzc87381t0_0_1756639025507.png"
                  alt="AI model training service"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute top-6 left-6 w-12 h-12 bg-black text-white flex items-center justify-center text-lg font-light">
                  01
                </div>
              </div>
              <h3 
                className="font-serif text-xl mb-4 text-black font-light"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                Employee Model Training
              </h3>
              <p className="text-gray-600 leading-relaxed">
                We collect selfies from every team member and train individual AI models. 
                Completely managed by our specialists.
              </p>
              <p className="text-sm text-gray-500 italic mt-3">
                No work required from your team
              </p>
            </div>
            
            {/* Service 2 */}
            <div className="text-center">
              <div className="relative h-64 mb-8 overflow-hidden">
                <img
                  src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/42585527/maya_8r00hax7n1rm80cryjbs9enxam_0_1756450255292.png"
                  alt="Custom brand integration"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute top-6 left-6 w-12 h-12 bg-black text-white flex items-center justify-center text-lg font-light">
                  02
                </div>
              </div>
              <h3 
                className="font-serif text-xl mb-4 text-black font-light"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                Custom Brand Integration
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Your company colors, style guidelines, and brand aesthetic programmed 
                into Maya AI for consistent team photos.
              </p>
              <p className="text-sm text-gray-500 italic mt-3">
                Perfect brand consistency across all employees
              </p>
            </div>
            
            {/* Service 3 */}
            <div className="text-center">
              <div className="relative h-64 mb-8 overflow-hidden">
                <img
                  src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/42585527/maya_3hj19rf19xrmc0cryyz81tk7pg_0_1756503154230.png"
                  alt="Company dashboard"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute top-6 left-6 w-12 h-12 bg-black text-white flex items-center justify-center text-lg font-light">
                  03
                </div>
              </div>
              <h3 
                className="font-serif text-xl mb-4 text-black font-light"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                Company Dashboard
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Custom admin portal where managers can generate photos for any employee, 
                download brand-compliant images, and manage the entire team.
              </p>
              <p className="text-sm text-gray-500 italic mt-3">
                Full control and oversight for leadership
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM - Enterprise Pain Points */}
      <section className="py-20 sm:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-12 gap-8 lg:gap-16">
            <div className="col-span-12 lg:col-span-7 flex items-center">
              <div className="max-w-2xl">
                <div className="text-xs uppercase tracking-[0.4em] text-gray-400 mb-8">
                  The Problem
                </div>
                
                <h2 
                  className="font-serif text-3xl sm:text-4xl md:text-5xl font-light mb-12 text-black leading-tight"
                  style={{ fontFamily: "Times New Roman, serif" }}
                >
                  Team photography<br />
                  is expensive and inefficient
                </h2>
                
                <div className="space-y-10">
                  <div className="border-l-4 border-black pl-8">
                    <h3 className="text-xl font-medium mb-3 text-black">€10,000+ Annual Budgets</h3>
                    <p className="text-gray-600 leading-relaxed text-lg">
                      Team photoshoots cost thousands. Every new hire requires additional sessions. 
                      Budget increases with company growth.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-black pl-8">
                    <h3 className="text-xl font-medium mb-3 text-black">Coordination Nightmare</h3>
                    <p className="text-gray-600 leading-relaxed text-lg">
                      Scheduling 20+ employees. Location booking. Wardrobe coordination. 
                      Weeks of back-and-forth with photographers.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-black pl-8">
                    <h3 className="text-xl font-medium mb-3 text-black">Inconsistent Results</h3>
                    <p className="text-gray-600 leading-relaxed text-lg">
                      Different photographers mean different styles. Your team looks disjointed 
                      across website, LinkedIn, marketing materials.
                    </p>
                  </div>
                </div>
                
                <div className="mt-12 p-8 bg-white border-l-4 border-gray-300">
                  <p className="text-xl text-black font-medium italic" style={{ fontFamily: "Times New Roman, serif" }}>
                    "While you coordinate photoshoots, competitors publish consistent content daily"
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-span-12 lg:col-span-5">
              <div className="relative h-[600px] overflow-hidden">
                <img
                  src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/42585527/maya_nxsdf9gfxdrma0crzzc87381t0_0_1756639025507.png"
                  alt="Corporate photography challenges"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-8 left-8 right-8">
                  <p className="text-white text-lg italic" style={{ fontFamily: "Times New Roman, serif" }}>
                    "€15,000 budget, 6 weeks coordination, inconsistent results"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING - High Ticket Packages */}
      <section className="py-20 sm:py-32 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="text-xs uppercase tracking-[0.4em] text-white/70 mb-8">
              Investment
            </div>
            <h2 
              className="font-serif text-3xl sm:text-4xl md:text-5xl font-light mb-8 text-white"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              Professional service pricing<br />
              <span className="italic text-white/70">that replaces €10K+ budgets</span>
            </h2>
            <div className="w-16 h-px bg-white/30 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter Package */}
            <div className="border border-white/20 p-8 text-center">
              <h3 
                className="font-serif text-2xl font-light mb-4"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                Starter Team
              </h3>
              <div className="text-4xl font-light mb-4">€500</div>
              <div className="text-sm text-white/70 mb-8">monthly • 5-15 employees</div>
              
              <ul className="text-left space-y-3 text-sm text-white/80 mb-8">
                <li>• AI models for all employees</li>
                <li>• Basic company dashboard</li>
                <li>• Standard brand integration</li>
                <li>• 50 photos per employee monthly</li>
                <li>• Email support</li>
              </ul>
              
              <button 
                onClick={handleContactSales}
                className="w-full border border-white/30 hover:bg-white hover:text-black transition-colors duration-300 text-xs tracking-[0.3em] uppercase px-6 py-3 font-light"
              >
                Get Started
              </button>
            </div>
            
            {/* Professional Package */}
            <div className="border-2 border-white p-8 text-center relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-white text-black px-4 py-1 text-xs uppercase tracking-wide">
                Most Popular
              </div>
              <h3 
                className="font-serif text-2xl font-light mb-4"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                Professional Team
              </h3>
              <div className="text-4xl font-light mb-4">€1,200</div>
              <div className="text-sm text-white/70 mb-8">monthly • 15-50 employees</div>
              
              <ul className="text-left space-y-3 text-sm text-white/80 mb-8">
                <li>• AI models for all employees</li>
                <li>• Custom company dashboard</li>
                <li>• Full brand guideline integration</li>
                <li>• 100 photos per employee monthly</li>
                <li>• Dedicated account manager</li>
                <li>• Custom Maya agent training</li>
                <li>• Priority support</li>
              </ul>
              
              <button 
                onClick={handleContactSales}
                className="w-full bg-white text-black hover:bg-white/90 transition-colors duration-300 text-xs tracking-[0.3em] uppercase px-6 py-3 font-medium"
              >
                Contact Sales
              </button>
            </div>
            
            {/* Enterprise Package */}
            <div className="border border-white/20 p-8 text-center">
              <h3 
                className="font-serif text-2xl font-light mb-4"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                Enterprise
              </h3>
              <div className="text-4xl font-light mb-4">Custom</div>
              <div className="text-sm text-white/70 mb-8">50+ employees</div>
              
              <ul className="text-left space-y-3 text-sm text-white/80 mb-8">
                <li>• Everything in Professional</li>
                <li>• White-label dashboard</li>
                <li>• API access</li>
                <li>• Unlimited photos</li>
                <li>• Custom integrations</li>
                <li>• On-site training session</li>
                <li>• 24/7 premium support</li>
              </ul>
              
              <button 
                onClick={handleContactSales}
                className="w-full border border-white/30 hover:bg-white hover:text-black transition-colors duration-300 text-xs tracking-[0.3em] uppercase px-6 py-3 font-light"
              >
                Contact Sales
              </button>
            </div>
          </div>
          
          <div className="text-center mt-16">
            <p className="text-white/60 text-sm">
              All packages include setup, training, and ongoing support.<br />
              Replace your annual photography budget with monthly professional service.
            </p>
          </div>
        </div>
      </section>

      {/* CTA - Contact Sales */}
      <section className="py-20 sm:py-32 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 
            className="font-serif text-3xl sm:text-4xl md:text-5xl font-light mb-8 text-black"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Ready to transform<br />
            your team's photography?
          </h2>
          
          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Schedule a consultation. We'll discuss your team size, brand guidelines, 
            and create a custom implementation plan.
          </p>
          
          <button 
            onClick={handleContactSales}
            className="inline-block bg-black text-white hover:bg-gray-800 transition-colors duration-300 text-xs tracking-[0.3em] uppercase px-12 py-4 font-light"
          >
            Schedule Enterprise Consultation
          </button>
          
          <p className="text-sm text-gray-500 mt-6">
            30-minute strategy session • Custom quote • Implementation timeline
          </p>
        </div>
      </section>

      <GlobalFooter />
    </div>
  );
}