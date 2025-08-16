import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface UpdateStats {
  totalCollections: number;
  totalPrompts: number;
  timestamp: string;
}

interface UpdateResult {
  success: boolean;
  message: string;
  upgradeStats?: UpdateStats;
}

export default function MayaCollectionManager() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateResult, setUpdateResult] = useState<UpdateResult | null>(null);
  const { toast } = useToast();

  // Get your actual AI photoshoot collections to update
  const getActualCollections = () => [
    {
      id: 'healing-mindset',
      name: 'HEALING MINDSET',
      subtitle: 'Phoenix Rising', 
      description: 'For when you want to capture how far you\'ve come. You know that quiet strength you have now? The one that came from surviving what almost broke you? Let\'s photograph that.',
      prompts: [
        { id: 'morning-meditation-solitude', name: 'Morning Solitude', category: 'Inner Peace', prompt: '[triggerword], woman finding stillness in the storm through morning meditation, luxurious soft neutral cashmere layers and flowing linen, soft golden morning light streaming through floor-to-ceiling window, peaceful contemplation with eyes gently closed, raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film' },
        { id: 'ocean-therapy-walk', name: 'Ocean Healing', category: 'Nature Therapy', prompt: '[triggerword], woman walking alone on empty beach where the ocean became her therapist, flowing ivory linen maxi dress moving in sea breeze, warm golden dawn lighting with ocean reflections creating healing solitude, contemplative expression while processing thoughts and finding peace in endless horizons, raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film' },
        { id: 'phoenix-rising-portrait', name: 'Phoenix Rising', category: 'Transformation', prompt: '[triggerword], woman who became stronger after the fire - the phoenix rising moment, flowing ethereal white silk dress perfect for transformation photography, magical golden hour backlighting in wheat field at sunset creating warm rim light, powerful yet serene expression with arms outstretched feeling freedom after becoming unbreakable, raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film' }
      ]
    },
    {
      id: 'magazine-covers',
      name: 'E D I T O R I A L',
      subtitle: 'P O W E R',
      description: 'Ready to look like the CEO you already are? These are for when you want photos that make people stop scrolling and think "wow, who is SHE?" Pure magazine cover energy.',
      prompts: [
        { id: 'vogue-transformative-strength', name: 'VOGUE Transformative Strength', category: 'Magazine Covers', prompt: '[triggerword], woman realizing her power in that transformative strength moment, perfectly tailored black off-shoulder blazer with architectural lines and minimal gold jewelry, pure white seamless backdrop with beauty dish lighting creating editorial drama, piercing direct gaze that says everything while hair is swept perfectly over one shoulder, raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film' },
        { id: 'elle-confidence-rebirth', name: 'ELLE Confidence Rebirth', category: 'Magazine Covers', prompt: '[triggerword], woman with that little knowing smile because she has figured it out, elegant black silk charmeuse camisole with beautiful drape and delicate jewelry, soft gray seamless background with window light and silver reflector creating gentle illumination, subtle knowing expression radiating quiet confidence with natural waves framing her face, raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film' },
        { id: 'harpers-bazaar-phoenix', name: "HARPER'S BAZAAR Phoenix", category: 'Magazine Covers', prompt: '[triggerword], woman with CEO energy in that perfect suit ready to take on the world, architecturally structured black suit jacket with dramatic deep V and layered 18k gold necklaces, neutral beige seamless backdrop with three-point studio lighting creating editorial drama, powerful three-quarter turn with strong posture and sleek hair in perfect center part, raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film' }
      ]
    },
    {
      id: 'street-documentary', 
      name: 'STREET DOCUMENTARY',
      subtitle: 'Urban Confidence',
      description: 'Candid moments of moving through the world with quiet authority - street photography that captures authentic confidence',
      prompts: [
        { id: 'copenhagen-bike-commute', name: 'Copenhagen Commute', category: 'Urban Movement', prompt: '[triggerword], woman cycling through the city with effortless grace and sustainable luxury in motion, tailored wool coat and leather crossbody bag perfect for urban sophistication, natural daylight illuminating colorful Nordic Copenhagen buildings creating Scandinavian charm, confident expression while commuting with minimal gold jewelry and hair moving gently in breeze, raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film' },
        { id: 'milan-fashion-walk', name: 'Milan Fashion District', category: 'Style in Motion', prompt: '[triggerword], woman walking through the fashion capital with innate style where elegance meets everyday, elevated basics with long camel coat and designer accessories showcasing Italian sophistication, golden hour lighting illuminating beautiful Italian architecture creating fashion district ambiance, purposeful stride with serene focused expression and effortlessly styled hair, raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film' },
        { id: 'london-crosswalk-moment', name: 'London Crosswalk', category: 'City Navigation', prompt: '[triggerword], woman navigating the city with quiet confidence in urban moments that feel cinematic, classic trench coat with minimal scarf and leather boots creating British sophistication, overcast natural lighting illuminating classic British architecture during street crossing, determined expression while navigating crosswalk with hair moving in city breeze, raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film' }
      ]
    },
    {
      id: 'lifestyle-editorial',
      name: 'LIFESTYLE EDITORIAL', 
      subtitle: 'Authentic Moments',
      description: 'Those beautiful in-between moments when life feels like art - elevated everyday photography',
      prompts: [
        { id: 'morning-coffee-ritual', name: 'Morning Coffee Ritual', category: 'Daily Rituals', prompt: '[triggerword], woman in her morning coffee ritual where life feels like art, cream silk camisole and cashmere robe creating elegant morning comfort, warm golden sunlight streaming through large kitchen windows illuminating marble countertops during peaceful daily routine, serene expression while holding ceramic mug with steam visible and hair in natural morning waves, raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film' },
        { id: 'reading-window-light', name: 'Reading by Window', category: 'Quiet Moments', prompt: '[triggerword], woman reading by window in quiet moments that feel cinematic, oversized cream sweater perfect for cozy sophistication, soft natural afternoon light streaming through sheer curtains creating dreamy illumination, peaceful focused expression while reading with book in lap and hair naturally framing face, raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film' },
        { id: 'evening-skincare-ritual', name: 'Evening Skincare', category: 'Self-Care', prompt: '[triggerword], woman in evening skincare ritual as beautiful self-care moment, white cotton robe creating spa-like elegance, warm bathroom lighting with candles creating intimate luxury atmosphere, gentle expression while applying skincare with mirror reflection and hair pulled back naturally, raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film' }
      ]
    },
    {
      id: 'vogue-editorial',
      name: 'VOGUE EDITORIAL',
      subtitle: 'High Fashion',
      description: 'When you want pure high fashion drama - editorial moments that belong in Vogue',
      prompts: [
        { id: 'architectural-blazer', name: 'Architectural Power', category: 'Power Suiting', prompt: '[triggerword], woman in architectural power blazer creating high fashion drama perfect for Vogue, structured black blazer with dramatic shoulders and minimal accessories showcasing editorial sophistication, studio lighting with beauty dish and fill creating fashion photography drama, confident expression with sleek hair and strong jawline highlighting architectural fashion, raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film' },
        { id: 'silk-slip-elegance', name: 'Silk Slip Elegance', category: 'Luxury Minimalism', prompt: '[triggerword], woman in silk slip elegance creating luxury minimalism perfect for editorial, champagne silk slip dress with delicate gold jewelry showcasing understated luxury, soft window light creating gentle shadows and editorial mood, serene expression with natural waves and authentic beauty highlighting silk texture, raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film' },
        { id: 'couture-statement', name: 'Couture Statement', category: 'High Fashion', prompt: '[triggerword], woman making couture statement in high fashion moment, dramatic black evening wear with architectural details showcasing couture craftsmanship, dramatic studio lighting creating high fashion editorial atmosphere, powerful expression with perfect styling and editorial hair showing fashion authority, raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film' }
      ]
    },
    {
      id: 'golden-hour',
      name: 'GOLDEN HOUR',
      subtitle: 'Natural Light',
      description: 'Chasing that perfect light - golden hour photography that makes everything magical',
      prompts: [
        { id: 'field-freedom', name: 'Field Freedom', category: 'Nature', prompt: '[triggerword], woman experiencing field freedom in golden hour magic, flowing white linen dress perfect for natural movement, warm golden sunset light creating rim lighting and lens flares during golden hour photography, joyful expression with arms outstretched and hair flowing in evening breeze showing pure freedom, raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film' },
        { id: 'urban-sunset', name: 'Urban Sunset', category: 'City Golden Hour', prompt: '[triggerword], woman in urban sunset creating city golden hour magic, casual chic outfit with denim jacket perfect for urban exploration, warm golden hour light illuminating city architecture and creating urban photography mood, contemplative expression while walking through city streets with hair catching light naturally, raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film' },
        { id: 'garden-serenity', name: 'Garden Serenity', category: 'Natural Beauty', prompt: '[triggerword], woman in garden serenity during golden hour natural beauty, soft pastel dress with delicate details perfect for garden photography, warm golden light filtering through leaves creating dappled natural lighting, peaceful expression while surrounded by flowers with hair glowing in natural light, raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film' }
      ]
    },
    {
      id: 'urban-edge',
      name: 'URBAN EDGE',
      subtitle: 'City Attitude',
      description: 'City life with an edge - architectural backgrounds and urban sophistication',
      prompts: [
        { id: 'rooftop-authority', name: 'Rooftop Authority', category: 'City Power', prompt: '[triggerword], woman with rooftop authority showing city power and urban sophistication, black leather jacket with minimal accessories creating edgy city style, dramatic city skyline background with urban architecture, confident expression with wind-blown hair showing metropolitan authority, raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film' },
        { id: 'industrial-chic', name: 'Industrial Chic', category: 'Urban Fashion', prompt: '[triggerword], woman embodying industrial chic in urban fashion moment, structured coat with architectural details perfect for city sophistication, industrial background with concrete and steel creating urban editorial mood, powerful expression with sleek styling showing metropolitan edge, raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film' },
        { id: 'street-style', name: 'Street Style', category: 'Urban Movement', prompt: '[triggerword], woman in street style showing urban movement and city confidence, trendy oversized blazer with street fashion accessories, urban street background with graffiti and city life, dynamic expression while walking with hair in motion showing street sophistication, raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film' }
      ]
    }
  ];

  const handleUpdateCollections = async () => {
    setIsUpdating(true);
    setUpdateResult(null);
    
    try {
      const collections = getActualCollections();
      
      toast({
        title: "Maya is updating collections...",
        description: `Upgrading ${collections.length} collections with latest 2025 trends`,
      });

      const result = await apiRequest('/api/maya-update-collections', 'POST', {
        collections
      });

      setUpdateResult(result);

      if (result.success) {
        toast({
          title: "Collections Updated Successfully!",
          description: `Maya upgraded ${result.upgradeStats?.totalPrompts} prompts with latest fashion trends and anatomy fixes`,
        });
      } else {
        toast({
          title: "Update Failed",
          description: result.message,
          
        });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setUpdateResult({
        success: false,
        message: errorMessage
      });
      
      toast({
        title: "Update Error",
        description: errorMessage,
        
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-xl font-light font-serif mb-2">Maya Collection Manager</h2>
        <p className="text-gray-600 text-sm">
          Update AI photoshoot collections with Maya's latest 2025 fashion expertise and anatomy fixes
        </p>
      </div>

      <div className="space-y-4">
        {/* Collections Preview */}
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="font-medium mb-2">Your AI Photoshoot Collections to Update:</h3>
          <div className="grid grid-cols-1 gap-2 text-sm">
            {getActualCollections().map(collection => (
              <div key={collection.id} className="flex justify-between">
                <span className="font-medium">{collection.name}</span>
                <span className="text-gray-500">{collection.prompts.length} prompts</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t text-xs text-gray-600">
            Total: {getActualCollections().reduce((acc, col) => acc + col.prompts.length, 0)} prompts across 7 collections
          </div>
        </div>

        {/* Update Button */}
        <button
          onClick={handleUpdateCollections}
          disabled={isUpdating}
          className="w-full px-4 py-3 bg-black text-white text-sm uppercase tracking-wide transition-all hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUpdating ? 'Maya is updating collections...' : 'Update All Collections with Maya'}
        </button>

        {/* Results */}
        {updateResult && (
          <div className={`p-4 rounded border ${updateResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <h3 className={`font-medium mb-2 ${updateResult.success ? 'text-green-800' : 'text-red-800'}`}>
              {updateResult.success ? 'Update Successful' : 'Update Failed'}
            </h3>
            <p className={`text-sm ${updateResult.success ? 'text-green-700' : 'text-red-700'}`}>
              {updateResult.message}
            </p>
            
            {updateResult.success && updateResult.upgradeStats && (
              <div className="mt-3 text-sm text-green-700">
                <div>Collections Updated: {updateResult.upgradeStats.totalCollections}</div>
                <div>Prompts Enhanced: {updateResult.upgradeStats.totalPrompts}</div>
                <div>Updated: {new Date(updateResult.upgradeStats.timestamp).toLocaleString()}</div>
              </div>
            )}
          </div>
        )}

        {/* What Maya Does */}
        <div className="text-xs text-gray-500 border-l-2 border-gray-200 pl-3">
          <strong>Maya's Enhancement Process:</strong>
          <ul className="mt-1 space-y-1">
            <li>• Upgrades basic prompts with 2025 fashion trends</li>
            <li>• Adds luxury editorial sophistication</li>
            <li>• Includes environmental storytelling</li>
            <li>• Ensures anatomical accuracy (no hand/foot issues)</li>
            <li>• Applies optimal generation parameters</li>
          </ul>
        </div>
      </div>
    </div>
  );
}