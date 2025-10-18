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
            className="w-full resize-none px-4 sm:px-5 py-3 sm:py-4 bg-white/40 backdrop-blur-2xl border border-white/60 rounded-xl sm:rounded-[1.5rem] text-stone-950 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-900/50 pr-12 shadow-lg shadow-stone-900/10 text-sm min-h-[48px] sm:min-h-[56px]"
            rows={3}
            disabled={disabled}
          />
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <Camera size={18} className="text-stone-500" strokeWidth={1.5} />
          </div>
        </div>
        <button
          data-testid="maya-chat-send"
          onClick={onSend}
          disabled={!value.trim() || !!disabled}
          className="group relative px-4 py-4 bg-stone-950 text-stone-50 rounded-2xl font-light transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden shadow-sm min-h-[52px] min-w-[52px] flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-stone-800 transform scale-0 group-hover:scale-100 transition-transform duration-300 origin-center"></div>
          <Send size={16} strokeWidth={1.5} className="relative z-10 group-hover:text-stone-50 transition-colors duration-300" />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;

