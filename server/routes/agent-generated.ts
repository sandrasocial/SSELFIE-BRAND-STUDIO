// client/src/data/collections/finding-myself.ts

export const findingMyselfCollection = {
  id: 'finding-myself',
  title: 'Finding Myself',
  description: 'A journey of self-discovery through authentic moments and elevated style',
  coverImage: '/images/collections/finding-myself-cover.jpg',
  tags: ['self-discovery', 'authentic', 'editorial', 'empowerment'],
  prompts: [
    {
      id: 'mirror-moment',
      title: 'Mirror Reflection',
      prompt: 'Editorial portrait of [triggerword] in an oversized cream blazer over a simple white tee, standing before a large vintage mirror in soft morning light. Natural makeup, hair swept back effortlessly. The mirror reflects not just her image but a sense of quiet contemplation and self-acceptance. Scandinavian minimalist interior, muted tones, professional fashion photography, shot with 85mm lens, shallow depth of field',
      category: 'self-reflection',
      mood: 'contemplative'
    },
    {
      id: 'golden-hour-confidence', 
      title: 'Golden Hour Awakening',
      prompt: 'Cinematic portrait of [triggerword] in a flowing camel coat, standing by floor-to-ceiling windows during golden hour. Hair catches the warm light, genuine smile, eyes full of determination. Modern luxury apartment setting, clean lines, warm golden light streaming across her face. Editorial fashion photography, natural authentic moment, Vogue-style composition',
      category: 'empowerment',
      mood: 'confident'
    },
    {
      id: 'cozy-vulnerability',
      title: 'Quiet Strength',
      prompt: 'Intimate portrait of [triggerword] in an oversized cashmere sweater in soft beige, sitting cross-legged on a plush velvet sofa. Holding a warm cup of tea, natural gentle smile, soft window light. Cozy luxury living room with textured throws and plants. Raw authentic moment capturing inner peace and self-acceptance, shot with 50mm lens, warm tones',
      category: 'authenticity',
      mood: 'peaceful'
    },
    {
      id: 'power-stride',
      title: 'Stepping Into Power',
      prompt: 'Dynamic editorial shot of [triggerword] walking confidently in a perfectly tailored black blazer and wide-leg trousers. Hair flowing behind her, purposeful stride, head held high. Modern glass office building or city street background, dramatic shadows and light. Capturing that moment of stepping into your power, professional fashion photography, editorial lighting',
      category: 'empowerment', 
      mood: 'powerful'
    },
    {
      id: 'creative-space',
      title: 'In My Element',
      prompt: 'Lifestyle portrait of [triggerword] in a relaxed linen shirt and high-waisted jeans, working in a beautiful creative space. Natural focused expression, surrounded by inspiration boards, plants, and warm lighting. Authentic moment of being in flow, doing what she loves. Scandinavian workspace aesthetic, soft natural light, 35mm lens, editorial lifestyle photography',
      category: 'authenticity',
      mood: 'inspired'
    },
    {
      id: 'evening-elegance',
      title: 'Refined Grace',
      prompt: 'Elegant portrait of [triggerword] in a silk slip dress in deep emerald, sitting gracefully in a velvet armchair. Soft romantic lighting, natural confident expression, hair styled in loose waves. Luxury hotel lounge or sophisticated interior, warm ambient lighting. Capturing refined femininity and self-assurance, shot with 85mm lens, editorial portrait style',
      category: 'elegance',
      mood: 'sophisticated'
    }
  ]
};