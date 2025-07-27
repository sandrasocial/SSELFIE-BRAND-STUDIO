/**
 * Elena Conversation History Component
 * Shows previous conversations with Elena and allows loading/continuing them
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, MessageCircle, ArrowRight } from 'lucide-react';

interface ConversationSummary {
  id: string;
  conversationId: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
  status: 'active' | 'archived';
  topic?: string;
}

interface ElenaConversationHistoryProps {
  onLoadConversation: (conversationId: string, messages: any[]) => void;
  currentConversationId?: string;
}

export function ElenaConversationHistory({ onLoadConversation, currentConversationId }: ElenaConversationHistoryProps) {
  // Load Elena's conversation history
  const { data: conversations, isLoading } = useQuery({
    queryKey: ['elena-conversation-history'],
    queryFn: async () => {
      const response = await fetch('/api/elena/conversation-history', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to load Elena conversation history');
      }

      const data = await response.json();
      return data.conversations || [];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const loadConversation = async (conversationId: string) => {
    try {
      console.log('📜 Loading Elena conversation:', conversationId);
      
      const response = await fetch(`/api/claude/conversation/${conversationId}/history`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to load conversation messages');
      }

      const data = await response.json();
      console.log('📜 Loaded conversation messages:', data.messages?.length || 0);
      
      onLoadConversation(conversationId, data.messages || []);
    } catch (error) {
      console.error('❌ Error loading conversation:', error);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const extractTopic = (lastMessage: string): string => {
    // Extract key topics from Elena's responses
    if (lastMessage.includes('TRAIN-STYLE-PHOTOSHOOT-BUILD')) return 'Business Model Discussion';
    if (lastMessage.includes('landing page')) return 'Landing Page Optimization';
    if (lastMessage.includes('selfie guide')) return 'Selfie Guide Updates';
    if (lastMessage.includes('coordinate') || lastMessage.includes('deploy')) return 'Agent Coordination';
    if (lastMessage.includes('workflow')) return 'Workflow Management';
    return 'Strategic Discussion';
  };

  if (isLoading) {
    return (
      <Card className="border border-gray-200">
        <CardHeader>
          <h4 className="font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Elena's Conversation History
          </h4>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Loading conversation history...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <h4 className="font-medium flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Elena's Conversation History
          {conversations?.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {conversations.length} conversations
            </Badge>
          )}
        </h4>
        <p className="text-sm text-gray-600">
          Load previous conversations to continue where you left off
        </p>
      </CardHeader>
      <CardContent>
        {!conversations || conversations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <div>No previous conversations found</div>
            <div className="text-xs">Start chatting with Elena to build history</div>
          </div>
        ) : (
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {conversations.map((conv: any) => (
                <div
                  key={conv.conversationId}
                  className={`p-3 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                    currentConversationId === conv.conversationId 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200'
                  }`}
                  onClick={() => loadConversation(conv.conversationId)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge 
                          variant={conv.status === 'active' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {extractTopic(conv.lastAgentResponse || conv.lastMessage || '')}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {conv.messageCount || 0} messages
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 truncate">
                        {(conv.lastAgentResponse || conv.lastMessage || 'No messages')
                          .replace(/##\s*/g, '')
                          .replace(/\*\*/g, '')
                          .substring(0, 100)}...
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(conv.lastMessageAt || conv.timestamp)}
                        </span>
                        {currentConversationId === conv.conversationId && (
                          <Badge variant="outline" className="text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        
        <div className="mt-4 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="w-full"
          >
            Refresh History
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}