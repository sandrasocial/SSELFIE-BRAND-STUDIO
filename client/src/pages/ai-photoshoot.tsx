import React, { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { MemberNavigation } from '@/components/member-navigation';
import { HeroFullBleed } from '@/components/hero-full-bleed';
import { SandraImages } from '@/lib/sandra-images';

// ELEGANT PHOTOSHOOT COLLECTIONS - Lookbook Style
const PROMPT_COLLECTIONS = {
  'healing-mindset': {
    id: 'healing-mindset',
    name: 'M I N D S E T',
    subtitle: 'M O M E N T S',
    description: 'Peaceful & authentic wellness photography',
    preview: SandraImages.portraits.professional[2],
    prompts: [
      {
        id: 'shadow-play-vulnerability',
        name: 'Shadow Play Vulnerability',
        category: 'Raw Moments',
        description: "Sitting in corner where walls meet, harsh window light creating geometric shadows across face and body.",
        prompt: '[triggerword] woman long dark messy hair, sitting in corner where walls meet, harsh window light creating geometric shadows across face and body, wearing simple black tank, bare walls, shot on Leica M11 Monochrom with 50mm Noctilux f/0.95, high contrast shadows, raw photo, exhausted expression, visible skin imperfections, heavy grain, unretouched raw emotion, documentary style'
      },
      {
        id: 'bathroom-floor-truth',
        name: 'Bathroom Floor Truth', 
        category: 'Raw Moments',
        description: "Sitting on bathroom floor against bathtub, single overhead light creating harsh downward shadows.",
        prompt: '[triggerword] woman long dark wet hair, sitting on bathroom floor against bathtub, wearing oversized black t-shirt, single overhead light creating harsh downward shadows, shot on Canon 5D Mark IV with 35mm f/1.4, bathroom tiles visible, raw photo, makeup smeared, real skin texture, heavy grain, unretouched rock bottom moment'
      },
      {
        id: 'window-silhouette-pain',
        name: 'Window Silhouette Pain',
        category: 'Raw Moments', 
        description: "Standing against bright window becoming silhouette, body language showing defeat.",
        prompt: '[triggerword] woman long dark hair backlit, standing against bright window becoming silhouette, wearing black slip, body language showing defeat, shot on Fujifilm X-Pro3 with 35mm f/1.4, extreme backlighting, raw photo, figure in shadow, emotional posture, film grain, unretouched isolation'
      },
      {
        id: 'kitchen-floor-3am',
        name: 'Kitchen Floor 3AM',
        category: 'Raw Moments',
        description: "Sitting on kitchen floor in refrigerator light only, holding coffee mug.",
        prompt: '[triggerword] woman long dark tangled hair, sitting on kitchen floor in refrigerator light only, wearing black robe fallen open, holding coffee mug, shot on Sony A7S III with 24mm f/1.4, only fridge light source, raw photo, insomnia visible on face, natural tired skin, heavy grain, unretouched sleepless reality'
      },
      {
        id: 'mirror-fragmentation', 
        name: 'Mirror Fragmentation',
        category: 'Raw Moments',
        description: "Looking at broken mirror reflection, multiple fractured reflections.",
        prompt: '[triggerword] woman long dark hair covering partial face, looking at broken mirror reflection, wearing black camisole, multiple fractured reflections, shot on Pentax 645Z with 75mm f/2.8, single bare bulb lighting, raw photo, distorted self-image, real skin in harsh light, grain, unretouched identity crisis'
      },
      {
        id: 'iphone-mirror-selfie',
        name: 'iPhone Mirror Selfie',
        category: 'Modern Portraits',
        description: "Taking mirror selfie with iPhone, luxury marble bathroom setting.",
        prompt: '[triggerword] woman long dark hair, taking mirror selfie with iPhone 15 Pro Max, wearing black slip dress, luxury marble bathroom, ring light reflection visible in mirror, shot on Hasselblad H6D-100c with 50mm lens f/2.8, ambient bathroom lighting, raw photo, natural skin in mirror reflection, film grain, unretouched authentic moment, lifestyle editorial'
      },
      {
        id: 'iphone-half-face-cover',
        name: 'iPhone Half Face Cover',
        category: 'Modern Portraits',
        description: "Holding iPhone covering left half of face, only right eye visible with intense gaze.",
        prompt: '[triggerword] woman long dark hair flowing, holding iPhone 15 Pro Max covering left half of face, only right eye visible with intense gaze, wearing black silk top, white studio backdrop, shot on Canon 5DS R with 85mm f/1.2L lens, soft beauty lighting, raw photo, visible skin pores on exposed face, film grain, unretouched natural skin texture, subsurface scattering, modern portrait photography'
      },
      {
        id: 'beach-meditation',
        name: 'Beach Meditation',
        category: 'Ocean Healing',
        description: "Peaceful meditation by the ocean. Lotus pose, waves in background, that zen moment where everything feels aligned.",
        prompt: '[triggerword] woman in lotus pose on sand, voluminous hair with natural body and movement, black ribbed bodysuit or fitted long-sleeve top, eyes closed in meditation, ocean waves in background, golden hour side lighting, serene expression, mindfulness practice, shot on Nikon Z9 with 50mm f/1.2S lens, soft golden hour lighting, beach yoga aesthetic, heavy 35mm film grain, matte textured skin, soft skin retouch, Kodak Portra 400 film aesthetic, visible pores and natural texture, gentle facial refinement, editorial skin enhancement. Negative: shiny skin, glossy skin, fake skin, plastic-looking skin, over-processed skin'
      },
      {
        id: 'candlelit-meditation',
        name: 'Candlelit Meditation',
        category: 'Inner Peace',
        description: "You know those nights when you just need to reset? Light some candles, close your eyes, and find your zen.",
        prompt: '[triggerword] woman in meditation pose, voluminous hair with natural body and movement, black ribbed bodysuit or fitted long-sleeve top, surrounded by candles, indoor zen space, warm candlelight glow on face, eyes closed in peace, healing sanctuary, shot on Sony A7R V with 85mm f/1.4 GM lens, intimate candlelight illumination, mindfulness photography, heavy 35mm film grain, matte textured skin, soft skin retouch, analog film photography aesthetic, natural skin imperfections and visible pores, gentle facial refinement, editorial skin enhancement. Negative: shiny skin, glossy skin, fake skin, plastic-looking skin, over-processed skin'
      },
      {
        id: 'morning-ritual',
        name: 'Morning Ritual',
        category: 'Inner Peace',
        description: "My favorite time of day. Just you, your tea, and that perfect window light. Pure morning magic.",
        prompt: '[triggerword] woman in morning meditation, voluminous hair with natural body and movement, sitting by window with natural light, holding warm tea, peaceful expression, plants visible, cozy healing space, daily mindfulness practice, shot on Fujifilm GFX100S with 110mm f/2 lens, soft morning window lighting, wellness lifestyle, heavy 35mm film grain, matte textured skin, soft skin retouch, pronounced texture, authentic grain pattern and visible pores, gentle facial refinement, editorial skin enhancement. Negative: shiny skin, glossy skin, fake skin, plastic-looking skin, over-processed skin'
      },
      {
        id: 'forest-grounding',
        name: 'Forest Grounding',
        category: 'Nature Connection',
        description: "When you need to get out of your head and into nature. Tree hugging is totally allowed here.",
        prompt: '[triggerword] woman standing among trees, voluminous hair with natural body and movement, touching tree trunk, earthing practice, wearing linen button-down shirt and wide-leg trousers in earth tones, dappled forest light, connection with nature, grounding energy, shot on Leica Q2 with 28mm f/1.7 lens, natural forest lighting with dappled shadows, forest therapy moment, heavy 35mm film grain, matte textured skin, soft skin retouch, film negative quality, visible grain structure and natural pores, gentle facial refinement, editorial skin enhancement. Negative: shiny skin, glossy skin, fake skin, plastic-looking skin, over-processed skin'
      },
      {
        id: 'yoga-flow',
        name: 'Yoga Flow',
        category: 'Movement Medicine',
        description: "Because your yoga practice is gorgeous and powerful. Let's show the world your graceful strength.",
        prompt: '[triggerword] woman in yoga pose, voluminous hair with natural body and movement, flowing movement captured, natural light studio, black ribbed bodysuit or fitted athletic wear, graceful strength, moving meditation, healing through movement, shot on Canon R6 Mark II with 35mm f/1.8 lens, soft natural studio lighting, wellness photography, heavy 35mm film grain, matte textured skin, soft skin retouch, authentic texture with visible pores, gentle facial refinement, editorial skin enhancement. Negative: shiny skin, glossy skin, fake skin, plastic-looking skin, over-processed skin'
      }
    ]
  },
  'magazine-covers': {
    id: 'magazine-covers',
    name: 'E D I T O R I A L',
    subtitle: 'P O W E R',
    description: 'High-fashion editorial portraits for your brand',
    preview: SandraImages.portraits.professional[1],
    prompts: [
      {
        id: 'vogue-transformative-strength',
        name: 'VOGUE Transformative Strength',
        category: 'Magazine Covers',
        description: "That moment when you realize your power. Hair perfectly swept, blazer on point, gaze that says everything.",
        prompt: '[triggerword] woman long dark hair swept over one shoulder, direct powerful gaze at camera, wearing black off-shoulder blazer, minimal gold jewelry, pure white backdrop, shot on Hasselblad H6D-100c with 80mm lens f/2.8, beauty dish with fill light, raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, transformative strength editorial portrait'
      },
      {
        id: 'elle-confidence-rebirth',
        name: 'ELLE Confidence Rebirth',
        category: 'Magazine Covers',
        description: "That little knowing smile because you've figured it out. Natural waves, silk cami, pure confidence.",
        prompt: '[triggerword] woman long dark hair natural waves, slight smile knowing expression, wearing simple black silk camisole, no excessive jewelry, soft gray seamless background, shot on Canon 5DS R with 85mm f/1.2L lens, window light with silver reflector, raw photo, authentic skin texture, film grain, unretouched beauty, subsurface scattering, quiet confidence portrait'
      },
      {
        id: 'harpers-bazaar-phoenix',
        name: "HARPER'S BAZAAR Phoenix",
        category: 'Magazine Covers',
        description: "CEO energy in that perfect suit. Hair sleek, posture strong, ready to take on the world.",
        prompt: '[triggerword] woman long sleek dark hair center part, three-quarter turn strong posture, wearing structured black suit jacket deep V, layered delicate necklaces, neutral beige backdrop, shot on Phase One XF IQ4 150MP with 110mm lens f/2.8, three-point studio lighting, raw photo, natural skin visible, film grain, unretouched power, magazine cover editorial'
      },
      {
        id: 'marie-claire-survivor',
        name: 'MARIE CLAIRE Survivor',
        category: 'Magazine Covers',
        description: "When you've been through it all and came out stronger. Tousled hair, cashmere comfort, unshakeable determination.",
        prompt: '[triggerword] woman long dark tousled hair, looking past camera with determination, wearing black cashmere turtleneck, single gold ring visible, warm white background, shot on Leica S3 with 70mm Summarit-S f/2.5, soft continuous lighting, raw photo, lived-in skin texture, film grain, unretouched authenticity, emotional strength portrait'
      },
      {
        id: 'cosmopolitan-comeback',
        name: 'COSMOPOLITAN Comeback',
        category: 'Magazine Covers',
        description: "Pure joy because you're winning at life. That real laugh, gorgeous hair, perfect blazer moment.",
        prompt: '[triggerword] woman long dark voluminous hair, genuine laugh caught mid-moment, wearing black blazer over lace cami, statement earrings, bright white studio, shot on Sony A1 with 135mm GM lens f/1.8, strobe with softbox, raw photo, expression lines visible, natural skin, film grain, unretouched joy, celebratory editorial'
      },
      {
        id: 'glamour-rising',
        name: 'GLAMOUR Rising',
        category: 'Magazine Covers',
        description: "That direct eye contact that says you're not playing anymore. Hair perfectly tucked, simple dress, maximum impact.",
        prompt: '[triggerword] woman long dark hair one side behind ear, direct confident eye contact, wearing simple black dress, delicate gold chain, clean white cyclorama, shot on Nikon Z9 with 105mm f/1.4 lens, beauty lighting setup, raw photo, real skin texture, visible pores, film grain, unretouched natural power, cover portrait'
      },
      {
        id: 'instyle-empire',
        name: 'INSTYLE Empire',
        category: 'Magazine Covers',
        description: "Boss mode activated. Low ponytail, power suit, standing like you own the room - because you do.",
        prompt: '[triggerword] woman long dark hair in low ponytail, CEO stance facing camera, wearing black power suit with white shirt, minimal jewelry, gray paper backdrop, shot on Fujifilm GFX100 II with 110mm f/2 lens, classic portrait lighting, raw photo, professional strength, natural skin detail, film grain, unretouched leadership'
      },
      {
        id: 'tatler-triumph',
        name: 'TATLER Triumph',
        category: 'Magazine Covers',
        description: "Old Hollywood glamour meets modern power. Those waves, that velvet, pearls that whisper elegance.",
        prompt: '[triggerword] woman long dark hair Hollywood waves, regal bearing, wearing black velvet blazer, pearl earrings, rich navy backdrop, shot on Pentax 645Z with 90mm f/2.8 lens, Rembrandt lighting, raw photo, mature beauty, skin texture visible, medium format grain, unretouched elegance, luxury survivor portrait'
      },
      {
        id: 'w-magazine-warrior',
        name: 'W MAGAZINE Warrior',
        category: 'Magazine Covers',
        description: "Your profile is art. Sleek hair, that incredible architectural top, strength in every line.",
        prompt: '[triggerword] woman long dark straight hair, profile showing strength, wearing architectural black top, single statement earring, black seamless background, shot on RED Komodo with 85mm cinema lens, dramatic side light, raw photo, skin in harsh light, film grain, unretouched fierce beauty, artistic power portrait'
      },
      {
        id: 'forbes-founder',
        name: 'FORBES Founder',
        category: 'Magazine Covers',
        description: "The founder energy is real. Professional hair, perfect blazer, ready to change the world with your business.",
        prompt: '[triggerword] woman long dark professional hair, business portrait angle, wearing black blazer white shirt, watch visible, corporate gray backdrop, shot on Canon R5 with 70-200mm f/2.8 at 135mm, corporate headshot lighting, raw photo, approachable CEO energy, natural skin, film grain, unretouched success story'
      },
      {
        id: 'rock-bottom-truth',
        name: 'Rock Bottom Truth',
        category: 'Journey Story',
        description: "We all have those rock bottom moments. This is yours - raw, real, and the beginning of your comeback story.",
        prompt: '[triggerword] woman long dark disheveled hair, sitting on floor against white wall, wearing oversized black sweater, knees pulled up, morning window light creating shadows, shot on Leica Q2 with 28mm Summilux, available light only, raw photo, tired eyes visible, natural exhausted skin, heavy grain, unretouched vulnerability, documentary style'
      },
      {
        id: 'first-brave-selfie',
        name: 'First Brave Selfie',
        category: 'Journey Story',
        description: "Remember your first brave selfie? That moment you decided to show up. This is where it all started.",
        prompt: '[triggerword] woman long dark messy hair, holding phone up taking selfie, wearing simple black t-shirt, bedroom background soft focus, natural morning light, shot on iPhone 15 Pro portrait mode feel, handheld casual angle, raw photo, no makeup skin texture, authentic moment, film grain, unretouched courage beginning'
      },
      {
        id: 'coffee-and-camera',
        name: 'Coffee and Camera',
        category: 'Journey Story',
        description: "That 7am hustle with coffee in one hand, phone in the other. Building your empire one morning at a time.",
        prompt: '[triggerword] woman long dark hair in messy bun, one hand holding coffee other holding phone, wearing black robe, kitchen counter background, 7am golden hour through window, shot on Canon 5D Mark IV with 35mm f/1.4, lifestyle documentary, raw photo, morning skin no makeup, visible texture, grain, unretouched daily ritual'
      },
      {
        id: 'building-momentum',
        name: 'Building Momentum',
        category: 'Journey Story',
        description: "The grind is real but so are you. Hair half up, laptop open, ring light on - building your dreams pixel by pixel.",
        prompt: '[triggerword] woman long dark hair half up, sitting at laptop with ring light, wearing black tank top, home office setup visible, afternoon natural light, shot on Sony A7R V with 50mm f/1.2, environmental portrait, raw photo, focused expression, real skin, film grain, unretouched work in progress'
      }
    ]
  },
  'street-documentary': {
    id: 'street-documentary',
    name: 'S T R E E T',
    subtitle: 'D O C U M E N T A R Y',
    description: 'Natural urban moments with film photography aesthetics',
    preview: SandraImages.portraits.professional[0],
    prompts: [
      {
        id: 'crosswalk-confidence',
        name: 'Crosswalk Confidence',
        category: 'Street Power',
        description: "That main character energy crossing the street. Blazer flowing, hair windswept, total boss move.",
        prompt: '[triggerword] woman long dark hair windswept, crossing street mid-stride, wearing black oversized blazer, designer bag, city traffic blurred background, shot on Leica M10 with 35mm Summicron f/2, street photography style, raw photo, natural stride energy, visible skin texture, film grain, unretouched confidence'
      },
      {
        id: 'subway-stairs-power',
        name: 'Parisian Café Exit',
        category: 'Morning Coffee Runs',
        description: "That expensive girl energy. You're stepping out of a cute Parisian café with your morning coffee, looking effortlessly chic.",
        prompt: '[triggerword] woman stepping out of Parisian cafe holding coffee cup, voluminous hair with natural body and movement, oversized black blazer over mini dress, Prada bag, morning sunlight on cobblestone street, natural stride, other cafe patrons blurred in background, shot on Canon EOS R5, 85mm lens, iPhone street photography aesthetic, heavy 35mm film grain, matte textured skin, soft skin retouch, visible pores and natural texture, natural facial refinement, editorial skin enhancement, candid lifestyle moment. Negative: shiny skin, glossy skin, fake skin, plastic-looking skin, over-processed skin'
      },
      {
        id: 'milan-coffee-walk',
        name: 'Milan Coffee Walk',
        category: 'Morning Coffee Runs',
        description: "Italian elegance meets street style. Walking with your espresso like the sophisticated woman you are.",
        prompt: '[triggerword] woman walking with espresso cup, voluminous hair with natural body and movement, black cropped tank, high-waisted cream trousers, small Bottega Veneta bag, Italian architecture behind, adjusting sunglasses with free hand, natural morning light, street style candid, shot on Fujifilm X-T5, 35mm lens, heavy 35mm film grain, matte textured skin, soft skin retouch, visible pores and natural texture, natural facial refinement, editorial skin enhancement, film photography mood. Negative: shiny skin, glossy skin, fake skin, plastic-looking skin, over-processed skin'
      },
      {
        id: 'avenue-montaigne-stroll',
        name: 'Avenue Montaigne Stroll',
        category: 'Luxury Shopping',
        description: "Walking past Dior like you belong there. Pure luxury shopping vibes with that confident stride.",
        prompt: '[triggerword] woman walking past Dior boutique, voluminous hair with natural body and movement, black strapless top, white wide-leg pants, Hermès Kelly bag, mid-stride confident walk, Parisian Haussmann architecture, natural daylight, street style photography, shot on Leica Q2, 28mm lens, heavy 35mm film grain, matte textured skin, soft skin retouch, visible pores and natural texture, natural facial refinement, editorial skin enhancement, film aesthetic, movement captured. Negative: shiny skin, glossy skin, fake skin, plastic-looking skin, over-processed skin'
      },
      {
        id: 'stone-building-lean',
        name: 'Stone Building Lean',
        category: 'Architectural Backgrounds',
        description: "That effortless pose against beautiful European architecture. Looking away thoughtfully, totally at ease.",
        prompt: '[triggerword] woman leaning against limestone building, voluminous hair with natural body and movement, black tube top, vintage denim, small chain bag, one hand in pocket, looking away from camera, European architectural details visible, natural shadows on face, half body street style shot, shot on Canon EOS R5, 50mm lens, heavy 35mm film grain, matte textured skin, soft skin retouch, visible pores and natural texture, natural facial refinement, editorial skin enhancement, film photography. Negative: shiny skin, glossy skin, fake skin, plastic-looking skin, over-processed skin, close-up portrait, headshot, tight crop'
      },
      {
        id: 'zebra-crossing-power',
        name: 'Zebra Crossing Power',
        category: 'Street Crossing',
        description: "Abbey Road vibes but make it fashion. Confident stride across the street, blazer flowing, pure power move.",
        prompt: '[triggerword] woman mid-stride on crosswalk, voluminous hair with natural body and movement, black bodysuit, oversized blazer flowing, small bag across body, city traffic blurred behind, confident walk, natural daylight, street photography style, shot on Sony α7R V, 35mm lens, heavy 35mm film grain, matte textured skin, soft skin retouch, visible pores and natural texture, natural facial refinement, editorial skin enhancement, movement captured, film aesthetic. Negative: shiny skin, glossy skin, fake skin, plastic-looking skin, over-processed skin'
      },
      {
        id: 'golden-hour-walk',
        name: 'Golden Hour Walk',
        category: 'Evening Transitions',
        description: "That magic hour when everything glows. Evening walk in your slip dress, golden light making you look ethereal.",
        prompt: '[triggerword] woman walking in evening light, voluminous hair with natural body and movement, black slip dress, leather jacket over shoulders, small clutch bag, European boulevard, golden hour backlighting, natural stride, street style photography, shot on Fujifilm X-T5, 56mm lens, heavy 35mm film grain, matte textured skin, soft skin retouch, visible pores and natural texture, natural facial refinement, editorial skin enhancement, film mood. Negative: shiny skin, glossy skin, fake skin, plastic-looking skin, over-processed skin'
      }
    ]
  },
  'lifestyle-editorial': {
    id: 'lifestyle-editorial',
    name: 'L I F E S T Y L E',
    subtitle: 'E D I T O R I A L',
    description: 'Natural moments with editorial quality and authentic expressions',
    preview: SandraImages.portraits.professional[3],
    prompts: [
      {
        id: 'surfboard-ocean-mood',
        name: 'Surfboard Ocean Mood',
        category: 'Beach Editorial',
        description: "Beach babe energy with your surfboard. Hair wild from the ocean breeze, wetsuit looking effortlessly cool.",
        prompt: '[triggerword] woman long dark hair windswept, holding surfboard vertical on beach, wearing black wetsuit partially unzipped, ocean waves background, golden hour side lighting, shot on Fujifilm X-T4 with 56mm f/1.2, coastal lifestyle, raw photo, salt-kissed skin texture, film grain, unretouched ocean energy, surf culture editorial'
      },
      {
        id: 'morning-garden-ritual',
        name: 'Morning Garden Ritual',
        category: 'Home Editorial',
        description: "That peaceful morning ritual with your plants. White linen, barefoot, totally in your element.",
        prompt: '[triggerword] woman long dark hair loose, watering plants in garden, wearing white linen dress, barefoot on grass, morning sunlight filtering through leaves, shot on Canon 5D Mark IV with 85mm f/1.4, lifestyle editorial, raw photo, natural skin in dappled light, film grain, unretouched peaceful moment'
      },
      {
        id: 'balcony-reading-corner',
        name: 'Balcony Reading Corner',
        category: 'Home Editorial',
        description: "Your cozy reading corner with the best city view. Black turtleneck, good book, pure bliss.",
        prompt: '[triggerword] woman long dark hair center part, reading book on balcony chair, wearing black turtleneck, city view background soft focus, afternoon natural light, shot on Leica Q2 with 28mm f/1.7, intimate lifestyle, raw photo, concentrated reading expression, natural skin, film grain, unretouched quiet intensity'
      },
      {
        id: 'kitchen-midnight-snack',
        name: 'Kitchen Midnight Snack',
        category: 'Real Life',
        description: "We've all been there - midnight snack in oversized shirt, fridge light glowing. Real life moments.",
        prompt: '[triggerword] woman long dark messy hair, standing in kitchen eating late night snack, wearing oversized shirt, refrigerator light only, shot on Sony A7S III with 35mm f/1.4, ambient kitchen lighting, raw photo, casual late night energy, natural tired skin, film grain, unretouched authentic moment'
      },
      {
        id: 'bookstore-floor-discover',
        name: 'Bookstore Floor Discovery',
        category: 'Urban Life',
        description: "That book lover moment sitting on the floor, completely absorbed. Surrounded by stories, lost in yours.",
        prompt: '[triggerword] woman long dark hair falling forward, sitting on bookstore floor reading, surrounded by books, wearing oversized sweater and jeans, warm bookstore lighting, shot on Canon R6 with 50mm f/1.2, documentary style, raw photo, absorbed in reading, natural skin texture, film grain, unretouched discovery moment'
      },
      {
        id: 'rainy-window-contemplation',
        name: 'Rainy Window Contemplation',
        category: 'Introspective',
        description: "Rainy day thoughts with tea in hand. Soft sweater, window reflections, those deep thinking moments.",
        prompt: '[triggerword] woman long dark hair natural, looking out rainy window with tea, wearing soft sweater, raindrops on glass, gray natural light, shot on Nikon Z6 II with 85mm f/1.8, intimate portrait, raw photo, contemplative mood, visible skin pores, film grain, unretouched melancholy beauty'
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
          prompt: prompt.prompt.replace('[triggerword]', userModel?.triggerWord || ''),
          // Note: userId will be handled by backend authentication
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
        <MemberNavigation />
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
      <MemberNavigation />
      
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
            I've put together these gorgeous collections for whatever mood you're in. Pick the one that feels right for you today.
          </p>
        </div>

        {!selectedCollection ? (
          <div>
            {/* Collection Grid - Lookbook Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {Object.values(PROMPT_COLLECTIONS).map((collection) => (
                <div
                  key={collection.id}
                  onClick={() => setSelectedCollection(collection.id)}
                  className="relative cursor-pointer transition-all duration-500 overflow-hidden group rounded-sm"
                  style={{ height: '360px', width: '100%' }}
                >
                  {/* Collection Image */}
                  <img
                    src={collection.preview}
                    alt={collection.name}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                  />
                  
                  {/* Soft Dark Overlay */}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all duration-500"></div>
                  
                  {/* Elegant Two-Line Title Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <div className="text-white text-center max-w-full">
                      <div className="font-serif text-lg md:text-2xl font-light uppercase mb-1 whitespace-nowrap overflow-hidden" 
                           style={{ letterSpacing: '0.2em' }}>
                        {collection.name}
                      </div>
                      {collection.subtitle && (
                        <div className="font-serif text-base md:text-lg font-light uppercase mb-3 whitespace-nowrap overflow-hidden" 
                             style={{ letterSpacing: '0.2em' }}>
                          {collection.subtitle}
                        </div>
                      )}
                      <div className="text-[10px] md:text-xs uppercase opacity-80 px-2" 
                           style={{ letterSpacing: '0.1em', lineHeight: '1.2' }}>
                        {collection.description}
                      </div>
                    </div>
                  </div>
                  
                  {/* Minimalist Count Badge */}
                  <div className="absolute top-4 right-4">
                    <div className="bg-white/90 px-2 py-1 text-xs font-light text-black">
                      {collection.prompts.length} styles
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
              <h2 className="font-serif text-[clamp(2rem,4vw,3rem)] font-light uppercase mb-2" 
                  style={{ letterSpacing: '0.3em' }}>
                {PROMPT_COLLECTIONS[selectedCollection]?.name}
              </h2>
              {PROMPT_COLLECTIONS[selectedCollection]?.subtitle && (
                <h3 className="font-serif text-[clamp(1.5rem,3vw,2rem)] font-light uppercase mb-4" 
                    style={{ letterSpacing: '0.3em' }}>
                  {PROMPT_COLLECTIONS[selectedCollection]?.subtitle}
                </h3>
              )}
              <p className="text-gray-600 max-w-2xl mx-auto text-lg font-light">
                {PROMPT_COLLECTIONS[selectedCollection]?.description}
              </p>
            </div>

            {/* Prompts Grid - Minimalist Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {PROMPT_COLLECTIONS[selectedCollection]?.prompts.map((prompt) => (
                <div
                  key={prompt.id}
                  className={`bg-gray-50 border border-gray-100 transition-all duration-500 ${
                    userModel?.trainingStatus === 'completed' 
                      ? 'cursor-pointer hover:border-black hover:shadow-lg hover:-translate-y-1' 
                      : 'opacity-60 cursor-default'
                  }`}
                  onClick={() => {
                    if (userModel?.trainingStatus === 'completed') {
                      generateFromPrompt(prompt);
                    }
                  }}
                >
                  {/* Image Placeholder Area - Ready for Collection Images */}
                  <div className="bg-gray-200 relative overflow-hidden" style={{ height: '200px' }}>
                    <div className="absolute inset-0 bg-black/20"></div>
                    
                    {/* Title Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white text-center px-4">
                        <div className="font-serif text-lg font-light tracking-[0.3em] uppercase">
                          {prompt.name.replace(/\s/g, ' ')}
                        </div>
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <div className={`px-2 py-1 text-xs font-light ${
                        userModel?.trainingStatus === 'completed' 
                          ? 'bg-white/90 text-black' 
                          : 'bg-white/70 text-gray-600'
                      }`}>
                        {userModel?.trainingStatus === 'completed' 
                          ? (generatingImages && selectedPrompt?.id === prompt.id ? 'Creating...' : 'Ready')
                          : 'Locked'
                        }
                      </div>
                    </div>
                  </div>
                  
                  {/* Card Content */}
                  <div className="p-6">
                    <div className="text-xs tracking-[0.2em] uppercase text-gray-500 mb-2">
                      {prompt.category}
                    </div>
                    <h3 className="font-serif text-lg font-light mb-3 leading-tight">
                      {prompt.name}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed font-light">
                      {prompt.description}
                    </p>
                  </div>
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