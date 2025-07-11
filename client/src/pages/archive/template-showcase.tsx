import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface Template {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
    neutral?: string;
  };
  typography: {
    headline: string;
    body: string;
    accent: string;
    weights: {
      headline: string;
      body: string;
      accent: string;
    };
  };
  voiceProfile: {
    tone: string[];
    personality: string;
    keyPhrases: string[];
  };
}

export default function TemplateShowcase() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const data = await apiRequest('GET', '/api/styleguide-templates');
        setTemplates(data);
        if (data.length > 0) {
          setSelectedTemplate(data[0]);
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-6xl font-light text-black" style={{ fontFamily: 'Times New Roman, serif' }}>
              TEMPLATE SHOWCASE
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              {templates.length} Professional Styleguide Templates Integrated
            </p>
            <p className="mt-2 text-sm text-gray-500">
              SANDRA AI intelligently selects templates based on user preferences
            </p>
          </div>
        </div>
      </div>

      {/* Template Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`border-2 p-6 cursor-pointer transition-all duration-200 ${
                selectedTemplate?.id === template.id
                  ? 'border-black bg-gray-50'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
              onClick={() => setSelectedTemplate(template)}
            >
              <h3 className="text-2xl mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
                {template.name}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {template.description}
              </p>
              
              {/* Color Palette */}
              <div className="mb-4">
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Colors</p>
                <div className="flex space-x-2">
                  <div
                    className="w-6 h-6 border border-gray-300"
                    style={{ backgroundColor: template.colors.primary }}
                    title="Primary"
                  ></div>
                  <div
                    className="w-6 h-6 border border-gray-300"
                    style={{ backgroundColor: template.colors.secondary }}
                    title="Secondary"
                  ></div>
                  <div
                    className="w-6 h-6 border border-gray-300"
                    style={{ backgroundColor: template.colors.accent }}
                    title="Accent"
                  ></div>
                </div>
              </div>

              {/* Typography */}
              <div className="mb-4">
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Typography</p>
                <p className="text-sm" style={{ fontFamily: template.typography.headline }}>
                  {template.typography.headline.split(',')[0]}
                </p>
              </div>

              {/* Voice Profile */}
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Voice</p>
                <p className="text-xs text-gray-600">
                  {template.voiceProfile.tone.slice(0, 3).join(', ')}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Template Details */}
        {selectedTemplate && (
          <div className="border-t border-gray-200 pt-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Template Preview */}
              <div>
                <h3 className="text-3xl mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
                  Template Preview
                </h3>
                <div 
                  className="border-2 border-gray-200 p-8 min-h-96"
                  style={{ 
                    backgroundColor: selectedTemplate.colors.background,
                    color: selectedTemplate.colors.text
                  }}
                >
                  <h1 
                    className="text-4xl mb-4" 
                    style={{ 
                      fontFamily: selectedTemplate.typography.headline,
                      fontWeight: selectedTemplate.typography.weights.headline
                    }}
                  >
                    {selectedTemplate.name}
                  </h1>
                  <p 
                    className="text-lg mb-6"
                    style={{ 
                      fontFamily: selectedTemplate.typography.body,
                      fontWeight: selectedTemplate.typography.weights.body
                    }}
                  >
                    {selectedTemplate.description}
                  </p>
                  
                  {/* Sample Content */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl mb-2" style={{ fontFamily: selectedTemplate.typography.headline }}>
                        Your Brand Voice
                      </h3>
                      <p className="text-sm" style={{ fontFamily: selectedTemplate.typography.body }}>
                        {selectedTemplate.voiceProfile.personality}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-xl mb-2" style={{ fontFamily: selectedTemplate.typography.headline }}>
                        Key Phrases
                      </h3>
                      <ul className="text-sm space-y-1" style={{ fontFamily: selectedTemplate.typography.body }}>
                        {selectedTemplate.voiceProfile.keyPhrases.slice(0, 3).map((phrase, index) => (
                          <li key={index}>× {phrase}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Template Details */}
              <div>
                <h3 className="text-3xl mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
                  Template Details
                </h3>
                
                <div className="space-y-6">
                  {/* Color System */}
                  <div>
                    <h4 className="text-lg mb-3" style={{ fontFamily: 'Times New Roman, serif' }}>
                      Color System
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(selectedTemplate.colors).map(([key, value]) => (
                        <div key={key} className="flex items-center space-x-3">
                          <div
                            className="w-4 h-4 border border-gray-300"
                            style={{ backgroundColor: value }}
                          ></div>
                          <span className="text-sm capitalize">{key}</span>
                          <span className="text-xs text-gray-500 ml-auto">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Typography System */}
                  <div>
                    <h4 className="text-lg mb-3" style={{ fontFamily: 'Times New Roman, serif' }}>
                      Typography System
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Headline</span>
                        <span className="text-xs text-gray-500">
                          {selectedTemplate.typography.headline}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Body</span>
                        <span className="text-xs text-gray-500">
                          {selectedTemplate.typography.body}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Accent</span>
                        <span className="text-xs text-gray-500">
                          {selectedTemplate.typography.accent}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Voice Profile */}
                  <div>
                    <h4 className="text-lg mb-3" style={{ fontFamily: 'Times New Roman, serif' }}>
                      Voice Profile
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium">Tone: </span>
                        <span className="text-sm text-gray-600">
                          {selectedTemplate.voiceProfile.tone.join(', ')}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Personality: </span>
                        <span className="text-sm text-gray-600">
                          {selectedTemplate.voiceProfile.personality}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}