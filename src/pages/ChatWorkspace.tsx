import React, { useState } from 'react';

const ChatWorkspace: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState('sandra');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      agent: 'sandra',
      content: 'Hi! I\'m Sandra, your AI business strategist. How can I help you build your brand today?',
      timestamp: new Date(),
      isUser: false
    }
  ]);

  const agents = [
    { id: 'sandra', name: 'Sandra', role: 'Business Strategist', color: 'bg-pink-100' },
    { id: 'zara', name: 'Zara', role: 'Technical Architect', color: 'bg-blue-100' },
    { id: 'maya', name: 'Maya', role: 'Dev Expert', color: 'bg-green-100' },
    { id: 'elena', name: 'Elena', role: 'Project Manager', color: 'bg-purple-100' }
  ];

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      agent: selectedAgent,
      content: message,
      timestamp: new Date(),
      isUser: true
    };

    setMessages([...messages, newMessage]);
    setMessage('');

    // Simulate AI response
    setTimeout(() => {
      const response = {
        id: messages.length + 2,
        agent: selectedAgent,
        content: `Thanks for your message! I'm ${selectedAgent} and I'm here to help you with your SSELFIE project.`,
        timestamp: new Date(),
        isUser: false
      };
      setMessages(prev => [...prev, response]);
    }, 1000);
  };

  return (
    <div className="h-screen flex">
      {/* Agent Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-times font-light text-black">
            AI Agents
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Choose your specialist
          </p>
        </div>
        
        <div className="flex-1 p-4">
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => setSelectedAgent(agent.id)}
              className={`w-full p-4 rounded-lg mb-3 text-left transition-colors ${
                selectedAgent === agent.id
                  ? 'bg-black text-white'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full ${agent.color} flex-shrink-0`}></div>
                <div className="ml-3">
                  <h3 className="font-medium">{agent.name}</h3>
                  <p className={`text-sm ${
                    selectedAgent === agent.id ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {agent.role}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <h1 className="text-2xl font-times font-light text-black">
            Chat with {agents.find(a => a.id === selectedAgent)?.name}
          </h1>
          <p className="text-gray-600">
            {agents.find(a => a.id === selectedAgent)?.role}
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-6 ${msg.isUser ? 'text-right' : 'text-left'}`}
            >
              <div
                className={`inline-block max-w-2xl p-4 rounded-lg ${
                  msg.isUser
                    ? 'bg-black text-white'
                    : 'bg-white border border-gray-200'
                }`}
              >
                <p className="leading-relaxed">{msg.content}</p>
                <p className={`text-xs mt-2 ${
                  msg.isUser ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  {msg.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-6 bg-white border-t border-gray-200">
          <div className="flex space-x-4">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
            />
            <button
              onClick={handleSendMessage}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWorkspace;