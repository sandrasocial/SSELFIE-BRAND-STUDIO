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
              {showLivePreview ? "Live Preview" : "Static Content"}
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => onSave?.(content)}>
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
          </div>
        </div>

        {/* Live Development Preview */}
        {showLivePreview ? (
          <div className="flex-1">
            <iframe
              ref={iframeRef}
              src={window.location.origin}
              className="w-full h-full border-0"
              title="Live Development Preview"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
              onLoad={() => {
                console.log('Live preview loaded');
              }}
            />
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