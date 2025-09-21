/**
 * Aesthetic Recipes Collection - 6 Seed Recipes
 * Based on Maya's signature looks with rich, detailed prompting capabilities
 */

import { AestheticRecipe } from './types';

export const AESTHETIC_RECIPES: AestheticRecipe[] = [
  {
    id: 'scandinavian-minimalist',
    name: 'The Scandinavian Minimalist',
    description: 'Clean, bright, and intentional. Capturing cozy modern vibes with natural materials and soft light.',
    tags: ['minimalist', 'nordic', 'bright', 'natural', 'clean', 'hygge'],
    styleKey: 'scandinavian-minimalist',
    
    femaleLook: {
      subject: {
        energyLevel: 'calm',
        expression: 'serene'
      },
      attire: {
        category: 'minimalist',
        fabrics: ['cashmere', 'linen', 'organic cotton', 'merino wool'],
        colors: ['cream', 'beige', 'soft white', 'light grey'],
        details: ['oversized silhouettes', 'clean lines', 'subtle textures', 'minimal jewelry']
      },
      pose: {
        primary: 'seated naturally in bright, airy space with relaxed posture',
        alternatives: ['standing by large windows', 'sitting cross-legged on floor cushions', 'leaning against white wall'],
        props: ['ceramic mug', 'knitted blanket', 'simple notebook']
      },
      proseElements: {
        settingNarratives: [
          'bathed in soft morning light streaming through floor-to-ceiling windows',
          'surrounded by clean white walls and warm light wood floors',
          'nestled in a serene corner with sheer linen curtains dancing gently'
        ],
        characterNarratives: [
          'wrapped in an oversized cream cashmere sweater',
          'her natural beauty enhanced by the soft, diffused lighting',
          'embodying effortless Nordic elegance'
        ],
        atmosphereNarratives: [
          'the air filled with quiet contemplation and morning peace',
          'creating an atmosphere of mindful simplicity',
          'evoking the Danish concept of hygge'
        ],
        sensoryDetails: [
          'the warmth of ceramic between her palms',
          'soft wool textures against skin',
          'the gentle sound of pages turning'
        ],
        storyMoments: [
          'pausing mid-thought while reading',
          'gazing thoughtfully out the window',
          'cradling a steaming mug of coffee'
        ]
      }
    },
    
    maleLook: {
      subject: {
        energyLevel: 'contemplative',
        expression: 'focused'
      },
      attire: {
        category: 'minimalist',
        fabrics: ['merino wool', 'linen', 'organic cotton', 'soft knits'],
        colors: ['charcoal', 'cream', 'warm grey', 'natural white'],
        details: ['relaxed tailoring', 'clean cuts', 'subtle textures', 'minimal accessories']
      },
      pose: {
        primary: 'seated at modern wooden desk with natural, thoughtful posture',
        alternatives: ['standing by bright window', 'leaning against minimalist kitchen counter', 'sitting in modern chair'],
        props: ['leather journal', 'simple ceramic cup', 'wooden pen']
      },
      proseElements: {
        settingNarratives: [
          'positioned in a bright, minimalist workspace with natural light flooding the scene',
          'surrounded by clean architectural lines and warm wood elements',
          'framed by large windows overlooking serene landscapes'
        ],
        characterNarratives: [
          'dressed in a perfectly fitted charcoal wool sweater',
          'his calm presence commanding the peaceful space',
          'embodying modern Scandinavian masculinity'
        ],
        atmosphereNarratives: [
          'the space breathing with intentional simplicity',
          'morning light creating soft, directional shadows',
          'an environment designed for deep thinking'
        ],
        sensoryDetails: [
          'the smooth texture of worn leather',
          'soft wool warming against morning chill',
          'the gentle scratch of pen on paper'
        ],
        storyMoments: [
          'pausing while writing in his journal',
          'looking up from work with clear focus',
          'reaching for his morning coffee with deliberate calm'
        ]
      }
    },
    
    nonbinaryLook: {
      subject: {
        energyLevel: 'balanced',
        expression: 'peacefully confident'
      },
      attire: {
        category: 'androgynous-minimalist',
        fabrics: ['bamboo blends', 'organic linen', 'soft knits', 'natural cotton'],
        colors: ['sage green', 'warm beige', 'soft grey', 'cream'],
        details: ['fluid silhouettes', 'unstructured shapes', 'natural draping', 'simple accessories']
      },
      pose: {
        primary: 'seated comfortably in cross-legged position with centered, grounded presence',
        alternatives: ['standing gracefully by window', 'sitting in meditation pose', 'leaning against white wall'],
        props: ['handmade ceramic mug', 'woven blanket', 'small plant']
      },
      proseElements: {
        settingNarratives: [
          'bathed in the gentle glow of natural light through sheer curtains',
          'surrounded by carefully curated minimalist elements',
          'positioned in a space that breathes tranquility'
        ],
        characterNarratives: [
          'wearing flowing, unstructured garments in earth tones',
          'their presence radiating calm confidence',
          'embodying the essence of mindful living'
        ],
        atmosphereNarratives: [
          'the room humming with peaceful energy',
          'creating a sanctuary of intentional simplicity',
          'morning light painting everything in soft, warm tones'
        ],
        sensoryDetails: [
          'the gentle warmth of ceramics',
          'soft natural fibers against skin',
          'the quiet rustle of plants nearby'
        ],
        storyMoments: [
          'taking a mindful sip of herbal tea',
          'gazing peacefully into the morning light',
          'adjusting their cozy blanket with gentle movements'
        ]
      }
    },
    
    atmosphere: {
      setting: {
        location: 'nordic-inspired-interior',
        environment: {
          architecture: ['floor-to-ceiling windows', 'white painted walls', 'light oak floors', 'clean geometric lines'],
          furnishing: ['modern scandinavian chair', 'simple wooden desk', 'cozy floor cushions', 'minimal side table'],
          decorative: ['single green plant', 'ceramic vessels', 'woven textiles', 'natural wood elements']
        },
        props: ['handmade ceramics', 'wool throws', 'simple books', 'candles'],
        textures: ['smooth wood grain', 'soft wool knits', 'linen weaves', 'matte ceramics']
      },
      mood: 'serene and contemplative',
      season: 'early spring',
      timeOfDay: 'morning',
      weatherElements: ['soft overcast light', 'gentle breeze through windows']
    },
    
    lighting: {
      source: 'natural',
      quality: 'soft',
      direction: 'diffused',
      specifics: ['bright overcast daylight', 'soft morning glow', 'even illumination', 'minimal shadows']
    },
    
    composition: {
      framing: 'half-body',
      cameraAngle: 'eye-level',
      lensType: '85mm portrait',
      depthOfField: 'shallow'
    },
    
    qualityHints: ['raw photo', 'editorial quality', 'professional photography', 'sharp focus', 'film grain', 'visible skin pores'],
    negativePrompts: ['plastic', 'artificial', 'oversaturated', 'harsh lighting', 'cluttered']
  },

  {
    id: 'urban-moody',
    name: 'The Urban Moody',
    description: 'Sophisticated, atmospheric, and cinematic. For the professional with an edge who thrives in dynamic city environments.',
    tags: ['urban', 'moody', 'dramatic', 'atmospheric', 'cinematic', 'sophisticated'],
    styleKey: 'urban-moody',
    
    femaleLook: {
      subject: {
        energyLevel: 'dynamic',
        expression: 'mysterious'
      },
      attire: {
        category: 'urban-chic',
        fabrics: ['leather', 'silk', 'wool', 'structured cotton'],
        colors: ['black', 'charcoal', 'deep burgundy', 'midnight blue'],
        details: ['sharp tailoring', 'dramatic silhouettes', 'statement pieces', 'metallic accents']
      },
      pose: {
        primary: 'leaning against exposed brick wall with confident, edgy stance',
        alternatives: ['walking purposefully down urban street', 'seated in dimly lit sophisticated bar', 'standing in modern art gallery'],
        props: ['leather handbag', 'statement watch', 'dark sunglasses']
      },
      proseElements: {
        settingNarratives: [
          'positioned against weathered brick walls in the heart of the city',
          'framed by the dramatic architecture of urban landscapes',
          'surrounded by the energy and edge of metropolitan environments'
        ],
        characterNarratives: [
          'dressed in an impeccably tailored black leather jacket over silk blouse',
          'her presence commanding attention in the urban setting',
          'embodying the sophisticated power of city life'
        ],
        atmosphereNarratives: [
          'the air thick with urban sophistication and creative energy',
          'shadows and light playing dramatically across the scene',
          'the pulse of the city creating an electric atmosphere'
        ],
        sensoryDetails: [
          'the supple feel of premium leather',
          'cool metal against warm skin',
          'the distant hum of city life'
        ],
        storyMoments: [
          'pausing mid-stride with confident purpose',
          'adjusting her jacket collar with precise movement',
          'gazing into the urban distance with focused intensity'
        ]
      }
    },
    
    maleLook: {
      subject: {
        energyLevel: 'intense',
        expression: 'focused'
      },
      attire: {
        category: 'urban-professional',
        fabrics: ['wool', 'leather', 'cashmere', 'structured cotton'],
        colors: ['charcoal black', 'deep grey', 'midnight navy', 'dark brown'],
        details: ['sharp cuts', 'architectural lines', 'premium textures', 'minimal details']
      },
      pose: {
        primary: 'standing confidently in industrial-chic environment with strong posture',
        alternatives: ['leaning against modern glass building', 'walking through urban alleyway', 'seated in contemporary loft space'],
        props: ['leather briefcase', 'minimalist watch', 'architectural eyewear']
      },
      proseElements: {
        settingNarratives: [
          'positioned in the sophisticated shadows of modern urban architecture',
          'framed by the geometric lines of contemporary city design',
          'surrounded by the raw energy of metropolitan creativity'
        ],
        characterNarratives: [
          'wearing a perfectly cut charcoal wool coat over dark cashmere sweater',
          'his commanding presence cutting through the urban landscape',
          'embodying modern masculine sophistication'
        ],
        atmosphereNarratives: [
          'the city creating a backdrop of dynamic energy',
          'dramatic lighting sculpting strong features',
          'an environment of creative intensity and urban power'
        ],
        sensoryDetails: [
          'the weight of quality wool',
          'cool urban air against skin',
          'the distant sounds of city rhythm'
        ],
        storyMoments: [
          'checking his watch with purposeful precision',
          'surveying the urban landscape with strategic thinking',
          'moving through the city with confident determination'
        ]
      }
    },
    
    nonbinaryLook: {
      subject: {
        energyLevel: 'edgy',
        expression: 'creatively intense'
      },
      attire: {
        category: 'androgynous-urban',
        fabrics: ['structured cotton', 'leather', 'wool blends', 'technical fabrics'],
        colors: ['all black', 'charcoal', 'deep forest', 'gunmetal'],
        details: ['asymmetric cuts', 'architectural shapes', 'bold proportions', 'statement accessories']
      },
      pose: {
        primary: 'standing with artistic confidence in urban creative space',
        alternatives: ['leaning against graffiti wall', 'walking through art district', 'posed in modern gallery'],
        props: ['structured bag', 'creative accessories', 'artistic eyewear']
      },
      proseElements: {
        settingNarratives: [
          'positioned in the creative heart of the urban arts district',
          'surrounded by the raw energy of street art and modern architecture',
          'framed by the intersection of creative rebellion and sophisticated style'
        ],
        characterNarratives: [
          'wearing bold, architectural clothing in deep, moody tones',
          'their presence radiating artistic confidence and urban edge',
          'embodying the intersection of creativity and street sophistication'
        ],
        atmosphereNarratives: [
          'the air buzzing with creative energy and urban rebellion',
          'shadows creating dramatic patterns of light and dark',
          'an environment where art meets street culture'
        ],
        sensoryDetails: [
          'the texture of urban surfaces',
          'cool night air carrying city scents',
          'the echo of footsteps on concrete'
        ],
        storyMoments: [
          'pausing to observe street art with artistic appreciation',
          'adjusting their statement piece with creative flair',
          'moving through the urban landscape with artistic purpose'
        ]
      }
    },
    
    atmosphere: {
      setting: {
        location: 'urban-industrial-chic',
        environment: {
          architecture: ['exposed brick walls', 'industrial metal elements', 'modern glass surfaces', 'concrete structures'],
          furnishing: ['minimalist steel furniture', 'leather seating', 'industrial lighting', 'contemporary art pieces'],
          decorative: ['modern sculptures', 'abstract art', 'dramatic plants', 'architectural elements']
        },
        props: ['leather accessories', 'metal details', 'contemporary art', 'urban elements'],
        textures: ['rough brick', 'smooth leather', 'cold metal', 'polished concrete']
      },
      mood: 'sophisticated and edgy',
      timeOfDay: 'golden hour or dusk',
      weatherElements: ['dramatic shadows', 'urban atmospheric haze']
    },
    
    lighting: {
      source: 'mixed',
      quality: 'dramatic',
      direction: 'side-lit',
      specifics: ['deep shadows', 'dramatic contrast', 'urban ambient light', 'architectural shadows']
    },
    
    composition: {
      framing: 'half-body',
      cameraAngle: 'slightly-above',
      lensType: '50mm street',
      depthOfField: 'medium'
    },
    
    qualityHints: ['raw photo', 'editorial quality', 'cinematic lighting', 'sharp focus', 'urban photography', 'high contrast'],
    negativePrompts: ['flat lighting', 'suburban', 'overly bright', 'conventional pose']
  },

  {
    id: 'golden-hour-glow',
    name: 'The Golden Hour Glow',
    description: 'Warm, approachable, and authentic. Capturing the magic of golden hour for genuine connection and natural beauty.',
    tags: ['golden-hour', 'warm', 'authentic', 'natural', 'approachable', 'sun-kissed'],
    styleKey: 'golden-hour-glow',
    
    femaleLook: {
      subject: {
        energyLevel: 'warm',
        expression: 'genuinely happy'
      },
      attire: {
        category: 'casual-luxury',
        fabrics: ['soft knits', 'linen', 'cotton blends', 'cashmere'],
        colors: ['warm cream', 'soft gold', 'peachy tones', 'natural white'],
        details: ['flowing silhouettes', 'natural textures', 'delicate jewelry', 'relaxed fit']
      },
      pose: {
        primary: 'seated naturally in golden light with genuine, warm smile',
        alternatives: ['walking through sun-dappled field', 'standing by window in golden light', 'laughing genuinely in natural setting'],
        props: ['flowing scarf', 'delicate jewelry', 'natural elements']
      },
      proseElements: {
        settingNarratives: [
          'bathed in the magical glow of golden hour sunlight streaming through tall windows',
          'positioned where warm afternoon light creates a natural halo effect',
          'surrounded by the soft, honeyed light of late day sunshine'
        ],
        characterNarratives: [
          'wrapped in a flowing cream cashmere sweater that catches the light beautifully',
          'her authentic smile radiating warmth that matches the golden atmosphere',
          'embodying natural beauty enhanced by the perfect lighting'
        ],
        atmosphereNarratives: [
          'the air filled with the warm, lazy feeling of perfect afternoon light',
          'creating an atmosphere of genuine happiness and natural grace',
          'golden hour magic transforming the entire scene into something ethereal'
        ],
        sensoryDetails: [
          'warm sunlight caressing her face',
          'soft cashmere against sun-warmed skin',
          'the gentle rustle of fabric in warm breeze'
        ],
        storyMoments: [
          'laughing at something delightfully unexpected',
          'closing her eyes to savor the warm sunlight',
          'adjusting her hair as it catches the golden light'
        ]
      }
    },
    
    maleLook: {
      subject: {
        energyLevel: 'relaxed',
        expression: 'warmly confident'
      },
      attire: {
        category: 'casual-refined',
        fabrics: ['linen', 'cotton', 'soft wool', 'knit blends'],
        colors: ['warm beige', 'soft white', 'golden tan', 'natural cream'],
        details: ['relaxed tailoring', 'natural textures', 'minimal accessories', 'comfortable fit']
      },
      pose: {
        primary: 'leaning casually against window frame with warm, genuine expression',
        alternatives: ['sitting relaxed in golden light', 'standing in sun-filled doorway', 'walking in natural setting'],
        props: ['casual watch', 'simple coffee mug', 'natural elements']
      },
      proseElements: {
        settingNarratives: [
          'positioned where golden afternoon light streams through large windows',
          'framed by the warm, directional glow of perfect golden hour timing',
          'surrounded by the natural warmth of late day sunshine'
        ],
        characterNarratives: [
          'wearing a perfectly fitted linen shirt in warm cream tones',
          'his relaxed confidence enhanced by the flattering golden light',
          'embodying approachable masculinity and authentic warmth'
        ],
        atmosphereNarratives: [
          'the space filled with the peaceful energy of golden hour',
          'warm light creating an atmosphere of genuine comfort',
          'the perfect intersection of natural beauty and human authenticity'
        ],
        sensoryDetails: [
          'warm afternoon sun on his shoulders',
          'soft linen moving gently in the breeze',
          'the comfortable weight of quality fabric'
        ],
        storyMoments: [
          'pausing to appreciate the beautiful light',
          'smiling at something genuinely amusing',
          'adjusting his sleeve with casual confidence'
        ]
      }
    },
    
    nonbinaryLook: {
      subject: {
        energyLevel: 'peacefully joyful',
        expression: 'authentically radiant'
      },
      attire: {
        category: 'flowing-natural',
        fabrics: ['organic cotton', 'linen blends', 'soft knits', 'bamboo'],
        colors: ['warm sage', 'golden cream', 'soft peach', 'natural white'],
        details: ['fluid shapes', 'natural draping', 'comfortable layers', 'earth-tone accents']
      },
      pose: {
        primary: 'sitting cross-legged in golden light with serene, joyful expression',
        alternatives: ['standing gracefully in sunbeam', 'walking through golden-lit space', 'resting peacefully in warm light'],
        props: ['flowing fabric', 'natural accessories', 'gentle elements']
      },
      proseElements: {
        settingNarratives: [
          'enveloped in the magical warmth of golden hour sunlight',
          'positioned where afternoon light creates the most flattering natural illumination',
          'surrounded by the peaceful energy of perfect lighting'
        ],
        characterNarratives: [
          'wearing flowing, comfortable clothing in earth tones that complement the golden light',
          'their authentic joy creating a radiance that rivals the sunset',
          'embodying natural beauty and peaceful confidence'
        ],
        atmosphereNarratives: [
          'the space humming with golden hour magic',
          'warm light creating an atmosphere of peaceful celebration',
          'the perfect moment where light and human spirit connect'
        ],
        sensoryDetails: [
          'golden sunlight warming every surface',
          'soft natural fabrics flowing with gentle movement',
          'the peaceful sensation of perfect light'
        ],
        storyMoments: [
          'stretching contentedly in the warm light',
          'breathing deeply with peaceful appreciation',
          'moving gracefully through the golden-lit space'
        ]
      }
    },
    
    atmosphere: {
      setting: {
        location: 'sunlit-interior-or-natural',
        environment: {
          architecture: ['large windows', 'warm wood elements', 'natural stone', 'open spaces'],
          furnishing: ['comfortable seating', 'natural wood furniture', 'soft textiles', 'organic shapes'],
          decorative: ['plants catching light', 'natural elements', 'warm textiles', 'golden accents']
        },
        props: ['natural elements', 'warm textiles', 'organic shapes', 'golden accents'],
        textures: ['warm wood grain', 'soft natural fibers', 'smooth stone', 'flowing fabrics']
      },
      mood: 'warm and authentic',
      season: 'late summer or early autumn',
      timeOfDay: 'golden hour',
      weatherElements: ['warm sunlight', 'gentle breeze', 'perfect temperature']
    },
    
    lighting: {
      source: 'natural',
      quality: 'warm',
      direction: 'directional',
      specifics: ['golden hour sun', 'warm directional light', 'natural lens flare', 'soft shadows']
    },
    
    composition: {
      framing: 'environmental',
      cameraAngle: 'eye-level',
      lensType: '50mm natural',
      depthOfField: 'medium'
    },
    
    qualityHints: ['raw photo', 'golden hour photography', 'natural lighting', 'warm tones', 'authentic expression', 'sun-kissed'],
    negativePrompts: ['harsh lighting', 'artificial', 'cold tones', 'overly posed', 'studio lighting']
  },

  {
    id: 'white-space-executive',
    name: 'The White Space Executive',
    description: 'Modern, powerful, and architecturally clean. For the forward-thinking leader who values contemporary sophistication.',
    tags: ['executive', 'modern', 'architectural', 'clean', 'powerful', 'minimalist'],
    styleKey: 'white-space-executive',
    
    femaleLook: {
      subject: {
        energyLevel: 'commanding',
        expression: 'confidently focused'
      },
      attire: {
        category: 'architectural-business',
        fabrics: ['structured wool', 'silk', 'premium cotton', 'technical fabrics'],
        colors: ['crisp white', 'cool grey', 'charcoal', 'silver accents'],
        details: ['sharp shoulders', 'clean lines', 'architectural cuts', 'minimal jewelry']
      },
      pose: {
        primary: 'standing with executive presence in modern architectural space',
        alternatives: ['seated at modern glass desk', 'walking purposefully through white corridor', 'positioned against geometric wall'],
        props: ['sleek laptop', 'modern accessories', 'architectural elements']
      },
      proseElements: {
        settingNarratives: [
          'positioned in a pristine modern office with floor-to-ceiling windows and clean geometric lines',
          'surrounded by the sophisticated minimalism of contemporary architectural design',
          'framed by white spaces and dramatic shadows that emphasize power and precision'
        ],
        characterNarratives: [
          'wearing a perfectly tailored white blazer with architectural shoulders',
          'her commanding presence filling the modern space with executive authority',
          'embodying the future of feminine leadership and sophisticated power'
        ],
        atmosphereNarratives: [
          'the environment humming with high-tech efficiency and modern sophistication',
          'clean, bright light creating an atmosphere of innovation and forward-thinking',
          'a space designed for visionary leadership and strategic thinking'
        ],
        sensoryDetails: [
          'crisp cotton against skin',
          'cool glass and metal surfaces',
          'the whisper-quiet hum of modern technology'
        ],
        storyMoments: [
          'pausing thoughtfully before making a strategic decision',
          'adjusting her jacket with precise, confident movement',
          'gazing toward the horizon with visionary focus'
        ]
      }
    },
    
    maleLook: {
      subject: {
        energyLevel: 'authoritative',
        expression: 'strategically focused'
      },
      attire: {
        category: 'modern-executive',
        fabrics: ['premium wool', 'technical cotton', 'structured blends', 'refined synthetics'],
        colors: ['charcoal', 'cool white', 'steel grey', 'black accents'],
        details: ['architectural tailoring', 'clean construction', 'minimal details', 'precision fit']
      },
      pose: {
        primary: 'standing with executive authority in white minimalist environment',
        alternatives: ['seated at futuristic desk', 'walking through modern corridor', 'positioned by geometric window'],
        props: ['high-tech devices', 'modern timepiece', 'architectural elements']
      },
      proseElements: {
        settingNarratives: [
          'positioned in the heart of a modern innovation hub with pristine white surfaces',
          'surrounded by the clean geometry of futuristic architectural design',
          'framed by the sophisticated minimalism of contemporary business environments'
        ],
        characterNarratives: [
          'wearing an impeccably cut charcoal suit with modern architectural lines',
          'his executive presence commanding the high-tech environment',
          'embodying the evolution of modern masculine leadership'
        ],
        atmosphereNarratives: [
          'the space radiating efficiency and contemporary sophistication',
          'bright, clinical lighting creating an atmosphere of precision and innovation',
          'an environment engineered for visionary thinking and strategic execution'
        ],
        sensoryDetails: [
          'the precision feel of premium tailoring',
          'smooth, cool surfaces of modern materials',
          'the subtle technological ambiance'
        ],
        storyMoments: [
          'reviewing strategic plans with focused intensity',
          'adjusting his sleeve with executive precision',
          'surveying the cityscape with visionary contemplation'
        ]
      }
    },
    
    nonbinaryLook: {
      subject: {
        energyLevel: 'innovatively confident',
        expression: 'visionary focused'
      },
      attire: {
        category: 'futuristic-professional',
        fabrics: ['technical blends', 'structured cotton', 'innovative materials', 'architectural fabrics'],
        colors: ['pure white', 'cool grey', 'silver', 'minimal black'],
        details: ['geometric shapes', 'innovative cuts', 'architectural proportions', 'futuristic elements']
      },
      pose: {
        primary: 'standing with innovative confidence in ultra-modern white space',
        alternatives: ['positioned at high-tech workstation', 'walking through futuristic corridor', 'posed against geometric architecture'],
        props: ['cutting-edge technology', 'futuristic accessories', 'architectural elements']
      },
      proseElements: {
        settingNarratives: [
          'positioned in an ultra-modern environment of pure white surfaces and geometric precision',
          'surrounded by the cutting-edge design of futuristic workspace architecture',
          'framed by the intersection of human innovation and technological advancement'
        ],
        characterNarratives: [
          'wearing architecturally inspired clothing that blends form with futuristic function',
          'their visionary presence perfectly suited to the innovative environment',
          'embodying the future of leadership beyond traditional boundaries'
        ],
        atmosphereNarratives: [
          'the space buzzing with technological innovation and creative possibility',
          'pristine lighting creating an atmosphere of unlimited potential',
          'an environment designed for breakthrough thinking and revolutionary ideas'
        ],
        sensoryDetails: [
          'the smooth precision of futuristic materials',
          'cool, controlled air circulation',
          'the gentle hum of advanced technology'
        ],
        storyMoments: [
          'engaging with cutting-edge technology with intuitive ease',
          'moving through the space with innovative grace',
          'contemplating future possibilities with visionary clarity'
        ]
      }
    },
    
    atmosphere: {
      setting: {
        location: 'ultra-modern-office',
        environment: {
          architecture: ['floor-to-ceiling glass', 'white surfaces', 'geometric elements', 'clean lines'],
          furnishing: ['minimalist furniture', 'high-tech elements', 'geometric seating', 'glass surfaces'],
          decorative: ['architectural sculptures', 'minimal art', 'high-tech displays', 'geometric plants']
        },
        props: ['modern technology', 'architectural elements', 'minimal accessories', 'high-tech details'],
        textures: ['smooth glass', 'matte white surfaces', 'polished metal', 'technical fabrics']
      },
      mood: 'powerful and futuristic',
      timeOfDay: 'bright daylight',
      weatherElements: ['bright, even lighting', 'controlled environment']
    },
    
    lighting: {
      source: 'architectural',
      quality: 'bright',
      direction: 'even',
      specifics: ['bright studio lighting', 'clean shadows', 'architectural illumination', 'high-key lighting']
    },
    
    composition: {
      framing: 'half-body',
      cameraAngle: 'slightly-below',
      lensType: '35mm architectural',
      depthOfField: 'deep'
    },
    
    qualityHints: ['raw photo', 'architectural photography', 'high-key lighting', 'executive portrait', 'modern professional', 'clean composition'],
    negativePrompts: ['warm lighting', 'casual pose', 'cluttered background', 'soft focus']
  },

  {
    id: 'night-time-luxe',
    name: 'The Night Time Luxe',
    description: 'Energetic, sophisticated, and glamorous. The city comes alive at night for the dynamic professional.',
    tags: ['nightlife', 'luxe', 'glamorous', 'city', 'sophisticated', 'energetic'],
    styleKey: 'night-time-luxe',
    
    femaleLook: {
      subject: {
        energyLevel: 'dynamic',
        expression: 'glamorously confident'
      },
      attire: {
        category: 'evening-luxe',
        fabrics: ['silk', 'satin', 'velvet', 'sequins', 'premium blends'],
        colors: ['deep black', 'midnight blue', 'rich burgundy', 'metallic accents'],
        details: ['statement pieces', 'luxurious textures', 'dramatic silhouettes', 'sparkling accessories']
      },
      pose: {
        primary: 'standing with glamorous confidence against city nightscape',
        alternatives: ['walking through neon-lit street', 'seated at upscale bar', 'posed on rooftop with city lights'],
        props: ['statement jewelry', 'luxury handbag', 'champagne flute']
      },
      proseElements: {
        settingNarratives: [
          'positioned against the backdrop of glittering city lights and urban energy',
          'surrounded by the sophisticated glamour of high-end nightlife venues',
          'framed by the electric atmosphere of the city after dark'
        ],
        characterNarratives: [
          'wearing an exquisite midnight blue silk dress that catches the city lights',
          'her sophisticated glamour perfectly suited to the electric nighttime environment',
          'embodying the power and allure of modern nightlife elegance'
        ],
        atmosphereNarratives: [
          'the air buzzing with the energy of cosmopolitan nightlife',
          'neon lights and city glow creating a dramatic, luxurious atmosphere',
          'the sophisticated pulse of the city creating an intoxicating backdrop'
        ],
        sensoryDetails: [
          'silk moving with every gesture',
          'cool night air against warm skin',
          'the distant sounds of sophisticated urban nightlife'
        ],
        storyMoments: [
          'pausing to take in the stunning city view',
          'adjusting her statement necklace with elegant precision',
          'moving through the night with glamorous confidence'
        ]
      }
    },
    
    maleLook: {
      subject: {
        energyLevel: 'sophisticated',
        expression: 'confidently suave'
      },
      attire: {
        category: 'evening-formal',
        fabrics: ['premium wool', 'silk', 'velvet', 'fine cotton'],
        colors: ['midnight black', 'charcoal', 'deep navy', 'silver details'],
        details: ['perfectly tailored', 'luxurious textures', 'refined details', 'sophisticated accessories']
      },
      pose: {
        primary: 'standing with suave confidence in sophisticated nighttime setting',
        alternatives: ['leaning against upscale bar', 'walking through illuminated city street', 'positioned on rooftop terrace'],
        props: ['luxury watch', 'classic cocktail', 'sophisticated accessories']
      },
      proseElements: {
        settingNarratives: [
          'positioned in the heart of the city\'s most sophisticated nighttime venues',
          'surrounded by the refined elegance of high-end urban nightlife',
          'framed by the dramatic interplay of city lights and shadows'
        ],
        characterNarratives: [
          'wearing an impeccably tailored midnight black tuxedo with silk lapels',
          'his suave confidence perfectly matched to the sophisticated nighttime environment',
          'embodying the timeless elegance of refined masculine style'
        ],
        atmosphereNarratives: [
          'the environment radiating the sophisticated energy of cosmopolitan nightlife',
          'dramatic lighting creating an atmosphere of luxury and refined celebration',
          'the city\'s most elegant spaces providing the perfect sophisticated backdrop'
        ],
        sensoryDetails: [
          'the luxurious feel of premium wool',
          'cool evening air and warm ambient lighting',
          'the sophisticated sounds of urban nightlife'
        ],
        storyMoments: [
          'adjusting his cufflinks with practiced elegance',
          'surveying the city lights with sophisticated appreciation',
          'moving through the night with refined confidence'
        ]
      }
    },
    
    nonbinaryLook: {
      subject: {
        energyLevel: 'artistically dynamic',
        expression: 'creatively glamorous'
      },
      attire: {
        category: 'avant-garde-evening',
        fabrics: ['innovative textiles', 'metallic elements', 'structured silk', 'artistic blends'],
        colors: ['dramatic black', 'deep jewel tones', 'metallic highlights', 'artistic accents'],
        details: ['avant-garde cuts', 'artistic elements', 'bold proportions', 'creative accessories']
      },
      pose: {
        primary: 'positioned with artistic flair in glamorous nighttime setting',
        alternatives: ['moving through artistic night venue', 'posed against creative city backdrop', 'standing in gallery opening'],
        props: ['artistic accessories', 'creative elements', 'avant-garde details']
      },
      proseElements: {
        settingNarratives: [
          'positioned in the creative heart of the city\'s most artistic nighttime venues',
          'surrounded by the intersection of high art and sophisticated nightlife',
          'framed by the dramatic beauty of urban creativity after dark'
        ],
        characterNarratives: [
          'wearing avant-garde evening wear that perfectly balances artistry with sophistication',
          'their creative glamour ideally suited to the artistic nighttime environment',
          'embodying the evolution of evening elegance beyond traditional boundaries'
        ],
        atmosphereNarratives: [
          'the space pulsing with creative energy and sophisticated artistic expression',
          'dramatic lighting creating an atmosphere where art meets luxury',
          'the perfect fusion of creative rebellion and refined elegance'
        ],
        sensoryDetails: [
          'innovative fabrics with unique textures',
          'the creative energy of artistic spaces',
          'the sophisticated sounds of cultural nightlife'
        ],
        storyMoments: [
          'adjusting their statement piece with artistic flair',
          'engaging with the creative nighttime environment',
          'moving through the space with artistic confidence'
        ]
      }
    },
    
    atmosphere: {
      setting: {
        location: 'upscale-nightlife-venue',
        environment: {
          architecture: ['modern glass structures', 'sophisticated interiors', 'dramatic lighting', 'urban skyline views'],
          furnishing: ['luxury seating', 'premium bar elements', 'sophisticated decor', 'elegant fixtures'],
          decorative: ['ambient lighting', 'luxury accents', 'artistic elements', 'glamorous details']
        },
        props: ['luxury accessories', 'sophisticated elements', 'glamorous details', 'city views'],
        textures: ['smooth glass', 'luxurious fabrics', 'polished surfaces', 'ambient lighting']
      },
      mood: 'glamorous and energetic',
      timeOfDay: 'night',
      weatherElements: ['city lights', 'urban energy', 'sophisticated atmosphere']
    },
    
    lighting: {
      source: 'mixed',
      quality: 'dramatic',
      direction: 'ambient',
      specifics: ['city lights', 'neon ambiance', 'sophisticated lighting', 'dramatic shadows']
    },
    
    composition: {
      framing: 'half-body',
      cameraAngle: 'eye-level',
      lensType: '85mm portrait',
      depthOfField: 'shallow'
    },
    
    qualityHints: ['raw photo', 'night photography', 'city lights', 'glamour portrait', 'sophisticated nightlife', 'urban luxury'],
    negativePrompts: ['daylight', 'casual wear', 'bright lighting', 'suburban setting']
  },

  {
    id: 'high-end-coastal',
    name: 'The High-End Coastal',
    description: 'Effortless luxury meets the sea. Relaxed elegance for the entrepreneur who values sophisticated simplicity.',
    tags: ['coastal', 'luxury', 'relaxed', 'elegant', 'natural', 'breezy'],
    styleKey: 'high-end-coastal',
    
    femaleLook: {
      subject: {
        energyLevel: 'effortlessly elegant',
        expression: 'serenely confident'
      },
      attire: {
        category: 'coastal-luxury',
        fabrics: ['linen', 'silk', 'cashmere', 'organic cotton'],
        colors: ['ivory', 'champagne', 'soft sage', 'warm beige'],
        details: ['flowing silhouettes', 'effortless draping', 'delicate textures', 'minimal jewelry']
      },
      pose: {
        primary: 'standing gracefully by ocean-view window with serene confidence',
        alternatives: ['walking along elegant terrace', 'seated in coastal luxury setting', 'positioned on sophisticated deck'],
        props: ['flowing scarf', 'delicate jewelry', 'elegant sunglasses']
      },
      proseElements: {
        settingNarratives: [
          'positioned in an elegant coastal home with floor-to-ceiling windows overlooking the sea',
          'surrounded by the refined simplicity of luxury coastal living',
          'framed by the natural beauty of sophisticated seaside architecture'
        ],
        characterNarratives: [
          'wearing a flowing ivory linen dress that moves beautifully in the ocean breeze',
          'her effortless elegance perfectly complementing the coastal luxury environment',
          'embodying the sophisticated simplicity of high-end coastal living'
        ],
        atmosphereNarratives: [
          'the air filled with the gentle energy of ocean breezes and refined tranquility',
          'natural light and sea views creating an atmosphere of elegant serenity',
          'the perfect intersection of natural beauty and sophisticated luxury'
        ],
        sensoryDetails: [
          'soft linen moving with ocean breezes',
          'warm sun filtered through sheer curtains',
          'the distant sound of waves against shore'
        ],
        storyMoments: [
          'gazing peacefully toward the ocean horizon',
          'adjusting her flowing dress with elegant grace',
          'breathing deeply of the fresh sea air'
        ]
      }
    },
    
    maleLook: {
      subject: {
        energyLevel: 'relaxed authority',
        expression: 'confidently serene'
      },
      attire: {
        category: 'coastal-refined',
        fabrics: ['linen', 'cotton', 'cashmere blends', 'natural fibers'],
        colors: ['natural white', 'sage green', 'warm sand', 'ocean blue'],
        details: ['relaxed tailoring', 'natural textures', 'effortless fit', 'minimal accessories']
      },
      pose: {
        primary: 'leaning casually against railing with ocean view and confident ease',
        alternatives: ['walking on luxury deck', 'seated in coastal setting', 'standing by seaside window'],
        props: ['casual watch', 'sunglasses', 'natural elements']
      },
      proseElements: {
        settingNarratives: [
          'positioned on the deck of a sophisticated coastal retreat with endless ocean views',
          'surrounded by the effortless luxury of high-end seaside living',
          'framed by the natural elegance of coastal architectural design'
        ],
        characterNarratives: [
          'wearing a perfectly fitted linen shirt in natural white that captures the coastal breeze',
          'his relaxed confidence ideally suited to the sophisticated coastal environment',
          'embodying the refined masculinity of luxury coastal living'
        ],
        atmosphereNarratives: [
          'the environment radiating the peaceful luxury of exclusive coastal retreats',
          'ocean breezes and natural light creating an atmosphere of elegant relaxation',
          'the sophisticated simplicity of high-end beachside living'
        ],
        sensoryDetails: [
          'soft linen moving in warm ocean breezes',
          'the warmth of filtered sunlight',
          'the peaceful rhythm of distant waves'
        ],
        storyMoments: [
          'pausing to appreciate the expansive ocean view',
          'adjusting his shirt collar with casual elegance',
          'breathing in the fresh coastal air with deep satisfaction'
        ]
      }
    },
    
    nonbinaryLook: {
      subject: {
        energyLevel: 'peacefully sophisticated',
        expression: 'naturally elegant'
      },
      attire: {
        category: 'coastal-flowing',
        fabrics: ['organic linen', 'bamboo blends', 'natural cotton', 'soft silks'],
        colors: ['driftwood grey', 'sea glass green', 'sand beige', 'ocean blue'],
        details: ['fluid shapes', 'natural draping', 'comfortable elegance', 'earth-tone accessories']
      },
      pose: {
        primary: 'standing peacefully in coastal luxury setting with natural grace',
        alternatives: ['walking on elegant seaside terrace', 'seated in ocean-view space', 'positioned by coastal window'],
        props: ['flowing elements', 'natural accessories', 'coastal details']
      },
      proseElements: {
        settingNarratives: [
          'positioned in a serene coastal sanctuary with panoramic ocean views',
          'surrounded by the natural elegance of sophisticated seaside design',
          'framed by the intersection of luxury living and coastal natural beauty'
        ],
        characterNarratives: [
          'wearing flowing, comfortable clothing in ocean-inspired tones',
          'their peaceful sophistication perfectly matching the coastal luxury setting',
          'embodying the natural elegance of mindful coastal living'
        ],
        atmosphereNarratives: [
          'the space humming with the peaceful energy of ocean proximity',
          'natural elements creating an atmosphere of sophisticated tranquility',
          'the perfect balance of luxury comfort and natural beauty'
        ],
        sensoryDetails: [
          'gentle ocean breezes through natural fabrics',
          'warm, filtered coastal sunlight',
          'the soothing sounds of nearby waves'
        ],
        storyMoments: [
          'stretching contentedly in the ocean breeze',
          'gazing thoughtfully toward the horizon',
          'adjusting flowing garments with graceful movement'
        ]
      }
    },
    
    atmosphere: {
      setting: {
        location: 'luxury-coastal-home',
        environment: {
          architecture: ['ocean-view windows', 'natural materials', 'open terraces', 'elegant coastal design'],
          furnishing: ['natural wood furniture', 'comfortable luxury seating', 'coastal textiles', 'organic shapes'],
          decorative: ['coastal art', 'natural elements', 'ocean views', 'elegant simplicity']
        },
        props: ['natural materials', 'coastal elements', 'luxury accessories', 'ocean views'],
        textures: ['weathered wood', 'flowing linens', 'natural fibers', 'smooth stones']
      },
      mood: 'elegantly serene',
      season: 'late spring to early summer',
      timeOfDay: 'morning to early afternoon',
      weatherElements: ['ocean breeze', 'filtered sunlight', 'perfect temperature']
    },
    
    lighting: {
      source: 'natural',
      quality: 'bright and airy',
      direction: 'diffused',
      specifics: ['ocean-reflected light', 'bright natural illumination', 'soft shadows', 'coastal atmosphere']
    },
    
    composition: {
      framing: 'environmental',
      cameraAngle: 'eye-level',
      lensType: '50mm natural',
      depthOfField: 'medium'
    },
    
    qualityHints: ['raw photo', 'coastal photography', 'natural lighting', 'luxury lifestyle', 'elegant simplicity', 'sophisticated casual'],
    negativePrompts: ['harsh lighting', 'formal wear', 'urban setting', 'artificial elements']
  },

  {
    id: 'classic-black-white',
    name: 'Editorial B&W',
    description: 'Timeless, emotional, and powerful. Focus on form, texture, and expression for sophisticated artistic storytelling.',
    tags: ['black-white', 'monochrome', 'timeless', 'editorial', 'artistic', 'emotional'],
    styleKey: 'classic-black-white',
    
    femaleLook: {
      subject: {
        energyLevel: 'contemplative',
        expression: 'intensely focused'
      },
      attire: {
        category: 'timeless-elegant',
        fabrics: ['silk', 'wool', 'cashmere', 'structured cotton'],
        colors: ['black', 'white', 'charcoal', 'cream'],
        details: ['classic silhouettes', 'rich textures', 'strong lines', 'minimal accessories']
      },
      pose: {
        primary: 'posed with artistic intention emphasizing form and shadow',
        alternatives: ['seated in contemplative moment', 'standing against textured wall', 'positioned for dramatic lighting'],
        props: ['vintage books', 'architectural elements', 'textural objects']
      },
      proseElements: {
        settingNarratives: [
          'positioned in a space where light and shadow create dramatic interplay',
          'surrounded by rich textures and architectural elements that emphasize form',
          'framed by the timeless beauty of monochromatic composition'
        ],
        characterNarratives: [
          'wearing classic clothing with strong silhouettes that translate beautifully to black and white',
          'her presence commanding attention through pure form and expression',
          'embodying the timeless elegance of editorial photography'
        ],
        atmosphereNarratives: [
          'the environment emphasizing texture, form, and emotional depth',
          'dramatic lighting creating powerful contrasts between light and shadow',
          'an atmosphere that transcends trends and captures essential human beauty'
        ],
        sensoryDetails: [
          'the weight of quality fabrics',
          'cool air creating subtle movement',
          'the play of light across textured surfaces'
        ],
        storyMoments: [
          'pausing in a moment of deep contemplation',
          'turning toward the light with purposeful grace',
          'existing in the perfect intersection of light and shadow'
        ]
      }
    },
    
    maleLook: {
      subject: {
        energyLevel: 'powerfully calm',
        expression: 'thoughtfully intense'
      },
      attire: {
        category: 'classic-masculine',
        fabrics: ['wool', 'cotton', 'linen', 'leather'],
        colors: ['black', 'charcoal', 'white', 'cream'],
        details: ['tailored fits', 'strong shoulders', 'textural interest', 'classic accessories']
      },
      pose: {
        primary: 'positioned with strong masculine presence in dramatic lighting',
        alternatives: ['leaning against architectural element', 'seated in contemplative pose', 'standing with purposeful stance'],
        props: ['leather journal', 'vintage watch', 'architectural details']
      },
      proseElements: {
        settingNarratives: [
          'positioned where dramatic lighting sculpts strong masculine features',
          'surrounded by architectural elements that emphasize strength and character',
          'framed by the powerful contrast of monochromatic composition'
        ],
        characterNarratives: [
          'wearing impeccably tailored clothing that emphasizes form and structure',
          'his commanding presence enhanced by the dramatic interplay of light and shadow',
          'embodying timeless masculine elegance through pure photographic artistry'
        ],
        atmosphereNarratives: [
          'the space radiating strength and contemplative power',
          'high-contrast lighting creating an atmosphere of artistic intensity',
          'an environment where classic masculinity meets artistic expression'
        ],
        sensoryDetails: [
          'the substantial feel of quality wool',
          'the cool precision of architectural surfaces',
          'the dramatic weight of shadow and light'
        ],
        storyMoments: [
          'pausing in powerful contemplation',
          'adjusting his collar with purposeful precision',
          'existing confidently in the intersection of art and masculinity'
        ]
      }
    },
    
    nonbinaryLook: {
      subject: {
        energyLevel: 'artistically centered',
        expression: 'creatively intense'
      },
      attire: {
        category: 'artistic-androgynous',
        fabrics: ['structured blends', 'artistic textiles', 'architectural cotton', 'creative materials'],
        colors: ['dramatic black', 'pure white', 'charcoal grey', 'artistic contrast'],
        details: ['bold proportions', 'geometric shapes', 'artistic lines', 'creative accessories']
      },
      pose: {
        primary: 'positioned with artistic confidence in dramatic monochromatic setting',
        alternatives: ['posed against textural backdrop', 'seated in creative contemplation', 'standing with artistic presence'],
        props: ['artistic elements', 'creative tools', 'sculptural objects']
      },
      proseElements: {
        settingNarratives: [
          'positioned in the dramatic intersection of art and photography',
          'surrounded by the powerful beauty of monochromatic artistic expression',
          'framed by the timeless appeal of black and white composition'
        ],
        characterNarratives: [
          'wearing artistic clothing that emphasizes form and creative expression',
          'their presence radiating artistic confidence and creative intensity',
          'embodying the evolution of photographic artistry beyond traditional boundaries'
        ],
        atmosphereNarratives: [
          'the space humming with creative energy and artistic possibility',
          'dramatic lighting creating an atmosphere where art meets human expression',
          'an environment designed for breaking artistic boundaries'
        ],
        sensoryDetails: [
          'the texture of innovative artistic materials',
          'the dramatic contrast of light and dark',
          'the creative energy of artistic spaces'
        ],
        storyMoments: [
          'engaging with the artistic environment with creative intensity',
          'moving through the space with artistic purpose',
          'existing boldly in the realm of creative expression'
        ]
      }
    },
    
    atmosphere: {
      setting: {
        location: 'artistic-studio-space',
        environment: {
          architecture: ['dramatic walls', 'textural surfaces', 'geometric elements', 'strong lines'],
          furnishing: ['minimal seating', 'artistic elements', 'sculptural pieces', 'textural objects'],
          decorative: ['artistic lighting', 'monochromatic elements', 'sculptural details', 'textural art']
        },
        props: ['books', 'art pieces', 'sculptural objects', 'textural elements'],
        textures: ['rough stone', 'smooth metal', 'worn leather', 'architectural concrete']
      },
      mood: 'dramatically artistic',
      timeOfDay: 'controlled lighting',
      weatherElements: ['dramatic shadows', 'controlled contrast']
    },
    
    lighting: {
      source: 'mixed',
      quality: 'dramatic',
      direction: 'directional',
      specifics: ['high contrast lighting', 'dramatic shadows', 'strong directional light', 'chiaroscuro effect']
    },
    
    composition: {
      framing: 'half-body',
      cameraAngle: 'eye-level',
      lensType: '85mm portrait',
      depthOfField: 'medium'
    },
    
    qualityHints: ['raw photo', 'black and white photography', 'high contrast', 'dramatic lighting', 'editorial portrait', 'artistic composition'],
    negativePrompts: ['color', 'flat lighting', 'low contrast', 'casual pose', 'bright lighting']
  },

  {
    id: 'beige-sophisticated',
    name: 'Beige & Sophisticated',
    description: 'Warm, calm, and professional. The modern neutral palette for contemporary business and creative work.',
    tags: ['beige', 'sophisticated', 'neutral', 'warm', 'professional', 'contemporary'],
    styleKey: 'beige-sophisticated',
    
    femaleLook: {
      subject: {
        energyLevel: 'calmly confident',
        expression: 'warmly professional'
      },
      attire: {
        category: 'sophisticated-neutral',
        fabrics: ['cashmere', 'wool', 'silk', 'high-quality cotton'],
        colors: ['beige', 'cream', 'camel', 'taupe', 'warm ivory'],
        details: ['tonal dressing', 'luxurious textures', 'refined tailoring', 'minimal gold accessories']
      },
      pose: {
        primary: 'seated comfortably in sophisticated neutral environment with warm confidence',
        alternatives: ['standing by modern window', 'positioned in elegant space', 'relaxed in luxury setting'],
        props: ['cashmere accessories', 'elegant coffee cup', 'luxury magazine']
      },
      proseElements: {
        settingNarratives: [
          'positioned in a beautifully designed space featuring warm neutral tones and luxury textures',
          'surrounded by the sophisticated calm of contemporary professional environments',
          'framed by the elegant simplicity of modern neutral design'
        ],
        characterNarratives: [
          'wearing an exquisite camel cashmere sweater that perfectly complements the neutral palette',
          'her warm confidence ideally suited to the sophisticated contemporary setting',
          'embodying the modern evolution of professional elegance'
        ],
        atmosphereNarratives: [
          'the environment radiating sophisticated warmth and professional calm',
          'soft, diffused lighting creating an atmosphere of elegant productivity',
          'the perfect balance of luxury comfort and contemporary professionalism'
        ],
        sensoryDetails: [
          'the luxurious softness of premium cashmere',
          'warm, filtered light creating gentle illumination',
          'the quiet sophistication of contemporary spaces'
        ],
        storyMoments: [
          'pausing thoughtfully while reviewing elegant materials',
          'adjusting her sweater with graceful precision',
          'enjoying a moment of sophisticated calm'
        ]
      }
    },
    
    maleLook: {
      subject: {
        energyLevel: 'steadily confident',
        expression: 'professionally warm'
      },
      attire: {
        category: 'contemporary-professional',
        fabrics: ['wool', 'cashmere', 'cotton', 'linen blends'],
        colors: ['taupe', 'warm grey', 'cream', 'camel'],
        details: ['relaxed tailoring', 'tonal coordination', 'luxury textures', 'minimal accessories']
      },
      pose: {
        primary: 'leaning casually against modern surface with professional warmth',
        alternatives: ['seated in contemporary chair', 'standing in neutral space', 'positioned by elegant window'],
        props: ['leather notebook', 'ceramic coffee cup', 'contemporary accessories']
      },
      proseElements: {
        settingNarratives: [
          'positioned in a sophisticated contemporary office with warm neutral design elements',
          'surrounded by the calm professionalism of modern neutral environments',
          'framed by the elegant sophistication of contemporary business design'
        ],
        characterNarratives: [
          'wearing a perfectly fitted taupe wool sweater that embodies contemporary masculine sophistication',
          'his steady confidence perfectly matching the warm professional environment',
          'embodying the modern approach to business elegance and professional warmth'
        ],
        atmosphereNarratives: [
          'the space radiating contemporary professionalism with sophisticated warmth',
          'natural lighting creating an atmosphere of productive elegance',
          'the ideal environment for modern business leadership and creative thinking'
        ],
        sensoryDetails: [
          'the refined feel of luxury wool',
          'warm ambient lighting creating comfortable illumination',
          'the sophisticated sounds of contemporary professional life'
        ],
        storyMoments: [
          'reviewing important documents with focused attention',
          'adjusting his sweater with professional precision',
          'pausing thoughtfully in the warm, sophisticated light'
        ]
      }
    },
    
    nonbinaryLook: {
      subject: {
        energyLevel: 'centeredly professional',
        expression: 'thoughtfully confident'
      },
      attire: {
        category: 'contemporary-neutral',
        fabrics: ['sustainable blends', 'natural fibers', 'soft wools', 'organic cotton'],
        colors: ['sage beige', 'warm stone', 'natural cream', 'soft taupe'],
        details: ['comfortable elegance', 'natural shapes', 'sustainable luxury', 'earth-tone coordination']
      },
      pose: {
        primary: 'positioned with thoughtful confidence in warm neutral professional space',
        alternatives: ['seated gracefully in contemporary setting', 'standing calmly by modern elements', 'relaxed in sophisticated environment'],
        props: ['sustainable accessories', 'natural elements', 'contemporary tools']
      },
      proseElements: {
        settingNarratives: [
          'positioned in a thoughtfully designed space featuring sustainable luxury and contemporary professionalism',
          'surrounded by the warm sophistication of mindful contemporary design',
          'framed by the intersection of professional success and conscious living'
        ],
        characterNarratives: [
          'wearing beautifully crafted clothing in earth tones that reflect both professionalism and personal values',
          'their thoughtful confidence perfectly suited to the contemporary neutral environment',
          'embodying the future of conscious professional leadership'
        ],
        atmosphereNarratives: [
          'the space radiating mindful professionalism and sustainable sophistication',
          'warm, natural lighting creating an atmosphere of conscious productivity',
          'the perfect environment for values-driven leadership and thoughtful success'
        ],
        sensoryDetails: [
          'the comfort of sustainable, natural fabrics',
          'warm, gentle light creating peaceful illumination',
          'the quiet energy of mindful professional spaces'
        ],
        storyMoments: [
          'reviewing work with thoughtful consideration',
          'adjusting clothing with mindful attention',
          'breathing deeply in the warm, sophisticated atmosphere'
        ]
      }
    },
    
    atmosphere: {
      setting: {
        location: 'contemporary-neutral-office',
        environment: {
          architecture: ['clean lines', 'warm surfaces', 'natural materials', 'contemporary elements'],
          furnishing: ['comfortable modern seating', 'natural wood elements', 'soft textiles', 'elegant accessories'],
          decorative: ['contemporary art', 'natural plants', 'neutral accents', 'sophisticated details']
        },
        props: ['luxury accessories', 'contemporary tools', 'natural elements', 'professional materials'],
        textures: ['soft wools', 'smooth wood', 'natural stone', 'comfortable fabrics']
      },
      mood: 'warmly professional',
      timeOfDay: 'soft daylight',
      weatherElements: ['gentle natural light', 'comfortable temperature']
    },
    
    lighting: {
      source: 'natural',
      quality: 'soft',
      direction: 'diffused',
      specifics: ['warm natural light', 'soft diffused illumination', 'gentle shadows', 'comfortable brightness']
    },
    
    composition: {
      framing: 'half-body',
      cameraAngle: 'eye-level',
      lensType: '85mm portrait',
      depthOfField: 'shallow'
    },
    
    qualityHints: ['raw photo', 'professional photography', 'warm lighting', 'contemporary portrait', 'sophisticated business', 'elegant simplicity'],
    negativePrompts: ['harsh lighting', 'cold tones', 'formal corporate', 'artificial elements']
  }
];

export default AESTHETIC_RECIPES;
