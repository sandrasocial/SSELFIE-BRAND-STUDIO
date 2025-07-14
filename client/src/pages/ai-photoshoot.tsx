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
    name: 'STREET DOCUMENTARY',
    subtitle: 'Urban Confidence',
    description: 'Candid moments of moving through the world with quiet authority - street photography that captures authentic confidence',
    preview: SandraImages.portraits.professional[0],
    prompts: [
      {
        id: 'copenhagen-bike-commute',
        name: 'Copenhagen Commute',
        category: 'Urban Movement',
        description: 'Cycling through the city with effortless grace - sustainable luxury in motion',
        prompt: 'raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, [triggerword], woman cycling vintage bicycle through Copenhagen streets, wearing tailored wool coat and leather crossbody bag, colorful Nordic buildings in background, natural confident expression, hair moving gently in breeze, minimal gold jewelry, shot on Leica Q2 with 28mm f/1.7 lens, street photography style, natural daylight, Scandinavian urban aesthetic'
      },
      {
        id: 'milan-fashion-walk',
        name: 'Milan Fashion District',
        category: 'Style in Motion',
        description: 'Walking through the fashion capital with innate style - where elegance meets everyday',
        prompt: 'raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, [triggerword], woman in elevated basics walking through Milano fashion district, long camel coat and designer accessories, Italian architecture backdrop, natural purposeful stride, serene focused expression, hair styled effortlessly, shot on Canon EOS R5 with 85mm f/1.4 lens, street fashion photography, golden hour lighting, Italian elegance aesthetic'
      },
      {
        id: 'london-crosswalk-moment',
        name: 'London Crosswalk',
        category: 'City Navigation',
        description: 'Navigating the city with quiet confidence - urban moments that feel cinematic',
        prompt: 'raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, [triggerword], woman in trench coat crossing busy London street, classic British architecture background, natural determined expression while navigating crosswalk, minimal scarf and leather boots, hair moving with city breeze, shot on Fujifilm GFX 100S with 63mm f/2.8 lens, documentary street photography, overcast natural lighting, British urban aesthetic'
      },
      {
        id: 'paris-metro-entrance',
        name: 'Parisian Metro',
        category: 'Transit Elegance',
        description: 'Even the mundane becomes elegant - French sophistication in everyday moments',
        prompt: 'raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, [triggerword], woman in neutral turtleneck and tailored coat descending into Parisian metro station, Art Nouveau metro entrance visible, contemplative expression while moving through transit, minimal jewelry and structured bag, natural confident posture, shot on Leica M11 with 50mm f/1.4 lens, urban documentary photography, soft Paris lighting, French metropolitan aesthetic'
      },
      {
        id: 'brooklyn-bridge-walk',
        name: 'Bridge Crossing',
        category: 'Urban Exploration',
        description: 'Taking the longer route for the better view - finding beauty in city infrastructure',
        prompt: 'raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, [triggerword], woman in wool sweater and jeans walking across urban bridge, city skyline in background, peaceful expression while taking in views, hair in natural loose style, hands in coat pockets, shot on Sony A7R IV with 70-200mm f/2.8 lens, bridge photography, golden hour lighting, metropolitan lifestyle aesthetic'
      },
      {
        id: 'stockholm-old-town',
        name: 'Stockholm Gamla Stan',
        category: 'Historic Wandering',
        description: 'Moving through cobblestone streets with timeless grace - where history meets modernity',
        prompt: 'raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, [triggerword], woman in Scandinavian minimalist outfit walking through Stockholm old town cobblestone streets, colorful medieval buildings backdrop, serene expression while exploring, minimal Nordic styling, natural confident stride, shot on Canon EOS R6 with 50mm f/1.2 lens, historic street photography, Nordic natural lighting, Swedish heritage aesthetic'
      },
      {
        id: 'rainy-amsterdam-umbrella',
        name: 'Amsterdam Rain',
        category: 'Weather Elegance',
        description: 'Even rainy days look elegant when you move with intention and style',
        prompt: 'raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, [triggerword], woman with classic black umbrella walking along Amsterdam canal, wearing long wool coat and leather boots, Dutch canal houses reflected in rain puddles, peaceful expression despite weather, hair protected under umbrella, shot on Fujifilm X-T5 with 35mm f/1.4 lens, rainy day photography, soft overcast lighting, Dutch urban resilience aesthetic'
      },
      {
        id: 'barcelona-morning-market',
        name: 'Barcelona Market Walk',
        category: 'Local Exploration',
        description: 'Navigating local markets with curiosity and confidence - where culture meets cuisine',
        prompt: 'raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, [triggerword], woman in linen shirt walking through Barcelona morning market, colorful produce stalls and Spanish architecture, natural interested expression while observing local life, woven market bag in hand, minimal Mediterranean styling, shot on Leica SL2 with 90mm f/2 lens, market documentary photography, warm morning light, Spanish cultural immersion aesthetic'
      },
      {
        id: 'tokyo-shibuya-crossing',
        name: 'Tokyo Navigation',
        category: 'Cultural Adaptation',
        description: 'Moving through foreign spaces with quiet confidence - cultural exploration with grace',
        prompt: 'raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, [triggerword], woman in minimalist black outfit navigating Tokyo crosswalk, neon signs and urban energy in background, calm focused expression amid city chaos, sleek modern styling, hair in simple elegant style, shot on Sony A7R V with 85mm f/1.4 lens, urban crowd photography, neon-lit evening atmosphere, metropolitan confidence aesthetic'
      },
      {
        id: 'edinburgh-royal-mile',
        name: 'Edinburgh Heritage',
        category: 'Historic Cities',
        description: 'Walking through centuries of history with contemporary confidence',
        prompt: 'raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, [triggerword], woman in tartan scarf and wool coat walking down Edinburgh Royal Mile, historic Scottish architecture surrounding, thoughtful expression while appreciating heritage, natural windswept hair, traditional yet modern styling, shot on Nikon Z9 with 24-70mm f/2.8 lens, heritage street photography, Scottish natural lighting, Celtic urban exploration aesthetic'
      },
      {
        id: 'vancouver-seawall-stroll',
        name: 'Coastal City Walk',
        category: 'Nature Meets Urban',
        description: 'Where city meets sea - finding harmony between urban and natural worlds',
        prompt: 'raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, [triggerword], woman in layered neutral clothing walking along Vancouver seawall, mountains and water visible in background, peaceful expression while enjoying coastal breeze, hair moving naturally in ocean air, comfortable walking shoes and crossbody bag, shot on Canon EOS R5 with 70-200mm f/2.8 lens, coastal urban photography, Pacific Northwest lighting, maritime city aesthetic'
      },
      {
        id: 'zurich-tram-commute',
        name: 'Swiss Precision',
        category: 'Efficient Movement',
        description: 'Moving through the city with Swiss precision and understated luxury',
        prompt: 'raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, [triggerword], woman in quality basics waiting for Zurich tram, Swiss Alps visible in distance, composed expression while commuting efficiently, minimal luxury accessories, hair in neat natural style, shot on Fujifilm GFX 50S with 110mm f/2 lens, Swiss urban photography, clean Alpine lighting, efficient luxury lifestyle aesthetic'
      }
    ]
  },
  'lifestyle-editorial': {
    id: 'lifestyle-editorial',
    name: 'LIFESTYLE EDITORIAL',
    subtitle: 'Elevated Everyday',
    description: 'Effortlessly elevated moments from a life well-lived - European sophistication meets everyday luxury',
    preview: SandraImages.portraits.professional[3],
    prompts: [
      {
        id: 'morning-coffee-ritual',
        name: 'Morning Coffee Ritual',
        category: 'Daily Moments',
        description: 'The quiet luxury of a perfect morning - simplicity elevated to art',
        prompt: 'raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, [triggerword], woman in oversized cream cashmere sweater holding ceramic coffee mug by large window, soft morning light streaming through sheer curtains, minimal Scandinavian interior with natural wood and white walls, serene contemplative expression, effortless tousled hair, sitting in modern chair, shot on Leica Q2 with 28mm f/1.7 lens, natural window lighting, hygge lifestyle photography, cozy home aesthetic, morning ritual vibes'
      },
      {
        id: 'parisian-cafe-afternoon',
        name: 'Café Afternoon',
        category: 'Urban Elegance',
        description: 'Lost in thought at your favorite café - where time moves differently',
        prompt: 'raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, [triggerword], woman in neutral turtleneck and tailored coat sitting at marble café table, Parisian street visible through large windows, soft afternoon light filtering in, thoughtful distant gaze, minimal gold jewelry, espresso cup and leather notebook on table, shot on Canon EOS R5 with 85mm f/1.4 lens, café window lighting, European lifestyle photography, urban sophistication aesthetic'
      },
      {
        id: 'london-walk-golden-hour',
        name: 'London Golden Hour',
        category: 'City Wandering',
        description: 'Evening stroll through the city - finding beauty in urban moments',
        prompt: 'raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, [triggerword], woman in long wool coat walking down tree-lined London street during golden hour, soft natural light catching her profile, peaceful contemplative expression, hair moving gently in breeze, minimal scarf and leather boots, shot on Fujifilm GFX 100S with 63mm f/2.8 lens, golden hour street photography, European urban aesthetic, natural city wandering vibes'
      },
      {
        id: 'home-cooking-ritual',
        name: 'Cooking at Home',
        category: 'Domestic Luxury',
        description: 'Creating something beautiful in your kitchen - everyday moments made precious',
        prompt: 'raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, [triggerword], woman in linen apron preparing fresh ingredients in bright minimalist kitchen, white marble counters and wooden cutting boards, soft natural focus while cooking, sleeves casually rolled up, hair loosely tied back, shot on Sony A7R IV with 50mm f/1.2 lens, kitchen lifestyle photography, natural home lighting, culinary minimalism aesthetic'
      },
      {
        id: 'bookstore-browsing',
        name: 'Literary Wandering',
        category: 'Cultural Moments',
        description: 'Discovering your next favorite book - intellectual curiosity in beautiful spaces',
        prompt: 'raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, [triggerword], woman in soft cardigan browsing books in independent bookstore, warm afternoon light filtering through tall windows, gentle contemplative expression while reading book spine, minimal accessories, stacks of books and cozy reading nooks around, shot on Leica M11 with 50mm f/1.4 lens, bookstore ambient lighting, literary lifestyle photography, intellectual curiosity aesthetic'
      },
      {
        id: 'milan-shopping-stroll',
        name: 'Milan Shopping',
        category: 'Fashion Moments',
        description: 'Curating your wardrobe in the fashion capital - where style meets intention',
        prompt: 'raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, [triggerword], woman in elevated basics examining beautiful garment in Milano boutique, soft retail lighting highlighting textures, focused expression while appreciating quality, elegant posture, designer bag and minimal jewelry, shot on Canon EOS R6 with 85mm f/1.2 lens, boutique lifestyle photography, luxury retail lighting, Italian fashion aesthetic'
      },
      {
        id: 'iceland-nature-moment',
        name: 'Nordic Nature',
        category: 'Natural Beauty',
        description: 'Finding solitude in stunning landscapes - where nature meets sophisticated style',
        prompt: 'raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, [triggerword], woman in wool coat and cashmere scarf standing beside Icelandic landscape, dramatic natural lighting from Nordic sky, serene expression while taking in vast beauty, hair moving in fresh air, minimal but warm styling, shot on Fujifilm X-T5 with 35mm f/1.4 lens, Nordic landscape photography, natural dramatic lighting, Scandinavian outdoor aesthetic'
      },
      {
        id: 'norwegian-fjord-reflection',
        name: 'Fjord Contemplation',
        category: 'Peaceful Moments',
        description: 'Silent moments by the water - where thoughts become clearer',
        prompt: 'raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, [triggerword], woman in neutral knit sweater sitting by Norwegian fjord, soft Nordic light reflecting on water, peaceful introspective expression, hair in relaxed natural style, hands wrapped around warm drink, shot on Leica SL2 with 90mm f/2 lens, fjord lifestyle photography, natural reflection lighting, Norwegian tranquility aesthetic'
      },
      {
        id: 'evening-bath-ritual',
        name: 'Evening Ritual',
        category: 'Self-Care Luxury',
        description: 'The luxury of time for yourself - evening rituals as meditation',
        prompt: 'raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, [triggerword], woman in silk robe preparing evening bath in marble bathroom, soft candlelight creating warm glow, peaceful expression while adding oils to water, hair in loose low bun, minimal luxury bath products arranged aesthetically, shot on Sony A7R V with 85mm f/1.4 lens, bathroom candlelight photography, intimate spa lighting, self-care luxury aesthetic'
      },
      {
        id: 'morning-yoga-practice',
        name: 'Morning Movement',
        category: 'Wellness Ritual',
        description: 'Starting the day with intention - mindful movement in beautiful light',
        prompt: 'raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, [triggerword], woman in neutral yoga wear practicing gentle stretches by large window, morning light filtering through sheer curtains, serene focused expression, hair in simple natural style, minimal room with plants and natural textures, shot on Canon EOS R5 with 50mm f/1.2 lens, wellness lifestyle photography, soft morning light, mindful living aesthetic'
      },
      {
        id: 'weekend-market-flowers',
        name: 'Fresh Flowers',
        category: 'Weekend Rituals',
        description: 'Choosing flowers for your home - small luxuries that elevate everyday life',
        prompt: 'raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, [triggerword], woman in cream sweater selecting white peonies at European flower market, soft natural morning light, gentle concentration while choosing blooms, woven basket with other flowers, minimal jewelry and natural styling, shot on Fujifilm GFX 50S with 110mm f/2 lens, flower market photography, natural outdoor lighting, botanical lifestyle aesthetic'
      },
      {
        id: 'cozy-reading-afternoon',
        name: 'Reading Corner',
        category: 'Quiet Luxury',
        description: 'Sunday afternoon with a good book - the luxury of uninterrupted time',
        prompt: 'raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, [triggerword], woman in soft knit sweater reading book in cozy corner with throw blanket, natural light from window creating soft shadows, peaceful absorbed expression, hair in relaxed style, tea cup on side table, shot on Leica Q2 Monochrom with natural lighting, hygge lifestyle photography, cozy home aesthetic, reading sanctuary vibes'
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