import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { MemberNavigation } from '@/components/member-navigation';
import { PaymentVerification } from '@/components/payment-verification';
import { SandraImages } from '@/lib/sandra-images';
import { apiRequest } from '@/lib/queryClient';
import UsageTracker from '@/components/UsageTracker';

type GenerationStep = 'selection' | 'processing' | 'results' | 'integration';

export default function AIGenerator() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<GenerationStep>('selection');
  const [generationResults, setGenerationResults] = useState<any[]>([]);
  const [selectedImages, setSelectedImages] = useState<{[key: string]: string}>({});
  const [sandraMode, setSandraMode] = useState(false);
  const [sandraMessages, setSandraMessages] = useState<Array<{role: string, content: string}>>([]);
  const [sandraInput, setSandraInput] = useState('');
  const [sandraGenerating, setSandraGenerating] = useState(false);

  // Check user's model status and existing generated images
  const { data: userModel } = useQuery({
    queryKey: ['/api/user-model'],
    enabled: isAuthenticated
  });

  const { data: generatedImages = [], refetch } = useQuery({
    queryKey: ['/api/generated-images'],
    enabled: isAuthenticated,
    refetchInterval: 3000 // Poll every 3 seconds for updates
  });

  // Filter and only show images with URLs
  const completedImages = generatedImages.filter((img: any) => img.imageUrls && img.imageUrls.length > 0);

  // Categories from the model training service
  const photoshootCategories = [
    {
      id: 'Editorial',
      name: 'Editorial',
      description: 'Magazine covers and high-fashion photography',
      subcategories: ['Magazine Cover', 'Fashion', 'Business'],
      preview: SandraImages.portraits.professional[0]
    },
    {
      id: 'Lifestyle', 
      name: 'Lifestyle',
      description: 'Authentic moments and personal brand',
      subcategories: ['Working', 'Travel', 'Home', 'Social'],
      preview: SandraImages.portraits.professional[4]
    },
    {
      id: 'Portrait',
      name: 'Portrait',
      description: 'Professional headshots and creative portraits',
      subcategories: ['Headshot', 'Creative', 'Professional'],
      preview: SandraImages.portraits.professional[1]
    },
    {
      id: 'Luxury',
      name: 'Luxury',
      description: 'Sophisticated luxury lifestyle photography',
      subcategories: ['Yacht', 'Villa', 'Shopping', 'Events'],
      preview: SandraImages.portraits.professional[6]
    }
  ];

  // Generate images using user's trained model
  const generatePhotoshootMutation = useMutation({
    mutationFn: async (data: { category: string; subcategory: string }) => {
      const response = await apiRequest('POST', '/api/generate-user-images', data);
      return await response.json();
    },
    onSuccess: (data) => {
      console.log('Generation response:', data); // Debug log
      setCurrentStep('processing');
      toast({
        title: "Creating your brand photoshoot!",
        description: `Generating ${selectedStyle} ${selectedSubcategory} images with your personal AI...`,
      });
      
      // Poll for completion
      if (data.predictionId) {
        pollGenerationStatus(data.generatedImageId, data.predictionId);
      } else {
        console.error('No prediction ID received:', data);
        toast({
          title: "Generation Error",
          description: "No prediction ID received from generation service",
          variant: "destructive",
        });
        setCurrentStep('selection');
      }
    },
    onError: (error: Error) => {
      // Check if it's a model validation error
      if (error.message.includes('AI model not found') || error.message.includes('Please train your model')) {
        toast({
          title: "AI Model Required",
          description: "Please complete your AI model training first.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = '/simple-training';
        }, 1500);
        return;
      }
      
      // Check if it's a usage limit error
      if (error.message.includes('Usage limit reached') || error.message.includes('Generation limit reached')) {
        toast({
          title: "Usage Limit Reached",
          description: "You've reached your generation limit. Upgrade your plan to continue creating AI images.",
          variant: "destructive",
        });
        // Refresh usage data
        queryClient.invalidateQueries({ queryKey: ['/api/usage/status'] });
        queryClient.invalidateQueries({ queryKey: ['/api/usage/stats'] });
      } else {
        toast({
          title: "Generation failed",
          description: error.message,
          variant: "destructive",
        });
      }
      setCurrentStep('selection');
    },
  });

  const pollGenerationStatus = async (generatedImageId: number, predictionId: string) => {
    if (!predictionId) {
      toast({
        title: "Generation Error",
        description: "No prediction ID received from generation service",
        variant: "destructive",
      });
      setCurrentStep('selection');
      return;
    }

    let attempts = 0;
    const maxAttempts = 100; // 5 minutes at 3-second intervals

    const pollInterval = setInterval(async () => {
      attempts++;
      
      try {
        // Check generated images database first (more reliable)
        const generatedImages = await apiRequest('GET', '/api/generated-images');
        const targetImage = generatedImages.find((img: any) => img.id === generatedImageId);
        
        if (targetImage && targetImage.generationStatus === 'completed' && targetImage.image_urls !== 'processing') {
          clearInterval(pollInterval);
          setCurrentStep('results');
          refetch(); // Refresh generated images list
          
          toast({
            title: "Photoshoot Complete!",
            description: "Your brand images are ready for selection.",
          });
          
          // Refresh usage data after successful generation
          queryClient.invalidateQueries({ queryKey: ['/api/usage/status'] });
          queryClient.invalidateQueries({ queryKey: ['/api/usage/stats'] });
          return;
        }
        
        if (targetImage && targetImage.generationStatus === 'failed') {
          clearInterval(pollInterval);
          toast({
            title: "Generation Failed",
            description: "Image generation failed. Please try again with a different style.",
            variant: "destructive",
          });
          setCurrentStep('selection');
          return;
        }
        
        // Fallback: Check Replicate API status and update our database
        try {
          const replicateStatus = await apiRequest('GET', `/api/check-generation/${predictionId}`);
          if (replicateStatus.status === 'succeeded') {
            // Update our database
            await apiRequest('POST', `/api/ai/update-status/${generatedImageId}/${predictionId}`);
          } else if (replicateStatus.status === 'failed') {
            clearInterval(pollInterval);
            toast({
              title: "Generation Failed",
              description: replicateStatus.error || "Image generation failed. Please try again.",
              variant: "destructive",
            });
            setCurrentStep('selection');
            return;
          }
        } catch (apiError) {
          console.warn('API status check failed, will retry:', apiError);
          // Don't fail the entire polling - just continue checking database
        }
        
      } catch (error) {
        console.error('Polling error:', error);
        // Continue polling for a while even with errors, as the generation might still complete
        // Only show timeout message after many attempts
        if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          toast({
            title: "Generation in Progress", 
            description: "Your images are still being created. They will appear once ready.",
            variant: "default",
          });
          // Don't reset to selection - let user see the processing state
        }
      }
      
      if (attempts >= maxAttempts) {
        clearInterval(pollInterval);
        toast({
          title: "Generation Taking Too Long",
          description: "Your images are still being created. Check back in a few minutes!",
          variant: "destructive",
        });
        setCurrentStep('selection');
      }
    }, 3000); // Check every 3 seconds
  };

  const handleStyleSelect = (category: string) => {
    setSelectedStyle(category);
    setSelectedSubcategory(null);
  };

  const handleSubcategorySelect = (subcategory: string) => {
    setSelectedSubcategory(subcategory);
  };

  const handleStartPhotoshoot = () => {
    if (!selectedStyle || !selectedSubcategory) {
      toast({
        title: "Please select a style",
        description: "Choose both a category and subcategory for your photoshoot.",
        variant: "destructive",
      });
      return;
    }

    if (!userModel || userModel.trainingStatus !== 'completed') {
      toast({
        title: "Model not ready",
        description: "Your personal AI model is still training. Please wait for completion.",
        variant: "destructive",
      });
      return;
    }

    generatePhotoshootMutation.mutate({
      category: selectedStyle,
      subcategory: selectedSubcategory
    });
  };

  const handleImageSelection = (style: string, imageUrl: string) => {
    setSelectedImages(prev => ({ ...prev, [style]: imageUrl }));
  };

  const handleUseToBrandbook = () => {
    setCurrentStep('integration');
  };

  // Sandra AI message handler
  const handleSandraMessage = useCallback(async () => {
    if (!sandraInput.trim()) return;

    const userMessage = sandraInput.trim();
    setSandraInput('');
    setSandraGenerating(true);

    // Add user message to chat
    const newMessages = [...sandraMessages, { role: 'user', content: userMessage }];
    setSandraMessages(newMessages);

    try {
      // Send to Sandra AI for custom prompt generation
      const response = await apiRequest('POST', '/api/sandra-custom-prompt', {
        message: userMessage,
        context: 'brand_photoshoot'
      });

      const sandraResponse = response.message;
      const generatedPrompt = response.generatedPrompt;

      // Add Sandra's response to chat
      setSandraMessages(prev => [...prev, { 
        role: 'sandra', 
        content: `${sandraResponse}\n\nI've created this perfect prompt for your vision: "${generatedPrompt}"\n\nShould I generate this for you right now?`,
        prompt: generatedPrompt
      }]);

      toast({
        title: "Sandra created your prompt!",
        description: "Click 'Generate Now' to create your images",
      });

    } catch (error) {
      console.error('Sandra chat error:', error);
      setSandraMessages(prev => [...prev, { 
        role: 'sandra', 
        content: "Oops! I'm having a moment. Try describing your vision again - I'm listening!" 
      }]);
    } finally {
      setSandraGenerating(false);
    }
  }, [sandraInput, sandraMessages, toast]);

  // Generate images from Sandra's prompt
  const generateFromSandraPrompt = useCallback(async (prompt: string) => {
    setSandraGenerating(true);
    try {
      const response = await apiRequest('POST', '/api/generate-custom-prompt', {
        customPrompt: prompt
      });

      toast({
        title: "Generation Started!",
        description: "Your custom images are being created. Check back in a few moments.",
      });

      // Refetch images to show new generation
      refetch();
      setCurrentStep('processing');
      
    } catch (error) {
      console.error('Custom generation error:', error);
      
      // Check if it's a model validation error
      if (error.message.includes('AI model not found') || error.message.includes('Please train your model')) {
        toast({
          title: "AI Model Required",
          description: "Please complete your AI model training first.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = '/simple-training';
        }, 1500);
        return;
      }
      
      toast({
        title: "Generation Failed",
        description: "Try again or choose a different style",
        variant: "destructive",
      });
    } finally {
      setSandraGenerating(false);
    }
  }, [toast, refetch]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <MemberNavigation />
        <div className="pt-32 pb-16 text-center">
          <h1 className="font-serif text-4xl mb-6 text-black font-light uppercase tracking-wide">
            Hey There
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            Continue with Google to access your brand photoshoot.
          </p>
          <a
            href="/login"
            className="inline-block px-8 py-4 text-xs uppercase tracking-wide border border-black hover:bg-black hover:text-white transition-all duration-300"
          >
            Continue with Google
          </a>
        </div>
      </div>
    );
  }

  return (
    <PaymentVerification>
      <div className="min-h-screen bg-white">
        <MemberNavigation />
        
        <div className="pt-32 pb-16">
          {/* Hero Section */}
          <div className="text-center mb-16 px-8">
            <h1 className="text-4xl md:text-6xl font-light mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
              YOUR BRAND PHOTOSHOOT
            </h1>
            <p className="text-lg text-[#666] max-w-2xl mx-auto">
              {currentStep === 'selection' && "Choose your style and create professional images with your personal AI"}
              {currentStep === 'processing' && "Your AI is creating magazine-quality images"}
              {currentStep === 'results' && "Here's your transformation"}
              {currentStep === 'integration' && "Ready to build your brand?"}
            </p>
          </div>

          {/* Usage Tracker */}
          <div className="max-w-4xl mx-auto px-8 mb-12">
            <UsageTracker />
          </div>

          {/* Step Indicator */}
          <div className="flex justify-center mb-16">
            <div className="flex items-center space-x-8">
              {(['selection', 'processing', 'results', 'integration'] as const).map((step, index) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm ${
                    currentStep === step ? 'border-[#0a0a0a] bg-[#0a0a0a] text-white' :
                    index < (['selection', 'processing', 'results', 'integration'] as const).indexOf(currentStep) ? 'border-[#0a0a0a] bg-[#0a0a0a] text-white' :
                    'border-[#ccc] text-[#ccc]'
                  }`}>
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  {index < 3 && <div className="w-16 h-px bg-[#e5e5e5] mx-4" />}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          {currentStep === 'selection' && (
            <SelectionStep 
              categories={photoshootCategories}
              selectedStyle={selectedStyle}
              selectedSubcategory={selectedSubcategory}
              onStyleSelect={handleStyleSelect}
              onSubcategorySelect={handleSubcategorySelect}
              onStartPhotoshoot={handleStartPhotoshoot}
              isLoading={generatePhotoshootMutation.isPending}
              userModel={userModel}
            />
          )}

          {currentStep === 'processing' && (
            <ProcessingStep 
              selectedStyle={selectedStyle}
              selectedSubcategory={selectedSubcategory}
            />
          )}

          {currentStep === 'results' && (
            <ResultsStep 
              generatedImages={completedImages}
              selectedImages={selectedImages}
              onImageSelection={handleImageSelection}
              onUseToBrandbook={handleUseToBrandbook}
            />
          )}

          {/* Sandra AI Chat Helper */}
          <SandraAIHelper 
            isOpen={sandraMode}
            onToggle={() => setSandraMode(!sandraMode)}
            messages={sandraMessages}
            input={sandraInput}
            onInputChange={setSandraInput}
            onSendMessage={handleSandraMessage}
            onGeneratePrompt={generateFromSandraPrompt}
            isGenerating={sandraGenerating}
          />

          {currentStep === 'integration' && (
            <IntegrationStep selectedImages={selectedImages} />
          )}
        </div>
      </div>
    </PaymentVerification>
  );
}

// Step Components

interface SelectionStepProps {
  categories: any[];
  selectedStyle: string | null;
  selectedSubcategory: string | null;
  onStyleSelect: (style: string) => void;
  onSubcategorySelect: (subcategory: string) => void;
  onStartPhotoshoot: () => void;
  isLoading: boolean;
  userModel: any;
}

function SelectionStep({ 
  categories, 
  selectedStyle, 
  selectedSubcategory, 
  onStyleSelect, 
  onSubcategorySelect, 
  onStartPhotoshoot, 
  isLoading, 
  userModel 
}: SelectionStepProps) {
  return (
    <div className="max-w-4xl mx-auto px-8">
      {/* Model Status */}
      {userModel && (
        <div className="mb-8 p-4 bg-[#f5f5f5] border border-[#e5e5e5]">
          <p className="text-sm text-[#666]">
            Your personal AI model: <span className="font-medium text-[#0a0a0a]">
              {userModel.trainingStatus === 'completed' ? 'Ready' : 
               userModel.trainingStatus === 'training' ? 'Training in progress...' : 
               'Not available'}
            </span>
          </p>
          {userModel.trainingStatus === 'training' && (
            <p className="text-xs text-[#999] mt-1">
              Training typically takes 24-48 hours. You'll be notified when ready.
            </p>
          )}
        </div>
      )}

      {/* Style Categories */}
      <div className="mb-12">
        <h3 className="text-xl font-light mb-8" style={{ fontFamily: 'Times New Roman, serif' }}>
          01. Choose your photoshoot style
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onStyleSelect(category.id)}
              className={`p-6 border text-left transition-all ${
                selectedStyle === category.id
                  ? 'border-[#0a0a0a] bg-[#0a0a0a] text-white'
                  : 'border-[#e5e5e5] hover:border-[#0a0a0a]'
              }`}
            >
              <img 
                src={category.preview} 
                alt={category.name}
                className="w-full h-32 object-cover mb-4"
              />
              <h4 className="font-medium mb-2">{category.name}</h4>
              <p className="text-xs opacity-80">{category.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Subcategories */}
      {selectedStyle && (
        <div className="mb-12">
          <h3 className="text-xl font-light mb-8" style={{ fontFamily: 'Times New Roman, serif' }}>
            02. Select specific style
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {categories.find(c => c.id === selectedStyle)?.subcategories.map((sub: string) => (
              <button
                key={sub}
                onClick={() => onSubcategorySelect(sub)}
                className={`p-4 border text-center transition-all ${
                  selectedSubcategory === sub
                    ? 'border-[#0a0a0a] bg-[#0a0a0a] text-white'
                    : 'border-[#e5e5e5] hover:border-[#0a0a0a]'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action Button */}
      {selectedStyle && selectedSubcategory && (
        <div className="text-center">
          <button
            onClick={onStartPhotoshoot}
            disabled={isLoading || userModel?.trainingStatus !== 'completed'}
            className="text-[#0a0a0a] border-b border-[#0a0a0a] pb-1 text-lg tracking-wide hover:opacity-70 transition-opacity disabled:opacity-50"
          >
            {isLoading ? "Starting Your Photoshoot..." : "Start Your Brand Photoshoot"}
          </button>
        </div>
      )}
    </div>
  );
}

interface ProcessingStepProps {
  selectedStyle: string | null;
  selectedSubcategory: string | null;
}

function ProcessingStep({ selectedStyle, selectedSubcategory }: ProcessingStepProps) {
  return (
    <div className="max-w-2xl mx-auto text-center px-8">
      <div className="mb-8">
        <div className="inline-block w-16 h-16 border-4 border-[#e5e5e5] border-t-[#0a0a0a] rounded-full animate-spin mb-6"></div>
        <h3 className="text-2xl font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
          Creating Your {selectedStyle} {selectedSubcategory} Images
        </h3>
        <p className="text-[#666] mb-8">
          Your personal AI is generating 4 variations. This usually takes 2-3 minutes.
        </p>
      </div>
      
      <div className="bg-[#f5f5f5] p-6">
        <p className="text-sm text-[#666] mb-2">Using your trained model:</p>
        <p className="text-xs text-[#999]">
          High-quality {selectedStyle?.toLowerCase()} style • Professional lighting • Magazine quality
        </p>
      </div>
    </div>
  );
}

interface ResultsStepProps {
  generatedImages: any[];
  selectedImages: {[key: string]: string};
  onImageSelection: (style: string, imageUrl: string) => void;
  onUseToBrandbook: () => void;
}

function ResultsStep({ generatedImages, selectedImages, onImageSelection, onUseToBrandbook }: ResultsStepProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [savedImages, setSavedImages] = useState<Set<string>>(new Set());
  const [savingImages, setSavingImages] = useState<Set<string>>(new Set());

  // Get the latest completed generation
  const latestGeneration = generatedImages
    .filter(img => img.generationStatus === 'completed' && img.image_urls && img.image_urls !== 'processing')
    .slice(-1)[0]; // Get the most recent completed generation

  let imageOptions: string[] = [];
  if (latestGeneration && latestGeneration.image_urls) {
    try {
      imageOptions = JSON.parse(latestGeneration.image_urls);
    } catch (e) {
      console.error('Failed to parse image URLs:', e);
      imageOptions = [];
    }
  }

  // Save image to gallery with permanent storage
  const saveToGallery = async (imageUrl: string, index: number) => {
    if (savedImages.has(imageUrl) || savingImages.has(imageUrl)) return;
    
    setSavingImages(prev => new Set([...prev, imageUrl]));
    
    try {
      await apiRequest('POST', '/api/save-to-gallery', {
        imageUrl,
        prompt: `${latestGeneration.category} ${latestGeneration.subcategory} - Option ${index + 1}`,
        style: latestGeneration.category,
        subcategory: latestGeneration.subcategory
      });
      
      setSavedImages(prev => new Set([...prev, imageUrl]));
      // Refresh the gallery to show newly saved image
      queryClient.invalidateQueries({ queryKey: ['/api/gallery-images'] });
      toast({
        title: "Saved to Gallery",
        description: "Image permanently saved to your gallery with S3 storage",
      });
    } catch (error) {
      console.error('Error saving to gallery:', error);
      toast({
        title: "Save Failed",
        description: "Could not save image to gallery. Please try again.",
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

  return (
    <div className="max-w-4xl mx-auto px-8">
      {/* AI Learning Message */}
      <div className="mb-8 p-6 bg-[#f5f5f5] border border-[#e5e5e5]">
        <h4 className="font-medium mb-3 text-[#0a0a0a]">About Your SSELFIE AI</h4>
        <p className="text-sm text-[#666] mb-2">
          AI sometimes gets it wrong and photos may not look exactly like you. This is completely normal! 
          The more you use your SSELFIE AI, the better it gets at learning your exact features.
        </p>
        <p className="text-sm text-[#666]">
          Choose the best images from each generation and keep creating more. Each photoshoot helps train your AI to be more accurate.
        </p>
      </div>

      <div className="mb-12">
        <h3 className="text-2xl font-light mb-8 text-center" style={{ fontFamily: 'Times New Roman, serif' }}>
          Your Brand Photoshoot Results
        </h3>
        
        {imageOptions.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-6 mb-8">
              {imageOptions.map((imageUrl, index) => (
                <div key={index} className="group relative">
                  <div className="relative mb-4">
                    <img 
                      src={imageUrl}
                      alt={`Generated ${latestGeneration.category} ${latestGeneration.subcategory} option ${index + 1}`}
                      className="w-full h-64 object-cover border border-[#e5e5e5]"
                      onError={(e) => {
                        // Image loading failed - user must train their own model
                        (e.target as HTMLImageElement).src = SandraImages.aiGallery[index % SandraImages.aiGallery.length];
                      }}
                    />
                    
                    {/* Save to Gallery Heart Button */}
                    <button
                      onClick={() => saveToGallery(imageUrl, index)}
                      disabled={savingImages.has(imageUrl)}
                      style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: savedImages.has(imageUrl) ? 'rgba(255, 68, 68, 0.9)' : 'rgba(0, 0, 0, 0.6)',
                        border: 'none',
                        color: '#ffffff',
                        fontSize: '20px',
                        padding: '8px 10px',
                        cursor: savingImages.has(imageUrl) ? 'not-allowed' : 'pointer',
                        borderRadius: '50%',
                        transition: 'all 300ms ease',
                        backdropFilter: 'blur(10px)',
                        zIndex: 10
                      }}
                      onMouseEnter={(e) => {
                        if (!savingImages.has(imageUrl)) {
                          e.currentTarget.style.background = savedImages.has(imageUrl) ? 'rgba(255, 68, 68, 1)' : 'rgba(0, 0, 0, 0.8)';
                          e.currentTarget.style.transform = 'scale(1.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!savingImages.has(imageUrl)) {
                          e.currentTarget.style.background = savedImages.has(imageUrl) ? 'rgba(255, 68, 68, 0.9)' : 'rgba(0, 0, 0, 0.6)';
                          e.currentTarget.style.transform = 'scale(1)';
                        }
                      }}
                    >
                      {savingImages.has(imageUrl) ? '⟳' : (savedImages.has(imageUrl) ? '♥' : '♡')}
                    </button>

                    {/* Saved Indicator */}
                    {savedImages.has(imageUrl) && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '16px',
                          left: '16px',
                          background: 'rgba(0, 0, 0, 0.9)',
                          color: '#ffffff',
                          fontSize: '10px',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontWeight: 500,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          backdropFilter: 'blur(10px)',
                          zIndex: 5
                        }}
                      >
                        Saved to Gallery
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-[#666] text-center">
                    Option {index + 1} • {latestGeneration.category} {latestGeneration.subcategory}
                  </p>
                </div>
              ))}
            </div>
            
            {/* Action Buttons */}
            <div className="text-center space-y-4">
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="text-[#0a0a0a] border border-[#0a0a0a] px-8 py-3 hover:bg-[#0a0a0a] hover:text-white transition-all"
                >
                  Generate More Images
                </button>
                
                {savedImages.size > 0 && (
                  <a
                    href="/sselfie-gallery"
                    className="inline-block text-white bg-[#0a0a0a] px-8 py-3 hover:opacity-80 transition-opacity"
                  >
                    View Gallery ({savedImages.size} saved)
                  </a>
                )}
              </div>
              
              {/* Save Instructions */}
              <p className="text-sm text-[#666] max-w-lg mx-auto">
                Click the heart (♡) on your favorite images to save them permanently to your gallery. 
                Only saved images will appear in your gallery collection.
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="mb-4">
              <div className="inline-block w-8 h-8 border-4 border-[#e5e5e5] border-t-[#0a0a0a] rounded-full animate-spin"></div>
            </div>
            <p className="text-[#666] mb-2">Your images are still being created...</p>
            <p className="text-sm text-[#999]">This usually takes 2-3 minutes. Please wait.</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface IntegrationStepProps {
  selectedImages: {[key: string]: string};
}

function IntegrationStep({ selectedImages }: IntegrationStepProps) {
  return (
    <div className="max-w-2xl mx-auto text-center px-8">
      <h3 className="text-2xl font-light mb-8" style={{ fontFamily: 'Times New Roman, serif' }}>
        Ready to Build Your Brand
      </h3>
      
      <div className="grid grid-cols-3 gap-8 mb-12">
        <div className="text-center">
          <div className="text-3xl mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>01</div>
          <h4 className="font-medium mb-2">Add to Brandbook</h4>
          <p className="text-sm text-[#666]">Use in your professional brandbook templates</p>
        </div>
        <div className="text-center">
          <div className="text-3xl mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>02</div>
          <h4 className="font-medium mb-2">Create Landing Pages</h4>
          <p className="text-sm text-[#666]">Build conversion-focused pages</p>
        </div>
        <div className="text-center">
          <div className="text-3xl mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>03</div>
          <h4 className="font-medium mb-2">Launch Studio</h4>
          <p className="text-sm text-[#666]">Complete your business setup</p>
        </div>
      </div>

      <div className="space-y-4">
        <button className="w-full text-[#0a0a0a] border border-[#0a0a0a] p-4 hover:bg-[#0a0a0a] hover:text-white transition-colors">
          Go to Brandbook Designer
        </button>
        <button className="w-full text-[#0a0a0a] border border-[#0a0a0a] p-4 hover:bg-[#0a0a0a] hover:text-white transition-colors">
          Create Landing Page
        </button>
        <button className="w-full text-[#0a0a0a] border border-[#0a0a0a] p-4 hover:bg-[#0a0a0a] hover:text-white transition-colors">
          Go to SSELFIE STUDIO
        </button>
      </div>
    </div>
  );
}

// Sandra AI Helper Component
interface SandraAIHelperProps {
  isOpen: boolean;
  onToggle: () => void;
  messages: Array<{role: string, content: string, prompt?: string}>;
  input: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onGeneratePrompt: (prompt: string) => void;
  isGenerating: boolean;
}

function SandraAIHelper({ 
  isOpen, 
  onToggle, 
  messages, 
  input, 
  onInputChange, 
  onSendMessage, 
  onGeneratePrompt,
  isGenerating 
}: SandraAIHelperProps) {
  return (
    <>
      {/* Sandra Helper Toggle Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={onToggle}
          className="bg-[#0a0a0a] text-white p-4 rounded-full shadow-lg hover:bg-[#333] transition-colors"
        >
          <div className="w-6 h-6 flex items-center justify-center text-sm font-light">
            {isOpen ? '×' : 'AI'}
          </div>
        </button>
      </div>

      {/* Sandra Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-8 w-96 h-[500px] bg-white border border-[#e5e5e5] shadow-xl z-40 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-[#e5e5e5] bg-[#f5f5f5]">
            <h3 className="text-lg font-light" style={{ fontFamily: 'Times New Roman, serif' }}>
              Sandra AI Helper
            </h3>
            <p className="text-sm text-[#666] mt-1">
              Tell me what you want to create and I'll generate the perfect prompt
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-[#666] py-8">
                <p className="mb-2">Hey! I'm Sandra 👋</p>
                <p className="text-sm">Describe your vision and I'll create the perfect prompt for your photoshoot</p>
              </div>
            )}
            
            {messages.map((message, index) => (
              <div key={index} className={`${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block max-w-[80%] p-3 rounded ${
                  message.role === 'user' 
                    ? 'bg-[#0a0a0a] text-white' 
                    : 'bg-[#f5f5f5] text-[#0a0a0a]'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  {message.prompt && (
                    <button
                      onClick={() => onGeneratePrompt(message.prompt)}
                      className="mt-2 text-xs underline hover:no-underline"
                      disabled={isGenerating}
                    >
                      {isGenerating ? 'Generating...' : 'Generate Now →'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-[#e5e5e5]">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
                placeholder="Describe your vision..."
                className="flex-1 p-2 border border-[#e5e5e5] text-sm"
                disabled={isGenerating}
              />
              <button
                onClick={onSendMessage}
                disabled={isGenerating || !input.trim()}
                className="px-4 py-2 bg-[#0a0a0a] text-white text-sm disabled:opacity-50 hover:bg-[#333] transition-colors"
              >
                {isGenerating ? '...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}