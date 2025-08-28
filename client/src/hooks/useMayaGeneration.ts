import { useState } from 'react';
import { useToast } from './use-toast';
import { apiRequest } from '../lib/queryClient';

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
  const [preset, setPreset] = useState<Preset>('Editorial');
  const [seed, setSeed] = useState<string>('');
  const { toast } = useToast();

  const generateFromConcept = async (
    conceptName: string, 
    setMessages: (updater: (prev: ChatMessage[]) => ChatMessage[]) => void,
    currentChatId: number | null
  ) => {
    const messageId = `generation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
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
      
      // Show friendly error message
      const errorMessage: ChatMessage = {
        role: 'maya',
        content: `I had a little hiccup creating those "${conceptName}" photos, but I'm not giving up! Let me try a different approach. What specific style elements are you most excited about for this look?`,
        timestamp: new Date().toISOString(),
        quickButtons: ["More luxury details", "Different lighting", "Try another concept", "Tell me the issue"]
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
    if (!generationId || activeGenerations.has(generationId)) {
      console.log('Generation blocked - missing ID or already active:', generationId);
      return;
    }
    
    console.log('Starting Maya generation:', { prompt, generationId, preset, seed });
    
    setActiveGenerations(prev => new Set([...prev, generationId]));
    
    try {
      // Call Maya's intelligent generation system
      const response = await apiRequest('/api/maya/generate', 'POST', {
        prompt,
        chatId: currentChatId,
        preset,
        seed: seed ? Number(seed) : undefined,
        count: 2 // Maya will intelligently adjust based on shot type
      });
      
      console.log('Maya generation response:', response);
      
      if (response.predictionId) {  // Remove the success check since API only returns predictionId
        console.log('Maya generation started successfully:', response.predictionId);
        
        // Poll for Maya's generation completion
        const pollForImages = async () => {
          try {
            const statusResponse = await fetch(`/api/check-generation/${response.predictionId}?chatId=${currentChatId}&messageId=${generationId}`, { 
              credentials: 'include' 
            }).then(res => res.json());
            
            console.log('Maya polling status:', statusResponse.status, 'Images:', statusResponse.imageUrls?.length || 0);
            
            if (statusResponse.status === 'completed' && statusResponse.imageUrls && statusResponse.imageUrls.length > 0) {
              console.log('Maya generation complete! Updating message with images');
              
              // Update the specific Maya message with generated images
              setMessages(prev => prev.map(msg => 
                msg.generationId === generationId 
                  ? { 
                      ...msg, 
                      imagePreview: statusResponse.imageUrls, 
                      canGenerate: false,
                      content: msg.content + `\n\nHere are your styled photos! These turned out absolutely incredible! ✨\n\nReady for more? Let me create different vibes for you:`
                    }
                  : msg
              ));
              
              // Add Maya's follow-up suggestions immediately for better flow
              setTimeout(() => {
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
                setMessages(prev => [...prev, followUpMessage]);
              }, 500);
              
              // Remove from active generations
              setActiveGenerations(prev => {
                const newSet = new Set(prev);
                newSet.delete(generationId);
                return newSet;
              });
              
            } else if (statusResponse.status === 'failed') {
              console.error('Maya generation failed:', statusResponse.error);
              
              // Update message with Maya's friendly error guidance
              setMessages(prev => prev.map(msg => 
                msg.generationId === generationId 
                  ? { 
                      ...msg, 
                      content: msg.content + '\n\nOh no! I had a little hiccup creating those photos. Let me try a different approach - tell me specifically what style you\'re going for and I\'ll make sure we get the perfect shot this time! What\'s the vibe you want?',
                      canGenerate: false,
                      quickButtons: ["Professional headshot", "Editorial style", "Casual lifestyle", "Tell me more about the issue"]
                    }
                  : msg
              ));
              
              setActiveGenerations(prev => {
                const newSet = new Set(prev);
                newSet.delete(generationId);
                return newSet;
              });
              
            } else {
              // Still processing - continue polling with faster 1-second intervals
              console.log('Maya still generating, polling again in 1 second...');
              setTimeout(pollForImages, 1000);
            }
          } catch (pollError) {
            console.error('Maya polling error:', pollError);
            setActiveGenerations(prev => {
              const newSet = new Set(prev);
              newSet.delete(generationId);
              return newSet;
            });
            
            // Add Maya's helpful polling error message
            const errorMessage: ChatMessage = {
              role: 'maya',
              content: "I'm having trouble checking on your photos right now, but don't worry! Let me create something fresh for you instead. What kind of photos would you love to see?",
              timestamp: new Date().toISOString(),
              quickButtons: ["Professional headshot", "Creative lifestyle", "Business portrait", "Try a different concept"]
            };
            
            setMessages(prev => [...prev, errorMessage]);
          }
        };
        
        // Start polling immediately for better user experience
        setTimeout(pollForImages, 500);
        
      } else {
        console.error('Maya generation failed to start:', response);
        setActiveGenerations(prev => {
          const newSet = new Set(prev);
          newSet.delete(generationId);
          return newSet;
        });
      }
      
    } catch (error) {
      console.error('Maya generation error:', error);
      setActiveGenerations(prev => {
        const newSet = new Set(prev);
        newSet.delete(generationId);
        return newSet;
      });
      
      // Show Maya's personality-driven error guidance
      const errorMessage: ChatMessage = {
        role: 'maya',
        content: "Oh no! I had a little hiccup creating those photos. Let me try a different approach - tell me specifically what style you're going for and I'll make sure we get the perfect shot this time! What's the vibe you want?",
        timestamp: new Date().toISOString(),
        quickButtons: ["Professional headshot", "Editorial style", "Casual lifestyle", "Tell me more about the issue"]
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