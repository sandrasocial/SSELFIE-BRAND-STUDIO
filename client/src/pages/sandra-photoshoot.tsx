import React, { useState, useRef, useEffect } from 'react';
import SandraNavigation from '@/components/SandraNavigation';
import { SandraImages } from '@/lib/sandra-images';

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
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      type: 'sandra',
      message: `Hey gorgeous! I'm Sandra, your AI photographer who understands your story.

This isn't about creating perfect photos. It's about capturing the moments that show who you're becoming. Your journey. Your growth. Your authentic energy.

Tell me about where you are in your story right now. What chapter are you writing?`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [fullSizeImage, setFullSizeImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <SandraNavigation />

      {/* Full Bleed Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-black text-white overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 opacity-40">
          <img 
            src={SandraImages.editorial.thinking}
            alt="Sandra - Your Story Matters"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-6xl mx-auto px-8">
          <div className="text-xs font-normal tracking-[0.4em] uppercase text-white/60 mb-12">
            Your Story Captured
          </div>
          
          <div className="mb-20">
            <h1 className="font-times text-[clamp(4rem,12vw,14rem)] leading-[0.85] font-extralight tracking-[-0.02em] uppercase mb-8">
              Every Photo<br />
              Tells Your Story
            </h1>
          </div>
          
          <p className="text-lg font-light max-w-3xl mx-auto leading-relaxed mb-16 tracking-[0.02em]">
            This isn't about perfection. It's about capturing the authentic moments that show who you're becoming. 
            Your growth. Your journey. Your real story.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button
              onClick={() => document.getElementById('story-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-12 py-5 bg-white text-black font-light tracking-[0.1em] uppercase transition-all duration-300 hover:bg-[#f5f5f5] border border-white"
            >
              Start Your Session
            </button>
          </div>
        </div>
      </section>

      {/* Story Philosophy Section */}
      <section className="py-40 px-8 bg-white text-center">
        <div className="max-w-5xl mx-auto">
          <div className="text-xs font-normal tracking-[0.4em] uppercase text-[#666666] mb-16">
            Photography Philosophy
          </div>
          <blockquote className="font-times text-[clamp(32px,5vw,72px)] italic leading-[1.2] tracking-[-0.02em] text-black mb-16">
            "Your mess is your message.<br />
            Your story is your strategy.<br />
            Let's capture both."
          </blockquote>
          <cite className="block text-sm font-light tracking-[0.2em] uppercase text-[#666666]">
            Sandra Sigurjónsdóttir
          </cite>
        </div>
      </section>

      {/* Editorial Visual Story */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-center">
            <div className="lg:col-span-1">
              <div className="aspect-[3/4] bg-[#f5f5f5] overflow-hidden">
                <img 
                  src={SandraImages.editorial.laptop1}
                  alt="Building Your Story"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="lg:col-span-1 text-center">
              <h3 className="font-times text-[clamp(2rem,4vw,3.5rem)] font-light tracking-[-0.01em] leading-[1.1] mb-8">
                Where You Are<br />
                Right Now<br />
                Matters
              </h3>
              <p className="text-base font-light leading-relaxed text-[#666666] max-w-sm mx-auto">
                Whether you're building something new, pivoting your path, or celebrating how far you've come—every chapter deserves to be documented.
              </p>
            </div>
            
            <div className="lg:col-span-1">
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
      <section id="story-section" className="py-32 px-8 bg-[#f5f5f5]">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="text-xs font-normal tracking-[0.4em] uppercase text-[#666666] mb-12">
              AI Photography Session
            </div>
            <h2 className="font-times text-[clamp(3rem,7vw,8rem)] leading-[0.9] font-extralight tracking-[-0.02em] uppercase text-black mb-16">
              Tell Sandra<br />Your Story
            </h2>
            <p className="text-lg font-light max-w-3xl mx-auto leading-relaxed text-[#666666]">
              I'm here to capture where you are in your journey. Whether you're building, growing, 
              celebrating, or pivoting—let's create images that reflect your authentic story.
            </p>
          </div>

          {/* Chat Container */}
          <div className="bg-white border border-[#e0e0e0] max-w-4xl mx-auto">
            <div className="min-h-[600px] flex flex-col">
              {/* Messages */}
              <div className="flex-1 p-8 overflow-y-auto max-h-[500px] space-y-8">
                {messages.map((message, index) => (
                  <div key={index} className={`${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block max-w-[80%] p-4 ${
                      message.type === 'user' 
                        ? 'bg-[#0a0a0a] text-white' 
                        : 'bg-[#f8f8f8] text-[#0a0a0a]'
                    }`}>
                      <div className="whitespace-pre-wrap font-light leading-relaxed">
                        {message.message}
                      </div>
                      
                      {/* Style Buttons */}
                      {message.styleButtons && message.styleButtons.length > 0 && (
                        <div className="mt-4 space-y-3">
                          <div className="text-sm font-medium mb-2">Choose Your Style:</div>
                          {message.styleButtons.map((button) => (
                            <div key={button.id} className="border border-[#e0e0e0] p-3 hover:bg-[#f0f0f0] transition-colors cursor-pointer"
                                 onClick={() => generateImages(button.prompt)}>
                              <div className="font-medium text-sm mb-1">{button.name}</div>
                              <div className="text-xs text-[#666666] mb-2">{button.description}</div>
                              <div className="text-xs text-[#999999]">
                                {button.camera} • {button.texture}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-[#999999] mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="text-left">
                    <div className="inline-block bg-[#f8f8f8] text-[#0a0a0a] p-4">
                      <div className="animate-pulse">Sandra is thinking...</div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-[#e0e0e0] p-4">
                <div className="flex space-x-3">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Tell Sandra about your story, your current chapter, where you're going..."
                    className="flex-1 p-4 border border-[#e0e0e0] resize-none focus:outline-none focus:border-[#0a0a0a] font-light"
                    rows={2}
                    disabled={isLoading}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="px-8 py-4 bg-[#0a0a0a] text-white font-light tracking-[0.1em] uppercase disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#333333] transition-colors"
                  >
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Generated Images - Lookbook Style */}
          {selectedImages.length > 0 && (
            <div className="mt-16">
              <div className="text-center mb-12">
                <h3 className="font-times text-[clamp(2rem,4vw,4rem)] font-light tracking-[-0.01em] mb-4">
                  Your Story, Captured
                </h3>
                <p className="text-sm font-light tracking-[0.2em] uppercase text-[#666666]">
                  {selectedImages.length} Images from this session
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {selectedImages.map((imageUrl, index) => (
                  <div key={index} className="group">
                    <div className="aspect-[4/5] overflow-hidden bg-[#f8f8f8] relative mb-4">
                      <img
                        src={imageUrl}
                        alt={`Your story ${index + 1}`}
                        className="w-full h-full object-cover cursor-pointer transition-all duration-500 group-hover:scale-105"
                        onClick={() => setFullSizeImage(imageUrl)}
                      />
                      {/* Minimal overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs tracking-[0.3em] uppercase font-light text-[#666666] mb-2">
                        Image {index + 1}
                      </div>
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => setFullSizeImage(imageUrl)}
                          className="text-xs tracking-[0.2em] uppercase font-light text-black hover:text-[#666666] transition-colors"
                        >
                          View
                        </button>
                        <span className="text-[#e0e0e0]">•</span>
                        <button
                          onClick={() => saveToGallery(imageUrl)}
                          className="text-xs tracking-[0.2em] uppercase font-light text-black hover:text-[#666666] transition-colors"
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
            <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4" onClick={() => setFullSizeImage(null)}>
              <div className="relative max-w-full max-h-full">
                <img
                  src={fullSizeImage}
                  alt="Full size photo"
                  className="max-w-full max-h-full object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button
                    onClick={() => saveToGallery(fullSizeImage)}
                    className="px-4 py-2 bg-white text-black font-light hover:bg-[#f0f0f0] transition-colors"
                  >
                    Save to Gallery
                  </button>
                  <a
                    href={fullSizeImage}
                    download={`sandra-photoshoot-${Date.now()}.jpg`}
                    className="px-4 py-2 bg-[#0a0a0a] text-white font-light hover:bg-[#333333] transition-colors inline-block"
                  >
                    Download
                  </a>
                  <button
                    onClick={() => setFullSizeImage(null)}
                    className="px-4 py-2 bg-[#666666] text-white font-light hover:bg-[#888888] transition-colors"
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