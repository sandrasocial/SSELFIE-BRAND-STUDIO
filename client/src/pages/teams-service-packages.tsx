import { useState, useEffect } from 'react';
import { useLocation } from "wouter";

export default function TeamsServicePackages() {
  const [, setLocation] = useLocation();

  const handleContactSales = () => {
    window.open('https://calendly.com/sselfie-teams', '_blank');
  };

  const servicePackages = {
    starter: {
      name: "Starter Team",
      price: "€500",
      period: "monthly",
      teamSize: "5-15 employees",
      description: "Perfect for growing teams that need professional imagery",
      features: [
        "AI model training for all employees",
        "Basic company dashboard",
        "Standard brand integration",
        "50 professional photos per employee monthly",
        "Email support within 24 hours",
        "LinkedIn, website, marketing materials ready",
        "Basic Maya AI agent with your brand voice"
      ],
      setup: "2-week implementation",
      ideal: "Growing startups and small teams"
    },
    
    professional: {
      name: "Professional Team", 
      price: "€1,200",
      period: "monthly",
      teamSize: "15-50 employees",
      description: "Complete done-for-you service for established companies",
      features: [
        "AI model training for all employees",
        "Custom branded company dashboard",
        "Full brand guideline integration",
        "100 professional photos per employee monthly",
        "Dedicated account manager",
        "Custom Maya AI agent trained on your brand",
        "Priority support (4-hour response)",
        "Monthly strategy calls",
        "Custom photo styles and concepts",
        "Team onboarding automation"
      ],
      setup: "1-week white-glove implementation",
      ideal: "Established companies and scale-ups",
      popular: true
    },
    
    enterprise: {
      name: "Enterprise",
      price: "Custom",
      period: "pricing",
      teamSize: "50+ employees", 
      description: "Full enterprise solution with custom integrations",
      features: [
        "Everything in Professional package",
        "White-label dashboard with your branding",
        "API access for custom integrations",
        "Unlimited professional photos",
        "Custom Maya AI agent personalities per department",
        "Advanced analytics and reporting",
        "On-site training and setup session",
        "24/7 premium support with dedicated Slack channel",
        "Custom integrations (HR systems, marketing tools)",
        "Multi-location support",
        "Advanced security and compliance"
      ],
      setup: "Custom implementation timeline",
      ideal: "Large corporations and enterprises"
    }
  };

  const additionalServices = [
    {
      name: "Rush Implementation",
      description: "Get your team up and running in 48 hours",
      price: "€2,000 one-time"
    },
    {
      name: "Custom Brand Training",
      description: "Deep brand personality integration for Maya AI",
      price: "€500 monthly add-on"
    },
    {
      name: "Department Segmentation",
      description: "Different photo styles per department (Sales, Marketing, C-Suite)",
      price: "€300 monthly per department"
    },
    {
      name: "Video Integration",
      description: "AI-generated professional video content",
      price: "€800 monthly add-on"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div 
              className="font-serif text-xl font-light tracking-wide text-white cursor-pointer"
              style={{ fontFamily: "Times New Roman, serif" }}
              onClick={() => setLocation("/teams")}
            >
              SSELFIE<span className="text-sm ml-2 opacity-70">SERVICE PACKAGES</span>
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

      {/* Hero */}
      <section className="pt-32 pb-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 
            className="font-serif text-4xl sm:text-5xl md:text-6xl font-light mb-8"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Professional Photography<br />
            <span className="text-white/70 italic">Service Packages</span>
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            Choose the perfect done-for-you solution for your team size and needs.<br />
            All packages include complete setup, training, and ongoing support.
          </p>
        </div>
      </section>

      {/* Main Service Packages */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {Object.entries(servicePackages).map(([key, pkg]) => (
              <div 
                key={key}
                className={`
                  relative bg-white p-8 shadow-lg
                  ${pkg.popular ? 'border-2 border-black' : 'border border-gray-200'}
                `}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-black text-white px-6 py-2 text-xs uppercase tracking-wide">
                    Most Popular
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 
                    className="font-serif text-2xl font-light mb-2"
                    style={{ fontFamily: "Times New Roman, serif" }}
                  >
                    {pkg.name}
                  </h3>
                  <div className="text-4xl font-light mb-2">{pkg.price}</div>
                  <div className="text-sm text-gray-600 mb-4">{pkg.period} • {pkg.teamSize}</div>
                  <p className="text-gray-700">{pkg.description}</p>
                </div>

                <div className="mb-8">
                  <h4 className="text-lg font-medium mb-4">What's Included:</h4>
                  <ul className="space-y-2">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-sm">
                        <span className="text-black mr-2">•</span>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-8 p-4 bg-gray-50">
                  <div className="text-sm">
                    <div className="font-medium mb-1">Implementation Time:</div>
                    <div className="text-gray-600">{pkg.setup}</div>
                  </div>
                  <div className="text-sm mt-3">
                    <div className="font-medium mb-1">Ideal For:</div>
                    <div className="text-gray-600">{pkg.ideal}</div>
                  </div>
                </div>

                <button 
                  onClick={handleContactSales}
                  className={`
                    w-full py-4 px-6 text-xs uppercase tracking-wider transition-colors
                    ${pkg.popular 
                      ? 'bg-black text-white hover:bg-gray-800' 
                      : 'border border-black text-black hover:bg-black hover:text-white'
                    }
                  `}
                >
                  {pkg.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 
              className="font-serif text-3xl sm:text-4xl font-light mb-6"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              Additional Services
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Enhance your package with specialized services tailored to your specific needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {additionalServices.map((service, idx) => (
              <div key={idx} className="border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 
                    className="font-serif text-xl font-light"
                    style={{ fontFamily: "Times New Roman, serif" }}
                  >
                    {service.name}
                  </h3>
                  <span className="text-lg font-light">{service.price}</span>
                </div>
                <p className="text-gray-600 leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 
            className="font-serif text-3xl sm:text-4xl font-light mb-8"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Compare The Investment
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="border border-white/20 p-8">
              <h3 className="text-xl font-light mb-6 text-red-300">Traditional Photography</h3>
              <ul className="text-left space-y-3 text-white/80">
                <li>• €15,000+ annual photoshoot budget</li>
                <li>• 6+ weeks coordination time</li>
                <li>• Inconsistent results across team</li>
                <li>• New hire delays for photos</li>
                <li>• Limited photo quantity</li>
                <li>• No brand consistency</li>
              </ul>
            </div>
            
            <div className="border-2 border-white p-8">
              <h3 className="text-xl font-light mb-6 text-green-300">SSELFIE Studio</h3>
              <ul className="text-left space-y-3 text-white/80">
                <li>• €6,000-14,400 annual investment</li>
                <li>• 1-2 week implementation</li>
                <li>• Perfect brand consistency</li>
                <li>• Instant new hire photos</li>
                <li>• Unlimited monthly photos</li>
                <li>• Ongoing support & optimization</li>
              </ul>
            </div>
          </div>
          
          <div className="text-2xl font-light mb-8">
            <span className="text-green-300">Save 50-70%</span> while getting <span className="text-white">unlimited professional photos</span>
          </div>
          
          <button 
            onClick={handleContactSales}
            className="bg-white text-black hover:bg-white/90 transition-colors text-xs tracking-[0.3em] uppercase px-12 py-4 font-light"
          >
            Calculate Your Savings
          </button>
        </div>
      </section>

      {/* Implementation Process */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 
              className="font-serif text-3xl sm:text-4xl font-light mb-6"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              How We Implement
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our proven process ensures smooth deployment with minimal disruption to your team.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-xl font-light mx-auto mb-6">
                1
              </div>
              <h3 className="text-lg font-medium mb-3">Discovery Call</h3>
              <p className="text-gray-600 text-sm">
                Understand your brand, team structure, and photography needs. Define custom requirements.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-xl font-light mx-auto mb-6">
                2
              </div>
              <h3 className="text-lg font-medium mb-3">Brand Integration</h3>
              <p className="text-gray-600 text-sm">
                Configure Maya AI with your brand guidelines, colors, and style preferences.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-xl font-light mx-auto mb-6">
                3
              </div>
              <h3 className="text-lg font-medium mb-3">Team Training</h3>
              <p className="text-gray-600 text-sm">
                Collect employee selfies and train individual AI models. Setup company dashboard.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-xl font-light mx-auto mb-6">
                4
              </div>
              <h3 className="text-lg font-medium mb-3">Go Live</h3>
              <p className="text-gray-600 text-sm">
                Launch with full access, ongoing support, and continuous optimization.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 
            className="font-serif text-3xl sm:text-4xl font-light mb-8"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Ready to eliminate<br />your photography budget?
          </h2>
          
          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
            Schedule a consultation to discuss your team's specific needs and get a custom quote.
          </p>
          
          <button 
            onClick={handleContactSales}
            className="bg-black text-white hover:bg-gray-800 transition-colors text-xs tracking-[0.3em] uppercase px-12 py-4 font-light mr-4"
          >
            Schedule Consultation
          </button>
          
          <button 
            onClick={() => setLocation("/teams")}
            className="border border-black text-black hover:bg-black hover:text-white transition-colors text-xs tracking-[0.3em] uppercase px-12 py-4 font-light"
          >
            Back to Overview
          </button>
        </div>
      </section>
    </div>
  );
}