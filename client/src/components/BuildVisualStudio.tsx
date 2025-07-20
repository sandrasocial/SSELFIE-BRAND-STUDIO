import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Eye, Code, Palette, Layout } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';

interface Message {
  id: string;
  type: 'user' | 'victoria' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    websiteUpdate?: boolean;
    previewUrl?: string;
    fileChanges?: string[];
  };
}

interface BuildProject {
  id: string;
  name: string;
  description: string;
  websiteUrl?: string;
  status: 'draft' | 'building' | 'preview' | 'live';
  lastModified: Date;
}

export default function BuildVisualStudio() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'victoria',
      content: "Hello! I'm Victoria, your AI website creator. I can help you build a stunning website from scratch or enhance your existing one. What would you like to create today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  const [currentProject, setCurrentProject] = useState<BuildProject | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simulate Victoria's response
  const sendMessageToVictoria = useMutation({
    mutationFn: async (message: string) => {
      setIsBuilding(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate Victoria's response based on message content
      let response = "I understand you'd like to work on that. Let me help you create something amazing!";
      let metadata = {};
      
      if (message.toLowerCase().includes('website') || message.toLowerCase().includes('site')) {
        response = "Perfect! I'll start building your website. Let me create the structure and design elements for you.";
        metadata = { websiteUpdate: true, fileChanges: ['index.html', 'styles.css', 'main.js'] };
      } else if (message.toLowerCase().includes('portfolio')) {
        response = "A portfolio website - excellent choice! I'll create a modern, professional layout that showcases your work beautifully.";
        metadata = { websiteUpdate: true, previewUrl: '/preview/portfolio' };
      } else if (message.toLowerCase().includes('business')) {
        response = "I'll design a professional business website with all the essential sections: about, services, contact, and more.";
        metadata = { websiteUpdate: true, previewUrl: '/preview/business' };
      }
      
      return { response, metadata };
    },
    onSuccess: (data) => {
      const newMessage: Message = {
        id: Date.now().toString(),
        type: 'victoria',
        content: data.response,
        timestamp: new Date(),
        metadata: data.metadata
      };
      setMessages(prev => [...prev, newMessage]);
      setIsBuilding(false);
      
      // Update project status
      if (data.metadata.websiteUpdate) {
        setCurrentProject(prev => prev ? {
          ...prev,
          status: 'building',
          lastModified: new Date()
        } : {
          id: Date.now().toString(),
          name: 'New Website Project',
          description: 'Created with Victoria AI',
          status: 'building',
          lastModified: new Date()
        });
      }
    },
    onError: () => {
      setIsBuilding(false);
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'system',
        content: "I'm having trouble processing that request. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  });

  const handleSendMessage = () => {
    if (!inputValue.trim() || isBuilding) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    sendMessageToVictoria.mutate(inputValue);
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-2">
              <Layout className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-serif text-slate-900">BUILD Studio</h1>
              <p className="text-sm text-slate-600">Visual Website Creation with Victoria AI</p>
            </div>
          </div>
          
          {currentProject && (
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">{currentProject.name}</p>
                <p className="text-xs text-slate-500 capitalize">{currentProject.status}</p>
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors">
                  <Eye className="w-4 h-4 inline mr-1" />
                  Preview
                </button>
                <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors">
                  <Code className="w-4 h-4 inline mr-1" />
                  Code
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-[600px] flex flex-col">
              {/* Chat Header */}
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-serif text-slate-900">Victoria AI</h2>
                    <p className="text-sm text-slate-600">Your Website Creation Assistant</p>
                  </div>
                  {isBuilding && (
                    <div className="ml-auto">
                      <div className="flex items-center space-x-2 text-sm text-purple-600">
                        <div className="animate-spin w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full"></div>
                        <span>Building...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.type === 'user'
                          ? 'bg-slate-900 text-white'
                          : message.type === 'victoria'
                          ? 'bg-gradient-to-r from-purple-50 to-pink-50 text-slate-900 border border-purple-100'
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      
                      {message.metadata?.websiteUpdate && (
                        <div className="mt-3 pt-3 border-t border-purple-200">
                          <div className="flex items-center space-x-2 text-xs text-purple-700">
                            <Layout className="w-3 h-3" />
                            <span>Website updated</span>
                            {message.metadata.fileChanges && (
                              <span className="text-purple-500">
                                • {message.metadata.fileChanges.length} files modified
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-6 border-t border-slate-200">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Describe what you want to build..."
                    className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    disabled={isBuilding}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isBuilding}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Project Panel */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-serif text-slate-900 mb-4">Quick Start</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setInputValue("Create a modern portfolio website")}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Palette className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-slate-900">Portfolio Site</p>
                      <p className="text-xs text-slate-600">Showcase your work</p>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => setInputValue("Build a business website with contact forms")}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Layout className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-slate-900">Business Site</p>
                      <p className="text-xs text-slate-600">Professional presence</p>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => setInputValue("Create a landing page for my product")}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-slate-900">Landing Page</p>
                      <p className="text-xs text-slate-600">Convert visitors</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Project Status */}
            {currentProject && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-serif text-slate-900 mb-4">Current Project</h3>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-slate-900">{currentProject.name}</p>
                    <p className="text-sm text-slate-600">{currentProject.description}</p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                      currentProject.status === 'building' 
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {currentProject.status}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600">
                    Last updated: {currentProject.lastModified.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}