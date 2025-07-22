/**
 * MAYA CHAT INTERFACE - Celebrity Stylist AI Photography Experience
 * Images preview in Maya's chat FIRST, then users heart favorites to save to gallery
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, Send, Sparkles, Camera } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';

interface GenerationTracker {
  id: number;
  userId: string;
  predictionId: string;
  prompt: string;
  style: string;
  status: 'processing' | 'completed' | 'failed';
  imageUrls?: string;
  createdAt: string;
}

interface MayaChatMessage {
  id: number;
  role: 'user' | 'maya';
  content: string;
  timestamp: string;
  imagePreview?: GenerationTracker;
  isGenerating?: boolean;
}

export function MayaChatInterface() {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<MayaChatMessage[]>([]);
  const queryClient = useQueryClient();

  // Maya's enthusiastic greeting
  useEffect(() => {
    setChatMessages([
      {
        id: 0,
        role: 'maya',
        content: `🌟 **Maya here - your personal celebrity stylist!** I've dressed A-list stars for red carpets and magazine covers. 

Ready to create your ICONIC moment? I'm envisioning something absolutely stunning for you - let's create cinematic editorial magic that stops people scrolling!

What kind of vibe are we creating today? Or just say "surprise me" and I'll create something spectacular! ✨`,
        timestamp: new Date().toISOString()
      }
    ]);
  }, []);

  // Poll for completed generation trackers
  const { data: completedGenerations } = useQuery({
    queryKey: ['/api/generation-trackers/completed', user?.id],
    enabled: !!user,
    refetchInterval: 3000, // Poll every 3 seconds
    staleTime: 0
  });

  // Update chat messages when new generations complete
  useEffect(() => {
    if (completedGenerations) {
      setChatMessages(prev => 
        prev.map(msg => {
          if (msg.isGenerating && completedGenerations.find((gen: GenerationTracker) => 
            gen.prompt === msg.content && gen.status === 'completed'
          )) {
            const generation = completedGenerations.find((gen: GenerationTracker) => 
              gen.prompt === msg.content && gen.status === 'completed'
            );
            return {
              ...msg,
              isGenerating: false,
              imagePreview: generation
            };
          }
          return msg;
        })
      );
    }
  }, [completedGenerations]);

  // Send message and trigger Maya's response with image generation
  const sendMessageMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const response = await apiRequest('/api/build/maya-chat', 'POST', {
        message: userMessage
      });
      return response;
    },
    onSuccess: (data) => {
      // Add Maya's response with generating status
      const mayaMessage: MayaChatMessage = {
        id: Date.now(),
        role: 'maya',
        content: data.message,
        timestamp: new Date().toISOString(),
        isGenerating: true
      };

      setChatMessages(prev => [...prev, mayaMessage]);
      queryClient.invalidateQueries({ queryKey: ['/api/generation-trackers/completed'] });
    }
  });

  // Heart an image to save to gallery
  const heartImageMutation = useMutation({
    mutationFn: async (imageUrl: string) => {
      return await apiRequest('/api/heart-image-to-gallery', 'POST', {
        imageUrl,
        prompt: 'Maya AI Photography',
        style: 'Editorial'
      });
    },
    onSuccess: () => {
      // Show success feedback
      setChatMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          role: 'maya',
          content: '💕 **GORGEOUS choice!** I\'ve saved that stunning shot to your gallery. That one is definitely going viral! ✨',
          timestamp: new Date().toISOString()
        }
      ]);
      queryClient.invalidateQueries({ queryKey: ['/api/ai-images'] });
    }
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // Add user message
    const userMessage: MayaChatMessage = {
      id: Date.now() - 1,
      role: 'user', 
      content: message,
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, userMessage]);
    sendMessageMutation.mutate(message);
    setMessage('');
  };

  const handleHeartImage = (imageUrl: string) => {
    heartImageMutation.mutate(imageUrl);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-rose-50 to-purple-50">
      {/* Maya Header */}
      <div className="flex items-center gap-3 p-4 bg-white border-b border-rose-200">
        <div className="w-10 h-10 bg-gradient-to-r from-rose-400 to-purple-500 rounded-full flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900">Maya - Celebrity Stylist AI</h2>
          <p className="text-sm text-gray-600">Creating your editorial masterpiece...</p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] rounded-lg p-3 ${
              msg.role === 'user' 
                ? 'bg-rose-500 text-white' 
                : 'bg-white border border-rose-200 text-gray-900'
            }`}>
              <div className="whitespace-pre-wrap">{msg.content}</div>
              
              {/* Generation Status */}
              {msg.isGenerating && (
                <div className="mt-3 p-3 bg-rose-50 rounded-lg border border-rose-200">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-rose-500 animate-pulse" />
                    <span className="text-sm text-rose-600">Creating your stunning images...</span>
                  </div>
                </div>
              )}

              {/* Image Preview with Heart Button */}
              {msg.imagePreview && msg.imagePreview.imageUrls && (
                <div className="mt-3 space-y-3">
                  <div className="text-sm font-medium text-rose-600 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Your Editorial Preview - Heart the ones you love!
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {JSON.parse(msg.imagePreview.imageUrls).map((imageUrl: string, index: number) => (
                      <div key={index} className="relative group">
                        <img 
                          src={imageUrl} 
                          alt="Maya AI Preview"
                          className="w-full rounded-lg shadow-lg"
                        />
                        
                        {/* Heart Button Overlay */}
                        <div className="absolute top-3 right-3">
                          <Button
                            onClick={() => handleHeartImage(imageUrl)}
                            size="sm"
                            className="bg-white/80 hover:bg-white text-rose-500 hover:text-rose-600 shadow-lg"
                            disabled={heartImageMutation.isPending}
                          >
                            <Heart className="w-4 h-4" />
                            {heartImageMutation.isPending ? 'Saving...' : 'Save to Gallery'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <p className="text-xs text-gray-500 bg-rose-50 p-2 rounded">
                    💡 <strong>Tip:</strong> Heart your favorite shots to save them to your permanent gallery!
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-rose-200">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell Maya what kind of shoot you want..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 border-rose-200 focus:border-rose-400"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="bg-rose-500 hover:bg-rose-600"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        <p className="text-xs text-gray-500 mt-2 text-center">
          Maya creates cinematic editorial moments • Images preview here first
        </p>
      </div>
    </div>
  );
}