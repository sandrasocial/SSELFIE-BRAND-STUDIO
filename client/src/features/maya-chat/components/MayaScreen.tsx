import React, { useState, useRef, useEffect } from 'react';
import { useBrandStudio, BrandStudioProvider } from '../../../contexts/BrandStudioContext.js';
import { useAuth } from '../../../hooks/use-auth.js';
import { Camera } from 'lucide-react';

import ErrorBoundary from '../../../components/ErrorBoundary.js';
import MayaHeader from './MayaHeader';
import TypingIndicator from './TypingIndicator';
import ChatInput from './ChatInput';
import ChatMessageBubble from './ChatMessageBubble';



interface MayaChatContentProps {
  initialPrompt?: string | null;
  onPromptUsed?: () => void;
}

// @ts-ignore - FC type compatibility with JSX.Element
const MayaChatContent: React.FC<MayaChatContentProps> = ({ initialPrompt, onPromptUsed }) => {
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use BrandStudioProvider for full brand studio integration
  const {
    messages,
    isTyping,
    sendMessage,
    isGenerating,
  } = useBrandStudio();

  // Debug logging
  console.log('Brand Studio Data:', { messages });

  const [showWelcome] = useState(true);
  const welcomeMessage = {
    id: 'welcome-maya',
    type: 'maya' as const,
    content: "I help people get amazing photos that actually look like them.\n\nI create 5 different shots every time - some close-ups, some full body, and some lifestyle scenes that work together like a perfect feed. What kind of photos are you dreaming of?",
    timestamp: new Date().toISOString(),
    conceptCards: [],
    generatedImages: []
  };

  // Combine welcome message with actual messages
  const allMessages = showWelcome && messages.length === 0 ? [welcomeMessage, ...messages] : messages;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [allMessages, isTyping]);

  // Handle initial prompt from style selection
  useEffect(() => {
    if (initialPrompt && !isTyping && messages.length === 0) {
      // Send the initial prompt automatically
      sendMessage(initialPrompt);
      // Mark the prompt as used
      onPromptUsed?.();
    }
  }, [initialPrompt, sendMessage, onPromptUsed, isTyping, messages.length]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || isTyping) return;

    const messageText = messageInput.trim();
    setMessageInput('');

    // Use BrandStudioProvider's sendMessage (handles full workflow)
    sendMessage(messageText);
  };



  return (
    <ErrorBoundary>
      <div className="h-full flex flex-col space-y-4 pb-2">
      {/* Maya Header */}
      <MayaHeader />

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1" style={{ maxHeight: 'calc(100vh - 320px)' }}>
        {allMessages.map((message: any, index: number) => (
          <React.Fragment key={message.id || index}>
            <ChatMessageBubble message={message} />

          </React.Fragment>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <TypingIndicator />
        )}

        {/* Generation Loading State */}
        {isGenerating && !isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/50 backdrop-blur-2xl border border-white/70 p-5 rounded-2xl max-w-[90%] shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 border-2 border-stone-400 border-t-transparent rounded-full animate-spin"></div>
                <div className="flex-1">
                  <span className="text-sm font-medium text-stone-800">Images generating...</span>
                  <div className="text-xs text-stone-600 mt-1">
                    🎨 Applying your personal LoRA model • 📐 3:4 aspect ratio • 🎯 LoRA scale 1.05
                  </div>
                  <div className="text-xs text-stone-500 mt-2 font-light italic">
                    Your images will appear here automatically when ready
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error handling through BrandStudioProvider now */}

      {/* Chat Input */}
      <ChatInput
        value={messageInput}
        onChange={setMessageInput}
        onSend={handleSendMessage}
        disabled={isTyping}
        placeholder="Describe your vision to Maya..."
      />
    </div>
    </ErrorBoundary>
  );
};

// Wrapper component with BrandStudioProvider
interface MayaScreenProps {
  initialPrompt?: string | null;
  onPromptUsed?: () => void;
}

// @ts-ignore - FC type compatibility with JSX.Element
const MayaScreen: React.FC<MayaScreenProps> = ({ initialPrompt, onPromptUsed }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Check if user has Maya AI access
  if (!isLoading && isAuthenticated && user && !user.mayaAiAccess) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-stone-100 flex items-center justify-center">
            <Camera size={32} className="text-stone-400" />
          </div>
          <h3 className="text-lg font-serif font-light text-stone-950 mb-2">Maya AI Access Required</h3>
          <p className="text-sm text-stone-600">
            Maya AI features are not available for this account. Please upgrade your plan to access AI-powered photo generation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <BrandStudioProvider>
      <MayaChatContent initialPrompt={initialPrompt} onPromptUsed={onPromptUsed} />
    </BrandStudioProvider>
  );
};

export default MayaScreen;

