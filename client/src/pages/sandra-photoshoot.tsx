import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navigation } from '@/components/navigation';
import { PaymentVerification } from '@/components/payment-verification';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// European Street Luxury - Model-Off-Duty in Paris/Milan Aesthetic
const SANDRA_PROMPTS = [
  {
    id: 'milan-boutique-stroll',
    title: 'Milan Boutique Stroll',
    description: 'European street luxury - Walking past designer stores effortlessly',
    prompt: '{trigger_word} woman walking past luxury boutique in Milan, black strapless top, white tailored trousers, small designer bag, adjusting sunglasses while walking, European street architecture, natural midday light, shot on iPhone street style, film aesthetic, environmental candid'
  },
  {
    id: 'parisian-coffee-run',
    title: 'Parisian Coffee Run',
    description: 'Casual luxury moment - Morning coffee with effortless style',
    prompt: '{trigger_word} woman exiting cafe with coffee, oversized black blazer as dress, Nike sneakers, baseball cap, layered gold necklaces, urban European street, morning light, candid lifestyle moment, influencer street style photography'
  },
  {
    id: 'ornate-doorway-moment',
    title: 'Ornate Doorway Moment',
    description: 'Architectural elegance - Leaning against European heritage',
    prompt: '{trigger_word} woman leaning against ornate European door, black tube top, oversized denim, small structured bag, looking away from camera, architectural details visible, natural street photography, film grain, fashion influencer aesthetic'
  },
  {
    id: 'european-street-crossing',
    title: 'European Street Crossing',
    description: 'City confidence - Mid-stride urban sophistication',
    prompt: '{trigger_word} woman mid-stride crossing European street, black vest top, sage green wide pants, designer bag swinging, confident walk, city life in background, candid street capture, natural movement, lifestyle influencer photography'
  },
  {
    id: 'stone-wall-attitude',
    title: 'Stone Wall Attitude',
    description: 'Architectural lean - All black confidence against history',
    prompt: '{trigger_word} woman against stone building wall, all black outfit leather jacket and pants, arms crossed, sunglasses on, European architecture visible, natural shadow play, street style photography, confident energy, film aesthetic'
  },
  {
    id: 'cobblestone-wandering',
    title: 'Cobblestone Wandering',
    description: 'Old world luxury - Strolling through historic European streets',
    prompt: '{trigger_word} woman walking on cobblestone street, cream oversized coat, black jeans, white sneakers, designer bag, European old town backdrop, natural afternoon light, candid street photography, effortless luxury aesthetic'
  },
  {
    id: 'plaza-phone-moment',
    title: 'Plaza Phone Moment',
    description: 'European plaza elegance - Caught in natural conversation',
    prompt: '{trigger_word} woman on phone in European plaza, beige trench coat, black turtleneck, minimal jewelry, fountain in background, natural gesture, street photography, film grain, sophisticated lifestyle moment'
  },
  {
    id: 'luxury-district-stride',
    title: 'Luxury District Stride',
    description: 'Designer avenue walk - Power walking through high-end shopping',
    prompt: '{trigger_word} woman walking luxury shopping avenue, black turtleneck, wide-leg trousers, structured bag, European luxury storefronts, confident stride, natural street lighting, fashion week street style, candid movement'
  },
  {
    id: 'bridge-contemplation',
    title: 'Bridge Contemplation',
    description: 'European bridge moment - Thoughtful pause over historic waters',
    prompt: '{trigger_word} woman on European bridge, white button-down, dark denim, looking at cityscape, historic bridge architecture, river below, natural wind movement, street photography, contemplative lifestyle moment'
  }
];

export default function SandraPhotoshoot() {
  const { user, isAuthenticated } = useAuth();
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'sandra', message: string}>>([]);
  const [activeTab, setActiveTab] = useState<'prompts' | 'chat'>('prompts');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showSelectionMode, setShowSelectionMode] = useState(false);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState<{
    isGenerating: boolean;
    predictionId: string | null;
    status: string;
    timeElapsed: number;
  }>({
    isGenerating: false,
    predictionId: null,
    status: '',
    timeElapsed: 0
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Timer effect for generation progress tracking
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (generationProgress.isGenerating) {
      interval = setInterval(() => {
        setGenerationProgress(prev => ({
          ...prev,
          timeElapsed: prev.timeElapsed + 1,
          status: prev.timeElapsed < 10 ? 'Processing dynamic scenes...' :
                  prev.timeElapsed < 30 ? 'Generating lifestyle content...' :
                  prev.timeElapsed < 45 ? 'Applying editorial style...' :
                  'Finalizing your images...'
        }));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [generationProgress.isGenerating]);

  // Fetch user model status
  const { data: userModel } = useQuery({
    queryKey: ['/api/user-model'],
    enabled: isAuthenticated
  });

  // Generate images mutation
  const generateImagesMutation = useMutation({
    mutationFn: async (prompt: string) => {
      // Start progress tracking
      setGenerationProgress({
        isGenerating: true,
        predictionId: null,
        status: 'Starting generation...',
        timeElapsed: 0
      });

      const response = await apiRequest('POST', '/api/generate-images', { 
        prompt,
        count: 4 
      });
      // Parse the response as JSON if it's a Response object
      if (response instanceof Response) {
        return await response.json();
      }
      return response;
    },
    onSuccess: (data) => {
      console.log('Generation success data:', data);
      console.log('Data type:', typeof data);
      console.log('Data properties:', Object.keys(data || {}));
      
      if (data && data.images && data.images.length > 0) {
        console.log('Setting generated images:', data.images);
        setGeneratedImages(data.images);
        setSelectedImages([]);
        setShowSelectionMode(true);
        setGenerationProgress({
          isGenerating: false,
          predictionId: null,
          status: 'Completed',
          timeElapsed: 0
        });
        toast({
          title: "Dynamic Lifestyle Images Generated!",
          description: `Successfully generated ${data.images.length} environmental scene images.`,
        });
      } else {
        console.error('No images in success data:', data);
        console.log('Expected format: { images: [...] }');
        // Try to set some test images for debugging
        if (data && !data.images) {
          console.log('Trying alternate data structures...');
          // Check if images are at root level
          if (Array.isArray(data)) {
            setGeneratedImages(data);
            setShowSelectionMode(true);
            setGenerationProgress({
              isGenerating: false,
              predictionId: null,
              status: 'Completed',
              timeElapsed: 0
            });
            return;
          }
        }
        setGenerationProgress({
          isGenerating: false,
          predictionId: null,
          status: 'Failed',
          timeElapsed: 0
        });
        toast({
          title: "Generation Issue", 
          description: "Images generated but not properly returned. Please try again.",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      console.error('Image generation failed:', error);
      setGenerationProgress({
        isGenerating: false,
        predictionId: null,
        status: 'Failed',
        timeElapsed: 0
      });
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate images. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Save selected images mutation
  const saveSelectedImagesMutation = useMutation({
    mutationFn: async (imageUrls: string[]) => {
      return await apiRequest('POST', '/api/save-selected-images', { 
        imageUrls,
        prompt: activeTab === 'prompts' ? selectedPrompts.join(', ') : customPrompt || chatHistory[chatHistory.length - 1]?.message
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-images'] });
      toast({
        title: "Images Saved!",
        description: `${selectedImages.length} photos added to your SSELFIE Gallery.`,
      });
      setGeneratedImages([]);
      setSelectedImages([]);
      setShowSelectionMode(false);
      setSelectedPrompts([]);
      setCustomPrompt('');
    },
    onError: (error: any) => {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save images. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Chat with Sandra AI mutation
  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest('POST', '/api/sandra-chat', { 
        message,
        history: chatHistory
      });
      console.log('Raw API response:', response);
      const data = await response.json();
      console.log('Parsed response data:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Chat success data:', data);
      
      const sandraMessage = data.response || data.message || 'I understand! Let me help you with that.';
      
      setChatHistory(prev => [...prev, 
        { role: 'user', message: chatMessage },
        { role: 'sandra', message: sandraMessage }
      ]);
      setChatMessage('');
      
      // If Sandra suggested a prompt, extract it
      if (data.suggestedPrompt) {
        setCustomPrompt(data.suggestedPrompt);
      }
    },
    onError: (error: any) => {
      console.error('Chat error:', error);
      setChatHistory(prev => [...prev, 
        { role: 'user', message: chatMessage },
        { role: 'sandra', message: "Sorry, I'm having a technical issue right now. Can you try asking me that again?" }
      ]);
      setChatMessage('');
      toast({
        title: "Chat Error", 
        description: error.message || "Failed to chat with Sandra AI. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handlePromptToggle = (promptId: string) => {
    setSelectedPrompts(prev => 
      prev.includes(promptId) 
        ? prev.filter(id => id !== promptId)
        : [...prev, promptId]
    );
  };

  const handleGenerateFromPrompts = () => {
    if (selectedPrompts.length === 0) {
      toast({
        title: "No Prompts Selected",
        description: "Please select at least one prompt style.",
        variant: "destructive",
      });
      return;
    }
    
    const selectedPromptTexts = SANDRA_PROMPTS
      .filter(p => selectedPrompts.includes(p.id))
      .map(p => p.prompt.replace('user{userId}', user?.id || 'subject'))
      .join(' | ');
    
    generateImagesMutation.mutate(selectedPromptTexts);
  };

  const handleGenerateFromCustom = () => {
    if (!customPrompt.trim()) {
      toast({
        title: "No Prompt Entered",
        description: "Please enter a custom prompt or chat with Sandra AI.",
        variant: "destructive",
      });
      return;
    }
    
    const finalPrompt = customPrompt.replace('user{userId}', user?.id || 'subject');
    generateImagesMutation.mutate(finalPrompt);
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    chatMutation.mutate(chatMessage);
  };

  const toggleImageSelection = (imageUrl: string) => {
    setSelectedImages(prev => 
      prev.includes(imageUrl) 
        ? prev.filter(url => url !== imageUrl)
        : [...prev, imageUrl]
    );
  };

  const handleSaveSelected = () => {
    if (selectedImages.length === 0) {
      toast({
        title: "No Images Selected",
        description: "Please select at least one image to save to your gallery.",
        variant: "destructive",
      });
      return;
    }
    saveSelectedImagesMutation.mutate(selectedImages);
  };

  const handleDiscardAll = () => {
    setGeneratedImages([]);
    setSelectedImages([]);
    setShowSelectionMode(false);
    toast({
      title: "Images Discarded",
      description: "All generated images have been discarded.",
    });
  };

  if (!isAuthenticated) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#ffffff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontWeight: 300,
        color: '#0a0a0a'
      }}>
        <Navigation />
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '120px 40px',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontFamily: 'Times New Roman, serif',
            fontSize: 'clamp(3rem, 6vw, 6rem)',
            fontWeight: 200,
            letterSpacing: '-0.01em',
            textTransform: 'uppercase',
            marginBottom: '24px',
            lineHeight: 1
          }}>
            Please Sign In
          </h1>
        </div>
      </div>
    );
  }

  if (userModel?.trainingStatus !== 'completed') {
    return (
      <PaymentVerification>
        <div style={{ 
          minHeight: '100vh', 
          background: '#ffffff',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          fontWeight: 300,
          color: '#0a0a0a'
        }}>
          <Navigation />
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '120px 40px',
            textAlign: 'center'
          }}>
            <h1 style={{
              fontFamily: 'Times New Roman, serif',
              fontSize: 'clamp(3rem, 6vw, 6rem)',
              fontWeight: 200,
              letterSpacing: '-0.01em',
              textTransform: 'uppercase',
              marginBottom: '32px',
              lineHeight: 1
            }}>
              AI Training Required
            </h1>
            <p style={{
              fontSize: '18px',
              lineHeight: 1.6,
              fontWeight: 300,
              maxWidth: '600px',
              margin: '0 auto 40px auto',
              color: '#666666'
            }}>
              You need to complete your AI model training before planning photoshoots.
            </p>
            <a
              href="/simple-training"
              style={{
                display: 'inline-block',
                padding: '16px 32px',
                fontSize: '11px',
                fontWeight: 400,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                border: '1px solid #0a0a0a',
                color: '#0a0a0a',
                background: 'transparent',
                transition: 'all 300ms ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#0a0a0a';
                e.target.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#0a0a0a';
              }}
            >
              Train Your AI
            </a>
          </div>
        </div>
      </PaymentVerification>
    );
  }

  return (
    <PaymentVerification>
      <div style={{ 
        minHeight: '100vh', 
        background: '#ffffff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontWeight: 300,
        color: '#0a0a0a'
      }}>
        <Navigation />
        
        {/* Hero Section */}
        <section style={{
          padding: '120px 0 80px 0'
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '0 40px'
          }}>
            <div style={{
              fontSize: '11px',
              fontWeight: 400,
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              color: '#666666',
              marginBottom: '24px'
            }}>
              STEP 2: PLAN YOUR PHOTOSHOOT
            </div>
            <h1 style={{
              fontFamily: 'Times New Roman, serif',
              fontSize: 'clamp(4rem, 8vw, 8rem)',
              fontWeight: 200,
              letterSpacing: '-0.01em',
              textTransform: 'uppercase',
              marginBottom: '32px',
              lineHeight: 1
            }}>
              SANDRA PHOTOSHOOT
            </h1>
            <p style={{
              fontSize: '20px',
              lineHeight: 1.5,
              fontWeight: 300,
              maxWidth: '600px',
              marginBottom: '60px'
            }}>
              Choose from Sandra's curated prompts or chat with Sandra AI to create the perfect photoshoot concept.
            </p>
            
            {/* Tab Navigation */}
            <div style={{
              display: 'flex',
              gap: '40px',
              marginBottom: '60px'
            }}>
              <button
                onClick={() => setActiveTab('prompts')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: activeTab === 'prompts' ? 400 : 300,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: activeTab === 'prompts' ? '#0a0a0a' : '#666666',
                  borderBottom: activeTab === 'prompts' ? '2px solid #0a0a0a' : '2px solid transparent',
                  paddingBottom: '8px',
                  cursor: 'pointer',
                  transition: 'all 300ms ease'
                }}
              >
                Built-in Prompts
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: activeTab === 'chat' ? 400 : 300,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: activeTab === 'chat' ? '#0a0a0a' : '#666666',
                  borderBottom: activeTab === 'chat' ? '2px solid #0a0a0a' : '2px solid transparent',
                  paddingBottom: '8px',
                  cursor: 'pointer',
                  transition: 'all 300ms ease'
                }}
              >
                Chat with Sandra AI
              </button>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section style={{ padding: '0 0 80px 0' }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '0 40px'
          }}>
            {activeTab === 'prompts' ? (
              <div>
                {/* Built-in Prompts Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                  gap: '30px',
                  marginBottom: '60px'
                }}>
                  {SANDRA_PROMPTS.map((prompt) => (
                    <div
                      key={prompt.id}
                      onClick={() => handlePromptToggle(prompt.id)}
                      style={{
                        background: selectedPrompts.includes(prompt.id) ? '#0a0a0a' : '#ffffff',
                        color: selectedPrompts.includes(prompt.id) ? '#ffffff' : '#0a0a0a',
                        border: '1px solid ' + (selectedPrompts.includes(prompt.id) ? '#0a0a0a' : '#e5e5e5'),
                        padding: '40px',
                        cursor: 'pointer',
                        transition: 'all 300ms ease',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => {
                        if (!selectedPrompts.includes(prompt.id)) {
                          e.currentTarget.style.background = '#f5f5f5';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!selectedPrompts.includes(prompt.id)) {
                          e.currentTarget.style.background = '#ffffff';
                        }
                      }}
                    >
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: 400,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        marginBottom: '16px',
                        lineHeight: 1
                      }}>
                        {prompt.title}
                      </h3>
                      <p style={{
                        fontSize: '14px',
                        lineHeight: 1.6,
                        fontWeight: 300,
                        marginBottom: '0',
                        opacity: selectedPrompts.includes(prompt.id) ? 0.9 : 0.7
                      }}>
                        {prompt.description}
                      </p>
                      {selectedPrompts.includes(prompt.id) && (
                        <div style={{
                          position: 'absolute',
                          top: '20px',
                          right: '20px',
                          fontSize: '18px'
                        }}>
                          ✓
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Generation Progress Display */}
                {generationProgress.isGenerating && (
                  <div style={{
                    maxWidth: '600px',
                    margin: '0 auto 60px auto',
                    padding: '32px',
                    background: '#f8f8f8',
                    border: '1px solid #e5e5e5',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 400,
                      letterSpacing: '0.3em',
                      textTransform: 'uppercase',
                      color: '#666666',
                      marginBottom: '16px'
                    }}>
                      GENERATING DYNAMIC LIFESTYLE IMAGES
                    </div>
                    
                    <div style={{
                      fontSize: '24px',
                      fontFamily: 'Times New Roman, serif',
                      fontWeight: 300,
                      marginBottom: '16px',
                      color: '#0a0a0a'
                    }}>
                      {generationProgress.status}
                    </div>
                    
                    <div style={{
                      fontSize: '18px',
                      fontWeight: 300,
                      color: '#0a0a0a',
                      marginBottom: '20px'
                    }}>
                      {Math.floor(generationProgress.timeElapsed / 60)}:{(generationProgress.timeElapsed % 60).toString().padStart(2, '0')}
                    </div>
                    
                    <div style={{
                      width: '100%',
                      height: '2px',
                      background: '#e5e5e5',
                      borderRadius: '1px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        background: '#0a0a0a',
                        width: `${Math.min((generationProgress.timeElapsed / 60) * 100, 100)}%`,
                        transition: 'width 1s ease-in-out'
                      }} />
                    </div>
                    
                    <div style={{
                      fontSize: '12px',
                      color: '#666666',
                      marginTop: '12px',
                      letterSpacing: '0.1em'
                    }}>
                      Average generation time: 45-60 seconds
                    </div>
                  </div>
                )}

                {/* Generate Button */}
                <div style={{ textAlign: 'center' }}>
                  <button
                    onClick={handleGenerateFromPrompts}
                    disabled={selectedPrompts.length === 0 || generateImagesMutation.isPending || generationProgress.isGenerating}
                    style={{
                      padding: '20px 40px',
                      fontSize: '11px',
                      fontWeight: 400,
                      letterSpacing: '0.3em',
                      textTransform: 'uppercase',
                      border: '1px solid #0a0a0a',
                      color: selectedPrompts.length > 0 && !generationProgress.isGenerating ? '#ffffff' : '#666666',
                      background: selectedPrompts.length > 0 && !generationProgress.isGenerating ? '#0a0a0a' : '#f5f5f5',
                      cursor: selectedPrompts.length > 0 && !generationProgress.isGenerating ? 'pointer' : 'default',
                      transition: 'all 300ms ease',
                      opacity: generateImagesMutation.isPending ? 0.5 : 1
                    }}
                  >
                    {generateImagesMutation.isPending ? 'Generating...' : 'Generate 4 Preview Photos'}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* Chat Interface */}
                <div style={{
                  background: '#f5f5f5',
                  padding: '40px',
                  marginBottom: '40px',
                  minHeight: '400px'
                }}>
                  {chatHistory.length === 0 ? (
                    <div style={{
                      textAlign: 'center',
                      color: '#666666',
                      padding: '60px 0'
                    }}>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: 400,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        marginBottom: '16px'
                      }}>
                        Chat with Sandra AI
                      </h3>
                      <p>
                        Tell Sandra what kind of photos you want and she'll create the perfect prompts for you.
                      </p>
                    </div>
                  ) : (
                    <div style={{ marginBottom: '40px' }}>
                      {chatHistory.map((msg, index) => (
                        <div key={index} style={{
                          marginBottom: '20px',
                          textAlign: msg.role === 'user' ? 'right' : 'left'
                        }}>
                          <div style={{
                            display: 'inline-block',
                            background: msg.role === 'user' ? '#0a0a0a' : '#ffffff',
                            color: msg.role === 'user' ? '#ffffff' : '#0a0a0a',
                            padding: '16px 20px',
                            maxWidth: '70%',
                            border: msg.role === 'sandra' ? '1px solid #e5e5e5' : 'none'
                          }}>
                            <div style={{
                              fontSize: '10px',
                              letterSpacing: '0.2em',
                              textTransform: 'uppercase',
                              marginBottom: '8px',
                              opacity: 0.7
                            }}>
                              {msg.role === 'user' ? 'You' : 'Sandra AI'}
                            </div>
                            <p style={{
                              fontSize: '14px',
                              lineHeight: 1.6,
                              margin: 0
                            }}>
                              {msg.message}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Chat Input */}
                <div style={{
                  display: 'flex',
                  gap: '20px',
                  marginBottom: '40px'
                }}>
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Describe the style of photos you want..."
                    style={{
                      flex: 1,
                      padding: '16px 20px',
                      fontSize: '16px',
                      border: '1px solid #e5e5e5',
                      background: '#ffffff',
                      fontFamily: 'inherit',
                      fontWeight: 300
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSendMessage();
                      }
                    }}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!chatMessage.trim() || chatMutation.isPending}
                    style={{
                      padding: '16px 32px',
                      fontSize: '11px',
                      fontWeight: 400,
                      letterSpacing: '0.3em',
                      textTransform: 'uppercase',
                      border: '1px solid #0a0a0a',
                      color: '#ffffff',
                      background: '#0a0a0a',
                      cursor: 'pointer',
                      transition: 'all 300ms ease',
                      opacity: chatMutation.isPending ? 0.5 : 1
                    }}
                  >
                    {chatMutation.isPending ? 'Sending...' : 'Send'}
                  </button>
                </div>
                
                {/* Custom Prompt Display */}
                {customPrompt && (
                  <div style={{
                    background: '#f5f5f5',
                    padding: '30px',
                    marginBottom: '40px'
                  }}>
                    <h4 style={{
                      fontSize: '11px',
                      fontWeight: 400,
                      letterSpacing: '0.3em',
                      textTransform: 'uppercase',
                      marginBottom: '16px',
                      color: '#666666'
                    }}>
                      Sandra's Suggested Prompt:
                    </h4>
                    <p style={{
                      fontSize: '14px',
                      lineHeight: 1.6,
                      marginBottom: '20px'
                    }}>
                      {customPrompt}
                    </p>
                    <button
                      onClick={handleGenerateFromCustom}
                      disabled={generateImagesMutation.isPending}
                      style={{
                        padding: '16px 32px',
                        fontSize: '11px',
                        fontWeight: 400,
                        letterSpacing: '0.3em',
                        textTransform: 'uppercase',
                        border: '1px solid #0a0a0a',
                        color: '#ffffff',
                        background: '#0a0a0a',
                        cursor: 'pointer',
                        transition: 'all 300ms ease',
                        opacity: generateImagesMutation.isPending ? 0.5 : 1
                      }}
                    >
                      {generateImagesMutation.isPending ? 'Generating...' : 'Generate 4 Preview Photos'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Generated Images Preview */}
        {generatedImages && generatedImages.length > 0 && (
          <section style={{ padding: '80px 0', background: '#f5f5f5' }}>
            <div style={{
              maxWidth: '1400px',
              margin: '0 auto',
              padding: '0 40px'
            }}>
              <h2 style={{
                fontFamily: 'Times New Roman, serif',
                fontSize: 'clamp(2rem, 4vw, 4rem)',
                fontWeight: 200,
                letterSpacing: '-0.01em',
                textTransform: 'uppercase',
                marginBottom: '40px',
                lineHeight: 1,
                textAlign: 'center'
              }}>
                Your Preview Photos
              </h2>
              <p style={{
                fontSize: '16px',
                lineHeight: 1.6,
                fontWeight: 300,
                textAlign: 'center',
                marginBottom: '60px',
                color: '#666666'
              }}>
                Select your favorites to save to your SSELFIE Gallery
              </p>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '30px',
                marginBottom: '60px'
              }}>
                {generatedImages.map((imageUrl, index) => (
                  <div
                    key={index}
                    style={{
                      position: 'relative',
                      aspectRatio: '3/4',
                      overflow: 'hidden',
                      border: selectedImages.includes(imageUrl) ? '3px solid #0a0a0a' : '3px solid transparent',
                      transition: 'all 300ms ease'
                    }}
                  >
                    <img
                      src={imageUrl}
                      alt={`Preview ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 300ms ease',
                        cursor: 'pointer'
                      }}
                      onClick={() => setSelectedImagePreview(imageUrl)}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.02)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                      }}
                    />
                    
                    {/* Selection Checkbox */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleImageSelection(imageUrl);
                      }}
                      style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: selectedImages.includes(imageUrl) ? '#0a0a0a' : 'rgba(255, 255, 255, 0.9)',
                        border: '2px solid #ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        color: selectedImages.includes(imageUrl) ? '#ffffff' : '#0a0a0a',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 300ms ease',
                        backdropFilter: 'blur(10px)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                      }}
                    >
                      {selectedImages.includes(imageUrl) ? '✓' : '○'}
                    </button>
                    
                    {/* Preview Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImagePreview(imageUrl);
                      }}
                      style={{
                        position: 'absolute',
                        top: '16px',
                        left: '16px',
                        background: 'rgba(0, 0, 0, 0.7)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        color: '#ffffff',
                        padding: '8px 12px',
                        fontSize: '10px',
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        transition: 'all 300ms ease',
                        backdropFilter: 'blur(10px)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                        e.target.style.color = '#0a0a0a';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(0, 0, 0, 0.7)';
                        e.target.style.color = '#ffffff';
                      }}
                    >
                      Full Size
                    </button>
                    
                    {/* Photo Number */}
                    <div style={{
                      position: 'absolute',
                      bottom: '16px',
                      left: '16px',
                      background: 'rgba(0, 0, 0, 0.7)',
                      color: '#ffffff',
                      padding: '6px 12px',
                      fontSize: '11px',
                      fontWeight: 400,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      backdropFilter: 'blur(10px)'
                    }}>
                      Photo {index + 1}
                    </div>
                    
                    {/* Selection Overlay */}
                    {selectedImages.includes(imageUrl) && (
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(10, 10, 10, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <div style={{
                          background: 'rgba(10, 10, 10, 0.9)',
                          color: '#ffffff',
                          padding: '12px 20px',
                          fontSize: '12px',
                          fontWeight: 400,
                          letterSpacing: '0.2em',
                          textTransform: 'uppercase',
                          backdropFilter: 'blur(10px)'
                        }}>
                          ✓ Selected for Gallery
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Action Buttons */}
              <div style={{ 
                textAlign: 'center',
                display: 'flex',
                gap: '20px',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <button
                  onClick={handleSaveSelected}
                  disabled={selectedImages.length === 0 || saveSelectedImagesMutation.isPending}
                  style={{
                    padding: '20px 40px',
                    fontSize: '11px',
                    fontWeight: 400,
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    border: '1px solid #0a0a0a',
                    color: '#ffffff',
                    background: selectedImages.length > 0 ? '#0a0a0a' : '#cccccc',
                    cursor: selectedImages.length > 0 ? 'pointer' : 'not-allowed',
                    transition: 'all 300ms ease',
                    opacity: saveSelectedImagesMutation.isPending ? 0.5 : 1
                  }}
                >
                  {saveSelectedImagesMutation.isPending ? 'Saving...' : `Save ${selectedImages.length} Selected`}
                </button>
                
                <button
                  onClick={handleDiscardAll}
                  style={{
                    padding: '20px 40px',
                    fontSize: '11px',
                    fontWeight: 400,
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    border: '1px solid #cccccc',
                    color: '#666666',
                    background: 'transparent',
                    cursor: 'pointer',
                    transition: 'all 300ms ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#f5f5f5';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                  }}
                >
                  Discard All
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Navigation */}
        <section style={{ padding: '80px 0', textAlign: 'center' }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '0 40px'
          }}>
            <a
              href="/studio"
              style={{
                display: 'inline-block',
                padding: '16px 32px',
                fontSize: '11px',
                fontWeight: 400,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                border: '1px solid #0a0a0a',
                color: '#0a0a0a',
                background: 'transparent',
                transition: 'all 300ms ease',
                marginRight: '20px'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#0a0a0a';
                e.target.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#0a0a0a';
              }}
            >
              Back to Studio
            </a>
            <a
              href="/gallery"
              style={{
                display: 'inline-block',
                padding: '16px 32px',
                fontSize: '11px',
                fontWeight: 400,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                border: '1px solid #0a0a0a',
                color: '#ffffff',
                background: '#0a0a0a',
                transition: 'all 300ms ease'
              }}
            >
              View Gallery
            </a>
          </div>
        </section>

        {/* Image Lightbox */}
        {selectedImagePreview && (
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.95)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px'
            }}
            onClick={() => setSelectedImagePreview(null)}
          >
            <div style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh'
            }}>
              <img 
                src={selectedImagePreview}
                alt="Full size preview"
                style={{
                  width: '100%',
                  height: 'auto',
                  objectFit: 'contain',
                  maxWidth: '90vw',
                  maxHeight: '90vh'
                }}
              />
              
              {/* Close Button */}
              <button
                onClick={() => setSelectedImagePreview(null)}
                style={{
                  position: 'absolute',
                  top: '-50px',
                  right: '0',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#ffffff',
                  padding: '12px 16px',
                  fontSize: '11px',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 300ms ease',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                  e.target.style.color = '#0a0a0a';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.color = '#ffffff';
                }}
              >
                × Close
              </button>
              
              {/* Select Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleImageSelection(selectedImagePreview);
                }}
                style={{
                  position: 'absolute',
                  bottom: '-60px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: selectedImages.includes(selectedImagePreview) ? '#0a0a0a' : 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: selectedImages.includes(selectedImagePreview) ? '#ffffff' : '#ffffff',
                  padding: '16px 32px',
                  fontSize: '11px',
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 300ms ease',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  if (!selectedImages.includes(selectedImagePreview)) {
                    e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!selectedImages.includes(selectedImagePreview)) {
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
              >
                {selectedImages.includes(selectedImagePreview) ? '✓ Selected for Gallery' : 'Select for Gallery'}
              </button>
            </div>
          </div>
        )}
      </div>
    </PaymentVerification>
  );
}