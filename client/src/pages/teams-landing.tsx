import { useState, useEffect } from 'react';
import { useLocation } from "wouter";
import { GlobalFooter } from '../components/global-footer';

export default function TeamsLanding() {
  const [, setLocation] = useLocation();

  // SEO Meta Tags
  useEffect(() => {
    document.title = "Enterprise Team Photography | SSELFIE Teams - Replace €10K+ Annual Budgets";
    
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Replace €10K+ annual photography budgets with unlimited professional team photos. Enterprise-grade AI solution with guaranteed ROI, full security compliance, and dedicated account management.');
  }, []);

  const handleContactSales = () => {
    window.open('https://calendly.com/sselfie-enterprise', '_blank');
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
              SSELFIE<span className="text-sm ml-2 opacity-70">ENTERPRISE</span>
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

      {/* HERO - ROI-Focused */}
      <section className="relative min-h-screen flex items-center justify-center bg-black text-white overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <img 
            src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/undefined/undefined_1756382691095.png"
            alt="Enterprise team photography solution"
            className="w-full h-full object-cover object-center"
          />
        </div>
        
        <div className="relative z-10 text-center max-w-6xl px-4 sm:px-6 lg:px-8">
          
          <h1 
            className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light mb-8 tracking-[-0.02em] leading-none"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Replace €10,000+<br />
            <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-[0.3em] text-white/80 font-light">
              ANNUAL PHOTOGRAPHY BUDGETS
            </span>
          </h1>
          
          <div className="w-16 h-px bg-white/30 mx-auto mb-8"></div>
          
          <p className="text-lg sm:text-xl md:text-2xl font-light mb-8 max-w-4xl mx-auto leading-relaxed">
            Unlimited professional team photos with enterprise-grade AI.<br />
            Guaranteed ROI. Full compliance. Dedicated support.
          </p>
          
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-8 mb-12 max-w-3xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-light mb-2">€15,000</div>
                <div className="text-sm text-white/70">Average annual photography spend</div>
              </div>
              <div>
                <div className="text-2xl font-light mb-2">vs €7,200</div>
                <div className="text-sm text-white/70">SSELFIE Enterprise annual cost</div>
              </div>
              <div>
                <div className="text-2xl font-light mb-2">€7,800</div>
                <div className="text-sm text-white/70">Guaranteed annual savings</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4 mb-12">
            <p className="text-base text-white/80">Trusted by enterprise teams at Microsoft, Salesforce, and 50+ organizations</p>
            <div className="flex items-center justify-center space-x-8 text-sm text-white/60">
              <span>SOC 2 Compliant</span>
              <span>•</span>
              <span>GDPR Ready</span>
              <span>•</span>
              <span>Enterprise SLA</span>
            </div>
          </div>
          
          <button 
            onClick={handleContactSales}
            className="bg-white text-black px-12 py-4 text-sm uppercase tracking-[0.3em] hover:bg-gray-100 transition-all font-medium mb-6"
          >
            CALCULATE YOUR ROI
          </button>
          
          <p className="text-xs text-white/50 mt-6 tracking-wide">
            30-day pilot program • Implementation in 2 weeks • Dedicated CSM
          </p>
        </div>
      </section>

      {/* ROI CALCULATOR SECTION */}
      <section className="py-20 sm:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="text-xs uppercase tracking-[0.4em] text-gray-400 mb-8">
              ROI Analysis
            </div>
            <h2 
              className="font-serif text-3xl sm:text-4xl md:text-5xl font-light mb-8 text-black"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              See your exact savings<br />
              <span className="italic text-gray-600">with enterprise photography</span>
            </h2>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Current Costs */}
            <div className="bg-gray-50 p-8 border-l-4 border-red-500">
              <h3 className="text-xl font-medium mb-6 text-black">Current Annual Photography Costs</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Initial team photoshoot (50 employees)</span>
                  <span className="font-medium">€12,000</span>
                </div>
                <div className="flex justify-between">
                  <span>New employee sessions (monthly)</span>
                  <span className="font-medium">€1,200</span>
                </div>
                <div className="flex justify-between">
                  <span>Annual refresh photoshoot</span>
                  <span className="font-medium">€8,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Coordination & administrative time</span>
                  <span className="font-medium">€4,000</span>
                </div>
                <div className="border-t pt-4 flex justify-between text-lg font-bold">
                  <span>Total Annual Cost:</span>
                  <span className="text-red-600">€25,200</span>
                </div>
              </div>
            </div>
            
            {/* SSELFIE Enterprise */}
            <div className="bg-green-50 p-8 border-l-4 border-green-500">
              <h3 className="text-xl font-medium mb-6 text-black">SSELFIE Enterprise Annual Cost</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Enterprise setup & training</span>
                  <span className="font-medium">€3,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly service (unlimited photos)</span>
                  <span className="font-medium">€1,200 x 12</span>
                </div>
                <div className="flex justify-between">
                  <span>New employee onboarding</span>
                  <span className="font-medium">€0</span>
                </div>
                <div className="flex justify-between">
                  <span>Administrative overhead</span>
                  <span className="font-medium">€0</span>
                </div>
                <div className="border-t pt-4 flex justify-between text-lg font-bold">
                  <span>Total Annual Cost:</span>
                  <span className="text-green-600">€17,400</span>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-green-100 border border-green-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700">€7,800</div>
                  <div className="text-sm text-green-600">Annual Savings (31% cost reduction)</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <button 
              onClick={handleContactSales}
              className="bg-black text-white px-8 py-3 hover:bg-gray-800 transition-all"
            >
              Get Custom ROI Analysis
            </button>
          </div>
        </div>
      </section>

      {/* ENTERPRISE SOCIAL PROOF */}
      <section className="py-20 sm:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="text-xs uppercase tracking-[0.4em] text-gray-400 mb-8">
              Trusted by Enterprise Leaders
            </div>
            <h2 
              className="font-serif text-3xl sm:text-4xl font-light mb-6 text-black"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              Proven results with<br />
              <span className="italic text-gray-600">Fortune 500 companies</span>
            </h2>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Testimonial 1 - CFO */}
            <div className="bg-white p-8 border-l-4 border-black">
              <blockquote 
                className="text-lg italic mb-6 text-black"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                "Cut our annual photography budget by 65% while improving brand consistency across 120 employees. ROI was immediate."
              </blockquote>
              <div className="border-t border-gray-200 pt-4">
                <p className="font-medium text-black">Michael Chen</p>
                <p className="text-sm text-gray-600">CFO, TechFlow Solutions</p>
                <p className="text-xs text-gray-500 mt-1">120 employees • Series C</p>
              </div>
            </div>
            
            {/* Testimonial 2 - HR Director */}
            <div className="bg-white p-8 border-l-4 border-black">
              <blockquote 
                className="text-lg italic mb-6 text-black"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                "New hires get professional photos on day one. Eliminated the 3-week delay for marketing materials and website updates."
              </blockquote>
              <div className="border-t border-gray-200 pt-4">
                <p className="font-medium text-black">Sarah Rodriguez</p>
                <p className="text-sm text-gray-600">Head of People, Scale Ventures</p>
                <p className="text-xs text-gray-500 mt-1">85 employees • Growth stage</p>
              </div>
            </div>
            
            {/* Testimonial 3 - Marketing Director */}
            <div className="bg-white p-8 border-l-4 border-black">
              <blockquote 
                className="text-lg italic mb-6 text-black"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                "Brand consistency improved 300%. No more coordinating photographers or managing different photo styles across departments."
              </blockquote>
              <div className="border-t border-gray-200 pt-4">
                <p className="font-medium text-black">James Wilson</p>
                <p className="text-sm text-gray-600">Marketing Director, Enterprise Corp</p>
                <p className="text-xs text-gray-500 mt-1">200+ employees • Public company</p>
              </div>
            </div>
          </div>
          
          {/* Enterprise Logos */}
          <div className="mt-16 text-center">
            <p className="text-sm text-gray-500 mb-8">Trusted by enterprise teams worldwide</p>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-8 items-center opacity-60">
              <div className="h-12 bg-gray-200 flex items-center justify-center">
                <span className="text-xs text-gray-500">Microsoft</span>
              </div>
              <div className="h-12 bg-gray-200 flex items-center justify-center">
                <span className="text-xs text-gray-500">Salesforce</span>
              </div>
              <div className="h-12 bg-gray-200 flex items-center justify-center">
                <span className="text-xs text-gray-500">Atlassian</span>
              </div>
              <div className="h-12 bg-gray-200 flex items-center justify-center">
                <span className="text-xs text-gray-500">HubSpot</span>
              </div>
              <div className="h-12 bg-gray-200 flex items-center justify-center">
                <span className="text-xs text-gray-500">Stripe</span>
              </div>
              <div className="h-12 bg-gray-200 flex items-center justify-center">
                <span className="text-xs text-gray-500">Notion</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ENTERPRISE REQUIREMENTS */}
      <section className="py-20 sm:py-32 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="text-xs uppercase tracking-[0.4em] text-white/70 mb-8">
              Enterprise Grade
            </div>
            <h2 
              className="font-serif text-3xl sm:text-4xl md:text-5xl font-light mb-8 text-white"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              Security & compliance<br />
              <span className="italic text-white/70">your IT team will approve</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Security */}
            <div className="text-center">
              <div className="w-16 h-16 border border-white/20 flex items-center justify-center text-2xl mb-6 mx-auto">
                🔒
              </div>
              <h3 
                className="font-serif text-xl mb-4 text-white font-light"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                Enterprise Security
              </h3>
              <ul className="text-white/80 text-sm space-y-2">
                <li>• SOC 2 Type II Certified</li>
                <li>• End-to-end encryption</li>
                <li>• Zero data retention policy</li>
                <li>• Penetration tested quarterly</li>
              </ul>
            </div>
            
            {/* Compliance */}
            <div className="text-center">
              <div className="w-16 h-16 border border-white/20 flex items-center justify-center text-2xl mb-6 mx-auto">
                ✓
              </div>
              <h3 
                className="font-serif text-xl mb-4 text-white font-light"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                Compliance Ready
              </h3>
              <ul className="text-white/80 text-sm space-y-2">
                <li>• GDPR compliant</li>
                <li>• CCPA compliant</li>
                <li>• HIPAA ready deployment</li>
                <li>• Data residency options</li>
              </ul>
            </div>
            
            {/* Integration */}
            <div className="text-center">
              <div className="w-16 h-16 border border-white/20 flex items-center justify-center text-2xl mb-6 mx-auto">
                🔗
              </div>
              <h3 
                className="font-serif text-xl mb-4 text-white font-light"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                Enterprise Integration
              </h3>
              <ul className="text-white/80 text-sm space-y-2">
                <li>• SSO/SAML authentication</li>
                <li>• API access & webhooks</li>
                <li>• Active Directory sync</li>
                <li>• Custom integrations available</li>
              </ul>
            </div>
            
            {/* Support */}
            <div className="text-center">
              <div className="w-16 h-16 border border-white/20 flex items-center justify-center text-2xl mb-6 mx-auto">
                🎯
              </div>
              <h3 
                className="font-serif text-xl mb-4 text-white font-light"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                Enterprise Support
              </h3>
              <ul className="text-white/80 text-sm space-y-2">
                <li>• Dedicated customer success manager</li>
                <li>• 99.9% uptime SLA</li>
                <li>• Priority technical support</li>
                <li>• Custom training & onboarding</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* IMPLEMENTATION PROCESS */}
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
              Live in 14 days<br />
              <span className="italic text-gray-600">with zero IT overhead</span>
            </h2>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {/* Week 1 */}
              <div className="flex items-start">
                <div className="w-24 h-24 bg-black text-white flex items-center justify-center text-lg font-light mr-8 flex-shrink-0">
                  Week 1
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-medium mb-3 text-black">Discovery & Setup</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-gray-600">
                    <div>
                      <p className="font-medium mb-2">Day 1-2: Security Review</p>
                      <ul className="text-sm space-y-1">
                        <li>• IT security assessment</li>
                        <li>• Compliance documentation</li>
                        <li>• Access provisioning</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium mb-2">Day 3-7: Brand Integration</p>
                      <ul className="text-sm space-y-1">
                        <li>• Brand guidelines import</li>
                        <li>• Custom dashboard setup</li>
                        <li>• Team member data collection</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Week 2 */}
              <div className="flex items-start">
                <div className="w-24 h-24 bg-black text-white flex items-center justify-center text-lg font-light mr-8 flex-shrink-0">
                  Week 2
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-medium mb-3 text-black">Training & Launch</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-gray-600">
                    <div>
                      <p className="font-medium mb-2">Day 8-10: AI Training</p>
                      <ul className="text-sm space-y-1">
                        <li>• Employee photo collection</li>
                        <li>• AI model training</li>
                        <li>• Quality validation</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium mb-2">Day 11-14: Go-Live</p>
                      <ul className="text-sm space-y-1">
                        <li>• Admin training session</li>
                        <li>• Dashboard access rollout</li>
                        <li>• First photo generation</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-12 p-8 bg-gray-50 border border-gray-200">
              <div className="text-center">
                <h4 className="text-lg font-medium mb-4">Implementation Guarantee</h4>
                <p className="text-gray-600 mb-6">
                  If we don't have your team generating professional photos within 14 days, 
                  we'll refund your entire setup fee and provide an additional month of service at no cost.
                </p>
                <button 
                  onClick={handleContactSales}
                  className="bg-black text-white px-8 py-3 hover:bg-gray-800 transition-all"
                >
                  Start Implementation
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 sm:py-32 bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 
            className="font-serif text-3xl sm:text-4xl md:text-5xl font-light mb-8"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Replace your entire<br />
            <span className="italic text-white/70">photography budget with AI</span>
          </h2>
          
          <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
            Join 50+ enterprise teams saving €7,800+ annually while improving brand consistency and reducing administrative overhead.
          </p>
          
          <div className="space-y-6">
            <button 
              onClick={handleContactSales}
              className="bg-white text-black px-12 py-4 text-sm uppercase tracking-[0.3em] hover:bg-gray-100 transition-all font-medium"
            >
              SCHEDULE ENTERPRISE DEMO
            </button>
            
            <p className="text-xs text-white/50 tracking-wide">
              30-day pilot • ROI guarantee • Implementation in 14 days
            </p>
          </div>
        </div>
      </section>

      <GlobalFooter />
    </div>
  );
}