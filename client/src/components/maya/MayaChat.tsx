// MayaChat component for handling just the chat interface
import React, { useRef, useState } from 'react';
import { useAuth } from '../../hooks/use-auth.js';
import { useLocation } from 'wouter';
import { useToast } from '../../hooks/use-toast.js';
import { useQueryClient } from '@tanstack/react-query';
import { useMayaChat } from '../../hooks/useMayaChat.js';
import { MayaUploadComponent } from '../maya/MayaUploadComponent.js';
import { MayaExamplesGallery } from '../maya/MayaExamplesGallery.js';
import type { MayaChatMessage } from '../../types/maya.js';

export function MayaChat() {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Maya chat hooks
  const {
    messages,
    isTyping,
    sendMessage,
    setIsTyping
  } = useMayaChat();

  const handleSendMessage = async (msg: string) => {
    if (!msg.trim()) return;
    
    try {
      setIsTyping(true);
      await sendMessage(msg);
      setMessage('');
      setHasStartedChat(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto py-4 px-6">
        {messages.map((msg) => (
          <div key={msg.id} className="mb-6">
            <div className={msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
              <div className="max-w-2xl">
                {msg.role === 'user' ? (
                  <div className="bg-gray-100 px-6 py-4 rounded-lg">
                    <p className="text-gray-800">{msg.content}</p>
                  </div>
                ) : (
                  <>
                    <div 
                      className="bg-gray-50 border border-gray-100 px-8 py-8 mb-6"
                      style={{ fontFamily: 'Helvetica Neue', fontWeight: 300, lineHeight: 1.7 }}
                    >
                      <p className="text-gray-800 whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    {msg.role === 'maya' && msg.showUpload && (
                      <div className="border-t border-gray-100 pt-8">
                        <MayaUploadComponent
                          onUploadComplete={(success) => {
                            if (success) {
                              console.log('Training initiated successfully');
                            }
                          }}
                          onTrainingStart={() => {
                            console.log('Training started');
                          }}
                          className="luxury-upload"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-100 p-6">
        <div className="flex items-center gap-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 min-h-[100px] p-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(message);
              }
            }}
          />
          <button
            onClick={() => handleSendMessage(message)}
            disabled={isTyping || !message.trim()}
            className="h-12 px-6 bg-black text-white rounded-lg disabled:opacity-50"
          >
            {isTyping ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}