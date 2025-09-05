import { useState, useEffect } from 'react';
import { useLocation } from "wouter";

export default function SalesConsultation() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    company: '',
    name: '',
    email: '',
    phone: '',
    teamSize: '',
    industry: '',
    currentBudget: '',
    urgency: '',
    challenges: '',
    goals: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // In production, this would integrate with Calendly or HubSpot
    alert('Consultation request submitted! Our team will contact you within 2 hours.');
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <nav className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div 
              className="font-serif text-xl font-light tracking-wide cursor-pointer"
              style={{ fontFamily: "Times New Roman, serif" }}
              onClick={() => setLocation("/teams")}
            >
              SSELFIE<span className="text-sm ml-2 opacity-70">ENTERPRISE CONSULTATION</span>
            </div>
            <span className="text-xs tracking-wider uppercase opacity-70">
              30-Minute Strategy Session
            </span>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 
            className="text-4xl sm:text-5xl font-light mb-6"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Schedule Your Enterprise<br />
            <span className="italic text-gray-600">Photography Consultation</span>
          </h1>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8">
            Get a custom quote and implementation plan for your team's professional photography needs.
          </p>
          
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
            <span>✓ 30-minute strategy session</span>
            <span>✓ Custom pricing quote</span>
            <span>✓ Implementation timeline</span>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => handleChange('company', e.target.value)}
                    className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:border-black"
                    placeholder="ACME Corporation"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:border-black"
                    placeholder="John Smith"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:border-black"
                    placeholder="john@company.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:border-black"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Team Size *</label>
                  <select
                    required
                    value={formData.teamSize}
                    onChange={(e) => handleChange('teamSize', e.target.value)}
                    className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:border-black"
                  >
                    <option value="">Select team size</option>
                    <option value="5-15">5-15 employees</option>
                    <option value="15-50">15-50 employees</option>
                    <option value="50-100">50-100 employees</option>
                    <option value="100+">100+ employees</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Industry</label>
                  <select
                    value={formData.industry}
                    onChange={(e) => handleChange('industry', e.target.value)}
                    className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:border-black"
                  >
                    <option value="">Select industry</option>
                    <option value="technology">Technology</option>
                    <option value="finance">Finance</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="consulting">Consulting</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="retail">Retail</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Current Annual Photography Budget</label>
                  <select
                    value={formData.currentBudget}
                    onChange={(e) => handleChange('currentBudget', e.target.value)}
                    className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:border-black"
                  >
                    <option value="">Select budget range</option>
                    <option value="5k-10k">€5,000 - €10,000</option>
                    <option value="10k-25k">€10,000 - €25,000</option>
                    <option value="25k-50k">€25,000 - €50,000</option>
                    <option value="50k+">€50,000+</option>
                    <option value="none">No current budget</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Implementation Urgency</label>
                  <select
                    value={formData.urgency}
                    onChange={(e) => handleChange('urgency', e.target.value)}
                    className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:border-black"
                  >
                    <option value="">Select urgency</option>
                    <option value="immediate">Immediate (within 2 weeks)</option>
                    <option value="month">Within 1 month</option>
                    <option value="quarter">Within 3 months</option>
                    <option value="exploring">Just exploring options</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Current Photography Challenges</label>
                <textarea
                  value={formData.challenges}
                  onChange={(e) => handleChange('challenges', e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:border-black"
                  placeholder="Describe your current challenges with team photography..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Photography Goals</label>
                <textarea
                  value={formData.goals}
                  onChange={(e) => handleChange('goals', e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:border-black"
                  placeholder="What do you want to achieve with professional team photography?"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white py-4 text-xs uppercase tracking-wider hover:bg-gray-800 transition-colors"
              >
                Schedule Consultation
              </button>
            </form>
          </div>

          {/* What to Expect */}
          <div className="space-y-8">
            <div>
              <h2 
                className="text-2xl font-light mb-6"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                What to Expect
              </h2>
              
              <div className="space-y-6">
                <div className="flex space-x-4">
                  <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Discovery & Analysis</h3>
                    <p className="text-gray-600 text-sm">
                      We'll review your current photography needs, brand guidelines, and team structure.
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Custom Solution Design</h3>
                    <p className="text-gray-600 text-sm">
                      Get a tailored package recommendation with exact pricing for your team size.
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Implementation Planning</h3>
                    <p className="text-gray-600 text-sm">
                      Receive a detailed timeline and next steps for launching your team photography.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Consultation Benefits */}
            <div className="bg-gray-50 p-6">
              <h3 className="font-medium mb-4">Consultation Benefits</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Custom ROI analysis vs current photography costs</li>
                <li>✓ Maya AI brand integration demonstration</li>
                <li>✓ Sample photos generated for your industry</li>
                <li>✓ Department-specific styling recommendations</li>
                <li>✓ Technical implementation roadmap</li>
                <li>✓ Pricing options tailored to your budget</li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="border border-gray-200 p-6">
              <h3 className="font-medium mb-4">Prefer to Talk Now?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Our enterprise team is available for immediate consultation.
              </p>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Email:</span> enterprise@sselfie.ai
                </div>
                <div>
                  <span className="font-medium">Phone:</span> +1 (555) 123-4567
                </div>
                <div>
                  <span className="font-medium">Hours:</span> Mon-Fri 9AM-6PM EST
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}