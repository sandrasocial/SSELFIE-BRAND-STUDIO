import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { MemberNavigation } from '@/components/member-navigation';

export default function FluxCollectionManager() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [fluxChat, setFluxChat] = useState<Array<{role: string, content: string}>>([]);
  const [fluxInput, setFluxInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Admin-only access
  if (!isAuthenticated || user?.email !== 'ssa@ssasocial.com') {
    return (
      <div className="min-h-screen bg-white">
        <MemberNavigation />
        <div className="max-w-4xl mx-auto px-8 py-16">
          <h1 className="text-3xl font-light mb-8" style={{ fontFamily: 'Times New Roman, serif' }}>
            Access Denied
          </h1>
          <p className="text-[#666]">This page is only accessible to Sandra.</p>
        </div>
      </div>
    );
  }

  // Chat with Flux to create new collections
  const chatWithFluxMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest('POST', '/api/admin/agent-chat-bypass', {
        agentId: 'flux',
        message: `COLLECTION CREATION REQUEST:

${message}

Please create a complete AI photoshoot collection following this exact format:

COLLECTION NAME: [Creative name in CAPS]
SUBTITLE: [Short tagline]
DESCRIPTION: [1-2 sentences about the collection's story/purpose]
CATEGORY: [Healing, Editorial, Lifestyle, Portrait, or Luxury]
PREVIEW_NEEDED: [Yes - describe the preview image you want me to generate with Sandra's model]

PROMPTS: [Create 6-12 individual prompts, each with:]
- ID: [kebab-case-id]
- NAME: [Short descriptive name]
- CATEGORY: [Sub-category within collection]
- DESCRIPTION: [Emotional story - what moment this captures]
- PROMPT: [Complete FLUX prompt with [triggerword] placeholder, professional photography details]

Focus on authentic storytelling, emotional connection, and technical photography excellence. Each prompt should feel like a magazine shoot with deep personal meaning.`,
        adminToken: 'sandra-admin-2025'
      });
      return response.json();
    },
    onSuccess: (data) => {
      setFluxChat(prev => [...prev, 
        { role: 'user', content: fluxInput },
        { role: 'assistant', content: data.response }
      ]);
      setFluxInput('');
      toast({
        title: "Flux Response Ready",
        description: "Collection concept created by Flux",
      });
    },
    onError: (error) => {
      toast({
        title: "Chat Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Generate preview image with Sandra's model
  const generatePreviewMutation = useMutation({
    mutationFn: async (previewPrompt: string) => {
      setIsGenerating(true);
      const response = await apiRequest('POST', '/api/generate-collection-preview', {
        prompt: previewPrompt,
        collectionId: `preview-${Date.now()}`
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Preview Image Generating",
        description: "Sandra's preview image is being created...",
      });
      setIsGenerating(false);
    },
    onError: (error) => {
      toast({
        title: "Preview Generation Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsGenerating(false);
    }
  });

  const handleSendMessage = () => {
    if (!fluxInput.trim()) return;
    chatWithFluxMutation.mutate(fluxInput);
  };

  return (
    <div className="min-h-screen bg-white">
      <MemberNavigation />
      
      <div className="max-w-6xl mx-auto px-8 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
            Flux Collection Manager
          </h1>
          <p className="text-lg text-[#666] max-w-2xl">
            Create new AI photoshoot collections with Flux's celebrity styling expertise. 
            Design collections, generate preview images with Sandra's model, and expand your photoshoot offerings.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Flux Chat Interface */}
          <div className="bg-[#f5f5f5] p-8">
            <h2 className="text-2xl font-light mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
              Chat with Flux
            </h2>
            
            {/* Chat Messages */}
            <div className="h-96 overflow-y-auto mb-6 space-y-4">
              {fluxChat.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-[#666] mb-4">Hello Sandra! 👋</p>
                  <p className="text-sm text-[#999]">
                    I'm Flux, your collection creation specialist. Tell me what kind of photoshoot collection you want to create and I'll design the complete concept with prompts.
                  </p>
                </div>
              )}
              
              {fluxChat.map((message, index) => (
                <div key={index} className={`${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block max-w-[80%] p-4 ${
                    message.role === 'user' 
                      ? 'bg-black text-white' 
                      : 'bg-white text-black border border-[#e5e5e5]'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="flex space-x-3">
              <input
                type="text"
                value={fluxInput}
                onChange={(e) => setFluxInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Describe the collection you want to create..."
                className="flex-1 p-3 border border-[#e5e5e5] focus:outline-none focus:border-black"
                disabled={chatWithFluxMutation.isPending}
              />
              <button
                onClick={handleSendMessage}
                disabled={chatWithFluxMutation.isPending || !fluxInput.trim()}
                className="px-6 py-3 bg-black text-white hover:bg-[#333] transition-colors disabled:opacity-50"
              >
                {chatWithFluxMutation.isPending ? 'Creating...' : 'Send'}
              </button>
            </div>
          </div>

          {/* Collection Preview & Actions */}
          <div>
            <h2 className="text-2xl font-light mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
              Collection Actions
            </h2>

            {/* Preview Image Generation */}
            <div className="bg-[#f5f5f5] p-6 mb-8">
              <h3 className="text-lg font-medium mb-4">Generate Preview Image</h3>
              <p className="text-sm text-[#666] mb-4">
                Use Sandra's trained model to create cover images for new collections
              </p>
              
              <div className="space-y-4">
                <textarea
                  placeholder="Describe the preview image you want (e.g., 'Sandra in elegant black blazer, magazine cover style, confident expression')"
                  className="w-full h-24 p-3 border border-[#e5e5e5] focus:outline-none focus:border-black resize-none"
                  disabled={isGenerating}
                />
                <button
                  onClick={() => {
                    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
                    if (textarea?.value) {
                      generatePreviewMutation.mutate(textarea.value);
                    }
                  }}
                  disabled={isGenerating}
                  className="w-full px-4 py-3 bg-black text-white hover:bg-[#333] transition-colors disabled:opacity-50"
                >
                  {isGenerating ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Generating Preview...
                    </div>
                  ) : (
                    'Generate Preview with Sandra\'s Model'
                  )}
                </button>
              </div>
            </div>

            {/* Implementation Guide */}
            <div className="bg-white border border-[#e5e5e5] p-6">
              <h3 className="text-lg font-medium mb-4">Implementation Guide</h3>
              <div className="space-y-3 text-sm text-[#666]">
                <div className="flex items-start space-x-2">
                  <span className="text-black font-medium">1.</span>
                  <span>Chat with Flux to create collection concept</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-black font-medium">2.</span>
                  <span>Generate preview image using Sandra's model</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-black font-medium">3.</span>
                  <span>Copy collection data to ai-photoshoot.tsx</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-black font-medium">4.</span>
                  <span>Test collection in AI photoshoot interface</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Collection Ideas */}
        <div className="mt-16 pt-12 border-t border-[#e5e5e5]">
          <h2 className="text-2xl font-light mb-8" style={{ fontFamily: 'Times New Roman, serif' }}>
            Quick Collection Ideas
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "CEO CONFIDENCE",
                description: "Power suits and boardroom energy",
                prompt: "Create a collection for female entrepreneurs wanting CEO-level confidence photos"
              },
              {
                title: "WELLNESS GURU",
                description: "Peaceful and authentic wellness content",
                prompt: "Design a collection for wellness coaches and meditation teachers"
              },
              {
                title: "CREATIVE ARTIST",
                description: "Authentic creative energy and artistic expression",
                prompt: "Build a collection for artists, designers, and creative professionals"
              }
            ].map((idea, index) => (
              <button
                key={index}
                onClick={() => setFluxInput(idea.prompt)}
                className="text-left p-6 bg-[#f5f5f5] hover:bg-[#e5e5e5] transition-colors"
              >
                <h3 className="font-medium mb-2">{idea.title}</h3>
                <p className="text-sm text-[#666]">{idea.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}