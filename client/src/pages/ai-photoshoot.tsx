import React, { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Navigation } from '@/components/navigation';
import { HeroFullBleed } from '@/components/hero-full-bleed';
import { SandraImages } from '@/lib/sandra-images';

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
        description: "Perfect for when you need that emotional release moment. Think ocean waves, arms stretched toward the sky, letting everything go.",
        prompt: '[triggerword] woman standing at ocean edge, arms raised to sky in release, waves washing over feet, wearing flowing earth-toned top and cream pants, overcast moody sky, muted color palette, emotional liberation moment, healing journey photography'
      },
      {
        id: 'sunset-contemplation',
        name: 'Sunset Contemplation',
        category: 'Ocean Healing',
        description: "That golden hour magic where you're just... peaceful. Beach vibes, flowing dress, looking toward your future.",
        prompt: '[triggerword] woman sitting on beach at golden hour, off-shoulder white dress, looking at horizon, hair flowing in ocean breeze, warm sunset glow on skin, peaceful expression, mindfulness moment, coastal healing aesthetic'
      },
      {
        id: 'wave-surrender',
        name: 'Wave Surrender',
        category: 'Ocean Healing',
        description: "The ultimate letting go shot. You're in the waves, dress flowing, completely surrendering to the healing power of water.",
        prompt: '[triggerword] woman in ocean waves, white flowing dress getting wet, arms spread in surrender, hair wild with salt water, sunset backlighting, letting go moment, therapeutic ocean photography, healing journey'
      },
      {
        id: 'beach-meditation',
        name: 'Beach Meditation',
        category: 'Ocean Healing',
        description: "Peaceful meditation by the ocean. Lotus pose, waves in background, that zen moment where everything feels aligned.",
        prompt: '[triggerword] woman in lotus pose on sand, black outfit, eyes closed in meditation, ocean waves in background, golden hour side lighting, serene expression, mindfulness practice, beach yoga aesthetic'
      },
      {
        id: 'candlelit-meditation',
        name: 'Candlelit Meditation',
        category: 'Inner Peace',
        description: "Sacred space vibes. Surrounded by candlelight, finding your center in the most beautiful healing sanctuary.",
        prompt: '[triggerword] woman in meditation pose, black tank and leggings, surrounded by candles, indoor zen space, warm candlelight glow on face, eyes closed in peace, healing sanctuary, mindfulness photography'
      },
      {
        id: 'morning-ritual',
        name: 'Morning Ritual',
        category: 'Inner Peace',
        description: "That quiet morning moment with tea and intention. Window light, plants, just you starting your day mindfully.",
        prompt: '[triggerword] woman in morning meditation, sitting by window with natural light, holding warm tea, peaceful expression, plants visible, cozy healing space, daily mindfulness practice, wellness lifestyle'
      },
      {
        id: 'forest-grounding',
        name: 'Forest Grounding',
        category: 'Nature Connection',
        description: "Connecting with Mother Earth. Standing among trees, touching bark, grounding yourself in nature's healing energy.",
        prompt: '[triggerword] woman standing among trees, touching tree trunk, earthing practice, natural clothing, dappled forest light, connection with nature, grounding energy, forest therapy moment'
      },
      {
        id: 'yoga-flow',
        name: 'Yoga Flow',
        category: 'Movement Medicine',
        description: "Movement as medicine. Captured mid-flow, showing your strength and grace through mindful movement.",
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
        description: "That expensive girl energy. You're stepping out of a cute Parisian café with your morning coffee, looking effortlessly chic.",
        prompt: '[triggerword] woman stepping out of Parisian cafe holding coffee cup, oversized black blazer over mini dress, Prada bag, morning sunlight on cobblestone street, natural stride, other cafe patrons blurred in background, iPhone street photography aesthetic, film grain, candid lifestyle moment'
      },
      {
        id: 'milan-coffee-walk',
        name: 'Milan Coffee Walk',
        category: 'Morning Coffee Runs',
        description: "Italian elegance meets street style. Walking with your espresso like the sophisticated woman you are.",
        prompt: '[triggerword] woman walking with espresso cup, black cropped tank, high-waisted cream trousers, small Bottega Veneta bag, Italian architecture behind, adjusting sunglasses with free hand, natural morning light, street style candid, film photography mood'
      },
      {
        id: 'avenue-montaigne-stroll',
        name: 'Avenue Montaigne Stroll',
        category: 'Luxury Shopping',
        description: "Walking past Dior like you belong there. Pure luxury shopping vibes with that confident stride.",
        prompt: '[triggerword] woman walking past Dior boutique, black strapless top, white wide-leg pants, Hermès Kelly bag, mid-stride confident walk, Parisian Haussmann architecture, natural daylight, street style photography, film aesthetic, movement captured'
      },
      {
        id: 'stone-building-lean',
        name: 'Stone Building Lean',
        category: 'Architectural Backgrounds',
        description: "That effortless pose against beautiful European architecture. Looking away thoughtfully, totally at ease.",
        prompt: '[triggerword] woman leaning against limestone building, black tube top, vintage denim, small chain bag, one hand in pocket, looking away from camera, European architectural details, natural shadows on face, street style portrait, film photography'
      },
      {
        id: 'zebra-crossing-power',
        name: 'Zebra Crossing Power',
        category: 'Street Crossing',
        description: "Abbey Road vibes but make it fashion. Confident stride across the street, blazer flowing, pure power move.",
        prompt: '[triggerword] woman mid-stride on crosswalk, black bodysuit, oversized blazer flowing, small bag across body, city traffic blurred behind, confident walk, natural daylight, street photography style, movement captured, film aesthetic'
      },
      {
        id: 'golden-hour-walk',
        name: 'Golden Hour Walk',
        category: 'Evening Transitions',
        description: "That magic hour when everything glows. Evening walk in your slip dress, golden light making you look ethereal.",
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
        description: "Beautiful silhouette by the window. Contemplative, powerful, showing your grace even in quiet moments.",
        prompt: '[triggerword] woman profile silhouette against bright window, hair up showing neck curve, wrapped in blanket or oversized sweater, contemplative moment, black and white photography, soft grain, visible emotion in posture, raw documentary style'
      },
      {
        id: 'against-the-wall',
        name: 'Against the Wall',
        category: 'Raw Moments',
        description: "Those overwhelming moments we all have. Forehead against the wall, real emotion, completely authentic.",
        prompt: '[triggerword] woman leaning forehead against textured wall, eyes closed, hair falling naturally, wearing simple knit sweater, exhausted or overwhelmed posture, available light only, black and white intimate portrait, unguarded moment'
      },
      {
        id: 'morning-truth',
        name: 'Morning Truth',
        category: 'Raw Moments',
        description: "Honest morning beauty. No makeup, real hair, looking directly at the camera with complete authenticity.",
        prompt: '[triggerword] woman in bed looking directly at camera, no makeup, hair spread on pillow, white sheets, natural morning vulnerability, black and white photography, raw intimate portrait, honest beauty'
      },
      {
        id: 'mirror-reflection',
        name: 'Mirror Reflection',
        category: 'Journey Portraits',
        description: "That moment of self-reflection. Looking at yourself in the mirror, questioning, growing, becoming.",
        prompt: '[triggerword] woman looking at self in bathroom mirror, hands on sink, questioning expression, simple clothing, harsh bathroom light, black and white self-confrontation portrait, raw personal moment'
      },
      {
        id: 'window-watcher',
        name: 'Window Watcher',
        category: 'Journey Portraits',
        description: "Contemplating life by the window. Coffee in hand, looking toward your future with hope and possibility.",
        prompt: '[triggerword] woman by window looking out, coffee cup in hands, messy hair, oversized sweater, rain or city view outside, black and white melancholic portrait, waiting or hoping'
      },
      {
        id: 'walking-away',
        name: 'Walking Away',
        category: 'Transformation',
        description: "Powerful transformation shot. Walking away from what was, toward what's next. No looking back.",
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
        description: "Pure editorial magic. Think Vogue beauty pages - clean, stunning, that perfect messy bun situation.",
        prompt: '[triggerword] woman, hair in high messy bun with face-framing pieces, minimal makeup with glossy lips, bare shoulders, seamless gray backdrop, shot on Hasselblad X2D, single beauty dish lighting, black and white photography, visible skin texture and freckles, film grain, high fashion beauty portrait'
      },
      {
        id: 'harpers-intimate',
        name: "Harper's Intimate Portrait",
        category: 'Studio Beauty',
        description: "Intimate Harper's Bazaar vibes. Looking over your shoulder, tousled hair, that effortless editorial beauty.",
        prompt: '[triggerword] woman, tousled hair falling naturally, looking over bare shoulder, minimal jewelry, neutral backdrop, shot on Canon 5DS R, soft window light from left, black and white editorial, natural skin with visible pores, medium format aesthetic'
      },
      {
        id: 'window-shadow-play',
        name: 'Window Shadow Play',
        category: 'Dramatic Lighting',
        description: "Dramatic light and shadow. Window blinds creating beautiful stripes across your face - pure artistic magic.",
        prompt: '[triggerword] woman, dramatic window blinds creating shadow stripes across face and body, eyes closed in serene expression, black slip dress, shot on Leica M11 Monochrom, natural harsh light, high contrast black and white, visible skin detail in light strips'
      },
      {
        id: 'hair-toss-energy',
        name: 'Hair Toss Energy',
        category: 'Natural Movement',
        description: "That perfect hair flip moment. Natural movement, genuine expression, pure energy captured.",
        prompt: '[triggerword] woman, mid hair flip movement, natural motion blur in hair, black tank top, genuine expression, shot on Nikon Z9, studio strobe to freeze motion, black and white action portrait, authentic moment captured'
      },
      {
        id: 'chair-authority',
        name: 'Chair Authority',
        category: 'Editorial Power',
        description: "Boss lady energy. Sitting backwards on a chair with that direct, powerful gaze that says you mean business.",
        prompt: '[triggerword] woman sitting backwards on chair, arms resting on chair back, black outfit, direct powerful gaze, shot on Phase One, dramatic studio lighting, black and white power portrait, strong presence, editorial fashion'
      },
      {
        id: 'freckles-texture',
        name: 'Freckles and Texture',
        category: 'Beauty Close-ups',
        description: "Extreme close-up beauty. Every freckle, every pore, natural texture - celebrating real, unfiltered beauty.",
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
  const [generationProgress, setGenerationProgress] = useState(0);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [fullSizeImage, setFullSizeImage] = useState<string | null>(null);

  const saveToGallery = async (imageUrl: string) => {
    try {
      // Use the working save-selected-images endpoint that doesn't require authentication
      const response = await fetch('/api/save-selected-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrls: [imageUrl],
          prompt: 'From AI Photoshoot'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save image');
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/ai-images'] });
      
      toast({
        title: "Image Saved",
        description: "Image added to your gallery",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Could not save image to gallery",
        variant: "destructive",
      });
    }
  };

  // Fetch user model for trigger word
  const { data: userModel } = useQuery({
    queryKey: ['/api/user-model'],
    enabled: isAuthenticated
  });

  // Using direct fetch pattern from working sandra-photoshoot page instead of mutation



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
      const response = await fetch('/api/generate-images', {
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
        setSelectedImages(data.images);
        
        // Invalidate AI images cache to show new images
        queryClient.invalidateQueries({ queryKey: ['/api/ai-images'] });
        
        toast({
          title: "Images Generated!",
          description: `${data.images.length} new photos ready for preview`,
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
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Generation Progress Bar */}
      {generatingImages && (
        <div className="fixed top-0 left-0 right-0 h-0.5 bg-gray-100 z-50">
          <div 
            className="h-full bg-black transition-all duration-300 ease-out"
            style={{ width: `${generationProgress}%` }}
          />
        </div>
      )}
      
      {/* Hero Section */}
      <HeroFullBleed
        backgroundImage={SandraImages.editorial.laptop1}
        tagline="Your AI photographer is ready"
        title="AI BRAND PHOTOSHOOT"
        subtitle={userModel?.trainingStatus === 'completed' ? "YOUR MODEL IS TRAINED" : "COMPLETE TRAINING FIRST"}
        ctaText="Start Creating"
        ctaLink="#collections"
      />

      {/* Photoshoot Interface */}
      <div id="collections" className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h2 className="font-times text-[clamp(2rem,4vw,3rem)] font-light tracking-wide uppercase mb-6">
            Choose Your Vibe
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            I've curated these gorgeous collections for different moods. Pick what feels right for you today.
          </p>
        </div>

        {!selectedCollection ? (
          <div>
            {/* Collection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.values(PROMPT_COLLECTIONS).map((collection) => (
                <div
                  key={collection.id}
                  onClick={() => setSelectedCollection(collection.id)}
                  className="bg-gray-50 aspect-[4/5] relative cursor-pointer transition-all duration-300 overflow-hidden hover:scale-[1.02]"
                >
                  {/* Collection Image */}
                  <img
                    src={collection.preview}
                    alt={collection.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Collection Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                    <h3 className="font-times text-xl font-normal mb-2">
                      {collection.name}
                    </h3>
                    <p className="text-sm opacity-90 mb-3 leading-relaxed">
                      {collection.description}
                    </p>
                    <div className="text-xs uppercase tracking-wider opacity-80">
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
              className="px-6 py-3 text-xs uppercase tracking-wide border border-black bg-transparent text-black mb-10 cursor-pointer transition-all duration-300 hover:bg-black hover:text-white"
            >
              ← Back to Collections
            </button>

            {/* Collection Header */}
            <div className="text-center mb-16">
              <h2 className="font-times text-[clamp(2rem,4vw,3rem)] font-light tracking-wide mb-4">
                {PROMPT_COLLECTIONS[selectedCollection]?.name}
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {PROMPT_COLLECTIONS[selectedCollection]?.description}
              </p>
            </div>

            {/* Prompts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PROMPT_COLLECTIONS[selectedCollection]?.prompts.map((prompt) => (
                <div
                  key={prompt.id}
                  className={`border border-gray-200 p-6 bg-white transition-all duration-300 ${
                    userModel?.trainingStatus === 'completed' 
                      ? 'cursor-pointer hover:border-black hover:-translate-y-1' 
                      : 'opacity-60 cursor-default'
                  }`}
                  onClick={() => {
                    if (userModel?.trainingStatus === 'completed') {
                      generateFromPrompt(prompt);
                    }
                  }}
                >
                  <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">
                    {prompt.category}
                  </div>
                  <h3 className="font-times text-xl font-normal mb-3">
                    {prompt.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    {prompt.description}
                  </p>
                  
                  {userModel?.trainingStatus === 'completed' ? (
                    <div className="text-xs uppercase tracking-wide text-black">
                      {generatingImages && selectedPrompt?.id === prompt.id ? 'Generating...' : 'Generate Photos'}
                    </div>
                  ) : (
                    <div className="text-xs uppercase tracking-wide text-gray-400">
                      Complete AI Training First
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generated Images - Lookbook Style */}
        {selectedImages.length > 0 && (
          <div className="mt-12 sm:mt-16">
            <div className="text-center mb-8 sm:mb-12">
              <h3 className="font-times text-[clamp(1.5rem,5vw,4rem)] font-light tracking-[-0.01em] mb-4">
                Your Story, Captured
              </h3>
              <p className="text-xs sm:text-sm font-light tracking-[0.15em] sm:tracking-[0.2em] uppercase text-[#666666]">
                {selectedImages.length} Images from this session
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
              {selectedImages.map((imageUrl, index) => (
                <div key={index} className="group">
                  <div className="aspect-[4/5] overflow-hidden bg-[#f8f8f8] relative mb-3 sm:mb-4">
                    <img
                      src={imageUrl}
                      alt={`Your story ${index + 1}`}
                      className="w-full h-full object-cover cursor-pointer transition-all duration-500 group-hover:scale-105 touch-manipulation"
                      onClick={() => setFullSizeImage(imageUrl)}
                    />
                    {/* Minimal overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] uppercase font-light text-[#666666] mb-1 sm:mb-2">
                      Image {index + 1}
                    </div>
                    <div className="flex justify-center gap-2 sm:gap-3">
                      <button
                        onClick={() => setFullSizeImage(imageUrl)}
                        className="text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] uppercase font-light text-black hover:text-[#666666] transition-colors touch-manipulation"
                      >
                        View
                      </button>
                      <span className="text-[#e0e0e0] text-xs">•</span>
                      <button
                        onClick={() => saveToGallery(imageUrl)}
                        className="text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] uppercase font-light text-black hover:text-[#666666] transition-colors touch-manipulation"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Full Size Image Modal */}
        {fullSizeImage && (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-2 sm:p-4" onClick={() => setFullSizeImage(null)}>
            <div className="relative max-w-full max-h-full">
              <img
                src={fullSizeImage}
                alt="Full size photo"
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <button
                  onClick={() => saveToGallery(fullSizeImage)}
                  className="px-3 sm:px-4 py-2 bg-white text-black font-light hover:bg-[#f0f0f0] transition-colors text-xs sm:text-sm touch-manipulation"
                >
                  Save to Gallery
                </button>
                <a
                  href={fullSizeImage}
                  download={`ai-photoshoot-${Date.now()}.jpg`}
                  className="px-3 sm:px-4 py-2 bg-[#0a0a0a] text-white font-light hover:bg-[#333333] transition-colors inline-block text-xs sm:text-sm touch-manipulation text-center"
                >
                  Download
                </a>
                <button
                  onClick={() => setFullSizeImage(null)}
                  className="px-3 sm:px-4 py-2 bg-[#666666] text-white font-light hover:bg-[#888888] transition-colors text-xs sm:text-sm touch-manipulation"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}