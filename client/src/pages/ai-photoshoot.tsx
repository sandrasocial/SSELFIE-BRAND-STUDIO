import React, { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { WorkspaceNavigation } from '@/components/workspace-navigation';
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
        prompt: '[triggerword] woman standing at ocean edge, voluminous hair flowing with natural body and movement, arms raised to sky in release, waves washing over feet, wearing flowing linen button-down shirt and wide-leg cream trousers, overcast moody sky, muted color palette, emotional liberation moment, shot on Hasselblad X2D 100C with 90mm lens, natural ocean lighting with dramatic sky, healing journey photography, heavy 35mm film grain, matte skin finish, authentic skin texture with visible pores, pronounced grain structure, gentle skin smoothing while maintaining realistic texture, natural facial refinement, editorial skin enhancement'
      },
      {
        id: 'sunset-contemplation',
        name: 'Sunset Contemplation',
        category: 'Ocean Healing',
        description: "That golden hour magic where you're just... peaceful. Beach vibes, flowing dress, looking toward your future.",
        prompt: '[triggerword] woman sitting on beach at golden hour, voluminous hair flowing beautifully in ocean breeze with natural body and movement, white linen midi dress with subtle texture, looking at horizon, warm sunset glow on skin, peaceful expression, mindfulness moment, shot on Canon EOS R5 with 85mm f/1.2L lens, dramatic golden hour backlighting, coastal healing aesthetic, heavy 35mm film grain, matte complexion, authentic grain pattern, gentle skin smoothing while maintaining realistic texture, natural facial refinement, editorial skin enhancement'
      },
      {
        id: 'wave-surrender',
        name: 'Wave Surrender',
        category: 'Ocean Healing',
        description: "The ultimate letting go shot. You're in the waves, dress flowing, completely surrendering to the healing power of water.",
        prompt: '[triggerword] woman in ocean waves, voluminous hair wild with salt water showing natural body and movement, white silk slip dress getting wet, arms spread in surrender, sunset backlighting, letting go moment, shot on Leica SL2 with 90mm APO-Summicron lens, dramatic sunset ocean lighting, therapeutic ocean photography, healing journey, heavy 35mm film grain, raw film negative quality, visible grain structure, gentle skin smoothing while maintaining realistic texture, natural facial refinement, editorial skin enhancement'
      },
      {
        id: 'beach-meditation',
        name: 'Beach Meditation',
        category: 'Ocean Healing',
        description: "Peaceful meditation by the ocean. Lotus pose, waves in background, that zen moment where everything feels aligned.",
        prompt: '[triggerword] woman in lotus pose on sand, voluminous hair with natural body and movement, black ribbed bodysuit or fitted long-sleeve top, eyes closed in meditation, ocean waves in background, golden hour side lighting, serene expression, mindfulness practice, shot on Nikon Z9 with 50mm f/1.2S lens, soft golden hour lighting, beach yoga aesthetic, heavy 35mm film grain, Kodak Portra 400 film aesthetic, matte complexion, gentle skin smoothing while maintaining realistic texture, natural facial refinement, editorial skin enhancement'
      },
      {
        id: 'candlelit-meditation',
        name: 'Candlelit Meditation',
        category: 'Inner Peace',
        description: "Sacred space vibes. Surrounded by candlelight, finding your center in the most beautiful healing sanctuary.",
        prompt: '[triggerword] woman in meditation pose, voluminous hair with natural body and movement, black ribbed bodysuit or fitted long-sleeve top, surrounded by candles, indoor zen space, warm candlelight glow on face, eyes closed in peace, healing sanctuary, shot on Sony A7R V with 85mm f/1.4 GM lens, intimate candlelight illumination, mindfulness photography, heavy 35mm film grain, analog film photography aesthetic, natural skin imperfections, gentle skin smoothing while maintaining realistic texture, natural facial refinement, editorial skin enhancement'
      },
      {
        id: 'morning-ritual',
        name: 'Morning Ritual',
        category: 'Inner Peace',
        description: "That quiet morning moment with tea and intention. Window light, plants, just you starting your day mindfully.",
        prompt: '[triggerword] woman in morning meditation, voluminous hair with natural body and movement, sitting by window with natural light, holding warm tea, peaceful expression, plants visible, cozy healing space, daily mindfulness practice, shot on Fujifilm GFX100S with 110mm f/2 lens, soft morning window lighting, wellness lifestyle, heavy 35mm film grain, pronounced texture, authentic grain pattern, gentle skin smoothing while maintaining realistic texture, natural facial refinement, editorial skin enhancement'
      },
      {
        id: 'forest-grounding',
        name: 'Forest Grounding',
        category: 'Nature Connection',
        description: "Connecting with Mother Earth. Standing among trees, touching bark, grounding yourself in nature's healing energy.",
        prompt: '[triggerword] woman standing among trees, voluminous hair with natural body and movement, touching tree trunk, earthing practice, wearing linen button-down shirt and wide-leg trousers in earth tones, dappled forest light, connection with nature, grounding energy, shot on Leica Q2 with 28mm f/1.7 lens, natural forest lighting with dappled shadows, forest therapy moment, heavy 35mm film grain, film negative quality, visible grain structure, gentle skin smoothing while maintaining realistic texture, natural facial refinement, editorial skin enhancement'
      },
      {
        id: 'yoga-flow',
        name: 'Yoga Flow',
        category: 'Movement Medicine',
        description: "Movement as medicine. Captured mid-flow, showing your strength and grace through mindful movement.",
        prompt: '[triggerword] woman in yoga pose, voluminous hair with natural body and movement, flowing movement captured, natural light studio, black ribbed bodysuit or fitted athletic wear, graceful strength, moving meditation, healing through movement, shot on Canon R6 Mark II with 35mm f/1.8 lens, soft natural studio lighting, wellness photography, heavy 35mm film grain, matte skin finish, authentic texture with visible pores, gentle skin smoothing while maintaining realistic texture, natural facial refinement, editorial skin enhancement'
      }
    ]
  },
  'effortless-chic': {
    id: 'effortless-chic',
    name: 'Effortless Chic',
    description: 'Lazy Sunday vibes that still look incredibly expensive. Milan street style meets cozy luxury.',
    preview: SandraImages.portraits.professional[1],
    prompts: [
      {
        id: 'oversized-sweater-luxury',
        name: 'Oversized Cashmere Dreams',
        category: 'Lazy Sunday Luxury',
        description: "That perfect lazy Sunday look - oversized cashmere sweater, messy hair, but you still look like you stepped out of a magazine.",
        prompt: '[triggerword] woman in oversized cream cashmere sweater, hair perfectly imperfect with lived-in texture, minimal makeup with dewy skin, sitting in luxury apartment with natural light, designer jeans or leggings, bare feet on marble floor, shot on Hasselblad X2D 100C with 90mm lens, soft morning window lighting, cozy luxury aesthetic, heavy 35mm film grain, matte skin finish, authentic texture, effortless expensive styling, comfortable elegance'
      },
      {
        id: 'milan-coffee-run',
        name: 'Milan Coffee Run',
        category: 'European Street Style',
        description: "Model-off-duty vibes. Cropped blazer, straight-leg trousers, designer sneakers, and that effortless hair that looks expensive.",
        prompt: '[triggerword] woman walking with coffee cup, oversized beige blazer over white tank, high-waisted straight-leg trousers, designer white sneakers, messy bun with face-framing pieces, minimal gold jewelry, architectural European street backdrop, shot on Canon EOS R5 with 85mm f/1.2L lens, natural street lighting, model-off-duty energy, heavy 35mm film grain, pronounced texture, effortless luxury styling, expensive casual aesthetic'
      },
      {
        id: 'silk-slip-layering',
        name: 'Silk & Layers',
        category: 'Elevated Basics',
        description: "The art of expensive layering - silk slip dress over fitted long sleeve, perfect proportions, looks effortless but costs a fortune.",
        prompt: '[triggerword] woman in silk slip dress layered over fitted black long-sleeve top, hair in low bun with texture, delicate gold jewelry, sitting at marble cafe table, designer leather bag nearby, shot on Leica SL2 with 90mm APO-Summicron lens, soft natural lighting, elegant layering aesthetic, heavy 35mm film grain, raw film negative quality, luxury minimalist styling, sophisticated casual elegance'
      },
      {
        id: 'trench-coat-moment',
        name: 'Classic Trench Mastery',
        category: 'Timeless Luxury',
        description: "The perfect trench coat moment - oversized, perfectly styled, hair blowing in the wind, classic but never boring.",
        prompt: '[triggerword] woman in oversized beige trench coat, white t-shirt underneath, high-waisted dark jeans, hair flowing naturally in breeze, minimal makeup with fresh skin, standing on European street, shot on Nikon Z9 with 50mm f/1.2S lens, dramatic natural lighting, classic luxury styling, heavy 35mm film grain, Kodak Portra 400 film aesthetic, timeless elegance, expensive simplicity'
      },
      {
        id: 'knit-set-luxury',
        name: 'Matching Knit Perfection',
        category: 'Coordinated Luxury',
        description: "Matching knit set but make it expensive - perfectly fitted, beautiful texture, styled to perfection.",
        prompt: '[triggerword] woman in matching knit set (cropped cardigan and fitted skirt), hair in loose waves, gold accessories, sitting in designer chair with natural light, luxury home setting, shot on Sony A7R V with 85mm f/1.4 GM lens, soft window lighting, coordinated luxury aesthetic, heavy 35mm film grain, analog film photography, expensive knitwear styling, sophisticated comfort'
      },
      {
        id: 'denim-on-denim-elevated',
        name: 'Elevated Denim Story',
        category: 'Denim Done Right',
        description: "Double denim but make it editorial - different washes, perfect fits, accessories that elevate everything.",
        prompt: '[triggerword] woman in light wash oversized denim shirt over dark straight-leg jeans, hair in effortless waves, gold jewelry and designer belt, leaning against concrete wall, shot on Fujifilm GFX100S with 110mm f/2 lens, urban natural lighting, elevated denim styling, heavy 35mm film grain, pronounced texture, expensive casual aesthetic, editorial street style'
      },
      {
        id: 'sweater-dress-boots',
        name: 'Sweater Dress & Boots',
        category: 'Cozy Elegance',
        description: "The perfect sweater dress with knee-high boots - cozy but incredibly chic, hair perfectly undone.",
        prompt: '[triggerword] woman in fitted ribbed sweater dress in camel or cream, knee-high leather boots, hair in textured waves, minimal gold jewelry, walking through luxury space, shot on Canon R6 Mark II with 35mm f/1.8 lens, natural warm lighting, cozy elegance aesthetic, heavy 35mm film grain, matte complexion, expensive comfort styling, sophisticated autumn vibes'
      },
      {
        id: 'blazer-bike-shorts',
        name: 'Blazer & Bike Shorts',
        category: 'Modern Luxury',
        description: "The modern power move - oversized blazer with fitted bike shorts, sneakers or boots, hair slicked back or textured.",
        prompt: '[triggerword] woman in oversized blazer over fitted bike shorts, designer sneakers or ankle boots, hair slicked back or in messy bun, minimalist jewelry, urban luxury backdrop, shot on Leica Q2 with 28mm f/1.7 lens, dramatic city lighting, modern luxury styling, heavy 35mm film grain, film negative quality, contemporary expensive aesthetic, power casual elegance'
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
        prompt: '[triggerword] woman stepping out of Parisian cafe holding coffee cup, voluminous hair with natural body and movement, oversized black blazer over mini dress, Prada bag, morning sunlight on cobblestone street, natural stride, other cafe patrons blurred in background, shot on Canon EOS R5, 85mm lens, iPhone street photography aesthetic, heavy 35mm film grain, gentle skin smoothing while maintaining realistic texture, natural facial refinement, editorial skin enhancement, candid lifestyle moment'
      },
      {
        id: 'milan-coffee-walk',
        name: 'Milan Coffee Walk',
        category: 'Morning Coffee Runs',
        description: "Italian elegance meets street style. Walking with your espresso like the sophisticated woman you are.",
        prompt: '[triggerword] woman walking with espresso cup, voluminous hair with natural body and movement, black cropped tank, high-waisted cream trousers, small Bottega Veneta bag, Italian architecture behind, adjusting sunglasses with free hand, natural morning light, street style candid, shot on Fujifilm X-T5, 35mm lens, heavy 35mm film grain, gentle skin smoothing while maintaining realistic texture, natural facial refinement, editorial skin enhancement, film photography mood'
      },
      {
        id: 'avenue-montaigne-stroll',
        name: 'Avenue Montaigne Stroll',
        category: 'Luxury Shopping',
        description: "Walking past Dior like you belong there. Pure luxury shopping vibes with that confident stride.",
        prompt: '[triggerword] woman walking past Dior boutique, voluminous hair with natural body and movement, black strapless top, white wide-leg pants, Hermès Kelly bag, mid-stride confident walk, Parisian Haussmann architecture, natural daylight, street style photography, shot on Leica Q2, 28mm lens, heavy 35mm film grain, gentle skin smoothing while maintaining realistic texture, natural facial refinement, editorial skin enhancement, film aesthetic, movement captured'
      },
      {
        id: 'stone-building-lean',
        name: 'Stone Building Lean',
        category: 'Architectural Backgrounds',
        description: "That effortless pose against beautiful European architecture. Looking away thoughtfully, totally at ease.",
        prompt: '[triggerword] woman leaning against limestone building, voluminous hair with natural body and movement, black tube top, vintage denim, small chain bag, one hand in pocket, looking away from camera, European architectural details, natural shadows on face, street style portrait, shot on Canon EOS R5, 50mm lens, heavy 35mm film grain, gentle skin smoothing while maintaining realistic texture, natural facial refinement, editorial skin enhancement, film photography'
      },
      {
        id: 'zebra-crossing-power',
        name: 'Zebra Crossing Power',
        category: 'Street Crossing',
        description: "Abbey Road vibes but make it fashion. Confident stride across the street, blazer flowing, pure power move.",
        prompt: '[triggerword] woman mid-stride on crosswalk, voluminous hair with natural body and movement, black bodysuit, oversized blazer flowing, small bag across body, city traffic blurred behind, confident walk, natural daylight, street photography style, shot on Sony α7R V, 35mm lens, heavy 35mm film grain, gentle skin smoothing while maintaining realistic texture, natural facial refinement, editorial skin enhancement, movement captured, film aesthetic'
      },
      {
        id: 'golden-hour-walk',
        name: 'Golden Hour Walk',
        category: 'Evening Transitions',
        description: "That magic hour when everything glows. Evening walk in your slip dress, golden light making you look ethereal.",
        prompt: '[triggerword] woman walking in evening light, voluminous hair with natural body and movement, black slip dress, leather jacket over shoulders, small clutch bag, European boulevard, golden hour backlighting, natural stride, street style photography, shot on Fujifilm X-T5, 56mm lens, heavy 35mm film grain, gentle skin smoothing while maintaining realistic texture, natural facial refinement, editorial skin enhancement, film mood'
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
        prompt: '[triggerword] woman profile silhouette against bright window, voluminous hair in elegant updo showing graceful neck curve, wrapped in blanket or oversized sweater, contemplative moment, black and white photography only, monochrome, no color, heavy 35mm film grain, gentle skin smoothing while maintaining realistic texture, natural facial refinement, editorial skin enhancement, visible emotion in posture, raw documentary style'
      },
      {
        id: 'against-the-wall',
        name: 'Against the Wall',
        category: 'Raw Moments',
        description: "Those overwhelming moments we all have. Forehead against the wall, real emotion, completely authentic.",
        prompt: '[triggerword] woman leaning forehead against textured wall, eyes closed, voluminous hair falling naturally with beautiful movement, wearing simple knit sweater, exhausted or overwhelmed posture, available light only, black and white intimate portrait only, monochrome, no color, heavy 35mm film grain, gentle skin smoothing while maintaining realistic texture, natural facial refinement, editorial skin enhancement, unguarded moment'
      },
      {
        id: 'morning-truth',
        name: 'Morning Truth',
        category: 'Raw Moments',
        description: "Honest morning beauty. No makeup, real hair, looking directly at the camera with complete authenticity.",
        prompt: '[triggerword] woman in bed looking directly at camera, no makeup, voluminous hair beautifully spread on pillow with natural body and movement, white sheets, natural morning vulnerability, black and white photography only, monochrome, no color, heavy 35mm film grain, gentle skin smoothing while maintaining realistic texture, natural facial refinement, editorial skin enhancement, raw intimate portrait, honest beauty'
      },
      {
        id: 'mirror-reflection',
        name: 'Mirror Reflection',
        category: 'Journey Portraits',
        description: "That moment of self-reflection. Looking at yourself in the mirror, questioning, growing, becoming.",
        prompt: '[triggerword] woman looking at self in bathroom mirror, voluminous hair with natural body and movement, hands on sink, questioning expression, simple clothing, harsh bathroom light, black and white self-confrontation portrait only, monochrome, no color, heavy 35mm film grain, gentle skin smoothing while maintaining realistic texture, natural facial refinement, editorial skin enhancement, raw personal moment'
      },
      {
        id: 'window-watcher',
        name: 'Window Watcher',
        category: 'Journey Portraits',
        description: "Contemplating life by the window. Coffee in hand, looking toward your future with hope and possibility.",
        prompt: '[triggerword] woman by window looking out, coffee cup in hands, voluminous messy hair with natural body and beautiful movement, oversized sweater, rain or city view outside, black and white melancholic portrait only, monochrome, no color, heavy 35mm film grain, gentle skin smoothing while maintaining realistic texture, natural facial refinement, editorial skin enhancement, waiting or hoping'
      },
      {
        id: 'walking-away',
        name: 'Walking Away',
        category: 'Transformation',
        description: "Powerful transformation shot. Walking away from what was, toward what's next. No looking back.",
        prompt: '[triggerword] woman walking away from camera down hallway or street, voluminous hair with natural body and movement, purposeful stride, looking forward not back, simple outfit, black and white documentary only, monochrome, no color, heavy 35mm film grain, gentle skin smoothing while maintaining realistic texture, natural facial refinement, editorial skin enhancement, leaving the past behind'
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
        prompt: '[triggerword] woman, voluminous hair in perfectly tousled messy bun with soft face-framing pieces, hair with natural body and movement, minimal makeup with glossy lips, bare shoulders, seamless gray backdrop, shot on Hasselblad X2D 100C, 90mm lens, single beauty dish lighting, black and white photography only, monochrome, no color, heavy 35mm film grain, gentle skin smoothing while maintaining realistic texture, natural facial refinement, visible skin texture but softened, high fashion beauty portrait, editorial skin enhancement'
      },
      {
        id: 'harpers-intimate',
        name: "Harper's Intimate Portrait",
        category: 'Studio Beauty',
        description: "Intimate Harper's Bazaar vibes. Looking over your shoulder, tousled hair, that effortless editorial beauty.",
        prompt: '[triggerword] woman, voluminous tousled hair with natural body and movement falling beautifully over shoulders, looking over bare shoulder, minimal jewelry, neutral backdrop, shot on Canon EOS R5, 85mm lens, soft window light from left, black and white editorial only, monochrome, no color, heavy 35mm film grain, gentle skin smoothing while maintaining realistic texture, natural facial refinement, editorial skin enhancement, medium format aesthetic'
      },
      {
        id: 'window-shadow-play',
        name: 'Window Shadow Play',
        category: 'Dramatic Lighting',
        description: "Dramatic light and shadow. Window blinds creating beautiful stripes across your face - pure artistic magic.",
        prompt: '[triggerword] woman, voluminous hair with natural body and texture, dramatic window blinds creating shadow stripes across face and body, eyes closed in serene expression, black slip dress, shot on Leica M11 Monochrom, 90mm lens, natural harsh light, high contrast black and white only, monochrome, no color, heavy 35mm film grain, gentle skin smoothing while maintaining realistic texture, natural facial refinement, editorial skin enhancement, visible skin detail in light strips'
      },
      {
        id: 'hair-toss-energy',
        name: 'Hair Toss Energy',
        category: 'Natural Movement',
        description: "That perfect hair flip moment. Natural movement, genuine expression, pure energy captured.",
        prompt: '[triggerword] woman, mid hair flip movement with voluminous hair showing natural body and bounce, natural motion blur in hair, black tank top, genuine expression, shot on Nikon Z9, 85mm lens, studio strobe to freeze motion, black and white action portrait only, monochrome, no color, heavy 35mm film grain, gentle skin smoothing while maintaining realistic texture, natural facial refinement, editorial skin enhancement, authentic moment captured'
      },
      {
        id: 'chair-authority',
        name: 'Chair Authority',
        category: 'Editorial Power',
        description: "Boss lady energy. Sitting backwards on a chair with that direct, powerful gaze that says you mean business.",
        prompt: '[triggerword] woman sitting backwards on chair, voluminous hair with natural body and movement, arms resting on chair back, black outfit, direct powerful gaze, shot on Phase One XF IQ4, 80mm lens, dramatic studio lighting, black and white power portrait only, monochrome, no color, heavy 35mm film grain, gentle skin smoothing while maintaining realistic texture, natural facial refinement, editorial skin enhancement, strong presence, editorial fashion'
      },
      {
        id: 'freckles-texture',
        name: 'Freckles and Texture',
        category: 'Beauty Close-ups',
        description: "Extreme close-up beauty. Every freckle, every pore, natural texture - celebrating real, unfiltered beauty.",
        prompt: '[triggerword] woman, extreme close-up beauty shot, voluminous hair in tousled messy bun with loose face-framing strands, natural freckles visible, glossy lips slightly parted, shot on Phase One XF IQ4 with 120mm macro lens, ring light, black and white beauty portrait only, monochrome, no color, heavy 35mm film grain, gentle skin smoothing while maintaining realistic texture, natural facial refinement, editorial skin enhancement, natural skin texture celebrated'
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
      
      queryClient.invalidateQueries({ queryKey: ['/api/gallery-images'] });
      
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



  // Generate from built-in prompt using Maya's polling pattern
  const generateFromPrompt = useCallback(async (prompt: any) => {
    setSelectedPrompt(prompt);
    setGeneratingImages(true);
    setGenerationProgress(0);
    setSelectedImages([]);
    
    try {
      // Use same pattern as Maya - start generation and get imageId
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
      
      if (data.imageId) {
        // Start polling for completion using Maya's pattern
        pollForImages(data.imageId);
        
        toast({
          title: "Generation Started",
          description: "Creating your photos... This takes about 30 seconds.",
        });
      }
    } catch (error) {
      console.error('Error generating images:', error);
      toast({
        title: "Generation Failed",
        description: "Something went wrong with image generation",
        variant: "destructive",
      });
      setGeneratingImages(false);
    }
  }, [userModel, queryClient, toast]);

  // Poll for image completion using Maya's exact pattern
  const pollForImages = async (imageId: number) => {
    const maxAttempts = 40; // 2 minutes total (3 second intervals)
    let attempts = 0;
    
    const poll = async () => {
      try {
        attempts++;
        setGenerationProgress(Math.min(90, (attempts / maxAttempts) * 90));
        
        const response = await fetch('/api/ai-images');
        if (!response.ok) throw new Error('Failed to fetch images');
        
        const images = await response.json();
        const currentImage = images.find((img: any) => img.id === imageId);
        
        if (currentImage && currentImage.imageUrl && currentImage.imageUrl !== 'processing') {
          // Image generation completed
          console.log('AI-PHOTOSHOOT: Image generation completed!', currentImage);
          console.log('AI-PHOTOSHOOT: imageUrl value:', currentImage.imageUrl);
          
          setGenerationProgress(100);
          setGeneratingImages(false);
          
          if (currentImage.imageUrl.startsWith('http') || currentImage.imageUrl.startsWith('[')) {
            // Parse the image URLs (should be array of 3 URLs)
            let imageUrls: string[] = [];
            try {
              // Try to parse as JSON array first
              const parsed = JSON.parse(currentImage.imageUrl);
              console.log('AI-PHOTOSHOOT: Parsed imageUrl:', parsed);
              if (Array.isArray(parsed)) {
                imageUrls = parsed;
                console.log('AI-PHOTOSHOOT: Found array with', imageUrls.length, 'images');
              } else {
                imageUrls = [currentImage.imageUrl];
                console.log('AI-PHOTOSHOOT: Single URL fallback');
              }
            } catch (error) {
              // If not JSON, treat as single URL
              console.log('AI-PHOTOSHOOT: JSON parse failed, using single URL:', error);
              imageUrls = [currentImage.imageUrl];
            }
            
            // Set the images for display
            setSelectedImages(imageUrls);
            
            // Invalidate gallery images cache to show new images when saved
            queryClient.invalidateQueries({ queryKey: ['/api/gallery-images'] });
            
            toast({
              title: "Images Generated!",
              description: `${imageUrls.length} new photos ready for preview`,
            });
          }
          return;
        }
        
        // Continue polling
        if (attempts < maxAttempts) {
          setTimeout(poll, 3000);
        } else {
          setGeneratingImages(false);
          toast({
            title: "Generation Timeout", 
            description: "Photos are taking longer than expected. Check gallery later!",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Polling error:', error);
        if (attempts < maxAttempts) {
          setTimeout(poll, 3000);
        } else {
          setGeneratingImages(false);
        }
      }
    };
    
    // Start polling
    setTimeout(poll, 2000);
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
        <WorkspaceNavigation />
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
      <WorkspaceNavigation />
      
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
        tagline="Where your vision meets reality"
        title="PHOTOSHOOT"
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