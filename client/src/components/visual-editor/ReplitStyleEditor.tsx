import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  RefreshCw, 
  Play, 
  Pause, 
  Code2, 
  Eye, 
  EyeOff,
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
  const [content, setContent] = useState(initialContent);
  const [showLivePreview, setShowLivePreview] = useState(true);
  const [selectedTextColor, setSelectedTextColor] = useState('#000000');
  const [selectedFontSize, setSelectedFontSize] = useState(16);
  const [selectedMargin, setSelectedMargin] = useState('16px');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    onContentChange?.(content);
  }, [content, onContentChange]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  return (
    <div className={`h-screen bg-white flex ${className}`}>
      {/* Left Panel - Code Editor */}
      <div className="w-1/2 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-medium text-gray-900">Style Editor</h2>
            <Badge variant="secondary" className="bg-black text-white border-black">
              <div className="w-2 h-2 bg-white mr-2"></div>
              REPLIT STYLE
            </Badge>
          </div>
          
          {/* Toolbar */}
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => onSave?.(content)}>
              <Save className="w-4 h-4 mr-1" />
              Save Changes
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLivePreview(!showLivePreview)}
            >
              {showLivePreview ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
              {showLivePreview ? 'Hide Preview' : 'Show Preview'}
            </Button>
          </div>
        </div>

        {/* Code Editing Area */}
        <div className="flex-1 p-4">
          <textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Enter your HTML/CSS code here..."
            className="w-full h-full border border-gray-300 rounded-lg p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ minHeight: '400px' }}
          />
        </div>
      </div>

      {/* Right Panel - Live Preview or Static Content */}
      <div className="w-1/2 flex flex-col">
        {/* Preview Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Live Preview</h3>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.open('/', '_blank');
                }}
              >
                Open in New Window
              </Button>
            </div>
          </div>
        </div>

        {/* Smart Live Preview */}
        {showLivePreview ? (
          <div className="flex-1 relative">
            {(() => {
              const isProduction = window.location.hostname !== 'localhost' && !window.location.hostname.includes('replit.dev');
              
              if (isProduction) {
                // Production: Show actual iframe preview
                return (
                  <iframe
                    ref={iframeRef}
                    src="/"
                    className="w-full h-full border-0"
                    title="Live Preview"
                    onLoad={() => {
                      console.log('🚀 Replit Style Editor: Live preview loaded successfully');
                    }}
                    onError={(e) => {
                      console.error('Live preview failed to load:', e);
                    }}
                  />
                );
              } else {
                // Development: Show safe placeholder to avoid CSP issues
                return (
                  <div className="w-full h-full bg-white flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="text-3xl mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
                        SSELFIE Studio
                      </div>
                      <div className="w-12 h-px bg-black mx-auto mb-4"></div>
                      <div className="text-lg mb-3 font-light">Development Preview</div>
                      <div className="text-sm text-gray-600 mb-6">
                        In development mode, preview opens safely in a new window. 
                        In production, live preview will be embedded here.
                      </div>
                      <button
                        onClick={() => {
                          console.log('🚀 Opening live preview from Replit Style Editor');
                          window.open('/', '_blank');
                        }}
                        className="px-6 py-3 bg-black text-white border border-black hover:bg-gray-800 transition-colors"
                      >
                        OPEN LIVE PREVIEW
                      </button>
                    </div>
                  </div>
                );
              }
            })()}
            {/* Live Preview Indicator */}
            <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
              🟢 LIVE
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

        {/* Properties Panel */}
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <h4 className="font-medium text-gray-900 mb-3">Quick Styles</h4>
          
          <div className="space-y-3">
            {/* Text Color */}
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-700 w-20">Color:</label>
              <input
                type="color"
                value={selectedTextColor}
                onChange={(e) => setSelectedTextColor(e.target.value)}
                className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
              />
              <Input
                value={selectedTextColor}
                onChange={(e) => setSelectedTextColor(e.target.value)}
                className="flex-1 text-sm"
                placeholder="#000000"
              />
            </div>

            {/* Font Size */}
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-700 w-20">Size:</label>
              <input
                type="range"
                min="12"
                max="48"
                value={selectedFontSize}
                onChange={(e) => setSelectedFontSize(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm text-gray-600 w-12">{selectedFontSize}px</span>
            </div>

            {/* Apply Button */}
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                console.log('Applying styles with color:', selectedTextColor, 'size:', selectedFontSize);
              }}
            >
              Apply Styles
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}