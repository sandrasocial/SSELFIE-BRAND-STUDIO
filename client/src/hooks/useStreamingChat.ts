/**
 * STREAMING CHAT HOOK
 * 
 * React hook for real-time streaming chat with AI agents like Replit AI
 * Handles Server-Sent Events (SSE) for word-by-word text streaming
 */

import { useState, useCallback, useRef } from 'react';

interface StreamingMessage {
  id: string;
  type: 'user' | 'agent';
  content: string;
  agentName?: string;
  timestamp: string;
  isStreaming?: boolean;
  streamingContent?: string;
  progress?: number;
}

interface UseStreamingChatOptions {
  onMessageComplete?: (message: StreamingMessage) => void;
  onError?: (error: Error) => void;
}

export const useStreamingChat = (options: UseStreamingChatOptions = {}) => {
  const [messages, setMessages] = useState<StreamingMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const currentMessageRef = useRef<StreamingMessage | null>(null);

  const addUserMessage = useCallback((content: string, agentName?: string) => {
    const userMessage: StreamingMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content,
      agentName,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    return userMessage;
  }, []);

  const sendStreamingMessage = useCallback(async (
    agentName: string,
    message: string,
    conversationId: string,
    fileEditMode: boolean = true
  ) => {
    try {
      setIsStreaming(true);
      
      // Add user message immediately
      addUserMessage(message, agentName);

      // Create initial agent message for streaming
      const agentMessage: StreamingMessage = {
        id: `agent-${Date.now()}`,
        type: 'agent',
        content: '',
        agentName,
        timestamp: new Date().toISOString(),
        isStreaming: true,
        streamingContent: '',
        progress: 0,
      };

      currentMessageRef.current = agentMessage;
      setMessages(prev => [...prev, agentMessage]);

      // Start streaming
      const response = await fetch('/api/claude/send-message-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sandra-admin-2025',
        },
        credentials: 'include',
        body: JSON.stringify({
          agentName,
          message,
          conversationId,
          fileEditMode,
        }),
      });

      if (!response.ok) {
        throw new Error(`Stream failed: ${response.statusText}`);
      }

      // Handle Server-Sent Events
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response stream available');
      }

      const decoder = new TextDecoder();
      let streamedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'content') {
                streamedContent += data.content;
                
                setMessages(prev => prev.map(msg => 
                  msg.id === agentMessage.id 
                    ? { ...msg, streamingContent, progress: data.progress || 0 }
                    : msg
                ));
              } else if (data.type === 'complete') {
                // Finalize message
                const finalMessage = {
                  ...agentMessage,
                  content: streamedContent,
                  isStreaming: false,
                  streamingContent: undefined,
                  progress: 100,
                };

                setMessages(prev => prev.map(msg => 
                  msg.id === agentMessage.id ? finalMessage : msg
                ));

                options.onMessageComplete?.(finalMessage);
                break;
              }
            } catch (e) {
              console.warn('Failed to parse SSE data:', line);
            }
          }
        }
      }

    } catch (error) {
      console.error('Streaming chat error:', error);
      options.onError?.(error as Error);
      
      // Show error message
      const errorMessage: StreamingMessage = {
        id: `error-${Date.now()}`,
        type: 'agent',
        content: `Error: ${(error as Error).message}`,
        agentName,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsStreaming(false);
      currentMessageRef.current = null;
    }
  }, [addUserMessage, options]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const cancelStreaming = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsStreaming(false);
    currentMessageRef.current = null;
  }, []);

  return {
    messages,
    isStreaming,
    sendStreamingMessage,
    clearMessages,
    cancelStreaming,
    addUserMessage,
  };
};