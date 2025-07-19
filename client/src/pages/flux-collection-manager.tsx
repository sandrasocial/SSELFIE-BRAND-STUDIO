import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { MemberNavigation } from '@/components/member-navigation';
import FluxPreviewApprovalSystem from '../components/FluxPreviewApprovalSystem';
import { findingMyselfAgainCollection } from '../data/collections/finding-myself-again';

// Current AI Photoshoot Collections
const CURRENT_COLLECTIONS = {
  'healing-mindset': {
    id: 'healing-mindset',
    name: 'HEALING MINDSET',
    subtitle: 'Phoenix Rising',
    description: 'The quiet strength of a woman who rebuilt herself - capturing the beauty of healing and the power of rising',
    promptCount: 12
  },
  'magazine-covers': {
    id: 'magazine-covers', 
    name: 'E D I T O R I A L',
    subtitle: 'P O W E R',
    description: 'High-fashion editorial portraits for your brand',
    promptCount: 12
  },
  'street-documentary': {
    id: 'street-documentary',
    name: 'STREET DOCUMENTARY', 
    subtitle: 'Urban Confidence',
    description: 'Candid moments of moving through the world with quiet authority - street photography that captures authentic confidence',
    promptCount: 12
  },
  'lifestyle-editorial': {
    id: 'lifestyle-editorial',
    name: 'LIFESTYLE EDITORIAL',
    subtitle: 'Elevated Everyday', 
    description: 'Effortlessly elevated moments from a life well-lived - European sophistication meets everyday luxury',
    promptCount: 12
  }
};

export default function FluxCollectionManager() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'chat' | 'preview-approval'>('chat');
  const [approvedImages, setApprovedImages] = useState<Record<number, string>>({});
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [fluxChat, setFluxChat] = useState<Array<{role: string, content: string}>>([]);
  const [fluxInput, setFluxInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<'create' | 'update' | 'current'>('current');
  
  // Persistent conversation ID for memory continuity
  const [conversationId] = useState(() => `flux-session-${Date.now()}`);

  // Load existing conversation history on mount for continuity
  useEffect(() => {
    const loadFluxConversation = async () => {
      if (!isAuthenticated || user?.email !== 'ssa@ssasocial.com') return;
      
      try {
        const response = await apiRequest('GET', `/api/agent-conversations/flux`);
        const result = await response.json();
        
        if (result.conversations && result.conversations.length > 0) {
          // Convert database format to chat format
          const chatHistory = result.conversations.map((conv: any) => [
            { role: 'user', content: conv.userMessage },
            { role: 'assistant', content: conv.agentResponse }
          ]).flat();
          
          setFluxChat(chatHistory);
          console.log(`✅ Loaded ${chatHistory.length} messages from Flux conversation history`);
        }
      } catch (error) {
        console.log('No existing Flux conversation found, starting fresh');
      }
    };

    loadFluxConversation();
  }, [isAuthenticated, user?.email]);

  // Admin access check
  if (!isAuthenticated || user?.email !== 'ssa@ssasocial.com') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
            Admin Access Required
          </h1>
          <p className="text-gray-600">This area is restricted to Sandra only.</p>
        </div>
      </div>
    );
  }

  // Chat with Flux mutation with persistent conversation ID for memory continuity
  const chatWithFluxMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest('POST', '/api/admin/agent-chat-bypass', {
        agentName: 'Flux',
        message: message,
        conversationId: conversationId,
        conversationHistory: fluxChat
      });
      return response.json();
    },
    onSuccess: (data) => {
      setFluxChat(prev => [
        ...prev,
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
            Create and manage AI photoshoot collections with Flux - your specialized FLUX LoRA expert who designs new collection themes and generates preview images using Sandra's trained model.
          </p>
        </div>

        {/* Mode Selection */}
        <div className="flex justify-center mb-8">
          <div className="bg-[#f5f5f5] p-1">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-8 py-3 transition-colors ${
                activeTab === 'chat' 
                  ? 'bg-black text-white' 
                  : 'text-[#666] hover:text-black'
              }`}
            >
              Chat with Flux
            </button>
            <button
              onClick={() => setActiveTab('preview-approval')}
              className={`px-8 py-3 transition-colors ${
                activeTab === 'preview-approval' 
                  ? 'bg-black text-white' 
                  : 'text-[#666] hover:text-black'
              }`}
            >
              Preview & Approval
            </button>
          </div>
        </div>

        {/* Chat Mode */}
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Object.values(CURRENT_COLLECTIONS).map((collection) => (
              <div key={collection.id} className="bg-[#f5f5f5] p-8">
                <h3 className="text-2xl font-light mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
                  {collection.name}
                </h3>
                <p className="text-lg text-[#666] mb-4">{collection.subtitle}</p>
                <p className="text-sm text-[#999] mb-6">{collection.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#666]">{collection.promptCount} prompts</span>
                  <button 
                    onClick={() => {
                      setSelectedCollection(collection.id);
                      setViewMode('update');
                    }}
                    className="px-6 py-2 bg-black text-white hover:bg-[#333] transition-colors"
                  >
                    Edit Collection
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Update Existing Collection */}
        {viewMode === 'update' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Collection Selection */}
            <div className="bg-[#f5f5f5] p-8">
              <h2 className="text-2xl font-light mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
                Select Collection to Update
              </h2>
              
              <div className="space-y-4">
                {Object.values(CURRENT_COLLECTIONS).map((collection) => (
                  <button
                    key={collection.id}
                    onClick={() => setSelectedCollection(collection.id)}
                    className={`w-full text-left p-4 border transition-colors ${
                      selectedCollection === collection.id
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-[#e5e5e5] hover:border-black'
                    }`}
                  >
                    <h4 className="font-medium">{collection.name}</h4>
                    <p className="text-sm opacity-75">{collection.subtitle}</p>
                  </button>
                ))}
              </div>
              
              {selectedCollection && (
                <div className="mt-6 p-4 bg-white border border-[#e5e5e5]">
                  <h4 className="font-medium mb-2">Selected: {CURRENT_COLLECTIONS[selectedCollection]?.name}</h4>
                  <p className="text-sm text-[#666] mb-4">{CURRENT_COLLECTIONS[selectedCollection]?.description}</p>
                  <button
                    onClick={() => setFluxInput(`I want to update the "${CURRENT_COLLECTIONS[selectedCollection]?.name}" collection. Please help me add new prompts or improve existing ones.`)}
                    className="px-6 py-2 bg-black text-white hover:bg-[#333] transition-colors"
                  >
                    Start Flux Update
                  </button>
                </div>
              )}
            </div>

            {/* Flux Chat for Updates */}
            <div className="bg-[#f5f5f5] p-8">
              <h2 className="text-2xl font-light mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
                Chat with Flux - Update Mode
              </h2>
              
              {/* Chat Messages */}
              <div className="h-96 overflow-y-auto mb-6 space-y-4">
                {fluxChat.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-[#666] mb-4">Ready to update collections! 📝</p>
                    <p className="text-sm text-[#999]">
                      Select a collection to update, then chat with Flux to add new prompts, improve existing ones, or generate preview images.
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
                  placeholder="Ask Flux to update the selected collection..."
                  className="flex-1 p-3 border border-[#e5e5e5] focus:outline-none focus:border-black"
                  disabled={chatWithFluxMutation.isPending}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={chatWithFluxMutation.isPending || !fluxInput.trim()}
                  className="px-6 py-3 bg-black text-white hover:bg-[#333] transition-colors disabled:opacity-50"
                >
                  {chatWithFluxMutation.isPending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Preview & Approval Mode */}
        {activeTab === 'preview-approval' && (
          <div>
            <h2 className="text-2xl font-light mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
              Cover Image Preview & Approval
            </h2>
            <p className="text-[#666] mb-8">
              Generate and approve cover images for the "Finding Myself Again" collection using Sandra's trained model.
            </p>

            <div className="space-y-8">
              {findingMyselfAgainCollection.prompts.map((prompt) => (
                <FluxPreviewApprovalSystem
                  key={prompt.id}
                  prompt={prompt}
                  onApproveImage={(promptId: number, imageUrl: string) => {
                    setApprovedImages(prev => ({
                      ...prev,
                      [promptId]: imageUrl
                    }));
                    toast({
                      title: "Cover Image Approved",
                      description: `Cover image for "${prompt.title}" has been approved and saved.`,
                    });
                  }}
                />
              ))}
            </div>

            {/* Approval Summary */}
            <div className="mt-12 bg-[#f5f5f5] p-8">
              <h3 className="text-xl font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
                Approval Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {findingMyselfAgainCollection.prompts.map((prompt) => (
                  <div key={prompt.id} className={`p-4 border ${
                    approvedImages[prompt.id] 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-300 bg-white'
                  }`}>
                    <h4 className="font-medium text-sm mb-2">{prompt.title}</h4>
                    <div className="flex items-center gap-2">
                      {approvedImages[prompt.id] ? (
                        <>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-green-700">Approved</span>
                        </>
                      ) : (
                        <>
                          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                          <span className="text-xs text-gray-600">Pending</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <p className="text-sm text-[#666]">
                  {Object.keys(approvedImages).length} of {findingMyselfAgainCollection.prompts.length} cover images approved
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Create New Collection - Hidden for now */}
        {false && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Flux Chat Interface */}
            <div className="bg-[#f5f5f5] p-8">
              <h2 className="text-2xl font-light mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
                Chat with Flux - Create Mode
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
                      'Generate Preview Image'
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white border border-[#e5e5e5] p-6">
                <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full p-3 text-left border border-[#e5e5e5] hover:border-black transition-colors">
                    View AI Photoshoot System
                  </button>
                  <button className="w-full p-3 text-left border border-[#e5e5e5] hover:border-black transition-colors">
                    Browse Generated Images
                  </button>
                  <button className="w-full p-3 text-left border border-[#e5e5e5] hover:border-black transition-colors">
                    Collection Analytics
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}