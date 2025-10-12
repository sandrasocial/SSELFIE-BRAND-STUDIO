/**
 * Image Generation Vertical Slice - Complete End-to-End Demonstration
 * 
 * This component demonstrates the complete workflow:
 * 1. Maya AI conversation interface
 * 2. Concept card generation
 * 3. FLUX image generation
 * 4. Database persistence
 * 5. Image display and interaction
 */

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types from our manual overrides
interface ConceptCard {
  id: string;
  title: string;
  description: string | null;
  fluxPrompt?: string;
  generatedImages?: string[];
  isGenerating?: boolean;
  hasGenerated?: boolean;
}

interface MayaResponse {
  response: string;
  conceptCards?: ConceptCard[];
  conversationId: string;
}

interface GenerationRequest {
  conceptCard: ConceptCard;
  userModelId?: string;
}

interface GeneratedImage {
  id: number;
  imageUrl: string;
  prompt: string;
  generatedPrompt: string;
  isSelected: boolean;
  isFavorite: boolean;
}

export const ImageGenerationVerticalSlice: React.FC = () => {
  const [userMessage, setUserMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [selectedConcept, setSelectedConcept] = useState<ConceptCard | null>(null);
  const [conversation, setConversation] = useState<Array<{role: 'user' | 'maya', content: string}>>([]);

  const queryClient = useQueryClient();

  // Maya Chat Mutation
  const mayaChatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch('/api/maya/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          conversationId,
          userId: 'demo-user-vertical-slice'
        })
      });
      
      if (!response.ok) {
        throw new Error(`Maya chat failed: ${response.status}`);
      }
      
      return response.json() as Promise<MayaResponse>;
    },
    onSuccess: (data) => {
      setConversationId(data.conversationId);
      setConversation(prev => [
        ...prev,
        { role: 'user', content: userMessage },
        { role: 'maya', content: data.response }
      ]);
      setUserMessage('');
    }
  });

  // Image Generation Mutation
  const generateImageMutation = useMutation({
    mutationFn: async (request: GenerationRequest) => {
      const response = await fetch('/api/maya/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...request,
          userId: 'demo-user-vertical-slice'
        })
      });
      
      if (!response.ok) {
        throw new Error(`Image generation failed: ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Refresh generated images
      queryClient.invalidateQueries({ queryKey: ['generated-images'] });
    }
  });

  // Fetch Generated Images
  const { data: generatedImages = [], isLoading: imagesLoading } = useQuery({
    queryKey: ['generated-images'],
    queryFn: async () => {
      const response = await fetch('/api/user/ai-images?userId=demo-user-vertical-slice');
      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }
      return response.json() as Promise<GeneratedImage[]>;
    },
    refetchInterval: 5000, // Poll for new images
  });

  const handleSendMessage = () => {
    if (!userMessage.trim()) return;
    mayaChatMutation.mutate(userMessage);
  };

  const handleGenerateImage = (concept: ConceptCard) => {
    setSelectedConcept(concept);
    generateImageMutation.mutate({ conceptCard: concept });
  };

  const getLatestConceptCards = (): ConceptCard[] => {
    // Extract concept cards from the latest Maya response
    // In a real implementation, this would come from the Maya response
    return [
      {
        id: 'concept-1',
        title: 'Professional Headshot',
        description: 'A clean, professional portrait perfect for LinkedIn and business cards',
        fluxPrompt: 'professional headshot, clean background, business attire, confident expression',
        generatedImages: [],
        isGenerating: generateImageMutation.isPending,
        hasGenerated: false
      },
      {
        id: 'concept-2', 
        title: 'Creative Portrait',
        description: 'An artistic portrait with creative lighting and composition',
        fluxPrompt: 'creative portrait, artistic lighting, interesting composition, professional quality',
        generatedImages: [],
        isGenerating: false,
        hasGenerated: false
      }
    ];
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Image Generation Vertical Slice
        </h1>
        <p className="text-gray-600">
          Complete workflow: Maya Conversation → Concept Cards → FLUX Generation → Display
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Maya Conversation Panel */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Maya AI Conversation</h2>
          
          {/* Conversation History */}
          <div className="h-64 overflow-y-auto mb-4 p-4 bg-gray-50 rounded-lg">
            {conversation.length === 0 ? (
              <p className="text-gray-500 italic">Start a conversation with Maya about your image needs...</p>
            ) : (
              conversation.map((msg, idx) => (
                <div key={idx} className={`mb-3 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block p-3 rounded-lg max-w-xs ${
                    msg.role === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white border border-gray-200'
                  }`}>
                    <div className="text-xs opacity-75 mb-1">
                      {msg.role === 'user' ? 'You' : 'Maya'}
                    </div>
                    <div>{msg.content}</div>
                  </div>
                </div>
              ))
            )}
            {mayaChatMutation.isPending && (
              <div className="text-left">
                <div className="inline-block p-3 rounded-lg bg-gray-100 border border-gray-200">
                  <div className="text-xs opacity-75 mb-1">Maya</div>
                  <div className="animate-pulse">Thinking...</div>
                </div>
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Tell Maya what kind of images you need..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={mayaChatMutation.isPending}
            />
            <button
              onClick={handleSendMessage}
              disabled={!userMessage.trim() || mayaChatMutation.isPending}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              Send
            </button>
          </div>

          {mayaChatMutation.isError && (
            <div className="mt-2 text-red-600 text-sm">
              Error: {mayaChatMutation.error?.message}
            </div>
          )}
        </div>

        {/* Concept Cards Panel */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Generated Concepts</h2>
          
          <div className="space-y-4">
            {getLatestConceptCards().map((concept) => (
              <div key={concept.id} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900">{concept.title}</h3>
                <p className="text-gray-600 text-sm mt-1">{concept.description}</p>
                
                {concept.fluxPrompt && (
                  <div className="mt-2 text-xs bg-gray-50 p-2 rounded font-mono">
                    Prompt: {concept.fluxPrompt}
                  </div>
                )}
                
                <button
                  onClick={() => handleGenerateImage(concept)}
                  disabled={generateImageMutation.isPending}
                  className="mt-3 w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                >
                  {concept.isGenerating ? 'Generating...' : 'Generate Image'}
                </button>
              </div>
            ))}
            
            {getLatestConceptCards().length === 0 && (
              <p className="text-gray-500 italic text-center py-8">
                Concept cards will appear here after Maya analyzes your request
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Generated Images Panel */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Generated Images</h2>
        
        {imagesLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading images...</p>
          </div>
        ) : generatedImages.length === 0 ? (
          <p className="text-gray-500 italic text-center py-8">
            Generated images will appear here
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generatedImages.map((image) => (
              <div key={image.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <img
                  src={image.imageUrl}
                  alt={image.prompt}
                  className="w-full h-48 object-cover"
                />
                <div className="p-3">
                  <p className="text-sm text-gray-600 line-clamp-2">{image.generatedPrompt}</p>
                  <div className="flex justify-between items-center mt-2">
                    <button
                      className={`text-sm px-2 py-1 rounded ${
                        image.isFavorite 
                          ? 'bg-red-100 text-red-600' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      ♥ {image.isFavorite ? 'Favorited' : 'Favorite'}
                    </button>
                    <button
                      className={`text-sm px-2 py-1 rounded ${
                        image.isSelected 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {image.isSelected ? 'Selected' : 'Select'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status Information */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-medium mb-2">Pipeline Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className={`p-3 rounded ${conversationId ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
            <div className="font-medium">Conversation</div>
            <div>{conversationId ? 'Active' : 'Not Started'}</div>
          </div>
          <div className={`p-3 rounded ${getLatestConceptCards().length > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
            <div className="font-medium">Concept Cards</div>
            <div>{getLatestConceptCards().length} Generated</div>
          </div>
          <div className={`p-3 rounded ${generateImageMutation.isPending ? 'bg-yellow-100 text-yellow-800' : generatedImages.length > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
            <div className="font-medium">Image Generation</div>
            <div>
              {generateImageMutation.isPending ? 'In Progress' : 
               generatedImages.length > 0 ? `${generatedImages.length} Images` : 'Ready'}
            </div>
          </div>
          <div className={`p-3 rounded ${generatedImages.length > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
            <div className="font-medium">Database</div>
            <div>{generatedImages.length > 0 ? 'Persisted' : 'Empty'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGenerationVerticalSlice;