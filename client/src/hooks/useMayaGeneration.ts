import { useState, useEffect } from 'react';
import { useToast } from './use-toast';
import { apiRequest } from '../lib/queryClient';
import { useMemoryCleanup } from './useMemoryCleanup';

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

interface ConceptCard {
  id: string;
  title: string;
  description: string;  // Short description for frontend display
  originalContext?: string;  // Maya's complete original styling context and reasoning
  fullPrompt?: string;  // Maya's complete detailed prompt ready for generation
  canGenerate: boolean;
  isGenerating: boolean;
  isLoading?: boolean;
  hasGenerated?: boolean;
  generatedImages?: string[];
}

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
  conceptCards?: ConceptCard[];
}

type Preset = 'Identity' | 'Editorial' | 'UltraPrompt' | 'Fast';

export const useMayaGeneration = (
  messages?: any,
  setMessages?: any,
  currentChatId?: any,
  setIsTyping?: any,
  toast?: any
) => {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [savingImages, setSavingImages] = useState(new Set<string>());
  const [savedImages, setSavedImages] = useState(new Set<string>());
  const [clickedButtons, setClickedButtons] = useState(new Map<number, Set<string>>());
  const [activeGenerations, setActiveGenerations] = useState(new Set<string>());
  const [generationQueue, setGenerationQueue] = useState<Array<{id: string, priority: number}>>([]);
  // REMOVED: Preset selection - Maya's AI now handles all parameter selection automatically
  const [seed, setSeed] = useState<string>('');
  const { createTimeout, addCleanup } = useMemoryCleanup();

  // Clear stale generations on mount
  useEffect(() => {
    // Clear stale generations silently
    setActiveGenerations(new Set());
    setGenerationQueue([]);
  }, []);

  // LEGACY FUNCTION REMOVED - generateFromConcept eliminated
  // Single API call architecture uses only generateFromSpecificConcept with embedded FLUX prompts


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

  // CRITICAL FIX: Concept-specific polling that updates the right concept card
  const pollConceptGeneration = async (predictionId: string, conceptTitle: string, conceptId: string, messageId: string) => {
    const maxAttempts = 100; // 5 minutes max
    let attempts = 0;
    
    const poll = async () => {
      try {
        const statusResponse = await fetch(`/api/maya/check-generation/${predictionId}?chatId=${currentChatId}&messageId=${messageId}`, { 
          credentials: 'include' 
        });
        
        if (!statusResponse.ok) {
          // Handle authentication errors gracefully
          if (statusResponse.status === 401) {
            console.log(`Maya concept "${conceptTitle}" polling stopped - authentication expired`);
            // Don't throw error for auth issues - just stop polling
            setActiveGenerations?.(prev => {
              const newSet = new Set(prev);
              newSet.delete(predictionId);
              return newSet;
            });
            return;
          }
          throw new Error(`Status check failed: ${statusResponse.status}`);
        }
        
        const result = await statusResponse.json();
        console.log(`Maya concept polling (${conceptTitle}):`, result.status, 'Images:', result.imageUrls?.length || 0);
        
        if (result.status === 'completed' && result.imageUrls && result.imageUrls.length > 0) {
          console.log(`Maya concept "${conceptTitle}" generation complete!`);
          
          // Update the specific concept card with generated images
          setMessages?.(prev => prev.map(msg => ({
            ...msg,
            conceptCards: msg.conceptCards?.map(concept => 
              concept.id === conceptId 
                ? { 
                    ...concept, 
                    generatedImages: result.imageUrls,
                    isLoading: false,
                    isGenerating: false,
                    hasGenerated: true 
                  }
                : concept
            )
          })));
          
          // Remove from active generations
          setActiveGenerations?.(prev => {
            const newSet = new Set(prev);
            newSet.delete(predictionId);
            return newSet;
          });
          
          return;
        } else if (result.status === 'failed') {
          throw new Error(`Generation failed: ${result.error || 'Unknown error'}`);
        }
        
        // Continue polling if still processing
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 3000); // Poll every 3 seconds
        } else {
          throw new Error('Generation timeout after 5 minutes');
        }
        
      } catch (error) {
        console.error(`Maya concept "${conceptTitle}" polling error:`, error);
        
        // Handle authentication errors gracefully without showing error toast
        if (error.message.includes('401') || error.message.includes('Authentication')) {
          console.log(`Maya concept "${conceptTitle}" polling stopped - authentication expired`);
          // Just remove from active generations, don't show error to user
          setActiveGenerations?.(prev => {
            const newSet = new Set(prev);
            newSet.delete(predictionId);
            return newSet;
          });
          return;
        }
        
        // Reset concept card state on error
        setMessages?.(prev => prev.map(msg => ({
          ...msg,
          conceptCards: msg.conceptCards?.map(concept => 
            concept.id === conceptId 
              ? { ...concept, isLoading: false, isGenerating: false }
              : concept
          )
        })));
        
        // Remove from active generations
        setActiveGenerations?.(prev => {
          const newSet = new Set(prev);
          newSet.delete(predictionId);
          return newSet;
        });
        
        toast?.({
          title: "Generation Error",
          description: `I had trouble creating the "${conceptTitle}" photos. Would you like to try again?`
        });
      }
    };
    
    poll();
  };

  const generateFromSpecificConcept = async (conceptTitle: string, conceptId: string) => {
    console.log('Generating concept:', conceptTitle);
    
    // Update concept card to loading state
    if (setMessages) {
      setMessages((prev: any) => prev.map((msg: any) => ({
        ...msg,
        conceptCards: msg.conceptCards?.map((concept: any) => 
          concept.id === conceptId 
            ? { ...concept, isLoading: true, isGenerating: true }
            : concept
        )
      })));
    }
    
    try {
      // CRITICAL FIX: Pass concept information to backend properly
      const response = await fetch('/api/maya/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          prompt: conceptTitle, 
          conceptName: conceptTitle, // This ensures the backend knows it's a concept selection
          conceptId: conceptId, // CRITICAL: Send concept ID to retrieve embedded prompt
          chatId: currentChatId,
          count: 1
        })
      });

      if (!response.ok) {
        throw new Error(`Generation failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.predictionId) {
        // Start polling for this specific concept generation
        const messageId = `concept_generation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Add to active generations
        setActiveGenerations?.(prev => new Set(prev).add(result.predictionId));
        
        // Start polling with concept context
        pollConceptGeneration(result.predictionId, conceptTitle, conceptId, messageId);
        
        return { predictionId: result.predictionId, messageId };
      } else {
        throw new Error(result.error || 'Generation failed');
      }
    } catch (error) {
      // Reset loading state on error
      if (setMessages) {
        setMessages((prev: any) => prev.map((msg: any) => ({
          ...msg,
          conceptCards: msg.conceptCards?.map((concept: any) => 
            concept.id === conceptId 
              ? { ...concept, isLoading: false, isGenerating: false }
              : concept
          )
        })));
      }
      throw error;
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
    // REMOVED: preset, setPreset, seed, setSeed - Maya AI handles all parameters
    // generateFromConcept REMOVED - legacy function eliminated
    generateImages,
    saveToGallery,
    generateFromSpecificConcept
  };
};