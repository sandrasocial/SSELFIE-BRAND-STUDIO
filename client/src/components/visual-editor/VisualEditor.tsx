import React, { useState, useRef, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

interface VisualEditorProps {
  initialContent?: string;
  onContentChange?: (content: string) => void;
  onSave?: (content: string) => void;
  className?: string;
}

interface EditableElement {
  id: string;
  type: 'text' | 'image' | 'button' | 'heading';
  content: string;
  styles: Record<string, string>;
  position: { x: number; y: number };
}

export function VisualEditor({ 
  initialContent = '', 
  onContentChange,
  onSave,
  className = ''
}: VisualEditorProps) {
  const [activeTab, setActiveTab] = useState('visual');
  const [content, setContent] = useState(initialContent);
  const [elements, setElements] = useState<EditableElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize with platform navigation and content
  useEffect(() => {
    if (!content && !initialContent) {
      const platformContent = `
        <!-- SSELFIE Studio Platform Navigation -->
        <nav class="bg-black text-white px-4 py-3">
          <div class="max-w-7xl mx-auto flex items-center justify-between">
            <div class="flex items-center space-x-8">
              <div class="font-serif text-lg tracking-wide">SSELFIE STUDIO</div>
              <div class="flex space-x-6">
                <a href="#landing" class="text-sm uppercase tracking-wide hover:text-gray-300 nav-link">Landing</a>
                <a href="#workspace" class="text-sm uppercase tracking-wide hover:text-gray-300 nav-link">Workspace</a>
                <a href="#pricing" class="text-sm uppercase tracking-wide hover:text-gray-300 nav-link">Pricing</a>
                <a href="#about" class="text-sm uppercase tracking-wide hover:text-gray-300 nav-link">About</a>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <a href="#profile" class="text-sm uppercase tracking-wide hover:text-gray-300">Profile</a>
              <a href="#logout" class="text-sm uppercase tracking-wide hover:text-gray-300">Logout</a>
            </div>
          </div>
        </nav>

        <!-- Landing Page Section -->
        <section id="landing" class="page-section min-h-screen bg-white">
          <div class="max-w-4xl mx-auto px-8 py-16">
            <h1 class="font-serif text-6xl font-light mb-8 text-center">SSELFIE Studio</h1>
            <p class="text-xl text-gray-600 max-w-2xl mx-auto text-center mb-12">Professional AI photos that build your entire personal brand</p>
            <div class="text-center">
              <button class="bg-black text-white px-8 py-3 font-light hover:bg-gray-900 transition-colors">Start Your Studio €47/month</button>
            </div>
            <div class="grid md:grid-cols-2 gap-8 mt-16">
              <div class="space-y-6">
                <h2 class="font-serif text-3xl font-light">From Selfie to Business Launch</h2>
                <p class="text-gray-700 leading-relaxed">Upload a few selfies. Get professional photos that build your entire personal brand.</p>
                <ul class="space-y-2 text-gray-700">
                  <li>• AI-powered professional photos</li>
                  <li>• Luxury editorial styling</li>
                  <li>• Complete brand assets</li>
                  <li>• Business launch templates</li>
                </ul>
              </div>
              <div class="bg-gray-100 aspect-square rounded flex items-center justify-center">
                <span class="text-gray-500">AI Gallery Preview</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Workspace Section -->
        <section id="workspace" class="page-section min-h-screen bg-gray-50 hidden">
          <div class="max-w-6xl mx-auto px-8 py-16">
            <div class="mb-8">
              <h1 class="font-serif text-4xl font-light mb-4">Your SSELFIE Studio</h1>
              <p class="text-gray-600">Create professional AI photos and build your brand</p>
            </div>
            
            <div class="grid lg:grid-cols-3 gap-8">
              <!-- AI Photoshoot Card -->
              <div class="bg-white p-6 border border-gray-200">
                <h3 class="font-serif text-xl mb-4">AI Photoshoot</h3>
                <p class="text-gray-600 mb-4">Generate professional photos with your trained AI model</p>
                <button class="w-full bg-black text-white py-2 hover:bg-gray-800">Start Photoshoot</button>
              </div>
              
              <!-- Maya AI Chat -->
              <div class="bg-white p-6 border border-gray-200">
                <h3 class="font-serif text-xl mb-4">Maya AI</h3>
                <p class="text-gray-600 mb-4">Chat with Maya for custom photo generation and advice</p>
                <button class="w-full bg-black text-white py-2 hover:bg-gray-800">Chat with Maya</button>
              </div>
              
              <!-- Gallery -->
              <div class="bg-white p-6 border border-gray-200">
                <h3 class="font-serif text-xl mb-4">Your Gallery</h3>
                <p class="text-gray-600 mb-4">View and manage your AI-generated photos</p>
                <button class="w-full bg-black text-white py-2 hover:bg-gray-800">View Gallery</button>
              </div>
            </div>
            
            <!-- Recent Photos -->
            <div class="mt-12">
              <h2 class="font-serif text-2xl mb-6">Recent Photos</h2>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-gray-200 aspect-square rounded"></div>
                <div class="bg-gray-200 aspect-square rounded"></div>
                <div class="bg-gray-200 aspect-square rounded"></div>
                <div class="bg-gray-200 aspect-square rounded"></div>
              </div>
            </div>
          </div>
        </section>

        <!-- Pricing Section -->
        <section id="pricing" class="page-section min-h-screen bg-white hidden">
          <div class="max-w-4xl mx-auto px-8 py-16">
            <div class="text-center mb-12">
              <h1 class="font-serif text-4xl font-light mb-4">Choose Your Plan</h1>
              <p class="text-gray-600">Start free, upgrade when you're ready to build your empire</p>
            </div>
            
            <div class="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              <!-- Free Plan -->
              <div class="border border-gray-200 p-8">
                <h3 class="font-serif text-2xl mb-4">Free</h3>
                <div class="text-3xl font-light mb-4">€0<span class="text-lg text-gray-600">/month</span></div>
                <ul class="space-y-2 text-gray-700 mb-6">
                  <li>• 6 AI photos per month</li>
                  <li>• Basic templates</li>
                  <li>• Community support</li>
                </ul>
                <button class="w-full bg-gray-900 text-white py-3 hover:bg-black">Get Started Free</button>
              </div>
              
              <!-- Premium Plan -->
              <div class="border-2 border-black p-8 relative">
                <div class="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span class="bg-black text-white px-4 py-1 text-sm uppercase tracking-wide">Popular</span>
                </div>
                <h3 class="font-serif text-2xl mb-4">SSELFIE Studio</h3>
                <div class="text-3xl font-light mb-4">€47<span class="text-lg text-gray-600">/month</span></div>
                <ul class="space-y-2 text-gray-700 mb-6">
                  <li>• Unlimited AI photos</li>
                  <li>• Maya AI chat assistant</li>
                  <li>• Premium templates</li>
                  <li>• Priority support</li>
                  <li>• Commercial license</li>
                </ul>
                <button class="w-full bg-black text-white py-3 hover:bg-gray-800">Upgrade Now</button>
              </div>
            </div>
          </div>
        </section>

        <!-- About Section -->
        <section id="about" class="page-section min-h-screen bg-gray-50 hidden">
          <div class="max-w-4xl mx-auto px-8 py-16">
            <div class="text-center mb-12">
              <h1 class="font-serif text-4xl font-light mb-4">About SSELFIE Studio</h1>
              <p class="text-xl text-gray-600">The world's first AI-powered personal branding platform</p>
            </div>
            
            <div class="grid md:grid-cols-2 gap-12 items-center">
              <div class="space-y-6">
                <h2 class="font-serif text-2xl font-light">From Selfie to Empire</h2>
                <p class="text-gray-700 leading-relaxed">
                  SSELFIE Studio transforms your phone photos into professional business assets. 
                  Our AI learns your unique style and creates unlimited professional photos 
                  that build your personal brand.
                </p>
                <p class="text-gray-700 leading-relaxed">
                  Founded by Sandra, who built her own empire from a simple selfie, 
                  SSELFIE Studio helps entrepreneurs, coaches, and creators launch 
                  their businesses in just 20 minutes.
                </p>
              </div>
              <div class="bg-gray-200 aspect-square rounded flex items-center justify-center">
                <span class="text-gray-500">Sandra's Story</span>
              </div>
            </div>
          </div>
        </section>

        <style>
          .page-section.hidden { display: none; }
          .nav-link.active { color: #d1d5db; }
        </style>

        <script>
          // Simple navigation handling
          document.addEventListener('click', function(e) {
            if (e.target.classList.contains('nav-link')) {
              e.preventDefault();
              const targetId = e.target.getAttribute('href').substring(1);
              
              // Hide all sections
              document.querySelectorAll('.page-section').forEach(section => {
                section.classList.add('hidden');
              });
              
              // Show target section
              const targetSection = document.getElementById(targetId);
              if (targetSection) {
                targetSection.classList.remove('hidden');
              }
              
              // Update nav active state
              document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
              });
              e.target.classList.add('active');
            }
          });
        </script>
      `;
      setContent(platformContent.trim());
    }
  }, [initialContent]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    onContentChange?.(newContent);
  };

  const handleSave = () => {
    onSave?.(content);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        // Replace placeholder images in content
        const updatedContent = content.replace(
          /Image Placeholder/g, 
          `<img src="${imageUrl}" alt="Uploaded image" class="w-full h-full object-cover rounded" />`
        );
        handleContentChange(updatedContent);
      };
      reader.readAsDataURL(file);
    }
  };

  const insertElement = (type: 'heading' | 'text' | 'button' | 'image' | 'section' | 'nav') => {
    const templates = {
      heading: '<h2 class="font-serif text-3xl font-light mb-4">New Heading</h2>',
      text: '<p class="text-gray-700 leading-relaxed mb-4">New paragraph text. Click to edit.</p>',
      button: '<button class="bg-black text-white px-6 py-2 font-light hover:bg-gray-900 transition-colors">New Button</button>',
      image: '<div class="bg-gray-100 aspect-video rounded flex items-center justify-center mb-4"><span class="text-gray-500">Image Placeholder</span></div>',
      section: '<section class="min-h-screen bg-white py-16"><div class="max-w-4xl mx-auto px-8"><h2 class="font-serif text-4xl font-light mb-8">New Section</h2><p class="text-gray-600">Section content goes here...</p></div></section>',
      nav: '<nav class="bg-black text-white px-4 py-3"><div class="max-w-7xl mx-auto flex items-center justify-between"><div class="font-serif text-lg">Navigation</div><div class="flex space-x-6"><a href="#" class="text-sm uppercase hover:text-gray-300">Link 1</a><a href="#" class="text-sm uppercase hover:text-gray-300">Link 2</a></div></div></nav>'
    };

    const newContent = content + '\n' + templates[type];
    handleContentChange(newContent);
  };

  const makeContentEditable = (htmlContent: string) => {
    return htmlContent
      .replace(/<h([1-6])[^>]*>/g, '<h$1 contenteditable="true" class="editable-element" data-type="heading">')
      .replace(/<p[^>]*>/g, '<p contenteditable="true" class="editable-element" data-type="text">')
      .replace(/<button[^>]*>/g, '<button contenteditable="true" class="editable-element" data-type="button">');
  };

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Editor Toolbar */}
      <div className="border-b bg-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => insertElement('heading')}
          >
            <Type className="w-4 h-4 mr-1" />
            Heading
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => insertElement('text')}
          >
            <Layout className="w-4 h-4 mr-1" />
            Text
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => insertElement('button')}
          >
            <Wand2 className="w-4 h-4 mr-1" />
            Button
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Image className="w-4 h-4 mr-1" />
            Image
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => insertElement('section')}
          >
            <Layout className="w-4 h-4 mr-1" />
            Section
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
          >
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
        </div>
      </div>

      {/* Editor Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 bg-gray-50">
          <TabsTrigger value="visual" className="flex items-center space-x-2">
            <Eye className="w-4 h-4" />
            <span>Visual Editor</span>
          </TabsTrigger>
          <TabsTrigger value="code" className="flex items-center space-x-2">
            <Code className="w-4 h-4" />
            <span>Code Editor</span>
          </TabsTrigger>
        </TabsList>

        {/* Visual Editor Tab */}
        <TabsContent value="visual" className="flex-1 p-0">
          <div className="h-full flex">
            {/* Preview Area */}
            <div className="flex-1 bg-white border-r overflow-auto">
              <div 
                ref={previewRef}
                className="min-h-full"
                dangerouslySetInnerHTML={{ 
                  __html: makeContentEditable(content)
                }}
                onInput={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.classList.contains('editable-element')) {
                    // Update content when user edits directly
                    const updatedContent = previewRef.current?.innerHTML || '';
                    handleContentChange(updatedContent);
                  }
                }}
              />
            </div>

            {/* Properties Panel */}
            <div className="w-80 bg-gray-50 p-4 overflow-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Element Properties</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">
                      Background Color
                    </label>
                    <Input
                      type="color"
                      defaultValue="#ffffff"
                      className="w-full h-8"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">
                      Text Color
                    </label>
                    <Input
                      type="color"
                      defaultValue="#000000"
                      className="w-full h-8"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">
                      Font Size
                    </label>
                    <Input
                      type="range"
                      min="12"
                      max="72"
                      defaultValue="16"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">
                      Margin
                    </label>
                    <Input
                      placeholder="e.g. 16px"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">
                      Custom CSS Class
                    </label>
                    <Input
                      placeholder="e.g. my-custom-class"
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-sm">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => insertElement('heading')}
                  >
                    Add Heading
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => insertElement('text')}
                  >
                    Add Text Block
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => insertElement('button')}
                  >
                    Add Button
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload Image
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Code Editor Tab */}
        <TabsContent value="code" className="flex-1 p-4">
          <Textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            className="h-full font-mono text-sm"
            placeholder="Enter your HTML content here..."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}