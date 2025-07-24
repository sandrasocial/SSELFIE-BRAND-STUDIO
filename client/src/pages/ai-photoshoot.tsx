import React, { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
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
    name: 'HEALING MINDSET',
    subtitle: 'Phoenix Rising',
    description: 'The quiet strength of a woman who rebuilt herself - capturing the beauty of healing and the power of rising',
    preview: SandraImages.portraits.professional[2],
    prompts: [
      {
        id: 'morning-meditation-solitude',
        name: 'Morning Solitude',
        category: 'Inner Peace',
        description: 'Finding stillness in the storm - the morning ritual that saved your sanity',
        prompt: 'film photograph, natural film grain, [triggerword], woman in soft neutral clothing sitting in meditation pose by large window, morning light gently illuminating her peaceful face, eyes closed in deep contemplation, natural untouched beauty, hair in simple loose style, hands resting gently, shot on Leica Q2 with 28mm f/1.7 lens, meditation photography, soft morning lighting, inner peace aesthetic'
      },
      {
        id: 'ocean-therapy-walk',
        name: 'Ocean Healing',
        category: 'Nature Therapy',
        description: 'Where the ocean became your therapist - finding peace in endless horizons',
        prompt: 'film photograph, natural film grain, [triggerword], woman in flowing linen dress walking alone on empty beach at dawn, ocean waves gently reaching shore, contemplative expression while processing thoughts, hair moving naturally in sea breeze, bare feet in sand, shot on Canon EOS R5 with 85mm f/1.4 lens, ocean therapy photography, golden dawn lighting, healing solitude aesthetic'
      },
      {
        id: 'journal-writing-ritual',
        name: 'Truth on Paper',
        category: 'Emotional Release',
        description: 'Writing your way through the pain - where honesty becomes healing',
        prompt: 'film photograph, natural film grain, [triggerword], woman in oversized cashmere sweater writing in leather journal at wooden table, soft afternoon light streaming through window, focused expression while processing emotions through words, minimal makeup revealing natural features, hair naturally falling around face, shot on Fujifilm GFX 100S with 63mm f/2.8 lens, journaling photography, natural writing light, emotional processing aesthetic'
      },
      {
        id: 'therapy-session-breakthrough',
        name: 'Breakthrough Moment',
        category: 'Professional Healing',
        description: 'The session where everything clicked - when vulnerability became strength',
        prompt: 'film photograph, natural film grain, [triggerword], woman in comfortable clothing sitting in therapy chair, soft natural light from office window, genuine expression of realization and understanding, hands clasped thoughtfully, natural beauty without artifice, shot on Sony A7R IV with 50mm f/1.2 lens, therapy session photography, soft office lighting, healing breakthrough aesthetic'
      },
      {
        id: 'single-mom-bedtime-strength',
        name: 'Bedtime Strength',
        category: 'Maternal Resilience',
        description: 'After tucking them in - the quiet moment when you realize how strong you really are',
        prompt: 'film photograph, natural film grain, [triggerword], woman in soft pajamas sitting on edge of child\'s bed after bedtime story, gentle nightlight creating warm glow, peaceful expression of maternal strength, natural beauty in domestic moment, hair in relaxed evening style, shot on Leica M11 with 50mm f/1.4 lens, maternal strength photography, warm evening lighting, single mother resilience aesthetic'
      },
      {
        id: 'mirror-self-acceptance',
        name: 'Mirror Truth',
        category: 'Self-Acceptance',
        description: 'Looking in the mirror and finally seeing your worth - the moment everything changed',
        prompt: 'film photograph, natural film grain, [triggerword], woman looking at herself in bathroom mirror with gentle acceptance, soft natural light from window, genuine expression of self-recognition and worth, no makeup revealing natural beauty, hair in honest morning state, shot on Canon EOS R6 with 85mm f/1.2 lens, self-acceptance photography, natural bathroom lighting, authentic self-love aesthetic'
      },
      {
        id: 'forest-therapy-walk',
        name: 'Forest Healing',
        category: 'Nature Connection',
        description: 'When trees became your teachers - finding wisdom in ancient growth',
        prompt: 'film photograph, natural film grain, [triggerword], woman in earth-toned layers walking slowly through forest path, dappled sunlight filtering through trees, serene expression while connecting with nature, natural windswept hair, hands touching tree bark gently, shot on Fujifilm X-T5 with 35mm f/1.4 lens, forest therapy photography, natural woodland lighting, earth connection aesthetic'
      },
      {
        id: 'crying-release-moment',
        name: 'Sacred Tears',
        category: 'Emotional Honesty',
        description: 'The tears that washed away the old you - sacred release of what no longer serves',
        prompt: 'film photograph, natural film grain, [triggerword], woman in soft clothing allowing tears to flow naturally, sitting by window with gentle light, vulnerable expression of emotional release, natural beauty in raw moment, hair naturally framing face, shot on Leica SL2 with 90mm f/2 lens, emotional release photography, soft natural lighting, vulnerable healing aesthetic'
      },
      {
        id: 'book-wisdom-absorption',
        name: 'Wisdom Gathering',
        category: 'Learning to Heal',
        description: 'Finding answers in pages - when books became your healing guides',
        prompt: 'film photograph, natural film grain, [triggerword], woman in cozy reading nook surrounded by self-help and healing books, soft reading light creating warm atmosphere, contemplative expression while absorbing wisdom, natural beauty in learning moment, hair in comfortable reading style, shot on Sony A7R V with 85mm f/1.4 lens, reading for healing photography, warm lamp lighting, knowledge seeking aesthetic'
      },
      {
        id: 'phoenix-rising-portrait',
        name: 'Phoenix Rising',
        category: 'Transformation',
        description: 'The woman you became after the fire - stronger, wiser, unbreakable',
        prompt: 'film photograph, natural film grain, [triggerword], woman in flowing white clothing standing in golden field at sunset, powerful yet serene expression of transformation, hair flowing in evening breeze, arms slightly outstretched feeling freedom, natural radiant beauty, shot on Canon EOS R5 with 70-200mm f/2.8 lens, transformation photography, golden hour lighting, phoenix rising aesthetic'
      },
      {
        id: 'new-beginning-sunrise',
        name: 'New Dawn',
        category: 'Fresh Starts',
        description: 'Watching the sunrise with new eyes - when hope returned to your heart',
        prompt: 'film photograph, natural film grain, [triggerword], woman in warm sweater watching sunrise from mountain viewpoint, soft golden light illuminating hopeful expression, natural beauty in moment of renewal, hair gently moved by morning breeze, hands wrapped around coffee mug, shot on Fujifilm GFX 50S with 110mm f/2 lens, sunrise hope photography, golden dawn lighting, new beginning aesthetic'
      },
      {
        id: 'strength-in-stillness',
        name: 'Stillness Strength',
        category: 'Inner Power',
        description: 'The power you found in stillness - when silence became your superpower',
        prompt: 'film photograph, natural film grain, [triggerword], woman sitting in peaceful meditation in minimalist room, soft natural light creating gentle shadows, expression of deep inner strength and peace, natural beauty in contemplative moment, hair in simple natural style, shot on Leica Q2 Monochrom with natural lighting, inner strength photography, peaceful lighting, quiet power aesthetic'
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
        prompt: '[triggerword] woman long dark hair swept over one shoulder, direct powerful gaze at camera, wearing black off-shoulder blazer, minimal gold jewelry, pure white backdrop, shot on Hasselblad H6D-100c with 80mm lens f/2.8, beauty dish with fill light, film photograph, natural film grain, transformative strength editorial portrait'
      },
      {
        id: 'elle-confidence-rebirth',
        name: 'ELLE Confidence Rebirth',
        category: 'Magazine Covers',
        description: "That little knowing smile because you've figured it out. Natural waves, silk cami, pure confidence.",
        prompt: '[triggerword] woman long dark hair natural waves, slight smile knowing expression, wearing simple black silk camisole, no excessive jewelry, soft gray seamless background, shot on Canon 5DS R with 85mm f/1.2L lens, window light with silver reflector, film photograph, natural film grain, quiet confidence portrait'
      },
      {
        id: 'harpers-bazaar-phoenix',
        name: "HARPER'S BAZAAR Phoenix",
        category: 'Magazine Covers',
        description: "CEO energy in that perfect suit. Hair sleek, posture strong, ready to take on the world.",
        prompt: '[triggerword] woman long sleek dark hair center part, three-quarter turn strong posture, wearing structured black suit jacket deep V, layered delicate necklaces, neutral beige backdrop, shot on Phase One XF IQ4 150MP with 110mm lens f/2.8, three-point studio lighting, film photograph, natural skin visible, film grain, unretouched power, magazine cover editorial'
      },
      {
        id: 'marie-claire-survivor',
        name: 'MARIE CLAIRE Survivor',
        category: 'Magazine Covers',
        description: "When you've been through it all and came out stronger. Tousled hair, cashmere comfort, unshakeable determination.",
        prompt: '[triggerword] woman long dark tousled hair, looking past camera with determination, wearing black cashmere turtleneck, single gold ring visible, warm white background, shot on Leica S3 with 70mm Summarit-S f/2.5, soft continuous lighting, film photograph, lived-in skin texture, film grain, unretouched authenticity, emotional strength portrait'
      },
      {
        id: 'cosmopolitan-comeback',
        name: 'COSMOPOLITAN Comeback',
        category: 'Magazine Covers',
        description: "Pure joy because you're winning at life. That real laugh, gorgeous hair, perfect blazer moment.",
        prompt: '[triggerword] woman long dark voluminous hair, genuine laugh caught mid-moment, wearing black blazer over lace cami, statement earrings, bright white studio, shot on Sony A1 with 135mm GM lens f/1.8, strobe with softbox, film photograph, expression lines visible, natural skin, film grain, unretouched joy, celebratory editorial'
      },
      {
        id: 'glamour-rising',
        name: 'GLAMOUR Rising',
        category: 'Magazine Covers',
        description: "That direct eye contact that says you're not playing anymore. Hair perfectly tucked, simple dress, maximum impact.",
        prompt: '[triggerword] woman long dark hair one side behind ear, direct confident eye contact, wearing simple black dress, delicate gold chain, clean white cyclorama, shot on Nikon Z9 with 105mm f/1.4 lens, beauty lighting setup, film photograph, real skin texture, visible pores, film grain, unretouched natural power, cover portrait'
      },
      {
        id: 'instyle-empire',
        name: 'INSTYLE Empire',
        category: 'Magazine Covers',
        description: "Boss mode activated. Low ponytail, power suit, standing like you own the room - because you do.",
        prompt: '[triggerword] woman long dark hair in low ponytail, CEO stance facing camera, wearing black power suit with white shirt, minimal jewelry, gray paper backdrop, shot on Fujifilm GFX100 II with 110mm f/2 lens, classic portrait lighting, film photograph, professional strength, natural skin detail, film grain, unretouched leadership'
      },
      {
        id: 'tatler-triumph',
        name: 'TATLER Triumph',
        category: 'Magazine Covers',
        description: "Old Hollywood glamour meets modern power. Those waves, that velvet, pearls that whisper elegance.",
        prompt: '[triggerword] woman long dark hair Hollywood waves, regal bearing, wearing black velvet blazer, pearl earrings, rich navy backdrop, shot on Pentax 645Z with 90mm f/2.8 lens, Rembrandt lighting, film photograph, mature beauty, skin texture visible, medium format grain, unretouched elegance, luxury survivor portrait'
      },
      {
        id: 'w-magazine-warrior',
        name: 'W MAGAZINE Warrior',
        category: 'Magazine Covers',
        description: "Your profile is art. Sleek hair, that incredible architectural top, strength in every line.",
        prompt: '[triggerword] woman long dark straight hair, profile showing strength, wearing architectural black top, single statement earring, black seamless background, shot on RED Komodo with 85mm cinema lens, dramatic side light, film photograph, skin in harsh light, film grain, unretouched fierce beauty, artistic power portrait'
      },
      {
        id: 'forbes-founder',
        name: 'FORBES Founder',
        category: 'Magazine Covers',
        description: "The founder energy is real. Professional hair, perfect blazer, ready to change the world with your business.",
        prompt: '[triggerword] woman long dark professional hair, business portrait angle, wearing black blazer white shirt, watch visible, corporate gray backdrop, shot on Canon R5 with 70-200mm f/2.8 at 135mm, corporate headshot lighting, film photograph, approachable CEO energy, natural skin, film grain, unretouched success story'
      },
      {
        id: 'rock-bottom-truth',
        name: 'Rock Bottom Truth',
        category: 'Journey Story',
        description: "We all have those rock bottom moments. This is yours - raw, real, and the beginning of your comeback story.",
        prompt: '[triggerword] woman long dark disheveled hair, sitting on floor against white wall, wearing oversized black sweater, knees pulled up, morning window light creating shadows, shot on Leica Q2 with 28mm Summilux, available light only, film photograph, tired eyes visible, natural exhausted skin, heavy grain, unretouched vulnerability, documentary style'
      },
      {
        id: 'first-brave-selfie',
        name: 'First Brave Selfie',
        category: 'Journey Story',
        description: "Remember your first brave selfie? That moment you decided to show up. This is where it all started.",
        prompt: '[triggerword] woman long dark messy hair, holding phone up taking selfie, wearing simple black t-shirt, bedroom background soft focus, natural morning light, shot on iPhone 15 Pro portrait mode feel, handheld casual angle, film photograph, no makeup skin texture, authentic moment, film grain, unretouched courage beginning'
      },
      {
        id: 'coffee-and-camera',
        name: 'Coffee and Camera',
        category: 'Journey Story',
        description: "That 7am hustle with coffee in one hand, phone in the other. Building your empire one morning at a time.",
        prompt: '[triggerword] woman long dark hair in messy bun, one hand holding coffee other holding phone, wearing black robe, kitchen counter background, 7am golden hour through window, shot on Canon 5D Mark IV with 35mm f/1.4, lifestyle documentary, film photograph, morning skin no makeup, visible texture, grain, unretouched daily ritual'
      },
      {
        id: 'building-momentum',
        name: 'Building Momentum',
        category: 'Journey Story',
        description: "The grind is real but so are you. Hair half up, laptop open, ring light on - building your dreams pixel by pixel.",
        prompt: '[triggerword] woman long dark hair half up, sitting at laptop with ring light, wearing black tank top, home office setup visible, afternoon natural light, shot on Sony A7R V with 50mm f/1.2, environmental portrait, film photograph, focused expression, real skin, film grain, unretouched work in progress'
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
        prompt: 'film photograph, natural film grain, [triggerword], woman cycling vintage bicycle through Copenhagen streets, wearing tailored wool coat and leather crossbody bag, colorful Nordic buildings in background, natural confident expression, hair moving gently in breeze, minimal gold jewelry, shot on Leica Q2 with 28mm f/1.7 lens, street photography style, natural daylight, Scandinavian urban aesthetic'
      },
      {
        id: 'milan-fashion-walk',
        name: 'Milan Fashion District',
        category: 'Style in Motion',
        description: 'Walking through the fashion capital with innate style - where elegance meets everyday',
        prompt: 'film photograph, natural film grain, [triggerword], woman in elevated basics walking through Milano fashion district, long camel coat and designer accessories, Italian architecture backdrop, natural purposeful stride, serene focused expression, hair styled effortlessly, shot on Canon EOS R5 with 85mm f/1.4 lens, street fashion photography, golden hour lighting, Italian elegance aesthetic'
      },
      {
        id: 'london-crosswalk-moment',
        name: 'London Crosswalk',
        category: 'City Navigation',
        description: 'Navigating the city with quiet confidence - urban moments that feel cinematic',
        prompt: 'film photograph, natural film grain, [triggerword], woman in trench coat crossing busy London street, classic British architecture background, natural determined expression while navigating crosswalk, minimal scarf and leather boots, hair moving with city breeze, shot on Fujifilm GFX 100S with 63mm f/2.8 lens, documentary street photography, overcast natural lighting, British urban aesthetic'
      },
      {
        id: 'paris-metro-entrance',
        name: 'Parisian Metro',
        category: 'Transit Elegance',
        description: 'Even the mundane becomes elegant - French sophistication in everyday moments',
        prompt: 'film photograph, natural film grain, [triggerword], woman in neutral turtleneck and tailored coat descending into Parisian metro station, Art Nouveau metro entrance visible, contemplative expression while moving through transit, minimal jewelry and structured bag, natural confident posture, shot on Leica M11 with 50mm f/1.4 lens, urban documentary photography, soft Paris lighting, French metropolitan aesthetic'
      },
      {
        id: 'brooklyn-bridge-walk',
        name: 'Bridge Crossing',
        category: 'Urban Exploration',
        description: 'Taking the longer route for the better view - finding beauty in city infrastructure',
        prompt: 'film photograph, natural film grain, [triggerword], woman in wool sweater and jeans walking across urban bridge, city skyline in background, peaceful expression while taking in views, hair in natural loose style, hands in coat pockets, shot on Sony A7R IV with 70-200mm f/2.8 lens, bridge photography, golden hour lighting, metropolitan lifestyle aesthetic'
      },
      {
        id: 'stockholm-old-town',
        name: 'Stockholm Gamla Stan',
        category: 'Historic Wandering',
        description: 'Moving through cobblestone streets with timeless grace - where history meets modernity',
        prompt: 'film photograph, natural film grain, [triggerword], woman in Scandinavian minimalist outfit walking through Stockholm old town cobblestone streets, colorful medieval buildings backdrop, serene expression while exploring, minimal Nordic styling, natural confident stride, shot on Canon EOS R6 with 50mm f/1.2 lens, historic street photography, Nordic natural lighting, Swedish heritage aesthetic'
      },
      {
        id: 'rainy-amsterdam-umbrella',
        name: 'Amsterdam Rain',
        category: 'Weather Elegance',
        description: 'Even rainy days look elegant when you move with intention and style',
        prompt: 'film photograph, natural film grain, [triggerword], woman with classic black umbrella walking along Amsterdam canal, wearing long wool coat and leather boots, Dutch canal houses reflected in rain puddles, peaceful expression despite weather, hair protected under umbrella, shot on Fujifilm X-T5 with 35mm f/1.4 lens, rainy day photography, soft overcast lighting, Dutch urban resilience aesthetic'
      },
      {
        id: 'barcelona-morning-market',
        name: 'Barcelona Market Walk',
        category: 'Local Exploration',
        description: 'Navigating local markets with curiosity and confidence - where culture meets cuisine',
        prompt: 'film photograph, natural film grain, [triggerword], woman in linen shirt walking through Barcelona morning market, colorful produce stalls and Spanish architecture, natural interested expression while observing local life, woven market bag in hand, minimal Mediterranean styling, shot on Leica SL2 with 90mm f/2 lens, market documentary photography, warm morning light, Spanish cultural immersion aesthetic'
      },
      {
        id: 'tokyo-shibuya-crossing',
        name: 'Tokyo Navigation',
        category: 'Cultural Adaptation',
        description: 'Moving through foreign spaces with quiet confidence - cultural exploration with grace',
        prompt: 'film photograph, natural film grain, [triggerword], woman in minimalist black outfit navigating Tokyo crosswalk, neon signs and urban energy in background, calm focused expression amid city chaos, sleek modern styling, hair in simple elegant style, shot on Sony A7R V with 85mm f/1.4 lens, urban crowd photography, neon-lit evening atmosphere, metropolitan confidence aesthetic'
      },
      {
        id: 'edinburgh-royal-mile',
        name: 'Edinburgh Heritage',
        category: 'Historic Cities',
        description: 'Walking through centuries of history with contemporary confidence',
        prompt: 'film photograph, natural film grain, [triggerword], woman in tartan scarf and wool coat walking down Edinburgh Royal Mile, historic Scottish architecture surrounding, thoughtful expression while appreciating heritage, natural windswept hair, traditional yet modern styling, shot on Nikon Z9 with 24-70mm f/2.8 lens, heritage street photography, Scottish natural lighting, Celtic urban exploration aesthetic'
      },
      {
        id: 'vancouver-seawall-stroll',
        name: 'Coastal City Walk',
        category: 'Nature Meets Urban',
        description: 'Where city meets sea - finding harmony between urban and natural worlds',
        prompt: 'film photograph, natural film grain, [triggerword], woman in layered neutral clothing walking along Vancouver seawall, mountains and water visible in background, peaceful expression while enjoying coastal breeze, hair moving naturally in ocean air, comfortable walking shoes and crossbody bag, shot on Canon EOS R5 with 70-200mm f/2.8 lens, coastal urban photography, Pacific Northwest lighting, maritime city aesthetic'
      },
      {
        id: 'zurich-tram-commute',
        name: 'Swiss Precision',
        category: 'Efficient Movement',
        description: 'Moving through the city with Swiss precision and understated luxury',
        prompt: 'film photograph, natural film grain, [triggerword], woman in quality basics waiting for Zurich tram, Swiss Alps visible in distance, composed expression while commuting efficiently, minimal luxury accessories, hair in neat natural style, shot on Fujifilm GFX 50S with 110mm f/2 lens, Swiss urban photography, clean Alpine lighting, efficient luxury lifestyle aesthetic'
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
        prompt: 'film photograph, natural film grain, [triggerword], woman in oversized cream cashmere sweater holding ceramic coffee mug by large window, soft morning light streaming through sheer curtains, minimal Scandinavian interior with natural wood and white walls, serene contemplative expression, effortless tousled hair, sitting in modern chair, shot on Leica Q2 with 28mm f/1.7 lens, natural window lighting, hygge lifestyle photography, cozy home aesthetic, morning ritual vibes'
      },
      {
        id: 'parisian-cafe-afternoon',
        name: 'Café Afternoon',
        category: 'Urban Elegance',
        description: 'Lost in thought at your favorite café - where time moves differently',
        prompt: 'film photograph, natural film grain, [triggerword], woman in neutral turtleneck and tailored coat sitting at marble café table, Parisian street visible through large windows, soft afternoon light filtering in, thoughtful distant gaze, minimal gold jewelry, espresso cup and leather notebook on table, shot on Canon EOS R5 with 85mm f/1.4 lens, café window lighting, European lifestyle photography, urban sophistication aesthetic'
      },
      {
        id: 'london-walk-golden-hour',
        name: 'London Golden Hour',
        category: 'City Wandering',
        description: 'Evening stroll through the city - finding beauty in urban moments',
        prompt: 'film photograph, natural film grain, [triggerword], woman in long wool coat walking down tree-lined London street during golden hour, soft natural light catching her profile, peaceful contemplative expression, hair moving gently in breeze, minimal scarf and leather boots, shot on Fujifilm GFX 100S with 63mm f/2.8 lens, golden hour street photography, European urban aesthetic, natural city wandering vibes'
      },
      {
        id: 'home-cooking-ritual',
        name: 'Cooking at Home',
        category: 'Domestic Luxury',
        description: 'Creating something beautiful in your kitchen - everyday moments made precious',
        prompt: 'film photograph, natural film grain, [triggerword], woman in linen apron preparing fresh ingredients in bright minimalist kitchen, white marble counters and wooden cutting boards, soft natural focus while cooking, sleeves casually rolled up, hair loosely tied back, shot on Sony A7R IV with 50mm f/1.2 lens, kitchen lifestyle photography, natural home lighting, culinary minimalism aesthetic'
      },
      {
        id: 'bookstore-browsing',
        name: 'Literary Wandering',
        category: 'Cultural Moments',
        description: 'Discovering your next favorite book - intellectual curiosity in beautiful spaces',
        prompt: 'film photograph, natural film grain, [triggerword], woman in soft cardigan browsing books in independent bookstore, warm afternoon light filtering through tall windows, gentle contemplative expression while reading book spine, minimal accessories, stacks of books and cozy reading nooks around, shot on Leica M11 with 50mm f/1.4 lens, bookstore ambient lighting, literary lifestyle photography, intellectual curiosity aesthetic'
      },
      {
        id: 'milan-shopping-stroll',
        name: 'Milan Shopping',
        category: 'Fashion Moments',
        description: 'Curating your wardrobe in the fashion capital - where style meets intention',
        prompt: 'film photograph, natural film grain, [triggerword], woman in elevated basics examining beautiful garment in Milano boutique, soft retail lighting highlighting textures, focused expression while appreciating quality, elegant posture, designer bag and minimal jewelry, shot on Canon EOS R6 with 85mm f/1.2 lens, boutique lifestyle photography, luxury retail lighting, Italian fashion aesthetic'
      },
      {
        id: 'iceland-nature-moment',
        name: 'Nordic Nature',
        category: 'Natural Beauty',
        description: 'Finding solitude in stunning landscapes - where nature meets sophisticated style',
        prompt: 'film photograph, natural film grain, [triggerword], woman in wool coat and cashmere scarf standing beside Icelandic landscape, dramatic natural lighting from Nordic sky, serene expression while taking in vast beauty, hair moving in fresh air, minimal but warm styling, shot on Fujifilm X-T5 with 35mm f/1.4 lens, Nordic landscape photography, natural dramatic lighting, Scandinavian outdoor aesthetic'
      },
      {
        id: 'norwegian-fjord-reflection',
        name: 'Fjord Contemplation',
        category: 'Peaceful Moments',
        description: 'Silent moments by the water - where thoughts become clearer',
        prompt: 'film photograph, natural film grain, [triggerword], woman in neutral knit sweater sitting by Norwegian fjord, soft Nordic light reflecting on water, peaceful introspective expression, hair in relaxed natural style, hands wrapped around warm drink, shot on Leica SL2 with 90mm f/2 lens, fjord lifestyle photography, natural reflection lighting, Norwegian tranquility aesthetic'
      },
      {
        id: 'evening-bath-ritual',
        name: 'Evening Ritual',
        category: 'Self-Care Luxury',
        description: 'The luxury of time for yourself - evening rituals as meditation',
        prompt: 'film photograph, natural film grain, [triggerword], woman in silk robe preparing evening bath in marble bathroom, soft candlelight creating warm glow, peaceful expression while adding oils to water, hair in loose low bun, minimal luxury bath products arranged aesthetically, shot on Sony A7R V with 85mm f/1.4 lens, bathroom candlelight photography, intimate spa lighting, self-care luxury aesthetic'
      },
      {
        id: 'morning-yoga-practice',
        name: 'Morning Movement',
        category: 'Wellness Ritual',
        description: 'Starting the day with intention - mindful movement in beautiful light',
        prompt: 'film photograph, natural film grain, [triggerword], woman in neutral yoga wear practicing gentle stretches by large window, morning light filtering through sheer curtains, serene focused expression, hair in simple natural style, minimal room with plants and natural textures, shot on Canon EOS R5 with 50mm f/1.2 lens, wellness lifestyle photography, soft morning light, mindful living aesthetic'
      },
      {
        id: 'weekend-market-flowers',
        name: 'Fresh Flowers',
        category: 'Weekend Rituals',
        description: 'Choosing flowers for your home - small luxuries that elevate everyday life',
        prompt: 'film photograph, natural film grain, [triggerword], woman in cream sweater selecting white peonies at European flower market, soft natural morning light, gentle concentration while choosing blooms, woven basket with other flowers, minimal jewelry and natural styling, shot on Fujifilm GFX 50S with 110mm f/2 lens, flower market photography, natural outdoor lighting, botanical lifestyle aesthetic'
      },
      {
        id: 'cozy-reading-afternoon',
        name: 'Reading Corner',
        category: 'Quiet Luxury',
        description: 'Sunday afternoon with a good book - the luxury of uninterrupted time',
        prompt: 'film photograph, natural film grain, [triggerword], woman in soft knit sweater reading book in cozy corner with throw blanket, natural light from window creating soft shadows, peaceful absorbed expression, hair in relaxed style, tea cup on side table, shot on Leica Q2 Monochrom with natural lighting, hygge lifestyle photography, cozy home aesthetic, reading sanctuary vibes'
      }
    ]
  },
  'vogue-editorial': {
    id: 'vogue-editorial',
    name: 'VOGUE EDITORIAL',
    subtitle: 'High Fashion Authority',
    description: 'Editorial portraits that command attention - where high fashion meets undeniable presence',
    preview: SandraImages.portraits.professional[1],
    prompts: [
      {
        id: 'power-profile-statement',
        name: 'Power Profile',
        category: 'Editorial Authority',
        description: 'The profile shot that stops everyone mid-scroll - pure editorial power',
        prompt: 'film photograph, natural film grain, [triggerword], striking profile portrait in black leather jacket and designer sunglasses, dramatic side lighting creating strong shadows, confident expression with slight upward gaze, hair slicked back in sophisticated style, minimal statement jewelry, shot on Hasselblad H6D-400c with 80mm f/1.9 lens, high contrast black and white photography, studio fashion editorial aesthetic'
      },
      {
        id: 'dramatic-shadow-play',
        name: 'Shadow Drama',
        category: 'Cinematic Fashion',
        description: 'When shadows become your co-star - architectural lighting meets high fashion',
        prompt: 'film photograph, natural film grain, [triggerword], woman in black turtleneck with dramatic window shadows creating geometric patterns across face, intense direct gaze, hair in perfect voluminous waves, natural editorial makeup, shot on Canon EOS R5 with 85mm f/1.2 lens, architectural shadow photography, high contrast lighting, Peter Lindbergh inspired aesthetic'
      },
      {
        id: 'minimalist-power-pose',
        name: 'Minimalist Authority',
        category: 'Clean Editorial',
        description: 'Less is more when you have this much presence - minimalist editorial perfection',
        prompt: 'film photograph, natural film grain, [triggerword], woman in simple black blazer against pure white background, arms crossed in confident power pose, direct intense eye contact, natural beauty with defined features, hair in sleek low bun, shot on Leica S3 with 120mm f/2.5 lens, clean studio photography, perfect even lighting, minimalist fashion editorial'
      },
      {
        id: 'haute-couture-moment',
        name: 'Haute Couture',
        category: 'High Fashion',
        description: 'Wearing fashion like armor - when clothes become art on your body',
        prompt: 'film photograph, natural film grain, [triggerword], model in sculptural black designer piece with dramatic architectural details, powerful stance with hands positioned elegantly, serious editorial expression, hair styled in avant-garde fashion, shot on Fujifilm GFX 100S with 63mm f/2.8 lens, high fashion photography, dramatic studio lighting, couture editorial aesthetic'
      },
      {
        id: 'intimate-close-portrait',
        name: 'Intimate Authority',
        category: 'Beauty Editorial',
        description: 'When the camera gets close enough to see your soul - raw beauty meets editorial perfection',
        prompt: 'film photograph, natural film grain, [triggerword], extreme close-up portrait focusing on eyes and natural skin texture, hand gently touching face, vulnerable yet powerful expression, natural dewy skin with visible pores, hair falling naturally around face, shot on Sony A7R IV with 85mm f/1.4 lens, beauty editorial photography, soft directional lighting, intimate fashion aesthetic'
      },
      {
        id: 'chair-power-pose',
        name: 'Boardroom Queen',
        category: 'Corporate Elegance',
        description: 'Sitting like you own every room you enter - corporate power meets editorial sophistication',
        prompt: 'film photograph, natural film grain, [triggerword], woman in tailored black blazer sitting in modern chair with confident posture, one hand draped elegantly, direct authoritative gaze, professional yet striking styling, hair in polished waves, shot on Nikon Z9 with 105mm f/1.4 lens, corporate editorial photography, clean professional lighting, executive fashion aesthetic'
      },
      {
        id: 'artistic-silhouette-drama',
        name: 'Silhouette Drama',
        category: 'Artistic Editorial',
        description: 'When your silhouette tells the whole story - artistic drama meets fashion',
        prompt: 'film photograph, natural film grain, [triggerword], dramatic silhouette in flowing black garment with strong rim lighting, profile creating powerful graphic element, hair movement captured in motion, artistic pose with fabric flowing, shot on Leica SL2 with 90mm f/2 lens, silhouette photography, dramatic backlighting, artistic fashion editorial'
      },
      {
        id: 'casual-luxury-portrait',
        name: 'Effortless Luxury',
        category: 'Modern Editorial',
        description: 'Making casual look like a million dollars - effortless sophistication',
        prompt: 'film photograph, natural film grain, [triggerword], woman in simple white tank top and jeans sitting on stool, natural confident expression, minimal makeup highlighting natural beauty, hair in effortless textured style, shot on Canon EOS R6 with 50mm f/1.2 lens, casual editorial photography, natural studio lighting, modern simplicity aesthetic'
      },
      {
        id: 'emotional-intensity-portrait',
        name: 'Emotional Intensity',
        category: 'Raw Editorial',
        description: 'When emotion becomes fashion - raw intensity meets editorial sophistication',
        prompt: 'film photograph, natural film grain, [triggerword], woman in black sleeveless top with hand running through hair, eyes closed in moment of introspection, natural emotional expression, textured messy hair, visible natural skin texture, shot on Fujifilm X-T5 with 56mm f/1.2 lens, emotional portrait photography, moody natural lighting, raw editorial aesthetic'
      },
      {
        id: 'profile-elegance-study',
        name: 'Profile Elegance',
        category: 'Classic Editorial',
        description: 'The timeless profile that belongs in a gallery - classic beauty meets modern edge',
        prompt: 'film photograph, natural film grain, [triggerword], elegant profile portrait with hair in messy top knot, natural contemplative expression, minimal ear jewelry catching light, clean natural makeup, shot on Leica M11 with 50mm f/1.4 lens, classic portrait photography, soft side lighting, timeless editorial elegance'
      },
      {
        id: 'fashion-rebellion-moment',
        name: 'Fashion Rebellion',
        category: 'Edgy Editorial',
        description: 'When fashion becomes rebellion - edgy sophistication with attitude',
        prompt: 'film photograph, natural film grain, [triggerword], woman in all-black ensemble with rebellious styling, confident defiant expression, natural textured hair with movement, bold minimal makeup, dramatic pose with attitude, shot on Sony A7R V with 85mm f/1.4 lens, edgy fashion photography, dramatic contrast lighting, rebellious editorial aesthetic'
      },
      {
        id: 'sophisticated-mystery',
        name: 'Sophisticated Mystery',
        category: 'Mysterious Editorial',
        description: 'The mystery that makes people want to know your story - sophisticated intrigue',
        prompt: 'film photograph, natural film grain, [triggerword], mysterious portrait with partial face in shadow, wearing elegant black clothing, enigmatic expression with slight smile, natural beauty enhanced by dramatic lighting, hair partially covering one side of face, shot on Hasselblad X2D 100C with 90mm f/2.5 lens, mysterious portrait photography, chiaroscuro lighting, sophisticated enigma aesthetic'
      }
    ]
  },
  'golden-hour': {
    id: 'golden-hour',
    name: 'GOLDEN HOUR',
    subtitle: 'Luxury in Light',
    description: 'When golden light meets luxury living - beach clubs, rooftops, and endless summer captured in perfect light',
    preview: SandraImages.portraits.professional[0],
    prompts: [
      {
        id: 'beach-sunset-silhouette',
        name: 'Beach Sunset Dreams',
        category: 'Coastal Luxury',
        description: 'Full scenery - Where ocean meets sky in perfect golden light',
        prompt: 'film photograph, natural film grain, [triggerword], woman in flowing white linen dress walking along pristine beach at golden hour, endless ocean and dramatic sunset sky in background, hair flowing in ocean breeze, natural serene expression, bare feet in soft sand, shot on Canon EOS R5 with 24-70mm f/2.8 lens, full body beach photography, golden hour lighting, coastal luxury aesthetic'
      },
      {
        id: 'rooftop-city-portrait',
        name: 'Rooftop Authority',
        category: 'Urban Sunset',
        description: 'Portrait - City lights beginning to twinkle as golden hour peaks',
        prompt: 'film photograph, natural film grain, [triggerword], close-up portrait on luxury penthouse rooftop during golden hour, city skyline softly blurred in background, warm sunset light illuminating face, natural confident expression, hair gently moved by evening breeze, minimal gold jewelry catching light, shot on Sony A7R IV with 85mm f/1.4 lens, rooftop portrait photography, golden hour backlighting, urban luxury aesthetic'
      },
      {
        id: 'beach-club-champagne',
        name: 'Beach Club Elegance',
        category: 'Social Luxury',
        description: 'Half body - The golden hour toast that defines summer luxury',
        prompt: 'film photograph, natural film grain, [triggerword], elegant woman in designer swimwear and sheer cover-up holding champagne glass at exclusive beach club, Mykonos-style white architecture and ocean in background, natural sophisticated expression, hair in effortless beach waves, shot on Leica Q2 with 28mm f/1.7 lens, half-body beach club photography, golden hour ambient lighting, Mediterranean luxury aesthetic'
      },
      {
        id: 'yacht-deck-sunset',
        name: 'Yacht Deck Dreams',
        category: 'Nautical Luxury',
        description: 'Full scenery - Living the yacht life as the sun kisses the horizon',
        prompt: 'film photograph, natural film grain, [triggerword], woman in elegant white dress on luxury yacht deck at sunset, endless ocean and dramatic sky creating stunning backdrop, natural windswept hair, peaceful expression while watching sunset, designer accessories, shot on Fujifilm GFX 100S with 63mm f/2.8 lens, yacht lifestyle photography, golden hour over water, nautical luxury aesthetic'
      },
      {
        id: 'infinity-pool-portrait',
        name: 'Infinity Pool Goddess',
        category: 'Resort Luxury',
        description: 'Portrait - Where pool meets sky in golden perfection',
        prompt: 'film photograph, natural film grain, [triggerword], portrait by infinity pool edge during golden hour, pool water reflecting warm sunset colors, natural relaxed expression with eyes gently closed feeling warm light, wet hair slicked back elegantly, minimal makeup highlighting natural glow, shot on Nikon Z9 with 105mm f/1.4 lens, poolside portrait photography, golden hour reflection lighting, resort luxury aesthetic'
      },
      {
        id: 'rooftop-dinner-ambiance',
        name: 'Rooftop Dining',
        category: 'Evening Luxury',
        description: 'Half body - The golden hour dinner where everything feels perfect',
        prompt: 'film photograph, natural film grain, [triggerword], sophisticated woman at rooftop restaurant table during golden hour, elegant dinner setting with city views, natural contemplative expression while enjoying wine, designer dress and delicate jewelry, hair styled in loose elegant waves, shot on Canon EOS R6 with 50mm f/1.2 lens, dining lifestyle photography, warm golden hour lighting, rooftop luxury aesthetic'
      },
      {
        id: 'beach-walk-meditation',
        name: 'Beach Walk Serenity',
        category: 'Mindful Luxury',
        description: 'Full scenery - Finding peace in paradise as day transitions to night',
        prompt: 'film photograph, natural film grain, [triggerword], woman in neutral linen clothing walking along water edge at golden hour, dramatic sky with soft clouds, peaceful meditative expression, natural windswept hair, hands gently touching flowing fabric, shot on Leica SL2 with 90mm f/2 lens, beach meditation photography, golden hour serenity lighting, mindful luxury aesthetic'
      },
      {
        id: 'balcony-wine-moment',
        name: 'Balcony Wine Hour',
        category: 'Private Luxury',
        description: 'Portrait - The private moment that feels like a movie scene',
        prompt: 'film photograph, natural film grain, [triggerword], intimate portrait on private balcony during golden hour, wine glass in hand, natural content expression while watching sunset, hair catching golden light, wearing silk robe or elegant loungewear, shot on Sony A7R V with 85mm f/1.4 lens, balcony lifestyle photography, warm evening lighting, intimate luxury aesthetic'
      },
      {
        id: 'beach-club-pool-edge',
        name: 'Pool Edge Paradise',
        category: 'Poolside Luxury',
        description: 'Half body - The pool edge moment where time stands still',
        prompt: 'film photograph, natural film grain, [triggerword], woman sitting on edge of beach club pool during golden hour, legs in crystal blue water, designer bikini and flowing kimono, natural serene expression, hair in beachy waves with golden highlights, shot on Fujifilm X-T5 with 35mm f/1.4 lens, poolside photography, golden hour pool lighting, beach club luxury aesthetic'
      },
      {
        id: 'rooftop-panoramic-view',
        name: 'Rooftop Panorama',
        category: 'Urban Views',
        description: 'Full scenery - The city view that makes everything worth it',
        prompt: 'film photograph, natural film grain, [triggerword], woman on luxury rooftop terrace with panoramic city view during golden hour, wearing flowing evening dress, natural expression of awe at the view, hair moving in gentle evening breeze, shot on Hasselblad H6D-400c with 80mm f/1.9 lens, rooftop panoramic photography, golden hour cityscape lighting, urban luxury aesthetic'
      },
      {
        id: 'sunset-champagne-toast',
        name: 'Champagne Sunset',
        category: 'Celebration Luxury',
        description: 'Portrait - The toast that celebrates your beautiful life',
        prompt: 'film photograph, natural film grain, [triggerword], close-up portrait raising champagne glass toward golden sunset, warm light illuminating face and glass, natural joyful expression of gratitude, hair glowing in backlight, elegant dress and jewelry, shot on Leica M11 with 50mm f/1.4 lens, celebration portrait photography, golden hour backlighting, luxury celebration aesthetic'
      },
      {
        id: 'beach-hammock-serenity',
        name: 'Hammock Serenity',
        category: 'Relaxation Luxury',
        description: 'Half body - The hammock moment where life feels perfect',
        prompt: 'film photograph, natural film grain, [triggerword], woman relaxing in beach hammock during golden hour, tropical paradise and ocean in soft focus background, natural peaceful expression with eyes gently closed, flowing white dress and natural hair, shot on Canon EOS R5 with 70-200mm f/2.8 lens, beach relaxation photography, warm golden hour lighting, tropical luxury aesthetic'
      }
    ]
  },
  'urban-edge': {
    id: 'urban-edge',
    name: 'URBAN EDGE',
    subtitle: 'Concrete Rebellion',
    description: 'Raw urban energy meets fearless attitude - where city streets become your runway and concrete tells your story',
    preview: SandraImages.portraits.professional[1],
    prompts: [
      {
        id: 'concrete-wall-defiance',
        name: 'Concrete Defiance',
        category: 'Industrial Power',
        description: 'Portrait - When concrete becomes your canvas and attitude is your armor',
        prompt: 'film photograph, natural film grain, [triggerword], powerful portrait against raw concrete wall, wearing all black leather jacket and dark clothing, intense direct gaze with subtle defiant expression, hair in edgy textured style, natural moody makeup, shot on Canon EOS R5 with 85mm f/1.2 lens, urban portrait photography, harsh directional lighting creating dramatic shadows, industrial rebellion aesthetic'
      },
      {
        id: 'warehouse-district-walk',
        name: 'Warehouse District',
        category: 'Industrial Streets',
        description: 'Full scenery - Walking through the city like you own every street',
        prompt: 'film photograph, natural film grain, [triggerword], woman in dark streetwear walking through industrial warehouse district, abandoned buildings and urban decay in background, natural confident stride, windswept hair, hands in pockets, shot on Fujifilm GFX 100S with 63mm f/2.8 lens, street documentary photography, overcast urban lighting, industrial urban aesthetic'
      },
      {
        id: 'fire-escape-rebel',
        name: 'Fire Escape Rebel',
        category: 'Urban Architecture',
        description: 'Half body - The metal stairs that lead to your empire',
        prompt: 'film photograph, natural film grain, [triggerword], edgy portrait on metal fire escape stairs, wearing dark denim jacket and urban accessories, natural rebellious expression while looking out over city, hair catching urban wind, minimal dark makeup, shot on Sony A7R IV with 50mm f/1.2 lens, architectural portrait photography, moody urban lighting, fire escape rebellion aesthetic'
      },
      {
        id: 'subway-tunnel-authority',
        name: 'Underground Authority',
        category: 'Subway Culture',
        description: 'Portrait - Where the underground becomes your domain',
        prompt: 'film photograph, natural film grain, [triggerword], intense portrait in subway tunnel or underpass, wearing black hoodie or urban streetwear, natural serious expression with piercing gaze, hair in street-style waves, dramatic tunnel lighting creating stark contrasts, shot on Nikon Z9 with 85mm f/1.8 lens, underground photography, dramatic artificial lighting, subway culture aesthetic'
      },
      {
        id: 'rooftop-city-overlook',
        name: 'Rooftop Overlord',
        category: 'Urban Heights',
        description: 'Full scenery - The city spread below like your conquered territory',
        prompt: 'film photograph, natural film grain, [triggerword], woman standing on urban rooftop overlooking city skyline, wearing dark coat and urban fashion, natural powerful stance, hair flowing in city wind, hands confidently positioned, shot on Leica SL2 with 90mm f/2 lens, rooftop cityscape photography, dramatic urban lighting, city conquest aesthetic'
      },
      {
        id: 'alley-shadow-mystery',
        name: 'Alley Shadows',
        category: 'Urban Noir',
        description: 'Half body - Where shadows dance and mysteries are born',
        prompt: 'film photograph, natural film grain, [triggerword], moody portrait in narrow urban alley with dramatic shadows, wearing dark clothing with interesting textures, natural mysterious expression, hair partially in shadow, edgy minimal makeup, shot on Canon EOS R6 with 50mm f/1.2 lens, alley noir photography, harsh shadow lighting, urban mystery aesthetic'
      },
      {
        id: 'graffiti-wall-statement',
        name: 'Graffiti Statement',
        category: 'Street Art',
        description: 'Portrait - When street art meets personal rebellion',
        prompt: 'film photograph, natural film grain, [triggerword], bold portrait against colorful graffiti wall, wearing edgy street fashion, natural confident expression with slight attitude, hair in urban street style, bold minimal makeup, shot on Fujifilm X-T5 with 35mm f/1.4 lens, street art photography, urban natural lighting, graffiti culture aesthetic'
      },
      {
        id: 'parking-garage-solitude',
        name: 'Parking Garage Mood',
        category: 'Concrete Spaces',
        description: 'Full scenery - Finding beauty in the most unlikely urban spaces',
        prompt: 'film photograph, natural film grain, [triggerword], atmospheric shot in concrete parking garage, wearing dark minimalist clothing, natural contemplative expression, hair naturally falling, hands in relaxed position, shot on Sony A7R V with 24-70mm f/2.8 lens, parking garage photography, harsh fluorescent lighting mixed with shadows, concrete brutalism aesthetic'
      },
      {
        id: 'bridge-underpass-mood',
        name: 'Bridge Underpass',
        category: 'Urban Structures',
        description: 'Half body - Where concrete arches frame your strength',
        prompt: 'film photograph, natural film grain, [triggerword], powerful portrait under concrete bridge or overpass, wearing urban streetwear with layered textures, natural intense expression, hair with urban wind movement, dramatic architectural shadows, shot on Leica M11 with 50mm f/1.4 lens, bridge architecture photography, dramatic concrete lighting, urban structure aesthetic'
      },
      {
        id: 'industrial-window-light',
        name: 'Industrial Window',
        category: 'Factory Spaces',
        description: 'Portrait - When factory windows become your spotlight',
        prompt: 'film photograph, natural film grain, [triggerword], dramatic portrait by large industrial window, wearing dark fitted clothing, natural serious expression with window light illuminating face, hair in edgy natural style, minimal urban makeup, shot on Hasselblad H6D-400c with 80mm f/1.9 lens, industrial portrait photography, harsh window lighting, factory rebellion aesthetic'
      },
      {
        id: 'street-corner-confidence',
        name: 'Street Corner Power',
        category: 'Urban Intersection',
        description: 'Full scenery - Owning every corner of the concrete jungle',
        prompt: 'film photograph, natural film grain, [triggerword], confident stance at urban street corner, wearing edgy street fashion, natural powerful expression while surveying territory, hair in street-style movement, urban accessories, shot on Canon EOS R5 with 24-70mm f/2.8 lens, street corner photography, urban intersection lighting, street power aesthetic'
      },
      {
        id: 'concrete-steps-ascension',
        name: 'Concrete Ascension',
        category: 'Urban Architecture',
        description: 'Half body - Climbing the concrete steps to your throne',
        prompt: 'film photograph, natural film grain, [triggerword], dynamic portrait on concrete steps or urban stairs, wearing dark streetwear with interesting details, natural determined expression, hair catching urban breeze, confident ascending posture, shot on Fujifilm GFX 50S with 110mm f/2 lens, concrete stairs photography, architectural urban lighting, ascension power aesthetic'
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
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [savedImages, setSavedImages] = useState<Set<string>>(new Set());
  const [savingImages, setSavingImages] = useState<Set<string>>(new Set());
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [currentTrackerId, setCurrentTrackerId] = useState<number | null>(null);

  // Maya-style save function with permanent URL migration using tracker system
  const saveToGallery = async (imageUrl: string) => {
    if (!currentTrackerId) {
      toast({
        title: "Save Failed",
        description: "No tracker ID available for saving",
        variant: "destructive",
      });
      return;
    }

    try {
      setSavingImages(prev => new Set([...prev, imageUrl]));
      
      // Use the permanent save endpoint that requires trackerId and selectedImageUrls array
      const response = await fetch('/api/save-preview-to-gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trackerId: currentTrackerId,
          selectedImageUrls: [imageUrl] // Send as array with single URL
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save image');
      }
      
      const result = await response.json();
      
      // Mark as saved and remove saving status
      setSavedImages(prev => new Set([...prev, imageUrl]));
      setSavingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(imageUrl);
        return newSet;
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/gallery-images'] });
      
      toast({
        title: "Image Saved",
        description: result.message || "Image permanently added to your gallery",
      });
    } catch (error) {
      console.error('Save error:', error);
      setSavingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(imageUrl);
        return newSet;
      });
      
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Could not save image to gallery",
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
    setGeneratedImages([]);
    setShowPreviewModal(false);
    
    try {
      // Use Maya's generation tracker system instead of direct AI images
      const response = await fetch('/api/maya-generate-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customPrompt: prompt.prompt.replace('[triggerword]', userModel?.triggerWord || 'useradmin_sandra_2025')
        }),
      });

      const data = await response.json();
      
      // Handle usage limit errors with upgrade prompts (same as Maya)
      if (!response.ok) {
        if (response.status === 403 && data.upgrade) {
          toast({
            title: "Usage Limit Reached",
            description: "Upgrade to generate more images",
            variant: "destructive",
          });
          // Could redirect to pricing: window.location.href = '/pricing';
          return;
        }
        
        // Check if it's a model validation error
        if (data.requiresTraining) {
          toast({
            title: "AI Model Required",
            description: data.error || "Please complete your AI model training first.",
            variant: "destructive",
          });
          setTimeout(() => {
            window.location.href = data.redirectTo || '/simple-training';
          }, 1500);
          return;
        }
        
        throw new Error(data.error || 'Failed to generate images');
      }
      
      if (data.success && data.trackerId) {
        // Store tracker ID for saving images later
        setCurrentTrackerId(data.trackerId);
        
        // Start polling for completion using Maya's tracker pattern
        pollForTrackerImages(data.trackerId);
        
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

  // Enhanced Maya-style tracker polling with immediate completion check
  const pollForTrackerImages = async (trackerId: number) => {
    console.log(`AI-PHOTOSHOOT: 🚀 Starting enhanced polling for tracker ${trackerId}`);
    
    const maxAttempts = 40; // 2 minutes total (3 second intervals)
    let attempts = 0;
    
    // CRITICAL FIX: First check if tracker is already completed (common case)
    const checkImmediateCompletion = async () => {
      try {
        console.log('AI-PHOTOSHOOT: Checking for immediate completion...');
        
        // Use Maya's working completed trackers endpoint to get recent completions
        const completedResponse = await fetch('/api/generation-trackers/completed', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (completedResponse.ok) {
          const completedTrackers = await completedResponse.json();
          const ourTracker = completedTrackers.find(t => t.id === trackerId);
          
          if (ourTracker && ourTracker.status === 'completed' && ourTracker.imageUrls?.length > 0) {
            console.log('AI-PHOTOSHOOT: ✅ TRACKER ALREADY COMPLETED!', ourTracker);
            
            setGenerationProgress(100);
            setGeneratingImages(false);
            setGeneratedImages(ourTracker.imageUrls);
            setShowPreviewModal(true);
            
            toast({
              title: "Images Generated!",
              description: `${ourTracker.imageUrls.length} new photos ready for preview`,
            });
            return true; // Completed immediately
          }
        }
        return false; // Not completed yet, continue polling
      } catch (error) {
        console.log('AI-PHOTOSHOOT: Immediate completion check failed, continuing with polling:', error);
        return false; // Continue with regular polling
      }
    };
    
    // Check immediate completion first
    const immediatelyCompleted = await checkImmediateCompletion();
    if (immediatelyCompleted) return;
    
    const poll = async () => {
      try {
        attempts++;
        setGenerationProgress(Math.min(90, (attempts / maxAttempts) * 90));
        
        // Enhanced authentication retry logic (matching Maya's working system)
        let response;
        let authRetries = 0;
        const maxAuthRetries = 3;
        
        while (authRetries < maxAuthRetries) {
          response = await fetch(`/api/generation-tracker/${trackerId}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            }
          });
          
          if (response.status !== 401) break; // Authentication successful or other error
          
          authRetries++;
          console.log(`AI-PHOTOSHOOT: Auth retry ${authRetries}/${maxAuthRetries} for tracker ${trackerId}`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
        }
        
        console.log(`AI-PHOTOSHOOT: Polling attempt ${attempts}/${maxAttempts}, status:`, response.status);
        
        if (!response.ok) {
          if (response.status === 401) {
            console.error('AI-PHOTOSHOOT: Authentication failed after retries');
            setGeneratingImages(false);
            toast({
              title: "Authentication Error", 
              description: "Session expired. Please refresh the page.",
              variant: "destructive",
            });
            return;
          }
          
          if (response.status === 404) {
            console.log('AI-PHOTOSHOOT: Tracker not found, checking completed list...');
            // Fallback: check completed trackers again
            const completedCheck = await checkImmediateCompletion();
            if (completedCheck) return;
          }
          
          console.error('AI-PHOTOSHOOT: Tracker fetch failed:', response.status);
          throw new Error('Failed to fetch tracker status');
        }
        
        const tracker = await response.json();
        console.log('AI-PHOTOSHOOT: Tracker data:', tracker);
        
        if (tracker && tracker.status === 'completed' && tracker.imageUrls && tracker.imageUrls.length > 0) {
          // Generation completed - show modal immediately
          console.log('AI-PHOTOSHOOT: ✅ TRACKER COMPLETED!', tracker);
          
          setGenerationProgress(100);
          setGeneratingImages(false);
          setGeneratedImages(tracker.imageUrls);
          setShowPreviewModal(true);
          
          toast({
            title: "Images Generated!",
            description: `${tracker.imageUrls.length} new photos ready for preview`,
          });
          return;
        }
        
        if (tracker && tracker.status === 'failed') {
          console.log('AI-PHOTOSHOOT: ❌ Generation failed');
          setGeneratingImages(false);
          toast({
            title: "Generation Failed",
            description: "Something went wrong with image generation",
            variant: "destructive",
          });
          return;
        }
        
        // Continue polling if still processing
        if (tracker && tracker.status === 'processing') {
          console.log(`AI-PHOTOSHOOT: Still processing... attempt ${attempts}/${maxAttempts}`);
        }
        
        // Continue polling
        if (attempts < maxAttempts) {
          setTimeout(poll, 3000);
        } else {
          console.log('AI-PHOTOSHOOT: ⚠️ Polling timeout - checking completed trackers one final time');
          
          // Final check for completion before giving up
          const finalCheck = await checkImmediateCompletion();
          if (!finalCheck) {
            setGeneratingImages(false);
            toast({
              title: "Generation Timeout", 
              description: "Photos are taking longer than expected. Check your gallery later!",
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error('AI-PHOTOSHOOT: Polling error:', error);
        if (attempts < maxAttempts) {
          setTimeout(poll, 3000);
        } else {
          setGeneratingImages(false);
          toast({
            title: "Connection Error",
            description: "Lost connection while generating. Please try again.",
            variant: "destructive",
          });
        }
      }
    };
    
    // Start polling with initial delay (matching Maya's pattern) 
    setTimeout(poll, 1000); // 1 second initial delay for session stabilization
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
            href="/login"
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
              
              {/* Admin Debug Test Button */}
              {user?.role === 'admin' && (
                <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded max-w-2xl mx-auto">
                  <p className="text-sm text-gray-600 mb-3">Admin Debug Tools:</p>
                  <button
                    onClick={async () => {
                      try {
                        console.log('AI-PHOTOSHOOT: Admin test button clicked');
                        
                        // Test loading most recent completed tracker (similar to Maya's test system)
                        const response = await fetch('/api/generation-trackers/completed', {
                          credentials: 'include'
                        });
                        
                        console.log('AI-PHOTOSHOOT: Test API response status:', response.status);
                        
                        if (response.ok) {
                          const trackers = await response.json();
                          console.log('AI-PHOTOSHOOT: Test - Completed trackers:', trackers);
                          
                          if (trackers.length > 0) {
                            const testTracker = trackers[0]; // Use most recent completed tracker
                            console.log('AI-PHOTOSHOOT: Test - Using tracker:', testTracker);
                            
                            // Ensure imageUrls is properly parsed
                            let imageUrls = testTracker.imageUrls;
                            if (typeof imageUrls === 'string') {
                              imageUrls = JSON.parse(imageUrls);
                            }
                            
                            setCurrentTrackerId(testTracker.id);
                            setGeneratedImages(imageUrls || []);
                            setShowPreviewModal(true);
                            setGeneratingImages(false);
                            
                            console.log('AI-PHOTOSHOOT: Test - Modal should show with', imageUrls?.length, 'images');
                            
                            toast({
                              title: "Test Tracker Loaded",
                              description: `Testing with tracker ${testTracker.id} - ${imageUrls?.length || 0} images`,
                            });
                          } else {
                            toast({
                              title: "No Completed Trackers",
                              description: "No completed trackers found for testing",
                              variant: "destructive",
                            });
                          }
                        } else {
                          const errorText = await response.text();
                          console.error('AI-PHOTOSHOOT: Test API failed:', response.status, errorText);
                          toast({
                            title: "API Test Failed",
                            description: `Status ${response.status}: ${errorText}`,
                            variant: "destructive",
                          });
                        }
                      } catch (error) {
                        console.error('AI-PHOTOSHOOT: Test tracker error:', error);
                        toast({
                          title: "Test Failed",
                          description: error.message || "Could not load test tracker",
                          variant: "destructive",
                        });
                      }
                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 mr-3"
                  >
                    Test Modal with Completed Tracker
                  </button>
                  <span className="text-xs text-gray-500">Tests modal display with most recent completed generation</span>
                </div>
              )}
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

      {/* Maya-style Image Preview Modal - Show when images are available */}
      {(() => {
        console.log('AI-PHOTOSHOOT: Preview modal check - showPreviewModal:', showPreviewModal, 'generatedImages.length:', generatedImages.length);
        return (showPreviewModal || generatingImages) && (generatedImages.length > 0 || generatingImages);
      })() && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4" onClick={() => setShowPreviewModal(false)}>
          <div className="bg-white max-w-5xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-times text-xl font-light text-black">Your AI Photos</h3>
                  <p className="text-sm text-gray-600 mt-1">{selectedPrompt?.name} • {generatedImages.length} images</p>
                </div>
                <button 
                  onClick={() => setShowPreviewModal(false)}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-black rounded-full transition-colors"
                >
                  <span className="text-xl leading-none">×</span>
                </button>
              </div>
            </div>

            {/* Progress Bar During Generation */}
            {generatingImages && (
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Creating your photos...</span>
                  <span className="text-gray-600">{Math.round(generationProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 h-1">
                  <div 
                    className="bg-black h-1 transition-all duration-300" 
                    style={{ width: `${generationProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Natural quality, authentic results • Estimated time: 30-45 seconds</p>
              </div>
            )}

            {/* Image Grid - Mobile Stack, Desktop Grid */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {generatedImages.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={imageUrl}
                      alt={`Generated image ${index + 1}`}
                      className="w-full h-32 object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                      onClick={() => setSelectedImage(imageUrl)}
                    />
                    
                    {/* Minimalistic Heart Save Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        saveToGallery(imageUrl);
                      }}
                      disabled={savingImages.has(imageUrl)}
                      className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white/90 hover:bg-white border border-gray-200 hover:border-gray-300 rounded-full transition-all shadow-sm"
                      title={savedImages.has(imageUrl) ? 'Saved to gallery' : 'Save to gallery'}
                    >
                      {savingImages.has(imageUrl) ? (
                        <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                      ) : savedImages.has(imageUrl) ? (
                        <span className="text-red-500 text-sm">♥</span>
                      ) : (
                        <span className="text-gray-400 hover:text-red-500 text-sm transition-colors">♡</span>
                      )}
                    </button>
                    
                    {/* Subtle Saved Indicator */}
                    {savedImages.has(imageUrl) && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                        <div className="text-white text-xs font-medium">
                          ✓ Saved
                        </div>
                      </div>
                    )}
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors pointer-events-none"></div>
                  </div>
                ))}
              </div>
              
              {/* Preview Status Message */}
              <div className="mt-3 text-xs text-gray-500 bg-gray-50 p-3 rounded border">
                <strong>Preview Mode:</strong> These are temporary preview images. Click the heart (♡) to save your favorites permanently to your gallery.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full-Size Image Modal with Heart-Save */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl max-h-full">
            <img 
              src={selectedImage}
              alt="Full size view"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* Modal Controls */}
            <div className="absolute top-4 right-4 flex gap-2">
              {/* Heart Save Button in Modal */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  saveToGallery(selectedImage);
                }}
                disabled={savingImages.has(selectedImage)}
                className="w-10 h-10 flex items-center justify-center bg-white/90 hover:bg-white border border-gray-200 hover:border-gray-300 rounded-full transition-all shadow-lg"
                title={savedImages.has(selectedImage) ? 'Saved to gallery' : 'Save to gallery'}
              >
                {savingImages.has(selectedImage) ? (
                  <div className="w-4 h-4 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                ) : savedImages.has(selectedImage) ? (
                  <span className="text-red-500 text-lg">♥</span>
                ) : (
                  <span className="text-gray-400 hover:text-red-500 text-lg transition-colors">♡</span>
                )}
              </button>
              
              {/* Close Button */}
              <button 
                onClick={() => setSelectedImage(null)}
                className="w-10 h-10 flex items-center justify-center bg-white/90 hover:bg-white text-gray-700 hover:text-black rounded-full transition-all shadow-lg"
                title="Close"
              >
                <span className="text-xl leading-none">×</span>
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}