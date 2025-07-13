import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { apiRequest } from '@/lib/queryClient';

interface ChatMessage {
  role: 'user' | 'maya';
  content: string;
  timestamp: string;
  imagePreview?: string[];
  canGenerate?: boolean;
  generatedPrompt?: string;
}

export default function Maya() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [savedImages, setSavedImages] = useState<Set<string>>(new Set());
  const [savingImages, setSavingImages] = useState<Set<string>>(new Set());

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to chat with Maya AI",
        variant: "destructive",
      });
      setLocation('/pricing');
      return;
    }
  }, [user, isLoading, setLocation, toast]);

  // Initialize with Maya's welcome message
  useEffect(() => {
    if (user && messages.length === 0) {
      setMessages([{
        role: 'maya',
        content: `Hey ${user.firstName || 'gorgeous'}! I'm Maya, your personal celebrity stylist, photographer, and makeup artist. I work with A-list celebrities and high-end fashion brands to create magazine-worthy content.\n\nI'm here to help you look absolutely stunning and bring out your best features. Let's talk about your vision - what kind of energy are you going for? Editorial sophistication? Natural lifestyle beauty? Red carpet glamour?\n\nDescribe the mood, the story you want to tell, or even just how you want to feel in the photos. I'll ask the right questions to understand your vision perfectly, then create those exact photos for you! ✨`,
        timestamp: new Date().toISOString()
      }]);
    }
  }, [user, messages.length]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/maya-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          chatHistory: messages
        }),
      });

      const data = await response.json();

      const mayaMessage: ChatMessage = {
        role: 'maya',
        content: data.message || "I'm having a creative moment! Try asking me again about your photo vision.",
        canGenerate: data.canGenerate || false,
        generatedPrompt: data.generatedPrompt || undefined,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, mayaMessage]);
    } catch (error) {
      console.error('Maya chat error:', error);
      toast({
        title: "Connection Error",
        description: "Maya is having trouble connecting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  // Generate images based on Maya's prompt
  const generateImages = async (prompt: string) => {
    setIsGenerating(true);
    setGeneratedImages([]);
    
    try {
      const response = await apiRequest('POST', '/api/maya-generate-images', {
        customPrompt: prompt
      });

      if (response.image_urls) {
        const imageUrls = JSON.parse(response.image_urls);
        setGeneratedImages(imageUrls);
        
        // Update the last Maya message to include the generated images
        setMessages(prev => prev.map((msg, index) => {
          if (index === prev.length - 1 && msg.role === 'maya') {
            return { ...msg, imagePreview: imageUrls };
          }
          return msg;
        }));

        toast({
          title: "Images Generated!",
          description: "Maya created 4 beautiful photos for you. Save your favorites!",
        });
      }
    } catch (error) {
      console.error('Error generating images:', error);
      toast({
        title: "Generation Failed",
        description: "Maya couldn't generate images right now. Try again!",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Save image to gallery
  const saveToGallery = async (imageUrl: string, index: number) => {
    if (savedImages.has(imageUrl) || savingImages.has(imageUrl)) return;
    
    setSavingImages(prev => new Set([...prev, imageUrl]));
    
    try {
      await apiRequest('POST', '/api/save-to-gallery', {
        imageUrl,
        prompt: `Maya AI Photoshoot - Image ${index + 1}`,
        style: 'Maya AI',
        subcategory: 'AI Photography'
      });
      
      setSavedImages(prev => new Set([...prev, imageUrl]));
      // Refresh gallery to show newly saved image
      queryClient.invalidateQueries({ queryKey: ['/api/gallery-images'] });
      
      toast({
        title: "Saved to Gallery",
        description: "Image saved to your gallery and Maya dashboard",
      });
    } catch (error) {
      console.error('Error saving to gallery:', error);
      toast({
        title: "Save Failed",
        description: "Could not save image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(imageUrl);
        return newSet;
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Maya AI...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-light text-black">
              Maya AI
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Your personal AI photographer & stylist
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setLocation('/workspace')}
            className="text-sm"
          >
            ← Back to Studio
          </Button>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-2xl ${message.role === 'user' ? 'bg-black text-white' : 'bg-gray-50 text-black'} p-4 sm:p-6`}>
                <div className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
                  {message.content}
                </div>
                
                {/* Generate Images Button */}
                {message.role === 'maya' && message.canGenerate && message.generatedPrompt && !message.imagePreview && (
                  <div className="mt-4">
                    <Button
                      onClick={() => generateImages(message.generatedPrompt!)}
                      disabled={isGenerating}
                      className="bg-black text-white hover:bg-gray-800 text-sm"
                    >
                      {isGenerating ? 'Generating...' : 'Generate These Photos ✨'}
                    </Button>
                  </div>
                )}
                
                {/* Image Preview Grid */}
                {message.role === 'maya' && message.imagePreview && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-3 text-black">Your Maya AI Photos</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {message.imagePreview.map((imageUrl, imgIndex) => (
                        <div key={imgIndex} className="relative group">
                          <img 
                            src={imageUrl}
                            alt={`Maya generated image ${imgIndex + 1}`}
                            className="w-full h-32 object-cover border border-gray-200"
                          />
                          
                          {/* Save Button */}
                          <button
                            onClick={() => saveToGallery(imageUrl, imgIndex)}
                            disabled={savingImages.has(imageUrl)}
                            className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white text-xs px-2 py-1 rounded transition-all"
                          >
                            {savingImages.has(imageUrl) ? '⟳' : (savedImages.has(imageUrl) ? '♥ Saved' : '♡ Save')}
                          </button>
                          
                          {/* Saved Indicator */}
                          {savedImages.has(imageUrl) && (
                            <div className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                              In Gallery
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className={`text-xs mt-3 ${message.role === 'user' ? 'text-white/60' : 'text-gray-500'}`}>
                  {message.role === 'user' ? 'You' : 'Maya'} • {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-50 text-black p-4 sm:p-6 max-w-2xl">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <div className="text-xs mt-3 text-gray-500">Maya is typing...</div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4 sm:p-6">
          <div className="flex gap-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tell Maya what kind of photos you want to create..."
              className="flex-1 min-h-[60px] resize-none border-gray-300 focus:border-black focus:ring-black"
              disabled={isTyping}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isTyping}
              className="bg-black text-white hover:bg-gray-800 px-6"
            >
              Send
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}