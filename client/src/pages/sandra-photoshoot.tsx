import React, { useState, useRef, useEffect } from 'react';
import { Navigation } from '@/components/navigation';
import { SandraImages } from '@/lib/sandra-images';
import { useToast } from '@/hooks/use-toast';

interface StyleButton {
  id: string;
  name: string;
  description: string;
  prompt: string;
  camera: string;
  texture: string;
}

interface ChatMessage {
  type: 'user' | 'sandra';
  message: string;
  styleButtons?: StyleButton[];
  timestamp: string;
}

export default function SandraPhotoshootPage() {
  const { toast } = useToast();

  // Pinterest starter prompts for immediate use
  const pinterestStarterPrompts: StyleButton[] = [
    {
      id: 'pinterest-starter-1',
      name: 'Sunset Contemplation',
      description: 'Golden hour magic, whole scenery, natural pose',
      prompt: 'usersandra_test_user_2025 woman, full body environmental shot, sunset beach setting, looking away from camera, long dark wavy hair flowing, shot on Nikon Z9 with 50mm f/1.2S lens, dramatic golden hour backlighting, warm atmospheric glow, flowing maxi dress, natural makeup, barefoot elegance, contemplative pose looking at horizon, not facing camera, serene moment, heavy 35mm film grain, pronounced texture',
      camera: 'Nikon Z9 with 50mm f/1.2S lens',
      texture: 'heavy 35mm film grain, pronounced texture'
    },
    {
      id: 'pinterest-starter-2',
      name: 'Garden Wanderer',
      description: 'Natural beauty, morning light, peaceful energy',
      prompt: 'usersandra_test_user_2025 woman, full body lifestyle shot, walking through luxury garden path, not looking at camera, shot on Sony A7R V with 55mm f/1.8 Zeiss lens, soft morning light filtering through leaves, natural daylight, flowing midi dress, natural textures, effortless styling, gentle walk among flowers, looking forward, peaceful movement, Kodak Portra 400 film aesthetic, visible grain structure',
      camera: 'Sony A7R V with 55mm f/1.8 Zeiss lens',
      texture: 'Kodak Portra 400 film aesthetic, visible grain structure'
    },
    {
      id: 'pinterest-starter-3',
      name: 'City Dreamer',
      description: 'Urban lifestyle, architectural beauty, confident energy',
      prompt: 'usersandra_test_user_2025 woman, full body street photography, city architectural backdrop, walking away from camera, shot on Leica Q2 with 28mm f/1.7 lens, natural city daylight, dramatic shadows and highlights, chic urban outfit, designer accessories, sophisticated styling, confident walking pose, looking ahead, urban exploration, analog film photography, raw grain texture',
      camera: 'Leica Q2 with 28mm f/1.7 lens',
      texture: 'analog film photography, raw grain texture'
    }
  ];

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      type: 'sandra',
      message: `Hey gorgeous! I'm Sandra, your AI photographer and style consultant. 

I specialize in creating Pinterest-style environmental shots where you're not looking at the camera and we can see the whole beautiful scenery. Think dreamy lifestyle vibes, luxury settings, and natural poses that look effortlessly expensive.

Here are some starter prompts to get you going, or tell me what mood you're feeling:`,
      styleButtons: pinterestStarterPrompts,
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [fullSizeImage, setFullSizeImage] = useState<string | null>(null);
  const [inspirationPhotos, setInspirationPhotos] = useState<string[]>([]);
  const [isUploadingInspiration, setIsUploadingInspiration] = useState(false);
  const [showInspirationUpload, setShowInspirationUpload] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 200);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load existing session images on component mount
  useEffect(() => {
    const loadSessionImages = async () => {
      try {
        const response = await fetch('/api/current-session-images');
        if (response.ok) {
          const data = await response.json();
          if (data.images && data.images.length > 0) {
            setSelectedImages(data.images);
            console.log('Loaded existing session images:', data.images.length);
          }
        }
      } catch (error) {
        console.error('Error loading session images:', error);
      }
    };

    loadSessionImages();
  }, []);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      type: 'user',
      message: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/sandra-ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const sandraMessage: ChatMessage = {
        type: 'sandra',
        message: data.message,
        styleButtons: data.styleButtons || [],
        timestamp: data.timestamp
      };

      setMessages(prev => [...prev, sandraMessage]);
      
      // Force scroll to bottom after Sandra's response
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 300);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        type: 'sandra',
        message: "I'm having a tech moment - try sharing your story again. I'm here to capture your authentic journey.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateImages = async (prompt: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          userId: 'sandra_test_user_2025'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.images && data.images.length > 0) {
        setSelectedImages(data.images);
        
        const successMessage: ChatMessage = {
          type: 'sandra',
          message: `Perfect! I captured ${data.images.length} moments from your story. These images reflect where you are right now - authentic, real, and beautifully you. Check them out below.`,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, successMessage]);
        
        // Force scroll to bottom after success message
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
        }, 300);
      }
    } catch (error) {
      console.error('Error generating images:', error);
      const errorMessage: ChatMessage = {
        type: 'sandra',
        message: "Oops! Something went wrong with the photoshoot generation. Let me know if you want to try again!",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveToGallery = async (imageUrl: string) => {
    try {
      const response = await fetch('/api/save-to-gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: imageUrl,
          userId: 'sandra_test_user_2025'
        }),
      });

      if (response.ok) {
        const successMessage: ChatMessage = {
          type: 'sandra',
          message: "Saved! That image is now part of your growing gallery. Your story is building beautifully.",
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, successMessage]);
      }
    } catch (error) {
      console.error('Error saving to gallery:', error);
    }
  };

  const savePromptToLibrary = async (styleButton: StyleButton) => {
    try {
      const response = await fetch('/api/save-prompt-to-library', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: styleButton.name,
          description: styleButton.description,
          prompt: styleButton.prompt,
          camera: styleButton.camera,
          texture: styleButton.texture,
          collection: 'Sandra Favorites',
          userId: 'sandra_test_user_2025'
        }),
      });

      if (response.ok) {
        toast({
          title: "Saved to Library",
          description: `"${styleButton.name}" has been saved to your Custom Prompts Library`,
        });
        
        const successMessage: ChatMessage = {
          type: 'sandra',
          message: `Perfect! I've saved "${styleButton.name}" to your Custom Prompts Library. You can access all your saved prompts anytime from your workspace!`,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, successMessage]);
      } else {
        throw new Error('Failed to save prompt');
      }
    } catch (error) {
      console.error('Error saving prompt to library:', error);
      toast({
        title: "Save Failed",
        description: "There was an issue saving your prompt. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleInspirationUpload = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please upload a valid image file (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingInspiration(true);

    try {
      // Convert file to base64 for demo purposes
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageDataUrl = e.target?.result as string;
        
        try {
          const response = await fetch('/api/upload-inspiration', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              imageUrl: imageDataUrl,
              description: 'User uploaded inspiration',
              source: 'upload'
            }),
          });

          if (response.ok) {
            setInspirationPhotos(prev => [...prev, imageDataUrl]);
            toast({
              title: "Inspiration Added",
              description: "Sandra can now see your style inspiration and will customize your images accordingly!",
            });
            
            const successMessage: ChatMessage = {
              type: 'sandra',
              message: "Perfect! I can see your inspiration photo now. I love your style! This will help me create AI images that match your aesthetic perfectly. What kind of photoshoot vibe are you feeling?",
              timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, successMessage]);
          } else {
            throw new Error('Upload failed');
          }
        } catch (error) {
          console.error('Error uploading inspiration:', error);
          toast({
            title: "Upload Failed",
            description: "There was an issue uploading your inspiration photo. Please try again.",
            variant: "destructive",
          });
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Upload Failed",
        description: "There was an issue processing your file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingInspiration(false);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleInspirationUpload(file);
    }
  };

  const removeInspirationPhoto = (index: number) => {
    setInspirationPhotos(prev => prev.filter((_, i) => i !== index));
    toast({
      title: "Inspiration Removed",
      description: "Inspiration photo has been removed from your reference gallery.",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-white touch-manipulation">
      {/* Navigation */}
      <Navigation />

      {/* Full Bleed Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-black text-white overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 opacity-40">
          <img 
            src={SandraImages.editorial.thinking}
            alt="Sandra - Your Story Matters"
            className="w-full h-full object-cover object-center"
          />
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-6xl mx-auto px-6 sm:px-8 md:px-12">
          <div className="text-[10px] sm:text-xs font-normal tracking-[0.3em] sm:tracking-[0.4em] uppercase text-white/70 mb-8 sm:mb-12">
            AI Photography That Gets You
          </div>
          
          <div className="mb-12 sm:mb-16">
            <h1 className="font-times text-[clamp(2.2rem,10vw,9rem)] leading-[0.9] font-extralight tracking-[0.05em] sm:tracking-[0.2em] md:tracking-[0.4em] uppercase mb-2 sm:mb-4 px-2">
              PHOTOSHOOT
            </h1>
            <h2 className="text-[10px] sm:text-xs font-light tracking-[0.3em] sm:tracking-[0.4em] uppercase text-white/70">
              WITH SANDRA
            </h2>
          </div>
          
          <p className="text-sm sm:text-base font-light max-w-lg sm:max-w-2xl mx-auto leading-relaxed mb-12 sm:mb-16 tracking-[0.02em] text-white/80">
            Your mess is your message. Let's capture the real you building something meaningful.
          </p>

          <div className="flex justify-center">
            <button
              onClick={() => document.getElementById('story-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-white text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] uppercase font-light pb-2 border-b border-white/30 hover:border-white transition-all duration-300 touch-manipulation"
            >
              Start Your Story
            </button>
          </div>
        </div>
      </section>

      {/* Story Philosophy Section */}
      <section className="py-20 sm:py-32 md:py-40 px-4 sm:px-6 md:px-8 bg-white text-center">
        <div className="max-w-5xl mx-auto">
          <div className="text-[10px] sm:text-xs font-normal tracking-[0.3em] sm:tracking-[0.4em] uppercase text-[#666666] mb-12 sm:mb-16">
            Photography Philosophy
          </div>
          <blockquote className="font-times text-[clamp(24px,6vw,72px)] italic leading-[1.2] tracking-[-0.02em] text-black mb-12 sm:mb-16">
            "Your mess is your message.<br />
            Your story is your strategy.<br />
            Let's capture both."
          </blockquote>
          <cite className="block text-xs sm:text-sm font-light tracking-[0.15em] sm:tracking-[0.2em] uppercase text-[#666666]">
            Sandra Sigurjónsdóttir
          </cite>
        </div>
      </section>

      {/* Editorial Visual Story */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-1 order-1 lg:order-1">
              <div className="aspect-[3/4] bg-[#f5f5f5] overflow-hidden">
                <img 
                  src={SandraImages.editorial.laptop1}
                  alt="Building Your Story"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="lg:col-span-1 text-center order-3 lg:order-2">
              <h3 className="font-times text-[clamp(1.5rem,5vw,3.5rem)] font-light tracking-[-0.01em] leading-[1.1] mb-6 sm:mb-8">
                Where You Are<br />
                Right Now<br />
                Matters
              </h3>
              <p className="text-sm sm:text-base font-light leading-relaxed text-[#666666] max-w-xs sm:max-w-sm mx-auto">
                Whether you're building something new, pivoting your path, or celebrating how far you've come—every chapter deserves to be documented.
              </p>
            </div>
            
            <div className="lg:col-span-1 order-2 lg:order-3">
              <div className="aspect-[3/4] bg-[#f5f5f5] overflow-hidden">
                <img 
                  src={SandraImages.editorial.aiSuccess}
                  alt="Your Success Story"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Chat Interface */}
      <section id="story-section" className="py-20 sm:py-24 md:py-32 px-4 sm:px-6 md:px-8 bg-[#f5f5f5]">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16 sm:mb-20">
            <div className="text-[10px] sm:text-xs font-normal tracking-[0.3em] sm:tracking-[0.4em] uppercase text-[#666666] mb-8 sm:mb-12">
              AI Photography Session
            </div>
            <h2 className="font-times text-[clamp(2rem,8vw,8rem)] leading-[0.9] font-extralight tracking-[-0.02em] uppercase text-black mb-12 sm:mb-16">
              Tell Sandra<br />Your Story
            </h2>
            <p className="text-base sm:text-lg font-light max-w-2xl sm:max-w-3xl mx-auto leading-relaxed text-[#666666]">
              I'm here to capture where you are in your journey. Whether you're building, growing, 
              celebrating, or pivoting—let's create images that reflect your authentic story.
            </p>
          </div>

          {/* Editorial Chat Studio */}
          <div className="bg-white max-w-6xl mx-auto overflow-hidden">
            <div className="min-h-[600px] sm:min-h-[700px] flex flex-col">
              {/* Studio Header */}
              <div className="bg-[#0a0a0a] text-white p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] tracking-[0.3em] uppercase font-light text-white/60 mb-1">
                      Photography Studio
                    </div>
                    <div className="font-times text-lg sm:text-xl font-light tracking-[0.1em]">
                      SANDRA SESSION
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] tracking-[0.2em] uppercase font-light text-white/60">
                      Live Session
                    </div>
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-1 ml-auto"></div>
                  </div>
                </div>
              </div>

              {/* Conversation Flow */}
              <div className="flex-1 p-6 sm:p-8 md:p-12 overflow-y-auto max-h-[500px] sm:max-h-[600px] space-y-12 sm:space-y-16">
                {messages.map((message, index) => (
                  <div key={index} className={`${message.type === 'user' ? 'ml-auto max-w-2xl' : 'mr-auto max-w-4xl'}`}>
                    {message.type === 'sandra' && (
                      <div className="flex items-start space-x-4 sm:space-x-6 mb-6">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#0a0a0a] flex items-center justify-center flex-shrink-0">
                          <div className="text-white text-xs sm:text-sm font-times font-light">S</div>
                        </div>
                        <div className="flex-1">
                          <div className="text-[10px] tracking-[0.2em] uppercase font-light text-[#666666] mb-2">
                            Sandra • {new Date(message.timestamp).toLocaleTimeString()}
                          </div>
                          <div className="font-light leading-relaxed text-sm sm:text-base text-[#0a0a0a] whitespace-pre-wrap">
                            {message.message}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {message.type === 'user' && (
                      <div className="text-right">
                        <div className="text-[10px] tracking-[0.2em] uppercase font-light text-[#666666] mb-2">
                          You • {new Date(message.timestamp).toLocaleTimeString()}
                        </div>
                        <div className="inline-block bg-[#f8f8f8] p-4 sm:p-6 max-w-lg">
                          <div className="font-light leading-relaxed text-sm sm:text-base text-[#0a0a0a] whitespace-pre-wrap">
                            {message.message}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Editorial Style Cards */}
                    {message.styleButtons && message.styleButtons.length > 0 && (
                      <div className="mt-8 sm:mt-12">
                        <div className="text-[10px] tracking-[0.3em] uppercase font-light text-[#666666] mb-6 sm:mb-8">
                          Photography Collections
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                          {message.styleButtons.map((button) => (
                            <div key={button.id} className="bg-white border border-[#e0e0e0] overflow-hidden hover:border-[#0a0a0a] transition-all duration-300 group">
                              {/* Card Header */}
                              <div className="p-4 sm:p-6 border-b border-[#f0f0f0]">
                                <div className="font-times text-lg sm:text-xl font-light tracking-[0.05em] text-[#0a0a0a] mb-2">
                                  {button.name}
                                </div>
                                <div className="text-xs sm:text-sm font-light text-[#666666] leading-relaxed mb-4">
                                  {button.description}
                                </div>
                                <div className="text-[10px] tracking-[0.15em] uppercase font-light text-[#999999] leading-relaxed">
                                  {button.camera}
                                </div>
                                <div className="text-[10px] tracking-[0.15em] uppercase font-light text-[#999999] mt-1">
                                  {button.texture}
                                </div>
                              </div>
                              
                              {/* Action Area */}
                              <div className="p-4 sm:p-6 bg-[#f8f8f8] group-hover:bg-[#f0f0f0] transition-colors">
                                <div className="space-y-3">
                                  <button
                                    onClick={() => generateImages(button.prompt)}
                                    className="w-full px-4 py-3 bg-[#0a0a0a] text-white text-[10px] sm:text-xs font-medium tracking-[0.2em] uppercase hover:bg-[#333333] transition-colors touch-manipulation"
                                  >
                                    Capture This Moment
                                  </button>
                                  <button
                                    onClick={() => savePromptToLibrary(button)}
                                    className="w-full px-4 py-3 border border-[#0a0a0a] text-[#0a0a0a] text-[10px] sm:text-xs font-medium tracking-[0.2em] uppercase hover:bg-[#f0f0f0] transition-colors touch-manipulation"
                                  >
                                    Save to Collection
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="mr-auto max-w-4xl">
                    <div className="flex items-start space-x-4 sm:space-x-6">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#0a0a0a] flex items-center justify-center flex-shrink-0">
                        <div className="text-white text-xs sm:text-sm font-times font-light">S</div>
                      </div>
                      <div className="flex-1">
                        <div className="text-[10px] tracking-[0.2em] uppercase font-light text-[#666666] mb-2">
                          Sandra • Creating...
                        </div>
                        <div className="font-light leading-relaxed text-sm sm:text-base text-[#0a0a0a] animate-pulse">
                          Analyzing your vision and preparing the perfect shot...
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Editorial Input Studio */}
              <div className="border-t border-[#e0e0e0] bg-[#f8f8f8] p-6 sm:p-8">
                {/* Inspiration Mood Board */}
                {inspirationPhotos.length > 0 && (
                  <div className="mb-6 sm:mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-[10px] tracking-[0.3em] uppercase font-light text-[#0a0a0a]">
                        Mood Board
                      </div>
                      <button
                        onClick={() => setShowInspirationUpload(!showInspirationUpload)}
                        className="text-[10px] tracking-[0.2em] uppercase font-light text-[#666666] hover:text-[#0a0a0a] transition-colors"
                      >
                        {showInspirationUpload ? 'Hide Upload' : 'Add References'}
                      </button>
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3">
                      {inspirationPhotos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square overflow-hidden bg-white border border-[#e0e0e0] hover:border-[#0a0a0a] transition-colors">
                            <img
                              src={photo}
                              alt={`Reference ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            onClick={() => removeInspirationPhoto(index)}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-[#0a0a0a] text-white text-[10px] flex items-center justify-center hover:bg-[#333333] transition-colors opacity-0 group-hover:opacity-100"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Style Reference Upload */}
                {(showInspirationUpload || inspirationPhotos.length === 0) && (
                  <div className="mb-6 sm:mb-8 bg-white border border-[#e0e0e0] p-6 sm:p-8">
                    <div className="text-center">
                      <div className="text-[10px] tracking-[0.3em] uppercase font-light text-[#0a0a0a] mb-4">
                        Style Reference Upload
                      </div>
                      <p className="text-xs sm:text-sm font-light text-[#666666] mb-6 leading-relaxed max-w-md mx-auto">
                        Share your Pinterest inspiration, lifestyle photos, or any visual references. 
                        Sandra will analyze your aesthetic and create images that match your unique style.
                      </p>
                      <button
                        onClick={triggerFileUpload}
                        disabled={isUploadingInspiration}
                        className="inline-block px-6 py-3 border border-[#0a0a0a] text-[#0a0a0a] text-[10px] sm:text-xs font-medium tracking-[0.2em] uppercase hover:bg-[#0a0a0a] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                      >
                        {isUploadingInspiration ? 'Processing...' : 'Choose Reference Images'}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                )}
                
                {/* Conversation Input */}
                <div className="bg-white border border-[#e0e0e0] p-6 sm:p-8">
                  <div className="text-[10px] tracking-[0.3em] uppercase font-light text-[#666666] mb-4">
                    Direct Sandra
                  </div>
                  <div className="space-y-4">
                    <textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Tell Sandra about your story, your current chapter, where you're going..."
                      className="w-full p-4 sm:p-6 border border-[#e0e0e0] resize-none focus:outline-none focus:border-[#0a0a0a] font-light text-sm sm:text-base leading-relaxed bg-white"
                      rows={3}
                      disabled={isLoading}
                    />
                    <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:space-x-3">
                      <button
                        onClick={() => setShowInspirationUpload(!showInspirationUpload)}
                        className="px-4 py-3 border border-[#e0e0e0] text-[#666666] text-[10px] sm:text-xs font-light tracking-[0.15em] uppercase hover:bg-[#f0f0f0] transition-colors touch-manipulation"
                        title="Upload inspiration photo"
                      >
                        Add Reference
                      </button>
                      <button
                        onClick={sendMessage}
                        disabled={!inputMessage.trim() || isLoading}
                        className="flex-1 px-6 sm:px-8 py-3 sm:py-4 bg-[#0a0a0a] text-white font-light tracking-[0.15em] uppercase disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#333333] transition-colors touch-manipulation text-xs sm:text-sm"
                      >
                        {isLoading ? 'Directing...' : 'Direct Sandra'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Generated Images - Lookbook Style */}
          {selectedImages.length > 0 && (
            <div className="mt-12 sm:mt-16">
              <div className="text-center mb-8 sm:mb-12">
                <h3 className="font-times text-[clamp(1.5rem,5vw,4rem)] font-light tracking-[-0.01em] mb-4">
                  Your Story, Captured
                </h3>
                <p className="text-xs sm:text-sm font-light tracking-[0.15em] sm:tracking-[0.2em] uppercase text-[#666666]">
                  {selectedImages.length} Images from this session
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
                {selectedImages.map((imageUrl, index) => (
                  <div key={index} className="group">
                    <div className="aspect-[4/5] overflow-hidden bg-[#f8f8f8] relative mb-3 sm:mb-4">
                      <img
                        src={imageUrl}
                        alt={`Your story ${index + 1}`}
                        className="w-full h-full object-cover cursor-pointer transition-all duration-500 group-hover:scale-105 touch-manipulation"
                        onClick={() => setFullSizeImage(imageUrl)}
                      />
                      {/* Minimal overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] uppercase font-light text-[#666666] mb-1 sm:mb-2">
                        Image {index + 1}
                      </div>
                      <div className="flex justify-center gap-2 sm:gap-3">
                        <button
                          onClick={() => setFullSizeImage(imageUrl)}
                          className="text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] uppercase font-light text-black hover:text-[#666666] transition-colors touch-manipulation"
                        >
                          View
                        </button>
                        <span className="text-[#e0e0e0] text-xs">•</span>
                        <button
                          onClick={() => saveToGallery(imageUrl)}
                          className="text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] uppercase font-light text-black hover:text-[#666666] transition-colors touch-manipulation"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Size Image Modal */}
          {fullSizeImage && (
            <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-2 sm:p-4" onClick={() => setFullSizeImage(null)}>
              <div className="relative max-w-full max-h-full">
                <img
                  src={fullSizeImage}
                  alt="Full size photo"
                  className="max-w-full max-h-full object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <button
                    onClick={() => saveToGallery(fullSizeImage)}
                    className="px-3 sm:px-4 py-2 bg-white text-black font-light hover:bg-[#f0f0f0] transition-colors text-xs sm:text-sm touch-manipulation"
                  >
                    Save to Gallery
                  </button>
                  <a
                    href={fullSizeImage}
                    download={`sandra-photoshoot-${Date.now()}.jpg`}
                    className="px-3 sm:px-4 py-2 bg-[#0a0a0a] text-white font-light hover:bg-[#333333] transition-colors inline-block text-xs sm:text-sm touch-manipulation text-center"
                  >
                    Download
                  </a>
                  <button
                    onClick={() => setFullSizeImage(null)}
                    className="px-3 sm:px-4 py-2 bg-[#666666] text-white font-light hover:bg-[#888888] transition-colors text-xs sm:text-sm touch-manipulation"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}


        </div>
      </section>
    </div>
  );
}