import React, { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function AICommandCenter() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Welcome to the AI Command Center. How can I assist you today?',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!currentInput.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: currentInput.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    const command = currentInput.trim();
    setCurrentInput('');
    setIsLoading(true);

    try {
      // Make API request to AI agent command endpoint
      const response = await fetch('/api/ai-agent/command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Add AI response to chat
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: data.response || 'I received your command but could not generate a response.',
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to send command:', error);
      
      // Add error message to chat
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'I apologize, but I encountered an error processing your command. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-stone-100 to-stone-200">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-extralight tracking-[0.3em] text-stone-950 uppercase leading-tight mb-2">
            Command Center
          </h1>
          <p className="text-sm font-light tracking-[0.15em] text-stone-600">
            Intelligent AI Assistant for SSELFIE Studio
          </p>
        </div>

        {/* Chat Container */}
        <div className="bg-stone-50/80 backdrop-blur-sm border border-stone-200/60 rounded-3xl shadow-2xl overflow-hidden">
          {/* Messages Area */}
          <div className="h-[600px] overflow-y-auto p-6 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    message.sender === 'user'
                      ? 'bg-stone-950 text-stone-50'
                      : 'bg-stone-100/80 text-stone-950 border border-stone-200/40'
                  }`}
                >
                  <div className="text-base font-light leading-relaxed">
                    {message.content}
                  </div>
                  <div
                    className={`text-xs mt-2 ${
                      message.sender === 'user' ? 'text-stone-400' : 'text-stone-500'
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-stone-100/80 border border-stone-200/40 rounded-2xl px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-stone-200/60 bg-stone-50/60 p-6">
            <div className="flex space-x-4">
              <textarea
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your command..."
                disabled={isLoading}
                className="flex-1 resize-none bg-stone-100/60 border border-stone-200/60 rounded-2xl px-4 py-3 text-stone-950 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-400/50 focus:border-stone-300 transition-all duration-200 font-light"
                rows={1}
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!currentInput.trim() || isLoading}
                className="px-6 py-3 bg-stone-950 text-stone-50 rounded-2xl font-light tracking-[0.1em] uppercase text-sm hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-stone-400/50"
              >
                {isLoading ? 'Sending' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}