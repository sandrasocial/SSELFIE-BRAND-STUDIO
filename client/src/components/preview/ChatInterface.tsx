import React from 'react';

interface ChatInterfaceProps {
  onSendMessage: (message: string) => void;
  activeComponent: string | null;
  onComponentSelect: (component: string) => void;
}

export function ChatInterface({ 
  onSendMessage, 
  activeComponent, 
  onComponentSelect 
}: ChatInterfaceProps) {
  return (
    <div className="chat-interface">
      <div className="chat-header">
        <h3>Developer Chat</h3>
      </div>
      <div className="chat-messages">
        {/* Chat messages would go here */}
      </div>
      <div className="chat-input">
        <input 
          type="text" 
          placeholder="Type your development request..."
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              onSendMessage((e.target as HTMLInputElement).value);
              (e.target as HTMLInputElement).value = '';
            }
          }}
        />
      </div>
    </div>
  );
}