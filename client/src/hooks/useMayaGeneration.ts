import { useState, useEffect } from 'react';
import { useToast } from './use-toast';
import { apiRequest } from '../lib/queryClient';

// PHASE 7: Frontend Performance Tracking (shared with chat hook)
const trackUserEvent = (event: string, data: any = {}) => {
  console.log(`USER_EVENT_${event}`, {
    ...data,
    timestamp: Date.now(),
    url: window.location.pathname
  });
};

const trackInteractionTiming = (event: string, startTime: number, success: boolean) => {
  console.log(`USER_INTERACTION_TIMING`, {
    event,
    duration: Date.now() - startTime,
    success,
    timestamp: Date.now()
  });
};

interface ChatMessage {
  id?: number;
  role: 'user' | 'maya';
  content: string;
  timestamp: string;
  imagePreview?: string[];
  canGenerate?: boolean;
  generatedPrompt?: string;
  quickButtons?: string[];
  questions?: string[];
  stepGuidance?: string;
  isOnboarding?: boolean;
  generationId?: string;
}

type Preset = 'Identity' | 'Editorial' | 'UltraPrompt' | 'Fast';

export const useMayaGeneration = () => {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [savingImages, setSavingImages] = useState(new Set<string>());
  const [savedImages, setSavedImages] = useState(new Set<string>());
  const [clickedButtons, setClickedButtons] = useState(new Map<number, Set<string>>());
  const [activeGenerations, setActiveGenerations] = useState(new Set<string>());
  const [generationQueue, setGenerationQueue] = useState<Array<{id: string, priority: number}>>([]);
  const [preset, setPreset] = useState<Preset>('Editorial');
  const [seed, setSeed] = useState<string>('');
  const { toast } = useToast();

  // Clear stale generations on mount
  useEffect(() => {
    console.log('Maya: Clearing any stale active generations on mount');
    setActiveGenerations(new Set());
    setGenerationQueue([]);
  }, []);

  const generateFromConcept = async (
    conceptName: string, 
    setMessages: (updater: (prev: ChatMessage[]) => ChatMessage[]) => void,
    currentChatId: number | null
  ) => {
    const messageId = `generation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const generationStartTime = Date.now(); // PHASE 7: Track generation performance
    
    // PHASE 7: Track concept generation start
    trackUserEvent('CONCEPT_GENERATION_START', {
      conceptName,
      messageId,
      currentChatId,
      activeGenerations: activeGenerations.size
    });
    
    // Check generation queue - prevent multiple concurrent generations
    if (activeGenerations.size > 0) {
      console.log('Maya: Queueing generation, active generation in progress');
      
      // PHASE 7: Track generation queue event
      trackUserEvent('GENERATION_QUEUED', {
        conceptName,
        activeGenerations: activeGenerations.size
      });
      
      const queueMessage: ChatMessage = {
        role: 'maya',
        content: `I'm still working on your previous photos! Let me finish those first, then I'll create these "${conceptName}" photos next. Quality over speed - I want each set to be absolutely perfect! ✨`,
        timestamp: new Date().toISOString(),
        quickButtons: ["Cancel queue", "What's taking so long?", "Show me current progress"]
      };
      setMessages(prev => [...prev, queueMessage]);
      return;
    }
    
    if (activeGenerations.has(messageId)) return;
    
    console.log('Maya: Starting concept generation for:', conceptName, 'ID:', messageId);
    
    try {
      // Create Maya message showing generation progress
      const generatingMessage: ChatMessage = {
        role: 'maya',
        content: `Creating your "${conceptName}" photos right now! I'm applying all my styling expertise to make these absolutely stunning. You're going to love the results! ✨`,
        timestamp: new Date().toISOString(),
        canGenerate: true,
        generationId: messageId
      };
      
      setMessages(prev => [...prev, generatingMessage]);
      
      // Add 15-second timeout
      setTimeout(() => {
        if (activeGenerations.has(messageId)) {
          console.log('Maya: Generation timeout after 15 seconds for:', messageId);
          
          // Clear stuck generation
          setActiveGenerations(prev => {
            const newSet = new Set(prev);
            newSet.delete(messageId);
            return newSet;
          });
          
          // Show Maya timeout message
          const timeoutMessage: ChatMessage = {
            role: 'maya',
            content: "I had a little hiccup with that photo creation! Let me try a different approach. What specific style are you going for?",
            timestamp: new Date().toISOString(),
            quickButtons: ["Try again", "Different style", "Tell me the issue"]
          };
          setMessages(prev => [...prev, timeoutMessage]);
        }
      }, 15000);
      
      // FIXED: Use Maya's dedicated concept generation approach
      // Clean up concept name (remove emojis and extra text) before sending to backend
      const cleanConceptName = conceptName.replace(/[✨💫💗🔥🌟💎🌅🏢💼🌊👑💃📸🎬]/g, '').trim();
      let finalPrompt = `Create a professional photo concept: ${cleanConceptName}`;
      // The concept prompt will be processed by Maya's AI prompt generation in the backend

      console.log('Maya: Starting concept generation for:', finalPrompt);

      // Start image generation with concept prompt - Maya will handle the detailed prompt generation
      await generateImages(finalPrompt, messageId, conceptName, setMessages, currentChatId);
      
    } catch (error) {
      console.error('Maya concept generation error:', error);
      
      // Clear from active generations on error
      setActiveGenerations(prev => {
        const newSet = new Set(prev);
        newSet.delete(messageId);
        return newSet;
      });
      
      // Show friendly error message with retry
      const errorMessage: ChatMessage = {
        role: 'maya',
        content: `I had a little hiccup creating those "${conceptName}" photos, but I'm not giving up! Let me try a different approach. What specific style elements are you most excited about for this look?`,
        timestamp: new Date().toISOString(),
        quickButtons: [`Retry "${conceptName}"`, "Different lighting", "Try another concept", "Tell me the issue"]
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const generateImages = async (
    prompt: string, 
    generationId: string | undefined, 
    conceptName: string | undefined,
    setMessages: (updater: (prev: ChatMessage[]) => ChatMessage[]) => void,
    currentChatId: number | null
  ) => {
    // Create unified generationId if not provided
    const finalGenerationId = generationId || `generation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    if (activeGenerations.has(finalGenerationId)) {
      console.log('Generation blocked - already active:', finalGenerationId);
      return;
    }
    
    console.log('Starting Maya generation:', { prompt, finalGenerationId, preset, seed });
    
    setActiveGenerations(prev => new Set([...prev, finalGenerationId]));
    
    try {
      // Call Maya's intelligent generation system with comprehensive error handling
      const response = await apiRequest('/api/maya/generate', 'POST', {
        prompt,
        chatId: currentChatId,
        preset,
        seed: seed ? Number(seed) : undefined,
        count: 2 // Maya will intelligently adjust based on shot type
      });
      
      console.log('Maya generation response:', response);
      
      if (response.predictionId) {
        console.log('Maya generation started successfully:', response.predictionId);
        
        // Add 30-second overall timeout for the entire generation process
        setTimeout(() => {
          if (activeGenerations.has(finalGenerationId)) {
            console.log('Maya: Overall generation timeout after 30 seconds for:', finalGenerationId);
            
            setActiveGenerations(prev => {
              const newSet = new Set(prev);
              newSet.delete(finalGenerationId);
              return newSet;
            });
            
            const timeoutMessage: ChatMessage = {
              role: 'maya',
              content: "That photo creation took longer than expected! Don't worry - let me try a quicker approach. What style would you like me to focus on?",
              timestamp: new Date().toISOString(),
              quickButtons: ["Retry with different settings", "Simpler style", "Professional headshot", "Tell me what happened"]
            };
            setMessages(prev => [...prev, timeoutMessage]);
          }
        }, 30000);
        
        // Poll for Maya's generation completion with enhanced error handling
        const pollForImages = async () => {
          try {
            const statusResponse = await fetch(`/api/maya/check-generation/${response.predictionId}?chatId=${currentChatId}&messageId=${finalGenerationId}`, { 
              credentials: 'include' 
            }).then(res => {
              if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${res.statusText}`);
              }
              return res.json();
            });
            
            console.log('Maya polling status:', statusResponse.status, 'Images:', statusResponse.imageUrls?.length || 0);
            
            if (statusResponse.status === 'completed' && statusResponse.imageUrls && statusResponse.imageUrls.length > 0) {
              console.log('Maya generation complete! Updating message with images');
              
              // Single batched update to prevent double rendering
              setMessages(prev => {
                const updatedMessages = prev.map(msg => 
                  msg.generationId === finalGenerationId 
                    ? { 
                        ...msg, 
                        imagePreview: statusResponse.imageUrls, 
                        canGenerate: false,
                        content: msg.content + `\n\nHere are your styled photos! These turned out absolutely incredible! ✨`
                      }
                    : msg
                );
                
                // Add follow-up message immediately instead of setTimeout
                const followUpMessage: ChatMessage = {
                  role: 'maya',
                  content: "Which style should we create next? I have so many more gorgeous concepts for you! 💫",
                  timestamp: new Date().toISOString(),
                  quickButtons: [
                    "✨ Different lighting mood", 
                    "🎬 New style category", 
                    "💎 Elevated version", 
                    "🌟 Surprise me Maya!",
                    "Show all categories"
                  ]
                };
                
                return [...updatedMessages, followUpMessage];
              });
              
              // Remove from active generations
              setActiveGenerations(prev => {
                const newSet = new Set(prev);
                newSet.delete(finalGenerationId);
                return newSet;
              });
              
            } else if (statusResponse.status === 'failed') {
              console.error('Maya generation failed:', statusResponse.error);
              
              // Update message with Maya's friendly error guidance and retry option
              setMessages(prev => prev.map(msg => 
                msg.generationId === finalGenerationId 
                  ? { 
                      ...msg, 
                      content: msg.content + '\n\nOh no! I had a little hiccup creating those photos. Let me try a different approach - tell me specifically what style you\'re going for and I\'ll make sure we get the perfect shot this time! What\'s the vibe you want?',
                      canGenerate: false,
                      quickButtons: [`Retry "${conceptName || 'this concept'}"`, "Different style approach", "Professional headshot", "Tell me more about the issue"]
                    }
                  : msg
              ));
              
              setActiveGenerations(prev => {
                const newSet = new Set(prev);
                newSet.delete(finalGenerationId);
                return newSet;
              });
              
            } else {
              // Still processing - continue polling with 2-second intervals
              console.log('Maya still generating, polling again in 2 seconds...');
              setTimeout(pollForImages, 2000);
            }
          } catch (pollError) {
            console.error('Maya polling error:', pollError);
            setActiveGenerations(prev => {
              const newSet = new Set(prev);
              newSet.delete(finalGenerationId);
              return newSet;
            });
            
            // Add Maya's helpful polling error message with retry
            const errorMessage: ChatMessage = {
              role: 'maya',
              content: "I'm having trouble checking on your photos right now, but don't worry! Let me create something fresh for you instead. What kind of photos would you love to see?",
              timestamp: new Date().toISOString(),
              quickButtons: [`Retry "${conceptName || 'last concept'}"`, "Professional headshot", "Creative lifestyle", "Try a different concept"]
            };
            
            setMessages(prev => [...prev, errorMessage]);
          }
        };
        
        // Start polling after a brief delay for better user experience
        setTimeout(pollForImages, 1000);
        
      } else {
        console.error('Maya generation failed to start:', response);
        setActiveGenerations(prev => {
          const newSet = new Set(prev);
          newSet.delete(finalGenerationId);
          return newSet;
        });
        
        // Add Maya's helpful startup error message
        const startupErrorMessage: ChatMessage = {
          role: 'maya',
          content: "I couldn't start creating those photos right now, but I'm here to help! Let me try a different approach. What specific style are you looking for?",
          timestamp: new Date().toISOString(),
          quickButtons: [`Retry "${conceptName || 'this concept'}"`, "Different style", "Professional headshot", "Tell me the issue"]
        };
        setMessages(prev => [...prev, startupErrorMessage]);
      }
      
    } catch (error) {
      console.error('Maya generation error:', error);
      setActiveGenerations(prev => {
        const newSet = new Set(prev);
        newSet.delete(finalGenerationId);
        return newSet;
      });
      
      // Show Maya's personality-driven error guidance with retry options
      const errorMessage: ChatMessage = {
        role: 'maya',
        content: "Oh no! I had a technical hiccup creating those photos. Don't worry - I'm still here to help! Let me try a different approach. What specific style are you going for?",
        timestamp: new Date().toISOString(),
        quickButtons: [`Retry "${conceptName || 'this concept'}"`, "Professional headshot", "Editorial style", "Tell me more about the issue"]
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const saveToGallery = async (imageUrl: string) => {
    if (savingImages.has(imageUrl) || savedImages.has(imageUrl)) return;

    setSavingImages(prev => new Set(prev).add(imageUrl));

    try {
      await apiRequest('/api/save-image', 'POST', {
        imageUrl,
        source: 'maya-chat'
      });

      setSavedImages(prev => new Set(prev).add(imageUrl));
      toast({
        title: "Saved!",
        description: "Image added to your gallery"
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Oops!",
        description: "I couldn't save that photo to your gallery right now. Let me try again!"
      });
    } finally {
      setSavingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(imageUrl);
        return newSet;
      });
    }
  };

  return {
    isGeneratingImage,
    setIsGeneratingImage,
    isGenerating,
    setIsGenerating,
    generationProgress,
    setGenerationProgress,
    savingImages,
    setSavingImages,
    savedImages,
    setSavedImages,
    clickedButtons,
    setClickedButtons,
    activeGenerations,
    setActiveGenerations,
    preset,
    setPreset,
    seed,
    setSeed,
    generateFromConcept,
    generateImages,
    saveToGallery
  };
};