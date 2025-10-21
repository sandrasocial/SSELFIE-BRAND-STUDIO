import React from 'react';
import { Send, Camera } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ value, onChange, onSend, disabled, placeholder }) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) onSend();
    }
  };

  return (
    <div className="border-t border-stone-200/30 pt-4 mt-auto flex-shrink-0">
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <textarea
            data-test-id="chat-input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || 'Describe your vision to Maya...'}
            className="w-full resize-none px-4 sm:px-5 py-3 sm:py-4 bg-white/40 backdrop-blur-2xl border border-white/60 rounded-xl sm:rounded-[1.5rem] text-stone-950 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-900/50 focus:border-stone-900/50 focus:bg-white/60 pr-12 font-medium text-sm min-h-[48px] sm:min-h-[56px] shadow-lg shadow-stone-900/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            rows={3}
            disabled={disabled}
          />
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <Camera size={18} className="text-stone-500" strokeWidth={1.5} />
          </div>
        </div>
        <button
          data-testid="maya-chat-send"
          onClick={onSend}
          disabled={!value.trim() || !!disabled}
          className="group relative px-4 sm:px-5 py-3 sm:py-4 bg-stone-950 text-white rounded-xl sm:rounded-[1.5rem] font-semibold transition-all duration-300 hover:shadow-2xl hover:shadow-stone-900/40 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden min-h-[48px] sm:min-h-[56px] min-w-[48px] sm:min-w-[56px] flex items-center justify-center hover:scale-105 active:scale-95"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <Send size={16} strokeWidth={2.5} className="relative z-10 transition-transform duration-300 group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;

