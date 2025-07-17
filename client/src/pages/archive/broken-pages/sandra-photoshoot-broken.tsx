import React, { useState, useRef, useEffect } from 'react';
import SandraNavigation from '@/components/SandraNavigation';

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
      message: `Hey gorgeous! I'm Sandra, your AI photographer and style consultant. 

I specialize in creating Pinterest-style environmental shots where you're not looking at the camera and we can see the whole beautiful scenery. Think dreamy lifestyle vibes, luxury settings, and natural poses that look effortlessly expensive.

What kind of mood are you going for today?`,
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
        message: "Sorry babe, I'm having a tech moment! Try asking me again - I'm excited to help with your photoshoot vision! 💫",
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
          prompt: prompt
          // Note: userId handled by backend authentication
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
          message: `Beautiful! I just generated ${data.images.length} stunning photos for you. These have that Pinterest-style environmental vibe you wanted - check them out below! Click any photo to view full size or save to your gallery. ✨`,
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
          imageUrl: imageUrl
          // Note: userId handled by backend authentication
        }),
      });

      if (response.ok) {
        const successMessage: ChatMessage = {
          type: 'sandra',
          message: "Perfect! I saved that gorgeous photo to your gallery. You can view all your saved photos anytime! 💫",
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
        <div className="absolute inset-0 opacity-50">
          <img 
            src="https://replicate.delivery/xezq/EQgBJ26wXBGJEYAQ5aSn8fLlPT6wdyXqOJDkSBBGT6gKShfTB/out-0.jpg"
            alt="Sandra AI Photographer"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-8">
          <p className="text-xs font-light tracking-[0.4em] uppercase text-white/70 mb-10">
            Pinterest-Style AI Photography
          </p>
          
          <div className="mb-16">
            <h1 className="font-times text-[clamp(4rem,10vw,10rem)] leading-[0.9] font-extralight tracking-[0.3em] uppercase mb-5">
              SANDRA
            </h1>
            <h2 className="font-times text-[clamp(1.2rem,3vw,2.5rem)] leading-none font-extralight tracking-[0.5em] uppercase opacity-80">
              AI PHOTOGRAPHER
            </h2>
          </div>
          
          <p className="text-base tracking-[0.1em] uppercase opacity-80 font-light max-w-2xl mx-auto leading-relaxed mb-12">
            Environmental shots • Not looking at camera • Whole scenery visible • 
            Pinterest vibes • Dreamy lifestyle • Luxury settings
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => document.getElementById('chat-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-white text-black font-light tracking-[0.1em] uppercase hover:bg-gray-100 transition-colors"
            >
              Start Photoshoot Chat
            </button>
            <button
              onClick={() => window.open('/sselfie-gallery', '_blank')}
              className="px-8 py-4 border border-white text-white font-light tracking-[0.1em] uppercase hover:bg-white hover:text-black transition-colors"
            >
              View My Gallery
            </button>
          </div>
        </div>
      </section>

      {/* Editorial Quote Section */}
      <section className="py-32 px-8 bg-[#f5f5f5] text-center">
        <div className="max-w-4xl mx-auto">
          <blockquote className="font-times text-[clamp(28px,4vw,56px)] italic leading-[1.3] tracking-[-0.02em] text-black">
            "Every photo should tell a story. Not about perfection, 
            but about the authentic moment when you're living your life beautifully."
          </blockquote>
        </div>
      </section>

      {/* Main Chat Interface */}
      <section id="chat-section" className="py-20 px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <p className="text-xs font-normal tracking-[0.4em] uppercase text-gray-600 mb-6">
              AI Photography Session
            </p>
            <h2 className="font-times text-[clamp(3rem,6vw,6rem)] leading-none font-extralight tracking-[-0.01em] uppercase text-black mb-8">
              PHOTOSHOOT WITH SANDRA
            </h2>
            <p className="text-lg font-light max-w-2xl mx-auto leading-relaxed text-gray-700">
              Tell me your vision and I'll create Pinterest-style environmental shots that capture 
              the whole scenery. Perfect for content creators who want authentic, lifestyle imagery 
              that doesn't look like typical selfies.
            </p>
          </div>

          {/* Chat Container */}
          <div className="bg-white border border-gray-200 rounded-none max-w-4xl mx-auto">
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
                placeholder="Tell Sandra about your photoshoot vision..."
                className="flex-1 p-3 border border-[#e0e0e0] resize-none focus:outline-none focus:border-[#0a0a0a] font-light"
                rows={2}
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="px-6 py-3 bg-[#0a0a0a] text-white font-light disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#333333] transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Generated Images */}
        {selectedImages.length > 0 && (
          <div className="mt-8 bg-white border border-[#e0e0e0] p-6">
            <h3 className="text-xl font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
              Your Pinterest-Style Photoshoot
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {selectedImages.map((imageUrl, index) => (
                <div key={index} className="aspect-[3/4] overflow-hidden bg-[#f8f8f8] relative group">
                  <img
                    src={imageUrl}
                    alt={`Generated photo ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                    onClick={() => setFullSizeImage(imageUrl)}
                  />
                  {/* Hover overlay with actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFullSizeImage(imageUrl);
                        }}
                        className="px-3 py-1 bg-white text-black text-sm font-light hover:bg-[#f0f0f0] transition-colors"
                      >
                        View Full Size
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          saveToGallery(imageUrl);
                        }}
                        className="px-3 py-1 bg-[#0a0a0a] text-white text-sm font-light hover:bg-[#333333] transition-colors"
                      >
                        Save to Gallery
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-sm text-[#666666] font-light">
              Click any photo to view full size or save to your gallery • Generate more by clicking style buttons above
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

        {/* Quick Start Examples */}
        <div className="mt-8 bg-white border border-[#e0e0e0] p-6">
          <h3 className="text-lg font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
            Try These Pinterest-Style Requests:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              "Pinterest vibes with sunset and flowing dress",
              "Garden walk, not looking at camera, whole scenery",
              "City lifestyle, walking away, architectural backdrop",
              "Beach contemplation, golden hour, natural pose",
              "Luxury cafe exit, full body environmental shot",
              "Morning light through trees, peaceful energy"
            ].map((example, index) => (
              <button
                key={index}
                onClick={() => setInputMessage(example)}
                className="text-left p-3 border border-[#e0e0e0] hover:bg-[#f8f8f8] transition-colors text-sm font-light"
              >
                "{example}"
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}