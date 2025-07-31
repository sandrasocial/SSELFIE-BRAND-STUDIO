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

  // Default photoshoot collections to update
  const getDefaultCollections = () => [
    {
      id: 'executive-power',
      name: 'Executive Power',
      description: 'Sophisticated business editorial moments',
      prompts: [
        { id: 'boardroom', name: 'Boardroom Authority', category: 'business', prompt: 'professional business portrait in modern office' },
        { id: 'power-lunch', name: 'Power Lunch', category: 'business', prompt: 'elegant dining scene with professional attire' },
        { id: 'leadership', name: 'Leadership Moment', category: 'business', prompt: 'confident executive in meeting room' }
      ]
    },
    {
      id: 'coastal-luxury',
      name: 'Coastal Luxury', 
      description: 'Beach elegance meets high fashion',
      prompts: [
        { id: 'sunset', name: 'Sunset Sophistication', category: 'lifestyle', prompt: 'luxury beach resort fashion photography' },
        { id: 'ocean', name: 'Ocean Editorial', category: 'lifestyle', prompt: 'seaside fashion shoot with natural lighting' },
        { id: 'beach-walk', name: 'Beach Walk', category: 'lifestyle', prompt: 'elegant woman walking on beach' }
      ]
    },
    {
      id: 'urban-edge',
      name: 'Urban Edge',
      description: 'City sophistication with editorial attitude',
      prompts: [
        { id: 'rooftop', name: 'Rooftop Authority', category: 'editorial', prompt: 'confident woman on city rooftop' },
        { id: 'industrial', name: 'Industrial Chic', category: 'editorial', prompt: 'fashion photography in industrial setting' },
        { id: 'street-style', name: 'Street Style', category: 'editorial', prompt: 'urban fashion photography street scene' }
      ]
    },
    {
      id: 'minimalist-luxury',
      name: 'Minimalist Luxury',
      description: 'Clean sophistication and refined elegance',
      prompts: [
        { id: 'studio', name: 'Studio Elegance', category: 'minimalist', prompt: 'clean studio portrait luxury fashion' },
        { id: 'architectural', name: 'Architectural Lines', category: 'minimalist', prompt: 'modern architecture background fashion' },
        { id: 'gallery', name: 'Gallery Moment', category: 'minimalist', prompt: 'art gallery sophisticated portrait' }
      ]
    }
  ];

  const handleUpdateCollections = async () => {
    setIsUpdating(true);
    setUpdateResult(null);
    
    try {
      const collections = getDefaultCollections();
      
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
          variant: "destructive"
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
        variant: "destructive"
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
          <h3 className="font-medium mb-2">Collections to Update:</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {getDefaultCollections().map(collection => (
              <div key={collection.id} className="flex justify-between">
                <span>{collection.name}</span>
                <span className="text-gray-500">{collection.prompts.length} prompts</span>
              </div>
            ))}
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