import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Navigation } from '@/components/navigation';
import { PaymentVerification } from '@/components/payment-verification';
import { SandraImages } from '@/lib/sandra-images';
import { apiRequest } from '@/lib/queryClient';

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

  // Check user's model status and existing generated images
  const { data: userModel } = useQuery({
    queryKey: ['/api/user-model'],
    enabled: isAuthenticated
  });

  const { data: generatedImages = [], refetch } = useQuery({
    queryKey: ['/api/generated-images'],
    enabled: isAuthenticated
  });

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
      return apiRequest('POST', '/api/generate-user-images', data);
    },
    onSuccess: (data) => {
      setCurrentStep('processing');
      toast({
        title: "Creating your brand photoshoot!",
        description: `Generating ${selectedStyle} ${selectedSubcategory} images with your personal AI...`,
      });
      
      // Poll for completion
      pollGenerationStatus(data.generatedImageId, data.predictionId);
    },
    onError: (error: Error) => {
      toast({
        title: "Generation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const pollGenerationStatus = async (generatedImageId: number, predictionId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const result = await apiRequest('GET', `/api/check-generation/${predictionId}`);
        if (result.status === 'succeeded') {
          clearInterval(pollInterval);
          setCurrentStep('results');
          refetch(); // Refresh generated images list
          toast({
            title: "Photoshoot Complete!",
            description: "Your brand images are ready for selection.",
          });
        } else if (result.status === 'failed') {
          clearInterval(pollInterval);
          toast({
            title: "Generation Failed",
            description: "Please try again with different settings",
            variant: "destructive",
          });
          setCurrentStep('selection');
        }
      } catch (error) {
        clearInterval(pollInterval);
        setCurrentStep('selection');
      }
    }, 3000);
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
    toast({
      title: "Perfect choice!",
      description: "Your images are ready for brandbook creation.",
    });
    setCurrentStep('integration');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-6xl font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
              Your Brand Photoshoot
            </h1>
            <p className="text-xl text-[#666] mb-8">Login to start your transformation</p>
            <button 
              onClick={() => window.location.href = '/api/login'}
              className="text-[#0a0a0a] border-b border-[#0a0a0a] pb-1 text-lg tracking-wide hover:opacity-70 transition-opacity"
            >
              Login to Begin
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PaymentVerification>
      <div className="min-h-screen bg-white">
        <Navigation />
        
        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-16">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-6xl md:text-7xl font-light text-[#0a0a0a] mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
              Your Brand Photoshoot
            </h1>
            <p className="text-xl text-[#666666] max-w-2xl mx-auto">
              {currentStep === 'upload' && "Let's see your natural beauty..."}
              {currentStep === 'processing' && "Creating your professional presence..."}
              {currentStep === 'results' && "Here's your transformation"}
              {currentStep === 'integration' && "Ready to build your brand?"}
            </p>
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
              generatedImages={generatedImages}
              selectedImages={selectedImages}
              onImageSelection={handleImageSelection}
              onUseToBrandbook={handleUseToBrandbook}
            />
          )}

          {currentStep === 'integration' && (
            <IntegrationStep selectedImages={selectedImages} />
          )}
        </main>
      </div>
    </PaymentVerification>
  );
}

// Step Components for the Brand Photoshoot Experience

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
    <div className="max-w-4xl mx-auto">
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
    <div className="max-w-2xl mx-auto text-center">
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
  const latestImages = generatedImages.slice(-4); // Show latest 4 generated images

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-12">
        <h3 className="text-2xl font-light mb-8 text-center" style={{ fontFamily: 'Times New Roman, serif' }}>
          Your Brand Photoshoot Results
        </h3>
        
        {latestImages.length > 0 ? (
          <div className="grid grid-cols-2 gap-6">
            {latestImages.map((image, index) => (
              <div key={image.id} className="group">
                <div className="relative mb-4">
                  <img 
                    src={image.imageUrls || SandraImages.aiGallery[index]} 
                    alt={`Generated ${image.category} ${image.subcategory}`}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                    <button
                      onClick={() => onImageSelection(image.category, image.imageUrls)}
                      className="opacity-0 group-hover:opacity-100 text-white border border-white px-4 py-2 text-sm transition-opacity"
                    >
                      Select This One
                    </button>
                  </div>
                </div>
                <p className="text-sm text-[#666] text-center">
                  {image.category} • {image.subcategory}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-[#666]">No generated images available yet.</p>
          </div>
        )}
      </div>

      {Object.keys(selectedImages).length > 0 && (
        <div className="text-center">
          <button
            onClick={onUseToBrandbook}
            className="text-[#0a0a0a] border-b border-[#0a0a0a] pb-1 text-lg tracking-wide hover:opacity-70 transition-opacity"
          >
            Use in Brandbook & Landing Pages
          </button>
        </div>
      )}
    </div>
  );
}

interface IntegrationStepProps {
  selectedImages: {[key: string]: string};
}

function IntegrationStep({ selectedImages }: IntegrationStepProps) {
  return (
    <div className="max-w-2xl mx-auto text-center">
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
              {style.name}
            </h3>
            <p className="text-xs text-[#666]">{style.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ResultsStepProps {
  aiImages: any[];
  selectedImages: {[key: string]: string};
  onImageSelection: (style: string, imageUrl: string) => void;
  onUseToBrandbook: () => void;
}

function ResultsStep({ aiImages, selectedImages, onImageSelection, onUseToBrandbook }: ResultsStepProps) {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <div className="text-sm text-[#666] mb-4">Here's your transformation</div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {aiImages.slice(0, 4).map((image, index) => (
          <div key={image.id} className="text-center">
            <div className="aspect-[3/4] bg-[#f5f5f5] border border-[#e5e5e5] mb-4 overflow-hidden cursor-pointer hover:border-[#0a0a0a] transition-colors">
              <img 
                src={image.imageUrl} 
                alt={`Style ${index + 1}`}
                className="w-full h-full object-cover"
                onClick={() => onImageSelection(image.style, image.imageUrl)}
              />
            </div>
            <h3 className="text-sm font-light text-[#0a0a0a] mb-1" style={{ fontFamily: 'Times New Roman, serif' }}>
              {image.style}
            </h3>
            <button
              onClick={() => onImageSelection(image.style, image.imageUrl)}
              className="text-xs text-[#666] hover:text-[#0a0a0a] border-b border-transparent hover:border-[#0a0a0a] transition-colors"
            >
              Select This One
            </button>
          </div>
        ))}
      </div>

      {/* Integration Actions */}
      <div className="text-center">
        <button
          onClick={onUseToBrandbook}
          className="text-[#0a0a0a] border-b border-[#0a0a0a] pb-1 text-lg tracking-wide hover:opacity-70 transition-opacity mr-8"
        >
          Use in Brandbook
        </button>
        <button className="text-[#666] border-b border-[#666] pb-1 text-lg tracking-wide hover:text-[#0a0a0a] hover:border-[#0a0a0a] transition-colors">
          Download All
        </button>
      </div>
    </div>
  );
}

interface IntegrationStepProps {
  selectedImages: {[key: string]: string};
}

function IntegrationStep({ selectedImages }: IntegrationStepProps) {
  return (
    <div className="max-w-4xl mx-auto text-center">
      <div className="text-sm text-[#666] mb-12">Ready to build your brand?</div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="border border-[#e5e5e5] p-8">
          <h3 className="text-lg font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
            Create Brandbook
          </h3>
          <p className="text-sm text-[#666] mb-6">
            Use your new images in a professional brandbook
          </p>
          <button className="text-[#0a0a0a] border-b border-[#0a0a0a] pb-1 text-sm tracking-wide hover:opacity-70 transition-opacity">
            Start Brandbook
          </button>
        </div>
        
        <div className="border border-[#e5e5e5] p-8">
          <h3 className="text-lg font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
            Build Landing Page
          </h3>
          <p className="text-sm text-[#666] mb-6">
            Create a conversion-optimized landing page
          </p>
          <button className="text-[#0a0a0a] border-b border-[#0a0a0a] pb-1 text-sm tracking-wide hover:opacity-70 transition-opacity">
            Build Page
          </button>
        </div>
        
        <div className="border border-[#e5e5e5] p-8">
          <h3 className="text-lg font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
            Visit Studio
          </h3>
          <p className="text-sm text-[#666] mb-6">
            Access your complete business workspace
          </p>
          <button className="text-[#0a0a0a] border-b border-[#0a0a0a] pb-1 text-sm tracking-wide hover:opacity-70 transition-opacity">
            Go to Studio
          </button>
        </div>
      </div>
    </div>
  );
}
