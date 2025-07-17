import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Eye, 
  Code, 
  Save, 
  Image, 
  Type, 
  Layout,
  Settings,
  Wand2,
  Download,
  Upload
} from 'lucide-react';

interface ReplitStyleEditorProps {
  initialContent?: string;
  onContentChange?: (content: string) => void;
  onSave?: (content: string) => void;
  className?: string;
}

export function ReplitStyleEditor({ 
  initialContent = '', 
  onContentChange,
  onSave,
  className = ''
}: ReplitStyleEditorProps) {
  const [showLivePreview, setShowLivePreview] = useState(true);
  const [selectedTextColor, setSelectedTextColor] = useState('#000000');
  const [selectedFontSize, setSelectedFontSize] = useState(16);
  const [selectedMargin, setSelectedMargin] = useState('16px');
  const [customCSSClass, setCustomCSSClass] = useState('');
  const [content, setContent] = useState(initialContent);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setShowLivePreview(true);
    
    // Listen for agent changes
    const handleAgentChanges = (event: CustomEvent) => {
      const { content } = event.detail;
      if (content) {
        // Extract CSS from agent suggestions and apply to live preview
        const cssMatch = content.match(/```css\n([\s\S]*?)\n```/);
        if (cssMatch) {
          injectChangesToLivePreview(cssMatch[1]);
        }
        
        // Look for style suggestions in the content
        const styleMatch = content.match(/style="([^"]*)"/) || content.match(/class="([^"]*)"/);
        if (styleMatch) {
          const dynamicStyles = `
            .agent-suggested {
              ${styleMatch[1].includes('style=') ? styleMatch[1] : ''}
            }
            .${styleMatch[1]} {
              transition: all 0.3s ease;
              animation: highlight 1s ease;
            }
            @keyframes highlight {
              0% { box-shadow: 0 0 0 2px #3b82f6; }
              100% { box-shadow: 0 0 0 0 transparent; }
            }
          `;
          injectChangesToLivePreview(dynamicStyles);
        }
      }
    };
    
    window.addEventListener('applyAgentChanges', handleAgentChanges as EventListener);
    
    return () => {
      window.removeEventListener('applyAgentChanges', handleAgentChanges as EventListener);
    };
  }, []);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    onContentChange?.(newContent);
  };

  const insertElement = (type: 'heading' | 'text' | 'button' | 'image') => {
    const templates = {
      heading: '<h2 class="font-serif text-3xl font-light mb-4">New Heading</h2>',
      text: '<p class="text-gray-700 leading-relaxed mb-4">New paragraph text. Click to edit.</p>',
      button: '<button class="bg-black text-white px-6 py-2 font-light hover:bg-gray-900 transition-colors">New Button</button>',
      image: '<div class="bg-gray-100 aspect-video rounded flex items-center justify-center mb-4"><span class="text-gray-500">Image Placeholder</span></div>'
    };

    const newContent = content + '\n' + templates[type];
    handleContentChange(newContent);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        const imageElement = `<img src="${imageUrl}" alt="Uploaded image" class="max-w-full h-auto rounded mb-4" />`;
        const newContent = content + '\n' + imageElement;
        handleContentChange(newContent);
      };
      reader.readAsDataURL(file);
    }
  };

  // Enhanced live preview with change injection
  const injectChangesToLivePreview = (changes: string) => {
    if (iframeRef.current && showLivePreview) {
      try {
        const iframe = iframeRef.current;
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          // Inject CSS changes
          const styleElement = iframeDoc.createElement('style');
          styleElement.innerHTML = changes;
          iframeDoc.head.appendChild(styleElement);
          console.log('🎨 Live changes injected:', changes);
        }
      } catch (error) {
        console.warn('Could not inject changes to live preview:', error);
      }
    }
  };

  // Apply style changes to live preview
  useEffect(() => {
    if (showLivePreview && (selectedTextColor !== '#000000' || selectedFontSize !== 16 || selectedMargin !== '16px' || customCSSClass)) {
      const styleChanges = `
        .visual-editor-selection {
          color: ${selectedTextColor} !important;
          font-size: ${selectedFontSize}px !important;
          margin: ${selectedMargin} !important;
        }
        ${customCSSClass ? `.${customCSSClass} { /* Custom styles will be applied */ }` : ''}
      `;
      injectChangesToLivePreview(styleChanges);
    }
  }, [selectedTextColor, selectedFontSize, selectedMargin, customCSSClass, showLivePreview]);

  return (
    <div className={`h-full flex bg-white ${className}`}>
      {/* Main Content Area - Live Preview */}
      <div className="flex-1 flex flex-col">
        {/* Preview Header */}
        <div className="border-b border-gray-200 px-4 py-2 flex items-center justify-between bg-gray-50">
          <div className="flex items-center space-x-4">
            <Button
              variant={showLivePreview ? "default" : "outline"}
              size="sm"
              onClick={() => setShowLivePreview(!showLivePreview)}
            >
              <Eye className="w-4 h-4 mr-1" />
              {showLivePreview ? "Live Development Preview" : "Static Editor"}
            </Button>
            {showLivePreview && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (iframeRef.current) {
                    iframeRef.current.src = iframeRef.current.src; // Refresh iframe
                  }
                }}
              >
                🔄 Refresh
              </Button>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => onSave?.(content)}>
              <Save className="w-4 h-4 mr-1" />
              Save Changes
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(window.location.origin + '/visual-editor');
                alert('Visual editor URL copied to clipboard!');
              }}
            >
              📋 Share Editor
            </Button>
          </div>
        </div>

        {/* Live Development Preview */}
        {showLivePreview ? (
          <div className="flex-1 relative">
            <iframe
              ref={iframeRef}
              src="http://localhost:5000"
              className="w-full h-full border-0 visual-editor-iframe"
              title="Live Development Preview"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
              onLoad={() => {
                console.log('🚀 Live SSELFIE Studio loaded in preview');
                
                // Auto-apply any pending style changes
                if (selectedTextColor !== '#000000' || selectedFontSize !== 16 || selectedMargin !== '16px') {
                  setTimeout(() => {
                    const styleChanges = `
                      body { 
                        transition: all 0.3s ease; 
                      }
                      .visual-editor-selection, .agent-highlight {
                        color: ${selectedTextColor} !important;
                        font-size: ${selectedFontSize}px !important;
                        margin: ${selectedMargin} !important;
                        transition: all 0.3s ease !important;
                      }
                      .victoria-enhancement {
                        animation: victoria-magic 0.8s ease-out;
                      }
                      @keyframes victoria-magic {
                        0% { 
                          transform: scale(1); 
                          box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); 
                        }
                        50% { 
                          transform: scale(1.02); 
                          box-shadow: 0 0 20px 10px rgba(59, 130, 246, 0.3); 
                        }
                        100% { 
                          transform: scale(1); 
                          box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); 
                        }
                      }
                    `;
                    injectChangesToLivePreview(styleChanges);
                  }, 1000);
                }
                
                // Enable element highlighting on hover
                setTimeout(() => {
                  const hoverStyles = `
                    * {
                      transition: box-shadow 0.2s ease !important;
                    }
                    *:hover {
                      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3) !important;
                      cursor: pointer !important;
                    }
                    .editable-element {
                      position: relative;
                    }
                    .editable-element::after {
                      content: "✏️ Edit with Victoria";
                      position: absolute;
                      top: -25px;
                      left: 0;
                      background: rgba(0, 0, 0, 0.8);
                      color: white;
                      padding: 2px 6px;
                      border-radius: 3px;
                      font-size: 11px;
                      opacity: 0;
                      transition: opacity 0.2s ease;
                      pointer-events: none;
                      z-index: 1000;
                    }
                    .editable-element:hover::after {
                      opacity: 1;
                    }
                  `;
                  injectChangesToLivePreview(hoverStyles);
                }, 1500);
              }}
            />
            {/* Live Preview Indicator */}
            <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
              🔴 LIVE
            </div>
          </div>
        ) : (
          /* Static Content Editing */
          <div className="flex-1 p-6">
            <div 
              className="w-full h-full border border-gray-200 rounded-lg bg-white overflow-auto p-4"
              dangerouslySetInnerHTML={{ __html: content }}
              contentEditable
              onInput={(e) => {
                const newContent = e.currentTarget.innerHTML;
                handleContentChange(newContent);
              }}
              style={{
                outline: 'none',
                minHeight: '500px'
              }}
            />
          </div>
        )}
      </div>

      {/* Right Sidebar - Properties Panel */}
      <div className="w-80 border-l border-gray-200 bg-gray-50 flex flex-col">
        {/* Properties Header */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-900">Properties</h3>
        </div>

        {/* Styling Controls */}
        <div className="p-4 space-y-6 flex-1 overflow-y-auto">
          {/* Text Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Text Color
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={selectedTextColor}
                onChange={(e) => setSelectedTextColor(e.target.value)}
                className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
              />
              <Input
                value={selectedTextColor}
                onChange={(e) => setSelectedTextColor(e.target.value)}
                className="flex-1 text-sm"
                placeholder="#000000"
              />
            </div>
          </div>

          {/* Font Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Font Size
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="12"
                max="72"
                value={selectedFontSize}
                onChange={(e) => setSelectedFontSize(parseInt(e.target.value))}
                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="text-sm text-gray-600">{selectedFontSize}px</div>
            </div>
          </div>

          {/* Margin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Margin
            </label>
            <Input
              value={selectedMargin}
              onChange={(e) => setSelectedMargin(e.target.value)}
              className="w-full"
              placeholder="E.G. 16PX"
            />
          </div>

          {/* Custom CSS Class */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom CSS Class
            </label>
            <Input
              value={customCSSClass}
              onChange={(e) => setCustomCSSClass(e.target.value)}
              className="w-full"
              placeholder="E.G. MY-CUSTOM-CLASS"
            />
          </div>
        </div>

        {/* Live Style Application */}
        <div className="p-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Apply to Live Preview</h4>
          <Button
            variant="default"
            size="sm"
            className="w-full mb-3"
            onClick={() => {
              const styleChanges = `
                .visual-editor-selection, .selected-element {
                  color: ${selectedTextColor} !important;
                  font-size: ${selectedFontSize}px !important;
                  margin: ${selectedMargin} !important;
                  transition: all 0.3s ease !important;
                }
                ${customCSSClass ? `.${customCSSClass} { border: 2px solid #3b82f6; }` : ''}
              `;
              injectChangesToLivePreview(styleChanges);
            }}
          >
            🎨 Apply Styles Live
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => insertElement('heading')}
            >
              Add Heading
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => insertElement('text')}
            >
              Add Text Block
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => insertElement('button')}
            >
              Add Button
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Image
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>

        {/* Victoria Quick Commands */}
        <div className="p-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Victoria Quick Commands</h4>
          <div className="space-y-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs"
              onClick={() => {
                const luxuryStyles = `
                  * { font-family: 'Times New Roman', serif !important; }
                  h1, h2, h3 { font-weight: 300 !important; letter-spacing: 0.5px !important; }
                  body { background: #ffffff !important; color: #0a0a0a !important; }
                  .victoria-enhancement { animation: victoria-magic 0.8s ease-out; }
                `;
                injectChangesToLivePreview(luxuryStyles);
              }}
            >
              ✨ Apply Luxury Typography
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs"
              onClick={() => {
                const editorialStyles = `
                  .container { max-width: 1200px !important; margin: 0 auto !important; }
                  section { padding: 4rem 2rem !important; }
                  .editorial-spacing { margin-bottom: 3rem !important; }
                  .victoria-enhancement { animation: victoria-magic 0.8s ease-out; }
                `;
                injectChangesToLivePreview(editorialStyles);
              }}
            >
              📖 Editorial Layout
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs"
              onClick={() => {
                const vogueModeStyles = `
                  body { background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%) !important; }
                  h1 { font-size: 4rem !important; font-weight: 100 !important; text-align: center !important; }
                  .hero { min-height: 100vh !important; display: flex !important; align-items: center !important; }
                  .victoria-enhancement { animation: victoria-magic 0.8s ease-out; }
                `;
                injectChangesToLivePreview(vogueModeStyles);
              }}
            >
              👑 Vogue Mode
            </Button>
          </div>
        </div>

        {/* Platform Navigation Shortcuts */}
        <div className="p-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Navigate Platform</h4>
          <div className="space-y-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs"
              onClick={() => {
                if (iframeRef.current) {
                  iframeRef.current.src = window.location.origin;
                }
              }}
            >
              🏠 Landing Page
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs"
              onClick={() => {
                if (iframeRef.current) {
                  iframeRef.current.src = window.location.origin + '/workspace';
                }
              }}
            >
              💼 Workspace
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs"
              onClick={() => {
                if (iframeRef.current) {
                  iframeRef.current.src = window.location.origin + '/admin';
                }
              }}
            >
              ⚙️ Admin Dashboard
            </Button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: #3b82f6;
          cursor: pointer;
          border-radius: 50%;
        }
        
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #3b82f6;
          cursor: pointer;
          border-radius: 50%;
          border: none;
        }
      `}</style>
    </div>
  );
}