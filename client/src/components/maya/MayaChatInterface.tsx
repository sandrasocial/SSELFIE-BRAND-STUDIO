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
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentTrackerId, setCurrentTrackerId] = useState<number | null>(null);
  const [savedImages, setSavedImages] = useState<Set<string>>(new Set());
  const [savingImages, setSavingImages] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
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

  // Removed old query - now using direct polling approach like backup implementation

  // Removed old useEffect - now using polling approach like backup implementation

  // Poll for completed generation trackers using the existing working endpoint
  const pollForTrackerCompletion = async (trackerId: number) => {
    const maxAttempts = 60; // 3 minutes total (3 second intervals)
    let attempts = 0;
    
    console.log('🎬 Maya: Starting progress tracking for tracker:', trackerId);
    
    const poll = async () => {
      try {
        attempts++;
        // Progressive progress: 0-90% during polling, 100% on completion
        const progressPercent = Math.min(90, (attempts / maxAttempts) * 90);
        setGenerationProgress(progressPercent);
        
        console.log(`🎬 Maya: Progress check ${attempts}/${maxAttempts} (${Math.round(progressPercent)}%)`);
        
        // Check for completed generation trackers using authenticated apiRequest
        const trackers: any[] = await apiRequest('/api/generation-trackers/completed', 'GET');
        console.log(`🎬 Maya: Found ${trackers.length} completed trackers`);
        
        // Find our specific tracker
        const ourTracker = trackers.find((t: any) => t.id === trackerId);
        
        if (ourTracker && ourTracker.status === 'completed' && ourTracker.imageUrls) {
          console.log('🎬 Maya: Our tracker completed!', ourTracker);
          
          // Complete progress and show results
          setGenerationProgress(100);
          setIsGenerating(false);
          
          // Parse image URLs
          let imageUrls = [];
          try {
            imageUrls = typeof ourTracker.imageUrls === 'string' 
              ? JSON.parse(ourTracker.imageUrls) 
              : ourTracker.imageUrls;
          } catch (e) {
            imageUrls = [ourTracker.imageUrls];
          }
          
          setGeneratedImages(imageUrls);
          
          // Update Maya's last message to remove generating state and add preview
          setChatMessages(prev => {
            const newMessages = [...prev];
            const lastMayaIndex = newMessages.map(m => m.role).lastIndexOf('maya');
            if (lastMayaIndex >= 0) {
              newMessages[lastMayaIndex] = {
                ...newMessages[lastMayaIndex],
                isGenerating: false, // Remove generating state
                imagePreview: {
                  id: trackerId,
                  userId: ourTracker.userId,
                  predictionId: ourTracker.predictionId,
                  prompt: ourTracker.prompt,
                  style: ourTracker.style,
                  status: 'completed',
                  imageUrls: JSON.stringify(imageUrls),
                  createdAt: ourTracker.createdAt
                }
              };
            }
            return newMessages;
          });
          
          // Reset progress after brief completion display
          setTimeout(() => {
            setGenerationProgress(0);
            setCurrentTrackerId(null);
          }, 2000);
          
          console.log('🎬 Maya: Generation completed successfully!');
          return;
        }
        
        // Continue polling if not found or not completed
        if (attempts < maxAttempts) {
          setTimeout(poll, 3000);
        } else {
          console.log('🎬 Maya: Max attempts reached, stopping polling');
          setIsGenerating(false);
          setGenerationProgress(0);
        }
      } catch (error) {
        console.error('🎬 Maya: Polling error:', error);
        if (attempts < maxAttempts) {
          setTimeout(poll, 3000);
        } else {
          console.log('🎬 Maya: Max attempts reached after errors, stopping');
          setIsGenerating(false);
          setGenerationProgress(0);
        }
      }
    };
    
    // Start polling immediately
    poll();
  };

  // Send message and trigger Maya's response with image generation
  const sendMessageMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const response = await apiRequest('/api/maya-generate-images', 'POST', {
        prompt: userMessage
      });
      return response;
    },
    onSuccess: (data: any) => {
      console.log('🎬 Maya: Generation started with response:', data);
      
      // Set generating state
      setIsGenerating(true);
      setGenerationProgress(0);
      
      // Set tracking ID for progress monitoring
      if (data?.imageId) {
        console.log('🎬 Maya: Setting tracker ID:', data.imageId);
        setCurrentTrackerId(data.imageId);
        
        // Start polling tracker for completion
        pollForTrackerCompletion(data.imageId);
      }

      // Add Maya's response with generating state
      const mayaMessage: MayaChatMessage = {
        id: Date.now(),
        role: 'maya',
        content: data?.message || '✨ Creating your stunning editorial moment right now! This is going to be absolutely gorgeous...',
        timestamp: new Date().toISOString(),
        isGenerating: true
      };

      console.log('🎬 Maya: Adding Maya response message with generating state');
      setChatMessages(prev => [...prev, mayaMessage]);
      queryClient.invalidateQueries({ queryKey: ['/api/generation-trackers/completed'] });
    }
  });

  // Heart an image to save to gallery  
  const heartImageMutation = useMutation({
    mutationFn: async (imageUrl: string) => {
      setSavingImages(prev => new Set(Array.from(prev).concat([imageUrl])));
      return await apiRequest('/api/heart-image-to-gallery', 'POST', {
        imageUrl,
        prompt: 'Maya AI Photography',
        style: 'Editorial'
      });
    },
    onSuccess: (data, imageUrl) => {
      // Mark image as saved
      setSavedImages(prev => new Set(Array.from(prev).concat([imageUrl])));
      setSavingImages(prev => {
        const newSet = new Set(Array.from(prev));
        newSet.delete(imageUrl);
        return newSet;
      });
      
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
    },
    onError: (error, imageUrl) => {
      setSavingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(imageUrl);
        return newSet;
      });
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
              
              {/* Generation Status with Progress Bar */}
              {(msg.isGenerating || (isGenerating && msg.role === 'maya' && chatMessages.indexOf(msg) === chatMessages.length - 1)) && (
                <div className="mt-3 p-3 bg-rose-50 rounded-lg border border-rose-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Camera className="w-4 h-4 text-rose-500 animate-pulse" />
                    <span className="text-sm text-rose-600">Creating your stunning images...</span>
                    {currentTrackerId && (
                      <span className="text-xs text-gray-500">(#{currentTrackerId})</span>
                    )}
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-rose-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-rose-400 to-purple-500 h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${Math.min(generationProgress, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-rose-500 mt-1 text-center">
                    {Math.round(Math.min(generationProgress, 100))}% complete
                    {generationProgress < 90 && <span className="ml-1">• Estimated 30-45 seconds</span>}
                  </div>
                </div>
              )}

              {/* Enhanced Image Preview Grid with Heart-Save (matching backup format) */}
              {msg.imagePreview && msg.imagePreview.imageUrls && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-black">Your Maya Photos</h4>
                    <p className="text-xs text-gray-500">Click to view full size • Heart to save permanently</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {JSON.parse(msg.imagePreview.imageUrls).map((imageUrl: string, index: number) => (
                      <div key={index} className="relative group">
                        <div className="relative overflow-hidden border border-gray-200 hover:border-gray-300 transition-colors">
                          <img 
                            src={imageUrl}
                            alt={`Maya generated image ${index + 1}`}
                            className="w-full h-32 object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                            onClick={() => window.open(imageUrl, '_blank')}
                          />
                          
                          {/* Minimalistic Heart Save Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleHeartImage(imageUrl);
                            }}
                            disabled={savingImages.has(imageUrl)}
                            className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white/90 hover:bg-white border border-gray-200 hover:border-gray-300 rounded-full transition-all shadow-sm"
                            title={savedImages.has(imageUrl) ? 'Saved to gallery' : 'Save to gallery'}
                          >
                            {savingImages.has(imageUrl) ? (
                              <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                            ) : savedImages.has(imageUrl) ? (
                              <span className="text-red-500 text-sm">♥</span>
                            ) : (
                              <span className="text-gray-400 hover:text-red-500 text-sm transition-colors">♡</span>
                            )}
                          </button>
                          
                          {/* Subtle Saved Indicator */}
                          {savedImages.has(imageUrl) && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                              <div className="text-white text-xs font-medium">
                                ✓ Saved
                              </div>
                            </div>
                          )}
                          
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors pointer-events-none"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Preview Status Message */}
                  <div className="mt-3 text-xs text-gray-500 bg-gray-50 p-3 rounded border">
                    <strong>Preview Mode:</strong> These are temporary preview images. Click the heart (♡) to save your favorites permanently to your gallery.
                  </div>
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