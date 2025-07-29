import { useState, useCallback } from 'react';

interface StreamingMessage {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: string;
  agentName?: string;
  isStreaming?: boolean;
  streamingContent?: string;
  progress?: number;
}

interface UseStreamingChatProps {
  onMessageComplete?: (message: StreamingMessage) => void;
  onError?: (error: Error) => void;
}

export function useStreamingChat({ onMessageComplete, onError }: UseStreamingChatProps) {
  const [messages, setMessages] = useState<StreamingMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const sendStreamingMessage = useCallback(async (
    agentName: string,
    message: string,
    conversationId: string,
    fileEditMode: boolean = true
  ) => {
    // Add user message immediately
    const userMessage: StreamingMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsStreaming(true);

    // Create streaming agent message
    const agentMessageId = (Date.now() + 1).toString();
    const agentMessage: StreamingMessage = {
      id: agentMessageId,
      type: 'agent',
      content: '',
      timestamp: new Date().toISOString(),
      agentName,
      isStreaming: true,
      streamingContent: '',
      progress: 0,
    };

    setMessages(prev => [...prev, agentMessage]);

    let retryCount = 0;
    const maxRetries = 3;
    
    const attemptStreaming = async (): Promise<void> => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          console.log('Stream timeout reached, aborting...');
          controller.abort();
        }, 30000);
        
        // Start streaming with proper error handling
        const response = await fetch('/api/claude/send-message-stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer sandra-admin-2025',
            'Accept': 'text/event-stream',
            'Cache-Control': 'no-cache',
          },
          credentials: 'include',
          signal: controller.signal,
          body: JSON.stringify({
            agentName,
            message,
            conversationId,
            fileEditMode,
          }),
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          if (controller.signal.aborted) {
            throw new Error('Request was aborted due to timeout');
          }
          const errorText = await response.text().catch(() => 'Unknown error');
          console.error('Streaming response error:', response.status, response.statusText, errorText);
          throw new Error(`Stream failed: ${response.status} ${response.statusText} - ${errorText}`);
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
                
                if (data.type === 'chunk') {
                  streamedContent += data.chunk;
                  
                  // Update the streaming message
                  setMessages(prev => prev.map(msg => 
                    msg.id === agentMessageId 
                      ? { 
                          ...msg, 
                          streamingContent: streamedContent,
                          progress: data.progress || 0 
                        }
                      : msg
                  ));
                } else if (data.type === 'complete') {
                  // Finalize the message
                  const finalMessage: StreamingMessage = {
                    ...agentMessage,
                    content: data.finalText || streamedContent,
                    isStreaming: false,
                    streamingContent: undefined,
                    progress: 100,
                  };

                  setMessages(prev => prev.map(msg => 
                    msg.id === agentMessageId ? finalMessage : msg
                  ));

                  onMessageComplete?.(finalMessage);
                  return;
                } else if (data.type === 'error') {
                  throw new Error(data.error);
                }
              } catch (parseError) {
                console.warn('Failed to parse streaming data:', parseError);
              }
            }
          }
        }
      } catch (error) {
        console.error(`Streaming attempt ${retryCount + 1} failed:`, error);
        
        if (retryCount < maxRetries && 
            error instanceof Error && 
            (error.message.includes('network error') || 
             error.message.includes('ERR_NETWORK_IO_SUSPENDED') ||
             error.name === 'AbortError' ||
             error.message.includes('Stream failed'))) {
          
          retryCount++;
          console.log(`Retrying streaming request (${retryCount}/${maxRetries})...`);
          
          // Update progress to show retry
          setMessages(prev => prev.map(msg => 
            msg.id === agentMessageId 
              ? { 
                  ...msg, 
                  streamingContent: `Retrying connection (${retryCount}/${maxRetries})...`,
                  progress: (retryCount / maxRetries) * 50
                }
              : msg
          ));
          
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
          return attemptStreaming();
        }
        
        // Fallback to non-streaming endpoint
        console.log('Streaming failed, falling back to regular endpoint...');
        try {
          const fallbackResponse = await fetch('/api/claude/send-message', {
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
              fileEditMode
            })
          });
          
          if (!fallbackResponse.ok) {
            throw new Error(`Fallback failed: HTTP ${fallbackResponse.status}`);
          }
          
          const data = await fallbackResponse.json();
          
          if (data.success) {
            const finalMessage: StreamingMessage = {
              id: agentMessageId,
              type: 'agent',
              content: data.response,
              timestamp: new Date().toISOString(),
              agentName,
              isStreaming: false,
              streamingContent: undefined,
              progress: 100,
            };

            setMessages(prev => prev.map(msg => 
              msg.id === agentMessageId ? finalMessage : msg
            ));

            onMessageComplete?.(finalMessage);
            return;
          } else {
            throw new Error(data.error || 'Fallback request failed');
          }
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
          throw error;
        }
      }
    };
    
    try {
      await attemptStreaming();
    } catch (error) {
      console.error('Final streaming error:', error);
      
      // Update message with error
      setMessages(prev => prev.map(msg => 
        msg.id === agentMessageId 
          ? { 
              ...msg, 
              content: `Connection error. Please try again. Details: ${error instanceof Error ? error.message : 'Unknown error'}`,
              isStreaming: false,
              streamingContent: undefined
            }
          : msg
      ));

      onError?.(error instanceof Error ? error : new Error('Unknown streaming error'));
    } finally {
      setIsStreaming(false);
    }
  }, [onMessageComplete, onError]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isStreaming,
    sendStreamingMessage,
    clearMessages,
  };
}