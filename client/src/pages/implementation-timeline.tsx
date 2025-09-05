import { useState, useEffect } from 'react';
import { useLocation } from "wouter";

export default function ImplementationTimeline() {
  const [, setLocation] = useLocation();
  const [selectedPackage, setSelectedPackage] = useState("professional");

  const implementationPhases = {
    starter: {
      totalTime: "2 weeks",
      phases: [
        {
          name: "Discovery & Setup",
          duration: "2-3 days",
          tasks: [
            "Initial consultation and requirements gathering",
            "Brand guideline analysis",
            "Employee roster collection",
            "Maya AI basic brand training",
            "Company dashboard setup"
          ]
        },
        {
          name: "Model Training",
          duration: "5-7 days",
          tasks: [
            "Employee selfie collection automation",
            "AI model training for 5-15 employees",
            "Quality assurance and testing",
            "Initial photo generation tests"
          ]
        },
        {
          name: "Launch & Training",
          duration: "2-3 days",
          tasks: [
            "Team access provisioning",
            "Basic admin training session",
            "Dashboard walkthrough",
            "Go-live support"
          ]
        }
      ]
    },
    
    professional: {
      totalTime: "1 week",
      phases: [
        {
          name: "Discovery & Custom Setup",
          duration: "1-2 days",
          tasks: [
            "Comprehensive brand analysis",
            "Department-specific style requirements",
            "Custom Maya AI personality training",
            "Advanced dashboard customization",
            "Dedicated account manager assignment"
          ]
        },
        {
          name: "Accelerated Training",
          duration: "3-4 days",
          tasks: [
            "Streamlined employee onboarding",
            "Parallel AI model training (15-50 employees)",
            "Department-specific style configuration",
            "Advanced quality assurance",
            "Custom photo concept development"
          ]
        },
        {
          name: "White-Glove Launch",
          duration: "1-2 days",
          tasks: [
            "Executive team training",
            "Manager dashboard orientation",
            "Employee self-service setup",
            "24/7 support activation",
            "Success metrics baseline"
          ]
        }
      ]
    },
    
    enterprise: {
      totalTime: "Custom (1-4 weeks)",
      phases: [
        {
          name: "Enterprise Architecture",
          duration: "3-5 days",
          tasks: [
            "Technical requirements analysis",
            "Security and compliance review",
            "API integration planning",
            "White-label dashboard design",
            "Multi-location setup planning"
          ]
        },
        {
          name: "Custom Development",
          duration: "5-10 days",
          tasks: [
            "Custom integrations development",
            "Advanced Maya AI training",
            "Department-specific agents",
            "Analytics and reporting setup",
            "Security implementation"
          ]
        },
        {
          name: "Deployment & Training",
          duration: "3-5 days",
          tasks: [
            "Staged rollout to departments",
            "On-site training sessions",
            "IT team technical training",
            "Advanced admin capabilities",
            "Success monitoring setup"
          ]
        }
      ]
    }
  };

  const technicalRequirements = {
    infrastructure: [
      "Cloud hosting on AWS/GCP (handled by SSELFIE)",
      "CDN for global image delivery",
      "Secure API endpoints with authentication",
      "Database with enterprise-grade backup",
      "24/7 monitoring and alerting"
    ],
    
    security: [
      "SOC 2 Type II compliant infrastructure",
      "End-to-end encryption for all data",
      "Employee data isolation and protection",
      "GDPR and privacy regulation compliance",
      "Regular security audits and penetration testing"
    ],
    
    integrations: [
      "Single Sign-On (SSO) integration",
      "HR system integration (Workday, BambooHR)",
      "Marketing automation platforms",
      "Content management systems",
      "API webhooks for custom workflows"
    ],
    
    support: [
      "Dedicated enterprise support team",
      "24/7 technical support availability",
      "Priority bug fixes and feature requests",
      "Quarterly business reviews",
      "Training and onboarding assistance"
    ]
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
              SSELFIE<span className="text-sm ml-2 opacity-70">IMPLEMENTATION TIMELINE</span>
            </div>
            <span className="text-xs tracking-wider uppercase opacity-70">
              Technical Requirements & Deployment
            </span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 
            className="text-4xl sm:text-5xl font-light mb-6"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Implementation Timeline<br />
            <span className="italic text-gray-600">& Technical Requirements</span>
          </h1>
          
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Comprehensive deployment plan with technical specifications for enterprise photography solutions.
          </p>
        </div>

        {/* Package Selection */}
        <div className="mb-12">
          <div className="flex justify-center space-x-4 mb-8">
            {Object.entries(implementationPhases).map(([key, package_data]) => (
              <button
                key={key}
                onClick={() => setSelectedPackage(key)}
                className={`
                  px-6 py-3 text-sm uppercase tracking-wider transition-colors
                  ${selectedPackage === key 
                    ? 'bg-black text-white' 
                    : 'border border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                {key} Package
              </button>
            ))}
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-light mb-2">
              {implementationPhases[selectedPackage].totalTime}
            </div>
            <div className="text-sm text-gray-600 uppercase tracking-wider">
              Total Implementation Time
            </div>
          </div>
        </div>

        {/* Timeline Phases */}
        <div className="mb-16">
          <h2 
            className="text-2xl font-light mb-8 text-center"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            {selectedPackage.charAt(0).toUpperCase() + selectedPackage.slice(1)} Package Timeline
          </h2>
          
          <div className="space-y-8">
            {implementationPhases[selectedPackage].phases.map((phase, idx) => (
              <div key={idx} className="border border-gray-200 p-8">
                <div className="flex items-start space-x-6">
                  <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center text-lg font-light flex-shrink-0">
                    {idx + 1}
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex items-center justify-between mb-4">
                      <h3 
                        className="text-xl font-light"
                        style={{ fontFamily: "Times New Roman, serif" }}
                      >
                        {phase.name}
                      </h3>
                      <span className="text-sm text-gray-600 uppercase tracking-wider">
                        {phase.duration}
                      </span>
                    </div>
                    
                    <ul className="space-y-2">
                      {phase.tasks.map((task, taskIdx) => (
                        <li key={taskIdx} className="flex items-start">
                          <span className="text-black mr-3 flex-shrink-0">•</span>
                          <span className="text-gray-700">{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Requirements */}
        <div className="mb-16">
          <h2 
            className="text-2xl font-light mb-8 text-center"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Technical Requirements & Capabilities
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {Object.entries(technicalRequirements).map(([category, requirements]) => (
              <div key={category} className="border border-gray-200 p-6">
                <h3 className="text-lg font-medium mb-4 capitalize">
                  {category.replace('_', ' & ')}
                </h3>
                <ul className="space-y-2">
                  {requirements.map((requirement, idx) => (
                    <li key={idx} className="flex items-start text-sm">
                      <span className="text-green-600 mr-2 flex-shrink-0">✓</span>
                      <span className="text-gray-700">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Success Metrics */}
        <div className="mb-16 bg-gray-50 p-8">
          <h2 
            className="text-2xl font-light mb-8 text-center"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Success Metrics & KPIs
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-light mb-2">95%+</div>
              <div className="text-sm text-gray-600 uppercase tracking-wider">
                Implementation Success Rate
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-light mb-2">&lt;24h</div>
              <div className="text-sm text-gray-600 uppercase tracking-wider">
                Employee Onboarding Time
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-light mb-2">50-70%</div>
              <div className="text-sm text-gray-600 uppercase tracking-wider">
                Cost Reduction vs Traditional
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="text-center">
          <h2 
            className="text-2xl font-light mb-6"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Ready to Begin Implementation?
          </h2>
          
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Schedule a technical consultation to discuss your specific requirements and create a custom implementation plan.
          </p>
          
          <div className="space-x-4">
            <button 
              onClick={() => setLocation("/sales-consultation")}
              className="bg-black text-white px-8 py-3 text-xs uppercase tracking-wider hover:bg-gray-800"
            >
              Schedule Technical Consultation
            </button>
            
            <button 
              onClick={() => setLocation("/teams/packages")}
              className="border border-gray-300 px-8 py-3 text-xs uppercase tracking-wider hover:bg-gray-50"
            >
              View Service Packages
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}