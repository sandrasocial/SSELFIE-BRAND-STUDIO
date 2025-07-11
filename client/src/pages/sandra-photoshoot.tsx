import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navigation } from '@/components/navigation';
import { PaymentVerification } from '@/components/payment-verification';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Built-in Sandra-style prompts - Professional Magazine-Worthy Templates
const SANDRA_PROMPTS = [
  {
    id: 'vogue-power-portrait',
    title: 'VOGUE Power Portrait',
    description: 'Editorial portrait for Vogue cover - Ultimate power shot',
    prompt: '{trigger_word} woman, editorial portrait for Vogue cover, wearing black power blazer, direct confident gaze at camera, luxury studio backdrop, shot on Hasselblad H6D-100c with 80mm lens, soft beauty dish lighting, raw photo, visible skin pores, film grain, unretouched natural skin texture, high-end editorial photography'
  },
  {
    id: 'elle-minimalist',
    title: 'ELLE Minimalist',
    description: 'Clean, sophisticated minimalist portrait - Editorial simplicity',
    prompt: '{trigger_word} woman, minimalist portrait, black turtleneck, clean white background, natural makeup, shot on Canon 5DS R with 85mm f/1.2L lens, window light with reflector, raw photo, authentic skin texture, film grain, editorial simplicity, magazine quality'
  },
  {
    id: 'harpers-ceo-energy',
    title: 'Harper\'s CEO Energy',
    description: 'Executive portrait with powerful stance - Luxury editorial confidence',
    prompt: '{trigger_word} woman, executive portrait, structured black suit, neutral backdrop, powerful stance, shot on Phase One XF IQ4 with 110mm lens, three-point studio lighting, raw photo, natural skin detail, film grain, unretouched confidence, luxury editorial'
  },
  {
    id: 'boardroom-dominance',
    title: 'Boardroom Dominance',
    description: 'Leading the meeting - Corporate editorial photography',
    prompt: '{trigger_word} woman at head of conference table, modern office, city skyline view, black power suit, leading meeting, golden hour light through windows, raw photo, confident expression, natural skin texture, film grain, corporate editorial photography'
  },
  {
    id: 'keynote-speaker',
    title: 'Keynote Speaker',
    description: 'On stage commanding attention - Professional event photography',
    prompt: '{trigger_word} woman on stage at luxury conference, speaking to audience, professional outfit, stage lighting, confident gesture, audience in soft focus, raw photo, natural skin under stage lights, film grain, event photography editorial style'
  },
  {
    id: 'morning-coffee-aesthetic',
    title: 'Morning Coffee Aesthetic',
    description: 'Pinterest-worthy lifestyle moment - Cozy luxury setting',
    prompt: '{trigger_word} woman with coffee cup, cozy luxury setting, oversized black sweater, natural morning light, minimal styling, raw photo, relaxed beauty, natural skin texture, film grain, Pinterest lifestyle photography'
  },
  {
    id: 'studio-session',
    title: 'Studio Session',
    description: 'Behind-the-scenes content creation - Authentic work moment',
    prompt: '{trigger_word} woman in modern photo studio, adjusting ring light, all black outfit, creative process, professional equipment visible, raw photo, natural skin texture, film grain, behind-the-scenes editorial, authentic work moment'
  },
  {
    id: 'wellness-elevation',
    title: 'Wellness Elevation',
    description: 'Morning ritual luxury - Mind, body, success aesthetic',
    prompt: '{trigger_word} woman on yoga mat, luxury apartment, morning sun streaming in, black activewear, meditation pose, city view, raw photo, natural morning glow, visible skin texture, film grain, wellness editorial photography'
  },
  {
    id: 'victory-celebration',
    title: 'Victory Celebration',
    description: 'Celebrating success - Achievement editorial moment',
    prompt: '{trigger_word} woman celebrating success, champagne toast, penthouse setting, black dress, genuine joy, city lights, raw photo, authentic happiness, natural skin detail, film grain, achievement editorial'
  },
  {
    id: 'future-vision',
    title: 'Future Vision',
    description: 'Aspirational horizon shot - Contemplative power pose',
    prompt: '{trigger_word} woman on infinity balcony, looking at horizon, flowing black outfit, sunset light, contemplative power pose, raw photo, visible skin texture, film grain, aspirational editorial photography'
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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user model status
  const { data: userModel } = useQuery({
    queryKey: ['/api/user-model'],
    enabled: isAuthenticated
  });

  // Generate images mutation
  const generateImagesMutation = useMutation({
    mutationFn: async (prompt: string) => {
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
        toast({
          title: "Images Generated Successfully",
          description: `Generated ${data.images.length} images using your trained model`,
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
            return;
          }
        }
        toast({
          title: "Generation Issue", 
          description: "Images generated but not properly returned. Please try again.",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      console.error('Image generation failed:', error);
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
      return await apiRequest('POST', '/api/sandra-chat', { 
        message,
        history: chatHistory
      });
    },
    onSuccess: (data) => {
      setChatHistory(prev => [...prev, 
        { role: 'user', message: chatMessage },
        { role: 'sandra', message: data.response }
      ]);
      setChatMessage('');
      
      // If Sandra suggested a prompt, extract it
      if (data.suggestedPrompt) {
        setCustomPrompt(data.suggestedPrompt);
      }
    },
    onError: (error: any) => {
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
                
                {/* Generate Button */}
                <div style={{ textAlign: 'center' }}>
                  <button
                    onClick={handleGenerateFromPrompts}
                    disabled={selectedPrompts.length === 0 || generateImagesMutation.isPending}
                    style={{
                      padding: '20px 40px',
                      fontSize: '11px',
                      fontWeight: 400,
                      letterSpacing: '0.3em',
                      textTransform: 'uppercase',
                      border: '1px solid #0a0a0a',
                      color: selectedPrompts.length > 0 ? '#ffffff' : '#666666',
                      background: selectedPrompts.length > 0 ? '#0a0a0a' : '#f5f5f5',
                      cursor: selectedPrompts.length > 0 ? 'pointer' : 'default',
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
                      cursor: 'pointer',
                      border: selectedImages.includes(imageUrl) ? '3px solid #0a0a0a' : '3px solid transparent',
                      transition: 'all 300ms ease'
                    }}
                    onClick={() => toggleImageSelection(imageUrl)}
                  >
                    <img
                      src={imageUrl}
                      alt={`Preview ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 300ms ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.02)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                      }}
                    />
                    
                    {/* Selection Indicator */}
                    <div style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: selectedImages.includes(imageUrl) ? '#0a0a0a' : 'rgba(255, 255, 255, 0.8)',
                      border: '2px solid #ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      color: selectedImages.includes(imageUrl) ? '#ffffff' : '#0a0a0a',
                      fontWeight: 'bold'
                    }}>
                      {selectedImages.includes(imageUrl) ? '✓' : (index + 1)}
                    </div>
                    
                    {/* Selection Overlay */}
                    {selectedImages.includes(imageUrl) && (
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(10, 10, 10, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <div style={{
                          background: 'rgba(10, 10, 10, 0.9)',
                          color: '#ffffff',
                          padding: '8px 16px',
                          fontSize: '11px',
                          fontWeight: 400,
                          letterSpacing: '0.2em',
                          textTransform: 'uppercase'
                        }}>
                          Selected
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
      </div>
    </PaymentVerification>
  );
}