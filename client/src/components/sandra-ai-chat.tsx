import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';

interface SandraAiChatProps {
  context: 'brandbook' | 'landing-page' | 'dashboard-builder' | 'general';
  userContext?: any;
  dashboardConfig?: any;
  onUpdate?: (update: any) => void;
  onSuggestion?: (suggestion: any) => void;
  placeholder?: string;
}

export function SandraAiChat({ context, userContext, dashboardConfig, onUpdate, onSuggestion, placeholder }: SandraAiChatProps) {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'sandra', content: string}>>([
    {
      role: 'sandra',
      content: context === 'brandbook' 
        ? "Hey! I'm Sandra, and I'm here to help you create a brandbook that's authentically you. What's your business story? What do you want people to feel when they see your brand?"
        : context === 'dashboard-builder'
        ? "Hey! I'm Sandra, and I'm excited to help you design your perfect dashboard. Think of this as your business command center - what matters most to you? Revenue tracking, client bookings, or showcasing your work? Let's make it stunning and functional!"
        : "Hey! I'm Sandra, your personal brand strategist. How can I help you today?"
    }
  ]);

  const sendMessageMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const response = await apiRequest('POST', '/api/sandra-ai-chat', {
        message: userMessage,
        context,
        userContext,
        chatHistory,
        pageConfig: (userContext as any)?.pageConfig,
        selectedTemplate: (userContext as any)?.selectedTemplate,
        dashboardConfig: (userContext as any)?.dashboardConfig
      });
      return response;
    },
    onSuccess: (response) => {
      const sandraResponse = response.response || response.message || "I understand! Let me help you with that.";
      
      setChatHistory(prev => [
        ...prev,
        { role: 'user', content: message },
        { role: 'sandra', content: sandraResponse }
      ]);
      
      // If Sandra provides suggestions, pass them to parent
      if (response.suggestions && onSuggestion) {
        onSuggestion(response.suggestions);
      }

      // If Sandra provides dashboard updates, pass them to parent
      if (response.dashboardUpdates && onUpdate) {
        onUpdate(response.dashboardUpdates);
      }
      
      setMessage('');
    },
    onError: (error) => {
      console.error('Error with Sandra AI:', error);
      setChatHistory(prev => [
        ...prev,
        { role: 'user', content: message },
        { role: 'sandra', content: "Okay, I'm having a little technical hiccup right now. Can you try asking me that again? I promise I'm usually more helpful than this!" }
      ]);
      setMessage('');
    }
  });

  const handleSend = () => {
    if (message.trim()) {
      sendMessageMutation.mutate(message);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Chat Messages */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 ${
              msg.role === 'user' 
                ? 'bg-[#0a0a0a] text-white' 
                : 'bg-[#f5f5f5] text-[#0a0a0a]'
            }`}>
              {msg.role === 'sandra' && (
                <div className="text-xs font-medium mb-2 text-[#666]">Sandra AI</div>
              )}
              <div className="text-sm">{msg.content}</div>
            </div>
          </div>
        ))}
        
        {sendMessageMutation.isPending && (
          <div className="flex justify-start">
            <div className="bg-[#f5f5f5] text-[#0a0a0a] p-4 max-w-[80%]">
              <div className="text-xs font-medium mb-2 text-[#666]">Sandra AI</div>
              <div className="text-sm">Thinking...</div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-[#e5e5e5] p-6">
        <div className="flex space-x-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={placeholder || "Ask Sandra about your brand..."}
            className="flex-1 border border-[#e5e5e5] p-3 text-sm text-[#0a0a0a] bg-white"
            disabled={sendMessageMutation.isPending}
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="bg-[#0a0a0a] text-white px-6 py-3 text-xs tracking-[0.2em] uppercase hover:bg-[#333] transition-colors disabled:bg-[#ccc] disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}