import React, { useState } from 'react';

const TestZara: React.FC = () => {
  const [messages, setMessages] = useState<Array<{id: number, text: string, sender: 'user' | 'zara'}>>([
    { id: 1, text: "Hello! I'm Zara, your personal brand strategist. I help transform your unique story into a powerful brand presence.", sender: 'zara' }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user' as const
    };

    const zaraResponses = [
      "That's fascinating! Let me help you turn that into a brand asset. What's your target audience for this?",
      "I love your thinking! This could be the foundation of something incredible. Tell me more about your vision.",
      "Perfect! This aligns beautifully with current market trends. Let's develop this concept further.",
      "Brilliant insight! I can already see how this translates into multiple revenue streams. What's your timeline?",
      "This has serious potential! Let me show you how to position this for maximum impact."
    ];

    const zaraMessage = {
      id: messages.length + 2,
      text: zaraResponses[Math.floor(Math.random() * zaraResponses.length)],
      sender: 'zara' as const
    };

    setMessages(prev => [...prev, userMessage, zaraMessage]);
    setInputMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">Z</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Test Chat with Zara</h1>
            <p className="text-lg text-gray-600">Your Personal Brand Strategist & Business Mentor</p>
            <div className="flex items-center justify-center space-x-2 mt-4">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 font-medium">Online & Ready to Help</span>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
              <h2 className="text-white font-semibold text-lg">Brand Strategy Session</h2>
              <p className="text-purple-100 text-sm">Let's build your empire together</p>
            </div>

            {/* Messages */}
            <div className="h-96 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gradient-to-r from-purple-100 to-pink-100 text-gray-800'
                    }`}
                  >
                    {message.sender === 'zara' && (
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-white">Z</span>
                        </div>
                        <span className="text-xs font-semibold text-purple-600">Zara</span>
                      </div>
                    )}
                    <p className="text-sm">{message.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="border-t bg-gray-50 p-4">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask Zara about your brand strategy..."
                  className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-medium"
                >
                  Send
                </button>
              </div>
            </div>
          </div>

          {/* Zara's Expertise */}
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Brand Positioning</h3>
              <p className="text-gray-600 text-sm">Strategic positioning to differentiate your brand in the marketplace</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💡</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Business Strategy</h3>
              <p className="text-gray-600 text-sm">Revenue optimization and market expansion strategies</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Growth Hacking</h3>
              <p className="text-gray-600 text-sm">Scalable growth techniques for rapid business expansion</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestZara;