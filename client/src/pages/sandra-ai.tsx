import React, { useState, useRef, useEffect } from 'react';
import SandraNavigation from '@/components/SandraNavigation';
import { Button } from "@/components/ui/button";

interface ChatMessage {
  type: 'user' | 'sandra';
  message: string;
  timestamp: string;
}

export default function SandraAIPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      type: 'sandra',
      message: `Hey gorgeous! I'm Sandra, and I'm absolutely obsessed with helping you build the personal brand of your dreams.

You know what? I've been exactly where you are. Three kids, going through a divorce, wondering if I could actually build something meaningful from just... me. But here's what I discovered: your story, your authentic self, your unique perspective - that's pure gold.

I went from zero to 120K followers in 90 days, not because I had some perfect life, but because I learned how to show up authentically and create content that actually connects. And now? I want to help you do exactly the same thing.

What's your biggest dream for your personal brand right now?`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      const response = await fetch('/api/personal-branding-sandra', {
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
        message: data.message || "I'm here to help! Tell me more about your goals.",
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, sandraMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: ChatMessage = {
        type: 'sandra',
        message: "I'm having a quick technical moment, but I'm still here! What were you saying about your brand goals?",
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
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
            src="https://replicate.delivery/xezq/tIR9rofcvTxuE61uMrnnMufXCv7A8aAaMtQpIQkvYej8YhfTB/out-0.jpg"
            alt="Sandra"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-8">
          <p className="text-xs font-light tracking-[0.4em] uppercase text-white/70 mb-10">
            The Icelandic Selfie Queen
          </p>
          
          <div className="mb-16">
            <h1 className="font-times text-[clamp(5rem,12vw,12rem)] leading-[0.9] font-extralight tracking-[0.3em] uppercase mb-5">
              SANDRA
            </h1>
            <h2 className="font-times text-[clamp(1.5rem,4vw,3rem)] leading-none font-extralight tracking-[0.5em] uppercase opacity-80">
              SIGURJÓNSDÓTTIR
            </h2>
          </div>
          
          <p className="text-base tracking-[0.1em] uppercase opacity-80 font-light max-w-2xl mx-auto leading-relaxed">
            Your personal brand strategist, business mentor, and creative partner. 
            From divorce and uncertainty to 120K followers and multiple six figures. 
            Let's build your empire together.
          </p>
        </div>
      </section>

      {/* Editorial Quote Section */}
      <section className="py-32 px-8 bg-[#f5f5f5] text-center">
        <div className="max-w-4xl mx-auto">
          <blockquote className="font-times text-[clamp(28px,4vw,56px)] italic leading-[1.3] tracking-[-0.02em] text-black">
            "I built my entire business from selfies and authenticity. 
            Now I help ambitious women do exactly the same thing."
          </blockquote>
        </div>
      </section>

      {/* Main Chat Interface */}
      <section className="py-20 px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <p className="text-xs font-normal tracking-[0.4em] uppercase text-gray-600 mb-6">
              Personal Brand Strategy Session
            </p>
            <h2 className="font-times text-[clamp(3rem,6vw,6rem)] leading-none font-extralight tracking-[-0.01em] uppercase text-black mb-8">
              CHAT WITH SANDRA
            </h2>
            <p className="text-lg font-light max-w-2xl mx-auto leading-relaxed text-gray-700">
              Get personalized advice on building your personal brand, content strategy, 
              and business growth. Sandra draws from her real experience helping thousands 
              of women transform their lives through authentic personal branding.
            </p>
          </div>

          {/* Chat Container */}
          <div className="bg-white border border-gray-200 rounded-none max-w-4xl mx-auto">
            {/* Chat Messages */}
            <div className="h-[600px] overflow-y-auto p-8 space-y-8">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${
                    message.type === 'user' 
                      ? 'bg-black text-white' 
                      : 'bg-[#f5f5f5] text-black'
                  } p-6 rounded-none`}>
                    {message.type === 'sandra' && (
                      <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center mr-3">
                          <span className="text-white text-xs font-medium">S</span>
                        </div>
                        <span className="text-xs font-normal tracking-[0.3em] uppercase">Sandra</span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap text-base font-light leading-relaxed">
                      {message.message}
                    </div>
                    <div className="text-xs opacity-60 mt-3">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#f5f5f5] text-black p-6 rounded-none max-w-[80%]">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-xs font-medium">S</span>
                      </div>
                      <span className="text-xs font-normal tracking-[0.3em] uppercase">Sandra</span>
                    </div>
                    <div className="text-base font-light">
                      Thinking...
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="border-t border-gray-200 p-6">
              <div className="flex gap-4">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask Sandra about your personal brand strategy..."
                  className="flex-1 p-4 border border-gray-200 rounded-none resize-none h-24 text-base font-light leading-relaxed focus:outline-none focus:border-black transition-colors"
                  disabled={isLoading}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="px-8 py-4 bg-black text-white border border-black text-xs font-normal tracking-[0.3em] uppercase hover:bg-white hover:text-black transition-all duration-300 rounded-none"
                >
                  SEND
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Cards Section */}
      <section className="py-20 px-8 bg-[#f5f5f5]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-normal tracking-[0.4em] uppercase text-gray-600 mb-6">
              My Expertise
            </p>
            <h2 className="font-times text-[clamp(3rem,6vw,6rem)] leading-none font-extralight tracking-[-0.01em] uppercase text-black">
              WHAT I HELP WITH
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                number: "01",
                title: "Personal Brand Strategy",
                description: "Define your unique voice, positioning, and content strategy that attracts your ideal audience and clients."
              },
              {
                number: "02", 
                title: "Content Creation",
                description: "Learn my exact system for creating engaging content that builds authentic connections and drives business results."
              },
              {
                number: "03",
                title: "Business Growth",
                description: "Scale your personal brand into a profitable business with proven strategies I've used to build multiple six-figure streams."
              },
              {
                number: "04",
                title: "Social Media Mastery",
                description: "Master Instagram, TikTok, and other platforms to grow your following authentically and convert followers to customers."
              },
              {
                number: "05",
                title: "Mindset & Confidence", 
                description: "Overcome imposter syndrome, build unshakeable confidence, and show up authentically even when it feels scary."
              },
              {
                number: "06",
                title: "Life Transformation",
                description: "Navigate major life changes while building your brand. I've been through divorce, single motherhood, and complete reinvention."
              }
            ].map((card, index) => (
              <div key={index} className="bg-white relative transition-all duration-500 hover:bg-black hover:text-white group">
                <div className="p-12 relative">
                  <span className="font-times text-[120px] absolute top-5 right-8 opacity-10 leading-none group-hover:opacity-20">
                    {card.number}
                  </span>
                  <h3 className="font-times text-2xl font-extralight tracking-[-0.01em] uppercase mb-6 leading-tight">
                    {card.title}
                  </h3>
                  <p className="text-base font-light leading-relaxed opacity-80">
                    {card.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}