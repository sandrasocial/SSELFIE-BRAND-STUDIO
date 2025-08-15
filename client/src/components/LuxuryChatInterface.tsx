import React, { useState } from 'react';

interface Message {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
  agentName?: string;
}

interface LuxuryChatInterfaceProps {
  agentName: string;
  agentRole: string;
  status: 'active' | 'working' | 'thinking' | 'offline';
  onSendMessage?: (message: string) => void;
  messages?: Message[];
}

const LuxuryChatInterface: React.FC<LuxuryChatInterfaceProps> = ({
  agentName,
  agentRole,
  status,
  onSendMessage,
  messages = []
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && onSendMessage) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const statusColors = {
    active: 'text-green-600',
    working: 'text-blue-600',
    thinking: 'text-yellow-600',
    offline: 'text-gray-400'
  };

  const statusDots = {
    active: 'bg-green-500',
    working: 'bg-blue-500 animate-pulse',
    thinking: 'bg-yellow-500 animate-pulse',
    offline: 'bg-gray-400'
  };

  return (
    <div className="h-full flex flex-col bg-white border border-gray-200">
      
      {/* Chat Header */}
      <header className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-serif text-black">{agentName}</h2>
            <p className="text-sm text-gray-600 mt-1">{agentRole}</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${statusDots[status]}`} />
            <span className={`text-xs uppercase tracking-wide ${statusColors[status]}`}>
              {status}
            </span>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm">
              Start a conversation with {agentName}
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 ${
                  message.type === 'user'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-black border border-gray-200'
                }`}
              >
                {message.type === 'agent' && (
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                    {message.agentName || agentName}
                  </p>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
                <p className={`text-xs mt-2 ${
                  message.type === 'user' ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        
        {status === 'thinking' && (
          <div className="flex justify-start">
            <div className="bg-gray-100 border border-gray-200 px-4 py-3 max-w-xs">
              <div className="flex items-center space-x-1">
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {agentName} is thinking...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="border-t border-gray-200 p-6">
        <div className="flex space-x-4">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Message ${agentName}...`}
            className="flex-1 px-4 py-3 border border-gray-300 text-black placeholder-gray-500 focus:outline-none focus:border-black"
            disabled={status === 'offline'}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || status === 'offline'}
            className="px-6 py-3 bg-black text-white text-sm hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
        
        {status === 'offline' && (
          <p className="text-xs text-gray-500 mt-2">
            {agentName} is currently offline. Please try again later.
          </p>
        )}
      </form>
    </div>
  );
};

// Quick Actions Component for Chat Sidebar
interface QuickAction {
  label: string;
  description: string;
  action: () => void;
}

interface ChatQuickActionsProps {
  agentName: string;
  actions: QuickAction[];
}

export const ChatQuickActions: React.FC<ChatQuickActionsProps> = ({ 
  actions 
}) => {
  return (
    <div className="bg-gray-50 border border-gray-200 p-6">
      <h3 className="text-sm uppercase tracking-wide text-gray-600 mb-4">
        Quick Actions
      </h3>
      <div className="space-y-2">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className="w-full text-left p-3 border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
          >
            <h4 className="text-sm font-medium text-black">{action.label}</h4>
            <p className="text-xs text-gray-600 mt-1">{action.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

// Chat Layout Component combining interface and actions
export const LuxuryChatLayout: React.FC<{
  agentName: string;
  agentRole: string;
  status: 'active' | 'working' | 'thinking' | 'offline';
  messages: Message[];
  quickActions: QuickAction[];
  onSendMessage: (message: string) => void;
}> = ({ agentName, agentRole, status, messages, quickActions, onSendMessage }) => {
  return (
    <div className="h-full grid grid-cols-12 gap-6">
      {/* Chat Interface */}
      <div className="col-span-8">
        <LuxuryChatInterface
          agentName={agentName}
          agentRole={agentRole}
          status={status}
          messages={messages}
          onSendMessage={onSendMessage}
        />
      </div>
      
      {/* Quick Actions Sidebar */}
      <div className="col-span-4">
        <ChatQuickActions 
          agentName={agentName}
          actions={quickActions}
        />
      </div>
    </div>
  );
};

export default LuxuryChatInterface;