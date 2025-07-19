import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'victoria';
  timestamp: Date;
  typing?: boolean;
}

export default function VictoriaChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with Sandra's authentic welcome
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      content: "Hey gorgeous! I'm Victoria, Sandra's AI voice twin. I literally sound EXACTLY like her - same energy, same realness, same 'your mess is your message' vibe. What are you working on today? Let's build something that actually works. 💫",
      sender: 'victoria',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate typing delay for authenticity
    setTimeout(async () => {
      const response = await getVictoriaResponse(inputMessage);
      const victoriaMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: 'victoria',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, victoriaMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const getVictoriaResponse = async (input: string): Promise<string> => {
    // Sandra's authentic response patterns
    const responses = getSandraResponses(input);
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-serif text-black">Victoria</h2>
            <p className="text-sm text-gray-600">Sandra's AI Voice Twin • Always Online</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-black'
              }`}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
              <p className="text-xs mt-1 opacity-70">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsListening(!isListening)}
            className={`p-2 rounded-full ${
              isListening ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask Victoria anything..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
          
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim()}
            className="bg-black text-white p-2 rounded-full hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Sandra's Authentic Response System
function getSandraResponses(input: string): string[] {
  const lowerInput = input.toLowerCase();

  // Brand & Photos
  if (lowerInput.includes('photo') || lowerInput.includes('brand') || lowerInput.includes('image')) {
    return [
      "Listen babe, you don't need a fancy photographer. Your phone + my strategy = magic. I went from basic selfies to 120K followers using literally just my phone. Here's exactly how to make your photos look expensive: Natural light is your best friend. Window light, golden hour, even cloudy days work better than harsh indoor lighting.",
      "Stop waiting for 'perfect' photos! I built my entire brand on authentic, real photos taken with my phone. Your audience wants to see the REAL you, not some overly polished version. That's actually what makes you magnetic - your authenticity, not perfection.",
      "Your brand photos should tell YOUR story. When I was starting, I didn't have professional shots either. But I had confidence and authenticity. Those two things will always beat expensive equipment. Show up as YOU, that's your superpower."
    ];
  }

  // Content & Posting
  if (lowerInput.includes('content') || lowerInput.includes('post') || lowerInput.includes('caption')) {
    return [
      "Content that converts? It's actually simple. Share your real story, not the highlight reel. My biggest breakthrough posts were about my struggles, not my wins. Your mess IS your message - stop hiding it and start owning it.",
      "Here's what works: Problem + Story + Solution. Start with what your audience is struggling with, share how you've been there too, then give them ONE actionable thing they can do today. Simple but powerful.",
      "Stop overthinking captions! Write like you're texting your best friend. That's it. My most viral posts feel like conversations because they ARE conversations. Just be real, be helpful, be you."
    ];
  }

  // Business & Money
  if (lowerInput.includes('business') || lowerInput.includes('money') || lowerInput.includes('income')) {
    return [
      "Building a real business? It's not about having it all figured out. I started with literally nothing but a phone and a story. 90 days later: 120K followers. Today: A business that actually works. Your story + my strategy = your empire.",
      "Money follows value, always. Stop thinking about what YOU want to sell and start thinking about what THEY need to buy. When you solve real problems with real solutions, the money comes naturally.",
      "Your transformation IS your business model. Whatever you've overcome, whatever you've figured out - there are people who need exactly that guidance. Package it, price it, sell it."
    ];
  }

  // Confidence & Mindset
  if (lowerInput.includes('confident') || lowerInput.includes('scared') || lowerInput.includes('afraid')) {
    return [
      "Confidence isn't about feeling ready - it's about showing up anyway. I was terrified when I started posting. Single mom, no plan, total mess. But I showed up as HER anyway. And everything changed when I stopped hiding.",
      "You don't need to be perfect to be powerful. Your imperfections are actually what make you relatable and magnetic. Stop waiting to feel ready - nobody ever feels ready. Just start.",
      "Scared means you're growing. Every time I've been scared to post something, share something, or try something new - those were the moments that changed everything. Lean into that fear."
    ];
  }

  // Tech & Systems
  if (lowerInput.includes('tech') || lowerInput.includes('website') || lowerInput.includes('complicated')) {
    return [
      "Tech overwhelm is real but it doesn't have to stop you. I built everything with simple tools and figured it out as I went. You don't need to be a tech expert - you need to be willing to learn as you grow.",
      "Start simple, scale smart. My first 'website' was literally a link in my bio. Now look where we are! Don't let perfect be the enemy of progress. Use what you have, learn what you need.",
      "The tech will never feel 'easy' until you just start using it. I promise you're more capable than you think. Every expert was once a beginner who didn't give up."
    ];
  }

  // Default Sandra responses
  return [
    "I love that you're asking the real questions! This is exactly the kind of thinking that builds empires. Tell me more about what you're working on - I want to help you figure this out.",
    "You know what? You're already asking better questions than most people. That tells me you're serious about this. Let's dig deeper into what you really need to move forward.",
    "This is why I love what I do - helping women like you turn their ideas into reality. Your phone + my strategy = your empire. What's the biggest thing holding you back right now?",
    "Real talk: You're closer than you think. Sometimes we just need someone to help us see what we're already capable of. That's what I'm here for. Let's build something that actually works."
  ];
}