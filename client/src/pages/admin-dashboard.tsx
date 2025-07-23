import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AgentChatMessage {
  id: number;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
  agentId?: string;
}

const agents = [
  { id: 'elena', name: 'Elena', role: 'AI Agent Director & CEO' },
  { id: 'aria', name: 'Aria', role: 'Visionary Editorial Luxury Designer' },
  { id: 'zara', name: 'Zara', role: 'Dev AI - Technical Mastermind' },
  { id: 'rachel', name: 'Rachel', role: 'Voice AI - Copywriting Expert' },
  { id: 'maya', name: 'Maya', role: 'AI Photography Specialist' },
  { id: 'ava', name: 'Ava', role: 'Automation AI' },
  { id: 'quinn', name: 'Quinn', role: 'QA AI - Quality Guardian' },
  { id: 'sophia', name: 'Sophia', role: 'Social Media Manager AI' },
  { id: 'martha', name: 'Martha', role: 'Marketing/Ads AI' },
  { id: 'diana', name: 'Diana', role: 'Personal Mentor & Business Coach' },
  { id: 'wilma', name: 'Wilma', role: 'Workflow AI' },
  { id: 'olga', name: 'Olga', role: 'Repository Organizer AI' }
];

function AgentChat({ agentId, agentName, role }: { agentId: string; agentName: string; role: string }) {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<AgentChatMessage[]>([]);

  // Load chat history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem(`agent-chat-${agentId}`);
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setChatHistory(parsed);
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    }
  }, [agentId]);

  // Save chat history to localStorage
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem(`agent-chat-${agentId}`, JSON.stringify(chatHistory));
    }
  }, [chatHistory, agentId]);

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch('/api/admin/agent-chat-bypass', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          agentId,
          message: content,
          adminToken: 'sandra-admin-2025'
        })
      });
      
      if (!response.ok) {
        throw new Error(`Agent chat failed: ${response.statusText}`);
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      const userMessage = {
        id: Date.now(),
        type: 'user' as const,
        content: message,
        timestamp: new Date()
      };

      const agentMessage = {
        id: Date.now() + 1,
        type: 'agent' as const,
        content: data.response || data.message || 'Agent response received',
        timestamp: new Date(),
        agentId
      };

      setChatHistory(prev => [...prev, userMessage, agentMessage]);
      setMessage('');
    },
    onError: (error) => {
      console.error('Agent chat error:', error);
      const errorMessage = {
        id: Date.now(),
        type: 'agent' as const,
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        agentId
      };
      setChatHistory(prev => [...prev, errorMessage]);
    }
  });

  const handleSendMessage = () => {
    if (!message.trim() || sendMessage.isPending) return;
    sendMessage.mutate(message);
  };

  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-light" style={{ fontFamily: 'Times New Roman, serif' }}>
              {agentName}
            </h3>
            <p className="text-gray-600 text-sm">{role}</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setChatHistory([]);
                localStorage.removeItem(`agent-chat-${agentId}`);
              }}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              Clear Chat
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Chat Messages */}
        <div className="h-96 bg-gray-50 rounded-lg p-4 mb-4 overflow-y-auto">
          {chatHistory.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>Start a conversation with {agentName}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {chatHistory.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.type === 'user'
                        ? 'bg-black text-white'
                        : 'bg-white border border-gray-200 text-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium">
                        {msg.type === 'user' ? 'Sandra' : agentName}
                      </span>
                      <span className="text-xs opacity-70">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="flex gap-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Message ${agentName}...`}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/20 resize-none"
            rows={3}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || sendMessage.isPending}
            className="bg-black text-white hover:bg-gray-800"
          >
            {sendMessage.isPending ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();

  // Check if user is Sandra (admin access required)
  if (!user || (user.email !== 'ssa@ssasocial.com' && user.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light text-white mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
            Admin Access Required
          </h1>
          <p className="text-gray-400">Only Sandra can access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-light" style={{ fontFamily: 'Times New Roman, serif' }}>
            SSELFIE Studio Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Manage your AI agent team and platform</p>
        </div>
      </div>

      {/* Agent Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {agents.map((agent) => (
            <AgentChat
              key={agent.id}
              agentId={agent.id}
              agentName={agent.name}
              role={agent.role}
            />
          ))}
        </div>
      </div>
    </div>
  );
}