import React, { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Navigation } from '@/components/navigation';
import { SandraImages } from '@/lib/sandra-images';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Complete prompts library from the assets
const PROMPT_COLLECTIONS = {
  'healing-mindset': {
    id: 'healing-mindset',
    name: 'Healing & Mindset',
    description: 'Ocean healing, meditation, wellness journey energy',
    preview: SandraImages.portraits.professional[2],
    prompts: [
      {
        id: 'arms-to-sky',
        name: 'Arms to the Sky',
        category: 'Ocean Healing',
        prompt: '[triggerword] woman standing at ocean edge, arms raised to sky in release, waves washing over feet, wearing flowing earth-toned top and cream pants, overcast moody sky, muted color palette, emotional liberation moment, healing journey photography'
      },
      {
        id: 'sunset-contemplation',
        name: 'Sunset Contemplation',
        category: 'Ocean Healing',
        prompt: '[triggerword] woman sitting on beach at golden hour, off-shoulder white dress, looking at horizon, hair flowing in ocean breeze, warm sunset glow on skin, peaceful expression, mindfulness moment, coastal healing aesthetic'
      },
      {
        id: 'wave-surrender',
        name: 'Wave Surrender',
        category: 'Ocean Healing',
        prompt: '[triggerword] woman in ocean waves, white flowing dress getting wet, arms spread in surrender, hair wild with salt water, sunset backlighting, letting go moment, therapeutic ocean photography, healing journey'
      },
      {
        id: 'beach-meditation',
        name: 'Beach Meditation',
        category: 'Ocean Healing',
        prompt: '[triggerword] woman in lotus pose on sand, black outfit, eyes closed in meditation, ocean waves in background, golden hour side lighting, serene expression, mindfulness practice, beach yoga aesthetic'
      },
      {
        id: 'candlelit-meditation',
        name: 'Candlelit Meditation',
        category: 'Inner Peace',
        prompt: '[triggerword] woman in meditation pose, black tank and leggings, surrounded by candles, indoor zen space, warm candlelight glow on face, eyes closed in peace, healing sanctuary, mindfulness photography'
      },
      {
        id: 'morning-ritual',
        name: 'Morning Ritual',
        category: 'Inner Peace',
        prompt: '[triggerword] woman in morning meditation, sitting by window with natural light, holding warm tea, peaceful expression, plants visible, cozy healing space, daily mindfulness practice, wellness lifestyle'
      },
      {
        id: 'forest-grounding',
        name: 'Forest Grounding',
        category: 'Nature Connection',
        prompt: '[triggerword] woman standing among trees, touching tree trunk, earthing practice, natural clothing, dappled forest light, connection with nature, grounding energy, forest therapy moment'
      },
      {
        id: 'yoga-flow',
        name: 'Yoga Flow',
        category: 'Movement Medicine',
        prompt: '[triggerword] woman in yoga pose, flowing movement captured, natural light studio, black yoga wear, graceful strength, moving meditation, healing through movement, wellness photography'
      }
    ]
  },
  'european-luxury': {
    id: 'european-luxury',
    name: 'European Street Luxury',
    description: 'Model-off-duty Paris/Milan expensive girl energy',
    preview: SandraImages.portraits.professional[0],
    prompts: [
      {
        id: 'parisian-cafe-exit',
        name: 'Parisian Café Exit',
        category: 'Morning Coffee Runs',
        prompt: '[triggerword] woman stepping out of Parisian cafe holding coffee cup, oversized black blazer over mini dress, Prada bag, morning sunlight on cobblestone street, natural stride, other cafe patrons blurred in background, iPhone street photography aesthetic, film grain, candid lifestyle moment'
      },
      {
        id: 'milan-coffee-walk',
        name: 'Milan Coffee Walk',
        category: 'Morning Coffee Runs',
        prompt: '[triggerword] woman walking with espresso cup, black cropped tank, high-waisted cream trousers, small Bottega Veneta bag, Italian architecture behind, adjusting sunglasses with free hand, natural morning light, street style candid, film photography mood'
      },
      {
        id: 'avenue-montaigne-stroll',
        name: 'Avenue Montaigne Stroll',
        category: 'Luxury Shopping',
        prompt: '[triggerword] woman walking past Dior boutique, black strapless top, white wide-leg pants, Hermès Kelly bag, mid-stride confident walk, Parisian Haussmann architecture, natural daylight, street style photography, film aesthetic, movement captured'
      },
      {
        id: 'stone-building-lean',
        name: 'Stone Building Lean',
        category: 'Architectural Backgrounds',
        prompt: '[triggerword] woman leaning against limestone building, black tube top, vintage denim, small chain bag, one hand in pocket, looking away from camera, European architectural details, natural shadows on face, street style portrait, film photography'
      },
      {
        id: 'zebra-crossing-power',
        name: 'Zebra Crossing Power',
        category: 'Street Crossing',
        prompt: '[triggerword] woman mid-stride on crosswalk, black bodysuit, oversized blazer flowing, small bag across body, city traffic blurred behind, confident walk, natural daylight, street photography style, movement captured, film aesthetic'
      },
      {
        id: 'golden-hour-walk',
        name: 'Golden Hour Walk',
        category: 'Evening Transitions',
        prompt: '[triggerword] woman walking in evening light, black slip dress, leather jacket over shoulders, small clutch bag, European boulevard, golden hour backlighting, natural stride, street style photography, film mood'
      }
    ]
  },
  'vulnerability-series': {
    id: 'vulnerability-series',
    name: 'The Vulnerability Series',
    description: 'Raw storytelling, emotional authenticity, transformation narratives',
    preview: SandraImages.portraits.professional[3],
    prompts: [
      {
        id: 'silhouette-strength',
        name: 'Silhouette of Strength',
        category: 'Raw Moments',
        prompt: '[triggerword] woman profile silhouette against bright window, hair up showing neck curve, wrapped in blanket or oversized sweater, contemplative moment, black and white photography, soft grain, visible emotion in posture, raw documentary style'
      },
      {
        id: 'against-the-wall',
        name: 'Against the Wall',
        category: 'Raw Moments',
        prompt: '[triggerword] woman leaning forehead against textured wall, eyes closed, hair falling naturally, wearing simple knit sweater, exhausted or overwhelmed posture, available light only, black and white intimate portrait, unguarded moment'
      },
      {
        id: 'morning-truth',
        name: 'Morning Truth',
        category: 'Raw Moments',
        prompt: '[triggerword] woman in bed looking directly at camera, no makeup, hair spread on pillow, white sheets, natural morning vulnerability, black and white photography, raw intimate portrait, honest beauty'
      },
      {
        id: 'mirror-reflection',
        name: 'Mirror Reflection',
        category: 'Journey Portraits',
        prompt: '[triggerword] woman looking at self in bathroom mirror, hands on sink, questioning expression, simple clothing, harsh bathroom light, black and white self-confrontation portrait, raw personal moment'
      },
      {
        id: 'window-watcher',
        name: 'Window Watcher',
        category: 'Journey Portraits',
        prompt: '[triggerword] woman by window looking out, coffee cup in hands, messy hair, oversized sweater, rain or city view outside, black and white melancholic portrait, waiting or hoping'
      },
      {
        id: 'walking-away',
        name: 'Walking Away',
        category: 'Transformation',
        prompt: '[triggerword] woman walking away from camera down hallway or street, purposeful stride, looking forward not back, simple outfit, black and white documentary, leaving the past behind'
      }
    ]
  },
  'studio-beauty': {
    id: 'studio-beauty',
    name: 'B&W Studio Beauty',
    description: 'High-fashion editorial portraits, studio beauty test shots',
    preview: SandraImages.portraits.professional[1],
    prompts: [
      {
        id: 'vogue-beauty-classic',
        name: 'Vogue Beauty Classic',
        category: 'Studio Beauty',
        prompt: '[triggerword] woman, hair in high messy bun with face-framing pieces, minimal makeup with glossy lips, bare shoulders, seamless gray backdrop, shot on Hasselblad X2D, single beauty dish lighting, black and white photography, visible skin texture and freckles, film grain, high fashion beauty portrait'
      },
      {
        id: 'harpers-intimate',
        name: "Harper's Intimate Portrait",
        category: 'Studio Beauty',
        prompt: '[triggerword] woman, tousled hair falling naturally, looking over bare shoulder, minimal jewelry, neutral backdrop, shot on Canon 5DS R, soft window light from left, black and white editorial, natural skin with visible pores, medium format aesthetic'
      },
      {
        id: 'window-shadow-play',
        name: 'Window Shadow Play',
        category: 'Dramatic Lighting',
        prompt: '[triggerword] woman, dramatic window blinds creating shadow stripes across face and body, eyes closed in serene expression, black slip dress, shot on Leica M11 Monochrom, natural harsh light, high contrast black and white, visible skin detail in light strips'
      },
      {
        id: 'hair-toss-energy',
        name: 'Hair Toss Energy',
        category: 'Natural Movement',
        prompt: '[triggerword] woman, mid hair flip movement, natural motion blur in hair, black tank top, genuine expression, shot on Nikon Z9, studio strobe to freeze motion, black and white action portrait, authentic moment captured'
      },
      {
        id: 'chair-authority',
        name: 'Chair Authority',
        category: 'Editorial Power',
        prompt: '[triggerword] woman sitting backwards on chair, arms resting on chair back, black outfit, direct powerful gaze, shot on Phase One, dramatic studio lighting, black and white power portrait, strong presence, editorial fashion'
      },
      {
        id: 'freckles-texture',
        name: 'Freckles and Texture',
        category: 'Beauty Close-ups',
        prompt: '[triggerword] woman, extreme close-up beauty shot, natural freckles visible, glossy lips slightly parted, messy bun with loose strands, shot on Phase One with 120mm macro, ring light, black and white beauty portrait, every pore visible'
      }
    ]
  }
};

// Sandra AI Chat Messages
interface ChatMessage {
  role: 'user' | 'sandra';
  content: string;
  prompt?: string;
  timestamp: string;
}

export default function AIPhotoshootPage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<any>(null);
  const [generatingImages, setGeneratingImages] = useState(false);
  const [sandraMessages, setSandraMessages] = useState<ChatMessage[]>([
    {
      role: 'sandra',
      content: `Hey gorgeous! I'm Sandra, your AI photographer and style consultant.

I specialize in creating editorial shots where you're living your best life - think dreamy lifestyle vibes, luxury settings, and natural poses that look effortlessly expensive.

What kind of mood are you going for today?`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [sandraInput, setSandraInput] = useState('');
  const [sandraGenerating, setSandraGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  // Fetch user model for trigger word
  const { data: userModel } = useQuery({
    queryKey: ['/api/user-model'],
    enabled: isAuthenticated
  });

  // Using direct fetch pattern from working sandra-photoshoot page instead of mutation

  // Sandra AI chat
  const sendSandraMessage = useCallback(async () => {
    if (!sandraInput.trim()) return;
    
    const userMessage = sandraInput.trim();
    setSandraInput('');
    setSandraGenerating(true);
    
    // Add user message
    setSandraMessages(prev => [...prev, { 
      role: 'user', 
      content: userMessage,
      timestamp: new Date().toISOString()
    }]);

    try {
      const response = await apiRequest('POST', '/api/sandra-ai-chat', {
        message: userMessage
      });

      // Add Sandra's response
      setSandraMessages(prev => [...prev, { 
        role: 'sandra', 
        content: response.message,
        prompt: response.generatedPrompt,
        timestamp: new Date().toISOString()
      }]);

    } catch (error) {
      console.error('Sandra chat error:', error);
      setSandraMessages(prev => [...prev, { 
        role: 'sandra', 
        content: "Oops! I'm having a moment. Try describing your vision again - I'm listening!",
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setSandraGenerating(false);
    }
  }, [sandraInput]);

  // Generate from built-in prompt using working sandra-photoshoot pattern
  const generateFromPrompt = useCallback(async (prompt: any) => {
    setSelectedPrompt(prompt);
    setGeneratingImages(true);
    setGenerationProgress(0);
    
    // Progress simulation for user feedback
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 8;
      });
    }, 1000);
    
    try {
      // Use same pattern as working sandra-photoshoot page
      const response = await fetch('/api/sandra-prompt-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.prompt.replace('[triggerword]', userModel?.triggerWord || 'subject'),
          userId: 'sandra_test_user_2025'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      clearInterval(progressInterval);
      setGenerationProgress(100);
      
      if (data.images && data.images.length > 0) {
        // Invalidate AI images cache to show new images
        queryClient.invalidateQueries({ queryKey: ['/api/ai-images'] });
        
        toast({
          title: "Images Generated!",
          description: `${data.images.length} new photos ready in your gallery`,
        });
      }
    } catch (error) {
      console.error('Error generating images:', error);
      clearInterval(progressInterval);
      toast({
        title: "Generation Failed",
        description: "Something went wrong with image generation",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setGeneratingImages(false);
        setGenerationProgress(0);
      }, 1000);
    }
  }, [userModel, queryClient, toast]);

  // Generate from Sandra's custom prompt using working pattern
  const generateFromSandraPrompt = useCallback(async (prompt: string) => {
    setSandraGenerating(true);
    
    try {
      // Use same working pattern from sandra-photoshoot
      const response = await fetch('/api/sandra-prompt-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.replace('[triggerword]', userModel?.triggerWord || 'subject'),
          userId: 'sandra_test_user_2025'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.images && data.images.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['/api/ai-images'] });
        
        toast({
          title: "Images Generated!",
          description: `${data.images.length} new photos ready`,
        });
      }
    } catch (error) {
      console.error('Error generating images:', error);
      toast({
        title: "Generation Failed",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setSandraGenerating(false);
    }
  }, [userModel, queryClient, toast]);

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
          <p style={{
            fontSize: '16px',
            lineHeight: 1.6,
            fontWeight: 300,
            maxWidth: '600px',
            margin: '0 auto 40px auto',
            color: '#666666'
          }}>
            You need to be signed in to access AI Photoshoot.
          </p>
          <a
            href="/api/login"
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
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontWeight: 300,
      color: '#0a0a0a'
    }}>
      <Navigation />
      
      {/* Generation Progress Bar */}
      {generatingImages && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          backgroundColor: '#f5f5f5',
          zIndex: 9999
        }}>
          <div 
            style={{
              height: '100%',
              backgroundColor: '#000000',
              width: `${generationProgress}%`,
              transition: 'width 0.3s ease'
            }}
          />
        </div>
      )}
      
      {/* Full Bleed Hero */}
      <div style={{
        width: '100vw',
        height: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        {/* Hero Content */}
        <div style={{
          maxWidth: '1200px',
          padding: '0 40px',
          textAlign: 'center',
          color: '#ffffff'
        }}>
          <h1 style={{
            fontFamily: 'Times New Roman, serif',
            fontSize: 'clamp(4rem, 8vw, 8rem)',
            fontWeight: 200,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            marginBottom: '32px',
            lineHeight: 0.9
          }}>
            AI Brand<br />Photoshoot
          </h1>
          <p style={{
            fontSize: 'clamp(18px, 2vw, 24px)',
            lineHeight: 1.4,
            fontWeight: 300,
            maxWidth: '800px',
            margin: '0 auto 48px auto',
            color: '#f5f5f5'
          }}>
            Professional brand photos using your trained AI model. Choose from built-in prompts or chat with Sandra AI for custom shots.
          </p>
          
          {/* Model Status */}
          {userModel?.trainingStatus === 'completed' ? (
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '16px 24px',
              fontSize: '14px',
              fontWeight: 400,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '32px'
            }}>
              ✓ AI Model Ready: {userModel.triggerWord}
            </div>
          ) : (
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '16px 24px',
              fontSize: '14px',
              fontWeight: 400,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '32px',
              color: '#f5f5f5'
            }}>
              Complete AI training first to start generating
            </div>
          )}
        </div>
        
        {/* Scroll indicator */}
        <div style={{
          position: 'absolute',
          bottom: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: '#ffffff',
          fontSize: '11px',
          fontWeight: 400,
          letterSpacing: '0.3em',
          textTransform: 'uppercase'
        }}>
          Scroll to start
        </div>
      </div>

      {/* Photoshoot Interface */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '80px 40px'
      }}>
        <Tabs defaultValue="built-in-prompts" style={{ width: '100%' }}>
          <TabsList style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '60px',
            background: 'transparent',
            border: 'none'
          }}>
            <TabsTrigger 
              value="built-in-prompts"
              style={{
                padding: '16px 32px',
                fontSize: '11px',
                fontWeight: 400,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                border: '1px solid #0a0a0a',
                background: 'transparent',
                color: '#0a0a0a',
                marginRight: '16px',
                transition: 'all 300ms ease'
              }}
            >
              Built-in Prompts
            </TabsTrigger>
            <TabsTrigger 
              value="sandra-chat"
              style={{
                padding: '16px 32px',
                fontSize: '11px',
                fontWeight: 400,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                border: '1px solid #0a0a0a',
                background: 'transparent',
                color: '#0a0a0a',
                transition: 'all 300ms ease'
              }}
            >
              Sandra AI Chat
            </TabsTrigger>
          </TabsList>

          {/* Built-in Prompts Tab */}
          <TabsContent value="built-in-prompts">
            {!selectedCollection ? (
              <div>
                <h2 style={{
                  fontFamily: 'Times New Roman, serif',
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
                  fontWeight: 200,
                  letterSpacing: '-0.01em',
                  textAlign: 'center',
                  marginBottom: '60px',
                  lineHeight: 1.2
                }}>
                  Choose Your Aesthetic
                </h2>
                
                {/* Collection Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '24px',
                  marginBottom: '60px'
                }}>
                  {Object.values(PROMPT_COLLECTIONS).map((collection) => (
                    <div
                      key={collection.id}
                      onClick={() => setSelectedCollection(collection.id)}
                      style={{
                        background: '#f5f5f5',
                        aspectRatio: '4/5',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'all 300ms ease',
                        overflow: 'hidden'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      {/* Collection Image */}
                      <img
                        src={collection.preview}
                        alt={collection.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                      
                      {/* Collection Info Overlay */}
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                        padding: '40px 24px 24px 24px',
                        color: '#ffffff'
                      }}>
                        <h3 style={{
                          fontFamily: 'Times New Roman, serif',
                          fontSize: '24px',
                          fontWeight: 400,
                          marginBottom: '8px',
                          lineHeight: 1.2
                        }}>
                          {collection.name}
                        </h3>
                        <p style={{
                          fontSize: '14px',
                          fontWeight: 300,
                          opacity: 0.9,
                          lineHeight: 1.4
                        }}>
                          {collection.description}
                        </p>
                        <div style={{
                          fontSize: '11px',
                          fontWeight: 400,
                          letterSpacing: '0.2em',
                          textTransform: 'uppercase',
                          marginTop: '12px',
                          opacity: 0.8
                        }}>
                          {collection.prompts.length} prompts
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                {/* Back Button */}
                <button
                  onClick={() => setSelectedCollection(null)}
                  style={{
                    padding: '12px 24px',
                    fontSize: '11px',
                    fontWeight: 400,
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    border: '1px solid #0a0a0a',
                    background: 'transparent',
                    color: '#0a0a0a',
                    marginBottom: '40px',
                    cursor: 'pointer',
                    transition: 'all 300ms ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#0a0a0a';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#0a0a0a';
                  }}
                >
                  ← Back to Collections
                </button>

                {/* Collection Header */}
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                  <h2 style={{
                    fontFamily: 'Times New Roman, serif',
                    fontSize: 'clamp(2rem, 4vw, 3rem)',
                    fontWeight: 200,
                    letterSpacing: '-0.01em',
                    marginBottom: '16px',
                    lineHeight: 1.2
                  }}>
                    {PROMPT_COLLECTIONS[selectedCollection]?.name}
                  </h2>
                  <p style={{
                    fontSize: '16px',
                    fontWeight: 300,
                    color: '#666666',
                    maxWidth: '600px',
                    margin: '0 auto'
                  }}>
                    {PROMPT_COLLECTIONS[selectedCollection]?.description}
                  </p>
                </div>

                {/* Prompts Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '24px'
                }}>
                  {PROMPT_COLLECTIONS[selectedCollection]?.prompts.map((prompt) => (
                    <div
                      key={prompt.id}
                      style={{
                        border: '1px solid #e5e5e5',
                        padding: '24px',
                        background: '#ffffff',
                        transition: 'all 300ms ease',
                        cursor: userModel?.trainingStatus === 'completed' ? 'pointer' : 'default',
                        opacity: userModel?.trainingStatus === 'completed' ? 1 : 0.6
                      }}
                      onMouseEnter={(e) => {
                        if (userModel?.trainingStatus === 'completed') {
                          e.currentTarget.style.borderColor = '#0a0a0a';
                          e.currentTarget.style.transform = 'translateY(-4px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e5e5e5';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                      onClick={() => {
                        if (userModel?.trainingStatus === 'completed') {
                          generateFromPrompt(prompt);
                        }
                      }}
                    >
                      <div style={{
                        fontSize: '11px',
                        fontWeight: 400,
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        color: '#666666',
                        marginBottom: '8px'
                      }}>
                        {prompt.category}
                      </div>
                      <h3 style={{
                        fontFamily: 'Times New Roman, serif',
                        fontSize: '20px',
                        fontWeight: 400,
                        marginBottom: '12px',
                        lineHeight: 1.2
                      }}>
                        {prompt.name}
                      </h3>
                      <p style={{
                        fontSize: '14px',
                        fontWeight: 300,
                        lineHeight: 1.5,
                        color: '#666666',
                        marginBottom: '16px'
                      }}>
                        {prompt.prompt.replace('[triggerword]', userModel?.triggerWord || 'subject').slice(0, 120)}...
                      </p>
                      
                      {userModel?.trainingStatus === 'completed' ? (
                        <div style={{
                          fontSize: '11px',
                          fontWeight: 400,
                          letterSpacing: '0.3em',
                          textTransform: 'uppercase',
                          color: '#0a0a0a'
                        }}>
                          {generatingImages && selectedPrompt?.id === prompt.id ? 'Generating...' : 'Generate Photos'}
                        </div>
                      ) : (
                        <div style={{
                          fontSize: '11px',
                          fontWeight: 400,
                          letterSpacing: '0.3em',
                          textTransform: 'uppercase',
                          color: '#999999'
                        }}>
                          Complete AI Training First
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Sandra AI Chat Tab */}
          <TabsContent value="sandra-chat">
            <div style={{
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              <h2 style={{
                fontFamily: 'Times New Roman, serif',
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 200,
                letterSpacing: '-0.01em',
                textAlign: 'center',
                marginBottom: '60px',
                lineHeight: 1.2
              }}>
                Chat with Sandra AI
              </h2>

              {/* Chat Messages */}
              <div style={{
                background: '#f5f5f5',
                padding: '32px',
                marginBottom: '32px',
                maxHeight: '500px',
                overflowY: 'auto'
              }}>
                {sandraMessages.map((message, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: '24px',
                      textAlign: message.role === 'user' ? 'right' : 'left'
                    }}
                  >
                    <div style={{
                      display: 'inline-block',
                      maxWidth: '80%',
                      padding: '16px 20px',
                      background: message.role === 'user' ? '#0a0a0a' : '#ffffff',
                      color: message.role === 'user' ? '#ffffff' : '#0a0a0a',
                      fontSize: '14px',
                      lineHeight: 1.5,
                      fontWeight: 300
                    }}>
                      <div style={{ marginBottom: message.prompt ? '12px' : '0' }}>
                        {message.content}
                      </div>
                      
                      {message.prompt && userModel?.trainingStatus === 'completed' && (
                        <button
                          onClick={() => generateFromSandraPrompt(message.prompt!)}
                          disabled={sandraGenerating}
                          style={{
                            padding: '8px 16px',
                            fontSize: '11px',
                            fontWeight: 400,
                            letterSpacing: '0.3em',
                            textTransform: 'uppercase',
                            border: '1px solid #0a0a0a',
                            background: '#0a0a0a',
                            color: '#ffffff',
                            cursor: 'pointer',
                            transition: 'all 300ms ease'
                          }}
                        >
                          {sandraGenerating ? 'Generating...' : 'Generate Now'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div style={{
                display: 'flex',
                gap: '16px'
              }}>
                <input
                  type="text"
                  value={sandraInput}
                  onChange={(e) => setSandraInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendSandraMessage()}
                  placeholder="Describe your vision to Sandra..."
                  disabled={sandraGenerating}
                  style={{
                    flex: 1,
                    padding: '16px 20px',
                    fontSize: '14px',
                    fontWeight: 300,
                    border: '1px solid #e5e5e5',
                    background: '#ffffff',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={sendSandraMessage}
                  disabled={sandraGenerating || !sandraInput.trim()}
                  style={{
                    padding: '16px 32px',
                    fontSize: '11px',
                    fontWeight: 400,
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    border: '1px solid #0a0a0a',
                    background: '#0a0a0a',
                    color: '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 300ms ease',
                    opacity: sandraGenerating || !sandraInput.trim() ? 0.5 : 1
                  }}
                >
                  {sandraGenerating ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}