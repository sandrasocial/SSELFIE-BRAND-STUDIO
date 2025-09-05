import { useState, useEffect } from 'react';
import { useLocation } from "wouter";

export default function MayaBrandCustomization() {
  const [, setLocation] = useLocation();
  
  // Brand customization configuration options
  const brandCategories = {
    visual: {
      name: "Visual Identity",
      description: "Colors, typography, and visual style preferences",
      options: [
        { id: "primary_colors", label: "Primary Brand Colors", type: "color_palette", required: true },
        { id: "secondary_colors", label: "Secondary Colors", type: "color_palette" },
        { id: "typography", label: "Brand Typography", type: "font_selection" },
        { id: "logo_integration", label: "Logo Integration", type: "upload" },
        { id: "visual_style", label: "Visual Style", type: "selection", 
          choices: ["Modern & Clean", "Classic & Professional", "Creative & Bold", "Minimalist", "Luxury & Premium"] }
      ]
    },
    
    personality: {
      name: "Brand Personality",
      description: "How Maya should represent your company's voice and values",
      options: [
        { id: "brand_voice", label: "Brand Voice", type: "selection",
          choices: ["Professional & Authoritative", "Friendly & Approachable", "Innovative & Forward-thinking", "Trusted & Reliable", "Creative & Inspiring"] },
        { id: "communication_style", label: "Communication Style", type: "selection",
          choices: ["Formal", "Business Casual", "Conversational", "Technical", "Creative"] },
        { id: "brand_values", label: "Core Brand Values", type: "multi_select",
          choices: ["Innovation", "Trust", "Excellence", "Collaboration", "Growth", "Sustainability", "Quality", "Creativity"] },
        { id: "industry_focus", label: "Industry Focus", type: "selection",
          choices: ["Technology", "Finance", "Healthcare", "Consulting", "Creative", "Manufacturing", "Retail", "Other"] }
      ]
    },
    
    photography: {
      name: "Photography Style",
      description: "Visual guidelines for all employee photos",
      options: [
        { id: "photo_style", label: "Primary Photo Style", type: "selection",
          choices: ["Corporate Professional", "Modern Business", "Creative Professional", "Executive Portrait", "Team Lifestyle"] },
        { id: "lighting_preference", label: "Lighting Style", type: "selection",
          choices: ["Natural Light", "Studio Professional", "Soft Corporate", "Dramatic Executive", "Creative Lighting"] },
        { id: "background_style", label: "Background Preference", type: "selection",
          choices: ["Clean White", "Corporate Environment", "Branded Backdrop", "Natural/Outdoor", "Creative Abstract"] },
        { id: "dress_code", label: "Dress Code Guidelines", type: "multi_select",
          choices: ["Formal Business", "Business Casual", "Smart Casual", "Industry-Specific", "Creative/Flexible"] }
      ]
    },
    
    departments: {
      name: "Department Styling",
      description: "Custom styles for different departments",
      options: [
        { id: "executive_style", label: "C-Suite/Executive Style", type: "style_config" },
        { id: "sales_style", label: "Sales Team Style", type: "style_config" },
        { id: "marketing_style", label: "Marketing Team Style", type: "style_config" },
        { id: "engineering_style", label: "Engineering Team Style", type: "style_config" },
        { id: "customer_success_style", label: "Customer Success Style", type: "style_config" }
      ]
    }
  };

  const [currentCategory, setCurrentCategory] = useState("visual");
  const [configuration, setConfiguration] = useState({});

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <nav className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div 
              className="font-serif text-xl font-light tracking-wide cursor-pointer"
              style={{ fontFamily: "Times New Roman, serif" }}
              onClick={() => setLocation("/company-dashboard")}
            >
              MAYA<span className="text-sm ml-2 opacity-70">BRAND CUSTOMIZATION</span>
            </div>
            <button className="text-xs tracking-wider uppercase px-6 py-2 border border-white/30 hover:bg-white hover:text-black transition-colors">
              Save Configuration
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Navigation Sidebar */}
          <div className="col-span-3">
            <div className="space-y-2">
              {Object.entries(brandCategories).map(([key, category]) => (
                <button
                  key={key}
                  onClick={() => setCurrentCategory(key)}
                  className={`
                    w-full text-left p-4 border transition-colors
                    ${currentCategory === key 
                      ? 'border-black bg-black text-white' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="font-medium mb-1">{category.name}</div>
                  <div className="text-xs opacity-70">{category.description}</div>
                </button>
              ))}
            </div>
            
            {/* Preview Card */}
            <div className="mt-8 border border-gray-200 p-6">
              <h3 className="font-medium mb-4">Maya Brand Preview</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-600 rounded"></div>
                  <span>Primary Color</span>
                </div>
                <div className="text-gray-600">
                  "Professional & Authoritative voice with Modern Business photography style"
                </div>
                <div className="text-xs text-gray-500">
                  Live preview updates as you make changes
                </div>
              </div>
            </div>
          </div>

          {/* Configuration Panel */}
          <div className="col-span-9">
            <div className="mb-8">
              <h1 
                className="text-3xl font-light mb-2"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                {brandCategories[currentCategory].name}
              </h1>
              <p className="text-gray-600">{brandCategories[currentCategory].description}</p>
            </div>

            {/* Configuration Options */}
            <div className="space-y-8">
              {brandCategories[currentCategory].options.map((option) => (
                <div key={option.id} className="border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium">{option.label}</h3>
                      {option.required && (
                        <span className="text-xs text-red-600">Required</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">
                      {option.type.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Render different input types */}
                  {option.type === 'color_palette' && (
                    <div className="grid grid-cols-6 gap-2">
                      {['#1a1a1a', '#2563eb', '#059669', '#dc2626', '#7c3aed', '#ea580c'].map((color, idx) => (
                        <button
                          key={idx}
                          className="w-12 h-12 rounded border-2 border-gray-300 hover:border-gray-500"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  )}

                  {option.type === 'selection' && (
                    <select className="w-full border border-gray-300 p-3">
                      <option value="">Select {option.label}</option>
                      {option.choices.map((choice) => (
                        <option key={choice} value={choice}>{choice}</option>
                      ))}
                    </select>
                  )}

                  {option.type === 'multi_select' && (
                    <div className="grid grid-cols-2 gap-2">
                      {option.choices.map((choice) => (
                        <label key={choice} className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm">{choice}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {option.type === 'style_config' && (
                    <div className="bg-gray-50 p-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Photo Style</label>
                        <select className="w-full border border-gray-300 p-2 text-sm">
                          <option>Executive Professional</option>
                          <option>Business Casual</option>
                          <option>Creative Professional</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Lighting</label>
                        <select className="w-full border border-gray-300 p-2 text-sm">
                          <option>Studio Professional</option>
                          <option>Natural Light</option>
                          <option>Dramatic</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {option.type === 'upload' && (
                    <div className="border-2 border-dashed border-gray-300 p-8 text-center">
                      <div className="text-gray-500 mb-2">Upload your logo</div>
                      <button className="text-xs uppercase tracking-wider px-4 py-2 border border-gray-300 hover:bg-gray-50">
                        Choose File
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* AI Training Preview */}
            <div className="mt-12 bg-gray-50 p-8">
              <h2 
                className="text-xl font-light mb-4"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                Maya AI Training Preview
              </h2>
              
              <div className="bg-white p-6 border border-gray-200 mb-6">
                <div className="text-sm text-gray-600 mb-2">Maya will learn to say:</div>
                <div className="italic text-gray-800">
                  "I'll create professional photos that reflect [Company Name]'s modern, innovative brand. 
                  Your team photos will have a clean, professional look with our signature blue accent colors 
                  and contemporary business styling."
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Photo Generation Style</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Modern Business photography</li>
                    <li>• Professional lighting with brand colors</li>
                    <li>• Department-specific styling</li>
                    <li>• Consistent corporate aesthetic</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Brand Voice Integration</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Professional & authoritative tone</li>
                    <li>• Company values embedded</li>
                    <li>• Industry-specific expertise</li>
                    <li>• Consistent brand messaging</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex space-x-4">
              <button className="bg-black text-white px-8 py-3 text-xs uppercase tracking-wider hover:bg-gray-800">
                Save & Train Maya
              </button>
              <button className="border border-gray-300 px-8 py-3 text-xs uppercase tracking-wider hover:bg-gray-50">
                Preview Changes
              </button>
              <button className="border border-gray-300 px-8 py-3 text-xs uppercase tracking-wider hover:bg-gray-50">
                Reset to Defaults
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}