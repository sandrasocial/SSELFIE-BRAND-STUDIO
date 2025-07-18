import React, { useState, useRef, useEffect } from 'react';
import { Send, FileText, Code, Folder } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface AgentChatMessage {
  id: number;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
  agentName?: string;
  fileOperations?: Array<{
    type: 'read' | 'write' | 'browse';
    path: string;
    success: boolean;
    error?: string;
  }>;
}

interface IntegratedAgentChatProps {
  onFileChange?: (filePath: string, content: string) => void;
  onDirectoryBrowse?: (path: string) => void;
  selectedAgent?: string;
}

export function IntegratedAgentChat({ 
  onFileChange, 
  onDirectoryBrowse,
  selectedAgent = 'zara' 
}: IntegratedAgentChatProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<AgentChatMessage[]>([]);
  const [currentAgent, setCurrentAgent] = useState(selectedAgent);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const agents = [
    { id: 'zara', name: 'Zara', role: 'Dev AI', icon: Code },
    { id: 'aria', name: 'Aria', role: 'UX Designer AI', icon: FileText },
    { id: 'rachel', name: 'Rachel', role: 'Voice AI', icon: FileText },
    { id: 'ava', name: 'Ava', role: 'Automation AI', icon: Folder },
    { id: 'quinn', name: 'Quinn', role: 'QA AI', icon: FileText },
    { id: 'sophia', name: 'Sophia', role: 'Social Media Manager AI', icon: FileText },
    { id: 'martha', name: 'Martha', role: 'Marketing/Ads AI', icon: FileText },
    { id: 'diana', name: 'Diana', role: 'Personal Mentor & Business Coach AI', icon: FileText },
    { id: 'wilma', name: 'Wilma', role: 'Workflow AI', icon: Folder }
  ];

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch('/api/admin/agent-chat-bypass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: currentAgent,
          message: content,
          adminToken: 'sandra-admin-2025',
          conversationHistory: chatHistory.slice(-10).map(msg => ({
            type: msg.type,
            content: msg.content
          }))
        })
      });
      
      if (!response.ok) {
        throw new Error(`Agent chat failed: ${response.statusText}`);
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      const userMessage: AgentChatMessage = {
        id: Date.now(),
        type: 'user',
        content: message,
        timestamp: new Date()
      };

      const agentMessage: AgentChatMessage = {
        id: Date.now() + 1,
        type: 'agent',
        content: data.message,
        timestamp: new Date(),
        agentName: data.agentName,
        fileOperations: data.fileOperations || []
      };

      setChatHistory(prev => [...prev, userMessage, agentMessage]);
      
      // Handle file operations
      if (data.fileOperations) {
        data.fileOperations.forEach((op: any) => {
          if (op.type === 'write' && op.success && onFileChange) {
            // Trigger file change callback for live editor update
            onFileChange(op.path, op.content || '');
          }
          if (op.type === 'browse' && op.success && onDirectoryBrowse) {
            onDirectoryBrowse(op.path);
          }
        });
      }

      // Check for continuous work patterns - enhanced for all 9 agents
      const responseText = data.message || '';
      const shouldContinueWorking = (
        responseText.includes('CONTINUING WORK') ||
        responseText.includes('NEXT STEP') ||
        responseText.includes('Let me also') ||
        responseText.includes('I\'ll continue') ||
        responseText.includes('Now I need to') ||
        responseText.includes('IMMEDIATE ACTION') ||
        responseText.includes('PROGRESS UPDATE') ||
        // Agent-specific continuous work patterns
        (currentAgent === 'zara' && responseText.includes('```')) ||
        (currentAgent === 'aria' && responseText.includes('design')) ||
        (currentAgent === 'rachel' && responseText.includes('copy')) ||
        (currentAgent === 'ava' && responseText.includes('workflow')) ||
        (currentAgent === 'quinn' && responseText.includes('testing')) ||
        (currentAgent === 'sophia' && responseText.includes('social')) ||
        (currentAgent === 'martha' && responseText.includes('marketing')) ||
        (currentAgent === 'diana' && responseText.includes('strategy')) ||
        (currentAgent === 'wilma' && responseText.includes('optimization'))
      );

      // Note: Auto-continue functionality removed per user request
      // Users can manually continue conversations by typing "continue" or similar
      
      setMessage('');
    }
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <Button
          onClick={() => setIsExpanded(true)}
          className="bg-black text-white hover:bg-gray-800 shadow-lg"
        >
          <Code className="w-4 h-4 mr-2" />
          Chat with {agents.find(a => a.id === currentAgent)?.name}
          ▲
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 flex flex-col z-30">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-serif text-lg">Agent Chat</h3>
          <Button
            onClick={() => setIsExpanded(false)}
            variant="ghost"
            size="sm"
          >
            ▼
          </Button>
        </div>
        
        {/* Agent Selector */}
        <select
          value={currentAgent}
          onChange={(e) => setCurrentAgent(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-black"
        >
          {agents.map(agent => (
            <option key={agent.id} value={agent.id}>
              {agent.name} • {agent.role}
            </option>
          ))}
        </select>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chatHistory.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Code className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <div className="text-sm">Start chatting with {agents.find(a => a.id === currentAgent)?.name}</div>
            <div className="text-xs text-gray-400 mt-1">Direct file access enabled</div>
          </div>
        ) : (
          chatHistory.map((msg) => (
            <div key={msg.id} className={`${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block max-w-[90%] p-3 rounded-lg ${
                msg.type === 'user' 
                  ? 'bg-black text-white' 
                  : 'bg-gray-100 border border-gray-200'
              }`}>
                {msg.type === 'agent' && (
                  <div className="text-xs text-gray-600 mb-1 font-medium">
                    {msg.agentName}
                  </div>
                )}
                <div className="text-sm">
                  <ReactMarkdown
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        const language = match ? match[1] : 'typescript';
                        
                        return !inline ? (
                          <SyntaxHighlighter
                            style={oneDark}
                            language={language}
                            PreTag="div"
                            className="rounded-md text-xs"
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className="bg-gray-200 px-1 py-0.5 rounded text-xs font-mono" {...props}>
                            {children}
                          </code>
                        );
                      },
                      details({ children, ...props }) {
                        return (
                          <details className="my-2 border border-gray-300 rounded-md" {...props}>
                            {children}
                          </details>
                        );
                      },
                      summary({ children, ...props }) {
                        return (
                          <summary className="cursor-pointer p-2 bg-gray-50 hover:bg-gray-100 font-medium text-sm border-b border-gray-200" {...props}>
                            {children}
                          </summary>
                        );
                      },
                      h1: ({ children }) => <h1 className="text-lg font-bold font-serif mt-4 mb-2">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-base font-bold font-serif mt-3 mb-2">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-sm font-bold font-serif mt-2 mb-1">{children}</h3>,
                      ul: ({ children }) => <ul className="list-disc list-inside space-y-1 ml-2">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 ml-2">{children}</ol>,
                      li: ({ children }) => <li className="text-sm">{children}</li>,
                      p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                      em: ({ children }) => <em className="italic">{children}</em>,
                      blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-300 pl-3 italic text-gray-600">{children}</blockquote>,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
                
                {/* File Operations */}
                {msg.fileOperations && msg.fileOperations.length > 0 && (
                  <div className="text-xs mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                    <div className="font-medium text-blue-800 mb-1">📁 File Operations:</div>
                    {msg.fileOperations.map((op, index) => (
                      <div key={index} className={`text-blue-700 ${op.success ? '' : 'text-red-700'}`}>
                        {op.success ? '✅' : '❌'} {op.type.toUpperCase()}: {op.path}
                        {op.error && <div className="text-red-600 text-xs ml-4">Error: {op.error}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <form onSubmit={(e) => {
          e.preventDefault();
          if (message.trim()) {
            sendMessage.mutate(message);
          }
        }} className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Ask ${agents.find(a => a.id === currentAgent)?.name} anything...`}
            className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-black"
            disabled={sendMessage.isPending}
          />
          <Button
            type="submit"
            disabled={sendMessage.isPending || !message.trim()}
            size="sm"
            className="bg-black text-white hover:bg-gray-800"
          >
            {sendMessage.isPending ? (
              <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
        <div className="text-xs text-gray-500 mt-2 flex items-center justify-between">
          <span>{agents.find(a => a.id === currentAgent)?.name} has full codebase access</span>
          <div className="flex space-x-3">
            <button
              onClick={() => {
                if (chatHistory.length > 0) {
                  const newHistory = chatHistory.slice(0, -1);
                  setChatHistory(newHistory);
                  // Save to localStorage if exists
                  if (newHistory.length === 0) {
                    localStorage.removeItem(`visual-editor-chat-${currentAgent}`);
                  } else {
                    localStorage.setItem(`visual-editor-chat-${currentAgent}`, JSON.stringify(newHistory));
                  }
                }
              }}
              disabled={chatHistory.length === 0}
              className="text-xs text-blue-500 hover:text-blue-700 underline disabled:text-gray-400 disabled:no-underline"
            >
              Rollback
            </button>
            <button
              onClick={() => {
                setChatHistory([]);
                localStorage.removeItem(`visual-editor-chat-${currentAgent}`);
              }}
              className="text-xs text-green-600 hover:text-green-800 font-bold"
              title="Start new chat"
            >
              + New Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}