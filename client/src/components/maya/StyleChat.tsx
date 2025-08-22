import React from 'react';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';

interface StyleChatProps {
  messages: any[];
  input: string;
  setInput: (value: string) => void;
  handleSend: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  isLoading: boolean;
}

export function StyleChat({
  messages,
  input,
  setInput,
  handleSend,
  handleKeyDown,
  isLoading,
}: StyleChatProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium">
            🎨 Style • 📸 Shoot • ✨ Perfect
          </div>
        </div>
        
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-start space-x-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'maya' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                M
              </div>
            )}
            
            <div
              className={`rounded-2xl px-6 py-3 max-w-[80%] ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700'
                  : 'bg-gradient-to-r from-gray-700 to-gray-800'
              } text-white shadow-lg backdrop-blur-sm`}
            >
              <div className="prose prose-invert">
                {message.content}
              </div>
              {message.imagePreview && message.imagePreview.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {message.imagePreview.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`Generated preview ${i + 1}`}
                      className="rounded-lg w-full h-auto"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-gray-900/50 backdrop-blur-sm border-t border-gray-800">
        <div className="relative">
          <Textarea
            placeholder="Describe your vision or ask for style advice..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-gray-800/50 border-gray-700 focus:border-purple-500 rounded-xl placeholder-gray-400 text-white resize-none"
            rows={3}
          />
          <div className="absolute bottom-3 right-3 flex space-x-2">
            <span className="text-xs text-gray-400">Press Enter to send</span>
          </div>
        </div>
        
        <Button
          onClick={handleSend}
          className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? 'Creating magic...' : 'Send message'}
        </Button>
      </div>
    </div>
  );
}