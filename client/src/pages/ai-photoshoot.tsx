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
        prompt: '[triggerword] woman standing at ocean edge, voluminous hair flowing with natural body and movement, arms raised to sky in release, waves washing over feet, wearing flowing linen button-down shirt and wide-leg cream trousers, overcast moody sky, muted color palette, emotional liberation moment, shot on Hasselblad X2D 100C with 90mm lens, natural ocean lighting with dramatic sky, healing journey photography, heavy 35mm film grain, matte textured skin, soft skin retouch, pronounced grain structure, authentic skin texture with visible pores, gentle facial refinement, editorial skin enhancement. Negative: shiny skin, glossy skin, fake skin, plastic-looking skin, over-processed skin'
      },
      {
        id: 'sunset-contemplation',
        name: 'Sunset Contemplation',
        category: 'Ocean Healing',
        description: "That golden hour magic where you're just... peaceful. Beach vibes, flowing dress, looking toward your future.",
        prompt: '[triggerword] woman sitting on beach at golden hour, voluminous hair flowing beautifully in ocean breeze with natural body and movement, white linen midi dress with subtle texture, looking at horizon, warm sunset glow on skin, peaceful expression, mindfulness moment, shot on Canon EOS R5 with 85mm f/1.2L lens, dramatic golden hour backlighting, coastal healing aesthetic, heavy 35mm film grain, matte textured skin, soft skin retouch, authentic grain pattern, visible pores and natural texture, gentle facial refinement, editorial skin enhancement. Negative: shiny skin, glossy skin, fake skin, plastic-looking skin, over-processed skin'
      },
      {
        id: 'wave-surrender',
        name: 'Wave Surrender',
        category: 'Ocean Healing',
        description: "The ultimate letting go shot. You're in the waves, dress flowing, completely surrendering to the healing power of water.",
        prompt: '[triggerword] woman in ocean waves, voluminous hair wild with salt water showing natural body and movement, white silk slip dress getting wet, arms spread in surrender, sunset backlighting, letting go moment, shot on Leica SL2 with 90mm APO-Summicron lens, dramatic sunset ocean lighting, therapeutic ocean photography, healing journey, heavy 35mm film grain, matte textured skin, soft skin retouch, raw film negative quality, visible grain structure and natural pores, gentle facial refinement, editorial skin enhancement. Negative: shiny skin, glossy skin, fake skin, plastic-looking skin, over-processed skin'
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
        description: "Sacred space vibes. Surrounded by candlelight, finding your center in the most beautiful healing sanctuary.",
        prompt: '[triggerword] woman in meditation pose, voluminous hair with natural body and movement, black ribbed bodysuit or fitted long-sleeve top, surrounded by candles, indoor zen space, warm candlelight glow on face, eyes closed in peace, healing sanctuary, shot on Sony A7R V with 85mm f/1.4 GM lens, intimate candlelight illumination, mindfulness photography, heavy 35mm film grain, matte textured skin, soft skin retouch, analog film photography aesthetic, natural skin imperfections and visible pores, gentle facial refinement, editorial skin enhancement. Negative: shiny skin, glossy skin, fake skin, plastic-looking skin, over-processed skin'
      },
      {
        id: 'morning-ritual',
        name: 'Morning Ritual',
        category: 'Inner Peace',
        description: "That quiet morning moment with tea and intention. Window light, plants, just you starting your day mindfully.",
        prompt: '[triggerword] woman in morning meditation, voluminous hair with natural body and movement, sitting by window with natural light, holding warm tea, peaceful expression, plants visible, cozy healing space, daily mindfulness practice, shot on Fujifilm GFX100S with 110mm f/2 lens, soft morning window lighting, wellness lifestyle, heavy 35mm film grain, matte textured skin, soft skin retouch, pronounced texture, authentic grain pattern and visible pores, gentle facial refinement, editorial skin enhancement. Negative: shiny skin, glossy skin, fake skin, plastic-looking skin, over-processed skin'
      },
      {
        id: 'forest-grounding',
        name: 'Forest Grounding',
        category: 'Nature Connection',
        description: "Connecting with Mother Earth. Standing among trees, touching bark, grounding yourself in nature's healing energy.",
        prompt: '[triggerword] woman standing among trees, voluminous hair with natural body and movement, touching tree trunk, earthing practice, wearing linen button-down shirt and wide-leg trousers in earth tones, dappled forest light, connection with nature, grounding energy, shot on Leica Q2 with 28mm f/1.7 lens, natural forest lighting with dappled shadows, forest therapy moment, heavy 35mm film grain, matte textured skin, soft skin retouch, film negative quality, visible grain structure and natural pores, gentle facial refinement, editorial skin enhancement. Negative: shiny skin, glossy skin, fake skin, plastic-looking skin, over-processed skin'
      },
      {
        id: 'yoga-flow',
        name: 'Yoga Flow',
        category: 'Movement Medicine',
        description: "Movement as medicine. Captured mid-flow, showing your strength and grace through mindful movement.",
        prompt: '[triggerword] woman in yoga pose, voluminous hair with natural body and movement, flowing movement captured, natural light studio, black ribbed bodysuit or fitted athletic wear, graceful strength, moving meditation, healing through movement, shot on Canon R6 Mark II with 35mm f/1.8 lens, soft natural studio lighting, wellness photography, heavy 35mm film grain, matte textured skin, soft skin retouch, authentic texture with visible pores, gentle facial refinement, editorial skin enhancement. Negative: shiny skin, glossy skin, fake skin, plastic-looking skin, over-processed skin'
      }
    ]
  },
  'effortless-chic': {
    id: 'effortless-chic',
    name: 'Effortless Chic',
    description: 'Authentic off-duty moments - imperfect hair, real expressions, actual living',
    preview: SandraImages.portraits.professional[1],
    prompts: [
      {
        id: 'morning-coffee-bed',
        name: 'Morning Coffee in Bed',
        category: 'Real Mornings',
        description: "That real morning moment - messy hair, oversized tee, coffee in bed, actually tired but beautiful.",
        prompt: '[triggerword] woman sitting cross-legged in unmade bed holding coffee mug, voluminous hair messy from sleep with natural body and movement, oversized vintage band t-shirt, bare legs, natural morning light streaming through window, authentic tired but content expression, shot on Fujifilm X100VI with 23mm lens, soft golden morning lighting, documentary lifestyle style, heavy 35mm film grain, matte textured skin, soft skin retouch, visible pores and natural texture, real life captured, authentic beauty. Negative: shiny skin, glossy skin, fake skin, plastic-looking skin, over-processed skin'
      },
      {
        id: 'laundromat-waiting',
        name: 'Laundromat Chronicles',
        category: 'Real Life Moments',
        description: "Waiting for laundry to finish, scrolling phone, hair in a messy topknot - real life but make it cinematic.",
        prompt: '[triggerword] woman sitting in laundromat chair looking at phone, voluminous hair in imperfect messy bun with pieces falling out, wearing oversized hoodie and leggings, laundry baskets and washing machines visible, fluorescent lighting mixed with natural light, candid moment, shot on Canon EOS R6 with 35mm f/1.8 lens, documentary street photography, heavy 35mm film grain, matte textured skin, soft skin retouch, visible pores and authentic texture, real mundane beauty, unposed lifestyle. Negative: shiny skin, glossy skin, fake skin, plastic-looking skin, over-processed skin'
      },
      {
        id: 'grocery-run-reality',
        name: 'Sunday Grocery Run',
        category: 'Authentic Errands',
        description: "Running errands but looking effortlessly put together - hair thrown up, comfortable clothes, real life energy.",
        prompt: '[triggerword] woman pushing shopping cart in grocery store, voluminous hair in quick messy bun secured with hair tie, wearing comfortable linen button-down and jeans, holding shopping list, natural fluorescent store lighting, genuine concentrated expression reading labels, shot on iPhone 15 Pro with portrait mode, candid lifestyle photography, heavy 35mm film grain, matte textured skin, soft skin retouch, visible pores and natural texture, real errands aesthetic, authentic daily life. Negative: shiny skin, glossy skin, fake skin, plastic-looking skin, over-processed skin'
      },
      {
        id: 'park-bench-call',
        name: 'Park Bench Phone Call',
        category: 'Between Moments',
        description: "Taking an important call in the park, hair blown by wind, gesturing while talking - caught in authentic conversation.",
        prompt: '[triggerword] woman sitting on park bench talking on phone, voluminous hair moving in natural breeze with authentic movement, wearing casual sweater and jeans, one hand gesturing while speaking, trees and park life blurred in background, natural afternoon lighting, genuine conversation expression, shot on Sony A7 IV with 50mm f/1.4 lens, street photography documentary style, heavy 35mm film grain, matte textured skin, soft skin retouch, visible pores and natural texture, real conversation captured, candid lifestyle. Negative: shiny skin, glossy skin, fake skin, plastic-looking skin, over-processed skin'
      },
      {
        id: 'subway-commute',
        name: 'Subway Commute Vibes',
        category: 'City Living',
        description: "Morning commute on the subway, reading or listening to music, that in-between moment of city life.",
        prompt: '[triggerword] woman sitting in subway train reading book or looking at phone, voluminous hair partially covered by beanie or scarf, wearing layered autumn clothes, other commuters blurred in background, artificial train lighting mixed with tunnel darkness, thoughtful commuter expression, shot on Canon EOS R5 with 85mm f/1.8 lens, urban documentary photography, heavy 35mm film grain, matte textured skin, soft skin retouch, visible pores and authentic texture, real commuter life, authentic city living. Negative: shiny skin, glossy skin, fake skin, plastic-looking skin, over-processed skin'
      },
      {
        id: 'cooking-at-home',
        name: 'Sunday Cooking Session',
        category: 'Home Life',
        description: "Actually cooking at home, hair up to stay out of face, flour on hands, real domestic goddess energy.",
        prompt: '[triggerword] woman cooking in kitchen with ingredients scattered on counter, voluminous hair secured in practical messy bun with bobby pins, wearing apron over casual clothes, flour dusted on hands and forearm, natural kitchen lighting from window, concentrated cooking expression, shot on Fujifilm X-T5 with 35mm f/1.4 lens, lifestyle documentary photography, heavy 35mm film grain, matte textured skin, soft skin retouch, visible pores and natural texture, real home cooking, authentic domestic life. Negative: shiny skin, glossy skin, fake skin, plastic-looking skin, over-processed skin'
      },
      {
        id: 'bookstore-browsing',
        name: 'Bookstore Discovery',
        category: 'Quiet Moments',
        description: "Lost in a bookstore, sitting on floor reading, hair falling in face, completely absorbed in discovery.",
        prompt: '[triggerword] woman sitting cross-legged on bookstore floor reading open book, voluminous hair falling naturally around face as she reads, wearing comfortable oversized sweater and jeans, bookshelves towering around her, warm bookstore lighting, completely absorbed reading expression, shot on Leica Q2 with 28mm f/1.7 lens, intimate documentary style, heavy 35mm film grain, matte textured skin, soft skin retouch, visible pores and authentic texture, real bookworm moment, authentic discovery. Negative: shiny skin, glossy skin, fake skin, plastic-looking skin, over-processed skin'
      },
      {
        id: 'window-rain-watching',
        name: 'Rainy Day Window',
        category: 'Contemplative Moments',
        description: "Watching rain through window, wrapped in blanket, that peaceful melancholy of rainy afternoons.",
        prompt: '[triggerword] woman sitting by window watching rain, voluminous hair loose and natural with gentle movement, wrapped in soft knit blanket, holding warm tea mug, raindrops on window glass, gray overcast natural lighting, peaceful contemplative expression, shot on Canon R6 Mark II with 50mm f/1.2L lens, intimate lifestyle photography, heavy 35mm film grain, matte textured skin, soft skin retouch, visible pores and natural texture, real rainy day mood, authentic quiet moments. Negative: shiny skin, glossy skin, fake skin, plastic-looking skin, over-processed skin'
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
        prompt: '[triggerword] woman leaning against limestone building, voluminous hair with natural body and movement, black tube top, vintage denim, small chain bag, one hand in pocket, looking away from camera, European architectural details, natural shadows on face, street style portrait, shot on Canon EOS R5, 50mm lens, heavy 35mm film grain, matte textured skin, soft skin retouch, visible pores and natural texture, natural facial refinement, editorial skin enhancement, film photography. Negative: shiny skin, glossy skin, fake skin, plastic-looking skin, over-processed skin'
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
        prompt: '[triggerword] woman profile silhouette against bright window, voluminous hair in elegant updo showing graceful neck curve, wrapped in blanket or oversized sweater, contemplative moment, black and white photography only, monochrome, no color, heavy 35mm film grain, matte textured skin, soft skin retouch, visible pores and natural texture, natural facial refinement, editorial skin enhancement, visible emotion in posture, raw documentary style. Negative: shiny skin, glossy skin, fake skin, plastic-looking skin, over-processed skin'
      },
      {
        id: 'against-the-wall',
        name: 'Against the Wall',
        category: 'Raw Moments',
        description: "Those overwhelming moments we all have. Forehead against the wall, real emotion, completely authentic.",
        prompt: '[triggerword] woman leaning forehead against textured wall, eyes closed, voluminous hair falling naturally with beautiful movement, wearing simple knit sweater, exhausted or overwhelmed posture, available light only, black and white intimate portrait only, monochrome, no color, heavy 35mm film grain, matte textured skin, soft skin retouch, visible pores and natural texture, natural facial refinement, editorial skin enhancement, unguarded moment. Negative: shiny skin, glossy skin, fake skin, plastic-looking skin, over-processed skin'
      },
      {
        id: 'morning-truth',
        name: 'Morning Truth',
        category: 'Raw Moments',
        description: "Honest morning beauty. No makeup, real hair, looking directly at the camera with complete authenticity.",
        prompt: '[triggerword] woman in bed looking directly at camera, no makeup, voluminous hair beautifully spread on pillow with natural body and movement, white sheets, natural morning vulnerability, black and white photography only, monochrome, no color, heavy 35mm film grain, matte textured skin, soft skin retouch, visible pores and natural texture, natural facial refinement, editorial skin enhancement, raw intimate portrait, honest beauty. Negative: shiny skin, glossy skin, fake skin, plastic-looking skin, over-processed skin'
      },
      {
        id: 'mirror-reflection',
        name: 'Mirror Reflection',
        category: 'Journey Portraits',
        description: "That moment of self-reflection. Looking at yourself in the mirror, questioning, growing, becoming.",
        prompt: '[triggerword] woman looking at self in bathroom mirror, voluminous hair with natural body and movement, hands on sink, questioning expression, simple clothing, harsh bathroom light, black and white self-confrontation portrait only, monochrome, no color, heavy 35mm film grain, matte textured skin, soft skin retouch, visible pores and natural texture, natural facial refinement, editorial skin enhancement, raw personal moment. Negative: shiny skin, glossy skin, fake skin, plastic-looking skin, over-processed skin'
      },
      {
        id: 'window-watcher',
        name: 'Window Watcher',
        category: 'Journey Portraits',
        description: "Contemplating life by the window. Coffee in hand, looking toward your future with hope and possibility.",
        prompt: '[triggerword] woman by window looking out, coffee cup in hands, voluminous messy hair with natural body and beautiful movement, oversized sweater, rain or city view outside, black and white melancholic portrait only, monochrome, no color, heavy 35mm film grain, matte textured skin, soft skin retouch, visible pores and natural texture, natural facial refinement, editorial skin enhancement, waiting or hoping. Negative: shiny skin, glossy skin, fake skin, plastic-looking skin, over-processed skin'
      },
      {
        id: 'walking-away',
        name: 'Walking Away',
        category: 'Transformation',
        description: "Powerful transformation shot. Walking away from what was, toward what's next. No looking back.",
        prompt: '[triggerword] woman walking away from camera down hallway or street, voluminous hair with natural body and movement, purposeful stride, looking forward not back, simple outfit, black and white documentary only, monochrome, no color, heavy 35mm film grain, matte textured skin, soft skin retouch, visible pores and natural texture, natural facial refinement, editorial skin enhancement, leaving the past behind. Negative: shiny skin, glossy skin, fake skin, plastic-looking skin, over-processed skin'
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
        prompt: '[triggerword] woman, voluminous hair in perfectly tousled messy bun with soft face-framing pieces, hair with natural body and movement, minimal makeup with glossy lips, bare shoulders, seamless gray backdrop, shot on Hasselblad X2D 100C, 90mm lens, single beauty dish lighting, black and white photography only, monochrome, no color, heavy 35mm film grain, matte textured skin, soft skin retouch, visible skin texture and natural pores, natural facial refinement, high fashion beauty portrait, editorial skin enhancement. Negative: shiny skin, glossy skin, fake skin, plastic-looking skin, over-processed skin'
      },
      {
        id: 'harpers-intimate',
        name: "Harper's Intimate Portrait",
        category: 'Studio Beauty',
        description: "Intimate Harper's Bazaar vibes. Looking over your shoulder, tousled hair, that effortless editorial beauty.",
        prompt: '[triggerword] woman, voluminous tousled hair with natural body and movement falling beautifully over shoulders, looking over bare shoulder, minimal jewelry, neutral backdrop, shot on Canon EOS R5, 85mm lens, soft window light from left, black and white editorial only, monochrome, no color, heavy 35mm film grain, matte textured skin, soft skin retouch, visible pores and natural texture, natural facial refinement, editorial skin enhancement, medium format aesthetic. Negative: shiny skin, glossy skin, fake skin, plastic-looking skin, over-processed skin'
      },
      {
        id: 'window-shadow-play',
        name: 'Window Shadow Play',
        category: 'Dramatic Lighting',
        description: "Dramatic light and shadow. Window blinds creating beautiful stripes across your face - pure artistic magic.",
        prompt: '[triggerword] woman, voluminous hair with natural body and texture, dramatic window blinds creating shadow stripes across face and body, eyes closed in serene expression, black slip dress, shot on Leica M11 Monochrom, 90mm lens, natural harsh light, high contrast black and white only, monochrome, no color, heavy 35mm film grain, matte textured skin, soft skin retouch, visible pores and natural texture, natural facial refinement, editorial skin enhancement, visible skin detail in light strips. Negative: shiny skin, glossy skin, fake skin, plastic-looking skin, over-processed skin'
      },
      {
        id: 'hair-toss-energy',
        name: 'Hair Toss Energy',
        category: 'Natural Movement',
        description: "That perfect hair flip moment. Natural movement, genuine expression, pure energy captured.",
        prompt: '[triggerword] woman, mid hair flip movement with voluminous hair showing natural body and bounce, natural motion blur in hair, black tank top, genuine expression, shot on Nikon Z9, 85mm lens, studio strobe to freeze motion, black and white action portrait only, monochrome, no color, heavy 35mm film grain, matte textured skin, soft skin retouch, visible pores and natural texture, natural facial refinement, editorial skin enhancement, authentic moment captured. Negative: shiny skin, glossy skin, fake skin, plastic-looking skin, over-processed skin'
      },
      {
        id: 'chair-authority',
        name: 'Chair Authority',
        category: 'Editorial Power',
        description: "Boss lady energy. Sitting backwards on a chair with that direct, powerful gaze that says you mean business.",
        prompt: '[triggerword] woman sitting backwards on chair, voluminous hair with natural body and movement, arms resting on chair back, black outfit, direct powerful gaze, shot on Phase One XF IQ4, 80mm lens, dramatic studio lighting, black and white power portrait only, monochrome, no color, heavy 35mm film grain, matte textured skin, soft skin retouch, visible pores and natural texture, natural facial refinement, editorial skin enhancement, strong presence, editorial fashion. Negative: shiny skin, glossy skin, fake skin, plastic-looking skin, over-processed skin'
      },
      {
        id: 'freckles-texture',
        name: 'Freckles and Texture',
        category: 'Beauty Close-ups',
        description: "Extreme close-up beauty. Every freckle, every pore, natural texture - celebrating real, unfiltered beauty.",
        prompt: '[triggerword] woman, extreme close-up beauty shot, voluminous hair in tousled messy bun with loose face-framing strands, natural freckles visible, glossy lips slightly parted, shot on Phase One XF IQ4 with 120mm macro lens, ring light, black and white beauty portrait only, monochrome, no color, heavy 35mm film grain, matte textured skin, soft skin retouch, visible pores and natural texture, natural facial refinement, editorial skin enhancement, natural skin texture celebrated. Negative: shiny skin, glossy skin, fake skin, plastic-looking skin, over-processed skin'
      }
    ]
  },
  'golden-hour': {
    id: 'golden-hour',
    name: 'Golden Hour Magic',
    description: 'Dreamy golden light portraits - sunset fields, warm backlighting, ethereal beauty',
    preview: SandraImages.portraits.editorial[0],
    prompts: [
      {
        id: 'sunset-field-walk',
        name: 'Sunset Field Walk',
        category: 'Magic Hour',
        description: "Walking through fields at golden hour, hair flowing in evening breeze, pure magic light wrapping around you.",
        prompt: '[triggerword] woman walking through tall grass field at sunset, voluminous hair flowing naturally in warm evening breeze with beautiful movement, wearing flowing white or cream linen dress, golden hour backlighting creating rim light around hair and silhouette, lens flare from low sun, peaceful expression, shot on Canon EOS R5 with 85mm f/1.4L lens, dramatic golden hour lighting, dreamy film aesthetic, heavy 35mm film grain, matte textured skin, soft skin retouch, visible pores and natural texture, ethereal beauty, authentic golden moment. Negative: shiny skin, glossy skin, fake skin, plastic-looking skin, over-processed skin'
      },
      {
        id: 'rooftop-golden-glow',
        name: 'Rooftop Golden Glow',
        category: 'Urban Sunset',
        description: "On a rooftop as the sun sets over the city, hair catching golden light, that perfect dreamy urban moment.",
        prompt: '[triggerword] woman standing on rooftop at golden hour with city skyline behind, voluminous hair illuminated by warm sunset light with natural movement, wearing simple black or white top, arms relaxed at sides, peaceful expression looking toward sunset, golden rim lighting on hair and skin, shot on Sony A7R V with 50mm f/1.4 lens, dramatic urban sunset lighting, cinematic golden hour mood, heavy 35mm film grain, matte textured skin, soft skin retouch, visible pores and natural texture, urban goddess energy, authentic sunset moment. Negative: shiny skin, glossy skin, fake skin, plastic-looking skin, over-processed skin'
      },
      {
        id: 'beach-sunset-silhouette',
        name: 'Beach Sunset Silhouette',
        category: 'Coastal Golden Hour',
        description: "Beach at sunset, waves and golden light, hair wild from ocean breeze - pure coastal goddess energy.",
        prompt: '[triggerword] woman standing at beach edge during sunset, voluminous hair wild and flowing from ocean breeze with dramatic movement, wearing flowing white dress or simple top, waves washing around feet, golden sun low on horizon creating dramatic backlighting, silhouette with golden rim light, shot on Fujifilm GFX100S with 63mm f/2.8 lens, epic coastal sunset lighting, romantic beach aesthetic, heavy 35mm film grain, matte textured skin, soft skin retouch, visible pores and natural texture, coastal goddess vibes, authentic ocean sunset. Negative: shiny skin, glossy skin, fake skin, plastic-looking skin, over-processed skin'
      },
      {
        id: 'flower-field-dreams',
        name: 'Flower Field Dreams',
        category: 'Natural Beauty',
        description: "In a wildflower field at golden hour, sitting among flowers, hair catching warm light, pure ethereal beauty.",
        prompt: '[triggerword] woman sitting in wildflower field at golden hour, voluminous hair with natural body flowing around shoulders, wearing soft white or cream dress, surrounded by colorful wildflowers, golden hour light filtering through, peaceful contemplative expression, shot on Leica SL2 with 90mm APO-Summicron lens, dreamy field lighting with warm glow, romantic nature aesthetic, heavy 35mm film grain, matte textured skin, soft skin retouch, visible pores and natural texture, flower goddess energy, authentic field moment. Negative: shiny skin, glossy skin, fake skin, plastic-looking skin, over-processed skin'
      },
      {
        id: 'golden-window-light',
        name: 'Golden Window Light',
        category: 'Indoor Golden Hour',
        description: "Sitting by window as golden hour light streams in, hair illuminated like a halo, peaceful and dreamy.",
        prompt: '[triggerword] woman sitting by large window during golden hour, voluminous hair backlit by warm golden window light with ethereal glow, wearing simple white or cream top, light streaming across face and body, peaceful expression looking toward light, dust particles visible in golden rays, shot on Canon R6 Mark II with 50mm f/1.2L lens, magical indoor golden hour lighting, dreamy window light aesthetic, heavy 35mm film grain, matte textured skin, soft skin retouch, visible pores and natural texture, ethereal indoor beauty, authentic golden light moment. Negative: shiny skin, glossy skin, fake skin, plastic-looking skin, over-processed skin'
      },
      {
        id: 'sunset-car-windows',
        name: 'Sunset Road Trip',
        category: 'Travel Golden Hour',
        description: "In car during golden hour road trip, hair flowing from open windows, that dreamy travel moment.",
        prompt: '[triggerword] woman in passenger seat of car during golden hour, voluminous hair flowing from open windows with natural movement, wearing casual road trip clothes, golden sunset light streaming through windows, peaceful expression looking out at landscape, hand resting on window frame, shot on iPhone 15 Pro with portrait mode, road trip golden hour aesthetic, casual travel beauty, heavy 35mm film grain, matte textured skin, soft skin retouch, visible pores and natural texture, travel goddess vibes, authentic road trip moment. Negative: shiny skin, glossy skin, fake skin, plastic-looking skin, over-processed skin'
      }
    ]
  },
  'raw-beauty': {
    id: 'raw-beauty',
    name: 'Raw Beauty',
    description: 'Unfiltered authentic moments - natural textures, real emotions, honest beauty',
    preview: SandraImages.portraits.casual[1],
    prompts: [
      {
        id: 'fresh-from-shower',
        name: 'Fresh From Shower',
        category: 'Natural Moments',
        description: "Just out of the shower, hair damp and natural, skin glowing, wrapped in soft towel - pure authentic beauty.",
        prompt: '[triggerword] woman just out of shower with damp voluminous hair in natural wet texture with beautiful movement, minimal or no makeup, dewy fresh skin, wrapped in soft white towel, natural bathroom lighting, genuine fresh expression, water droplets on shoulders, shot on Fujifilm X-T5 with 35mm f/1.4 lens, soft natural bathroom light, intimate fresh moment, heavy 35mm film grain, matte textured skin, soft skin retouch, visible pores and natural texture, authentic fresh beauty, honest shower moment. Negative: shiny skin, glossy skin, fake skin, plastic-looking skin, over-processed skin'
      },
      {
        id: 'morning-stretches',
        name: 'Morning Stretch Ritual',
        category: 'Authentic Mornings',
        description: "Natural morning stretching in soft light, hair messy from sleep, body in gentle movement - real morning energy.",
        prompt: '[triggerword] woman doing gentle morning stretches by window, voluminous hair messy from sleep with natural movement, wearing comfortable oversized t-shirt or tank, arms stretched above head or in yoga pose, natural morning light, authentic tired but peaceful expression, shot on Canon EOS R6 with 35mm f/1.8 lens, soft morning window lighting, intimate morning ritual, heavy 35mm film grain, matte textured skin, soft skin retouch, visible pores and natural texture, authentic morning beauty, real wake-up moment. Negative: shiny skin, glossy skin, fake skin, plastic-looking skin, over-processed skin'
      },
      {
        id: 'laughing-candid',
        name: 'Genuine Laughter',
        category: 'Real Emotions',
        description: "Caught in genuine laughter, hair moving with expression, eyes crinkled with joy - pure authentic happiness.",
        prompt: '[triggerword] woman in genuine laughter moment, voluminous hair moving naturally with laughter with beautiful bounce, wearing casual comfortable clothes, eyes crinkled with real joy, mouth open in authentic laugh, natural lighting, completely unguarded happy expression, shot on Sony A7 IV with 50mm f/1.4 lens, candid documentary lighting, authentic joy capture, heavy 35mm film grain, matte textured skin, soft skin retouch, visible pores and natural texture, real happiness beauty, honest laughter moment. Negative: shiny skin, glossy skin, fake skin, plastic-looking skin, over-processed skin'
      },
      {
        id: 'wind-blown-natural',
        name: 'Wind-Blown Natural',
        category: 'Natural Elements',
        description: "Hair completely wild from wind, natural unposed moment, authentic connection with the elements.",
        prompt: '[triggerword] woman with voluminous hair completely wild and wind-blown with dramatic natural movement, wearing simple casual clothes, hair whipping across face, genuine expression dealing with wind, outdoor natural setting, strong natural lighting, authentic unposed moment, shot on Leica Q2 with 28mm f/1.7 lens, dramatic wind photography, raw natural energy, heavy 35mm film grain, matte textured skin, soft skin retouch, visible pores and natural texture, wild natural beauty, authentic wind moment. Negative: shiny skin, glossy skin, fake skin, plastic-looking skin, over-processed skin'
      },
      {
        id: 'tired-but-beautiful',
        name: 'Tired But Beautiful',
        category: 'Honest Moments',
        description: "Those exhausted but beautiful moments - real tiredness but still radiant, authentic human experience.",
        prompt: '[triggerword] woman looking genuinely tired but beautiful, voluminous hair slightly messy with natural texture and movement, wearing comfortable casual clothes, authentic tired expression with gentle eyes, natural lighting, real exhaustion but peaceful, leaning against wall or sitting, shot on Canon R6 Mark II with 50mm f/1.2L lens, soft natural portrait lighting, honest tired beauty, heavy 35mm film grain, matte textured skin, soft skin retouch, visible pores and natural texture, authentic tiredness beauty, real human moment. Negative: shiny skin, glossy skin, fake skin, plastic-looking skin, over-processed skin'
      },
      {
        id: 'freckles-and-texture',
        name: 'Freckles & Natural Texture',
        category: 'Texture Celebration',
        description: "Close-up celebrating natural skin texture, freckles, real pores - authentic skin beauty in all its glory.",
        prompt: '[triggerword] woman in close-up portrait showing natural skin texture, voluminous hair with natural body and movement framing face, visible freckles and natural skin texture, minimal or no makeup, natural pores and skin details celebrated, authentic gentle expression, natural lighting, shot on Phase One XF IQ4 with 120mm macro lens, intimate skin texture photography, real texture celebration, heavy 35mm film grain, matte textured skin, soft skin retouch, visible pores and natural texture emphasized, authentic skin beauty, honest texture moment. Negative: shiny skin, glossy skin, fake skin, plastic-looking skin, over-processed skin'
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