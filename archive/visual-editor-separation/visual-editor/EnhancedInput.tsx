import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Paperclip, 
  Code, 
  Hash, 
  AtSign,
  ArrowUp,
  ArrowDown,
  History,
  Save,
  Zap,
  MessageSquare
} from 'lucide-react';

interface EnhancedInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (message: string) => void;
  onFileUpload?: (files: FileList | null) => void;
  placeholder?: string;
  agentName?: string;
  isLoading?: boolean;
  disabled?: boolean;
}

interface CommandSuggestion {
  command: string;
  description: string;
  category: 'action' | 'agent' | 'system';
  icon: React.ReactNode;
}

interface InputHistory {
  message: string;
  timestamp: Date;
  agentId: string;
}

export function EnhancedInput({
  value,
  onChange,
  onSend,
  onFileUpload,
  placeholder = "Ask your agent for help...",
  agentName = "Agent",
  isLoading = false,
  disabled = false
}: EnhancedInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [inputHistory, setInputHistory] = useState<InputHistory[]>([]);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Command suggestions based on input
  const commandSuggestions: CommandSuggestion[] = [
    { command: '/design', description: 'Request design improvements', category: 'action', icon: <Code className="w-4 h-4" /> },
    { command: '/analyze', description: 'Analyze current content', category: 'action', icon: <Hash className="w-4 h-4" /> },
    { command: '/optimize', description: 'Optimize performance', category: 'action', icon: <Zap className="w-4 h-4" /> },
    { command: '/review', description: 'Review and provide feedback', category: 'action', icon: <MessageSquare className="w-4 h-4" /> },
    { command: '@elena', description: 'Coordinate with Elena', category: 'agent', icon: <AtSign className="w-4 h-4" /> },
    { command: '@aria', description: 'Design with Aria', category: 'agent', icon: <AtSign className="w-4 h-4" /> },
    { command: '@zara', description: 'Develop with Zara', category: 'agent', icon: <AtSign className="w-4 h-4" /> },
    { command: '#luxury', description: 'Apply luxury styling', category: 'system', icon: <Hash className="w-4 h-4" /> },
    { command: '#editorial', description: 'Use editorial layout', category: 'system', icon: <Hash className="w-4 h-4" /> },
    { command: '#responsive', description: 'Make responsive', category: 'system', icon: <Hash className="w-4 h-4" /> }
  ];

  // Quick action templates
  const quickActions = [
    { label: 'Design Help', template: 'Help me improve the design with luxury editorial styling and Times New Roman typography', icon: <Code className="w-3 h-3" /> },
    { label: 'Code Review', template: 'Please review my code and suggest improvements for performance and maintainability', icon: <Hash className="w-3 h-3" /> },
    { label: 'Workflow Start', template: 'Start a multi-agent workflow to enhance this project with coordinated tasks', icon: <Zap className="w-3 h-3" /> },
    { label: 'Architecture', template: 'Analyze the current architecture and recommend optimizations', icon: <MessageSquare className="w-3 h-3" /> }
  ];

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 200; // Maximum height in pixels
      textareaRef.current.style.height = Math.min(scrollHeight, maxHeight) + 'px';
    }
  }, [value]);

  // Load input history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('agent-input-history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setInputHistory(parsed.map((h: any) => ({
          ...h,
          timestamp: new Date(h.timestamp)
        })));
      } catch (error) {
        console.error('Failed to load input history:', error);
      }
    }
  }, []);

  // Save input history
  const saveToHistory = useCallback((message: string) => {
    const newEntry: InputHistory = {
      message,
      timestamp: new Date(),
      agentId: agentName.toLowerCase()
    };
    
    const updatedHistory = [newEntry, ...inputHistory.slice(0, 49)]; // Keep last 50 entries
    setInputHistory(updatedHistory);
    localStorage.setItem('agent-input-history', JSON.stringify(updatedHistory));
    setHistoryIndex(-1);
  }, [inputHistory, agentName]);

  // Filter suggestions based on input
  const filteredSuggestions = commandSuggestions.filter(suggestion => {
    const inputLower = value.toLowerCase();
    const lastWord = inputLower.split(' ').pop() || '';
    
    if (lastWord.startsWith('/') || lastWord.startsWith('@') || lastWord.startsWith('#')) {
      return suggestion.command.toLowerCase().includes(lastWord);
    }
    return false;
  });

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Enter to send (unless Shift+Enter for new line)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading) {
        handleSend();
      }
    }
    
    // Arrow keys for history navigation
    if (e.key === 'ArrowUp' && e.ctrlKey) {
      e.preventDefault();
      if (historyIndex < inputHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        onChange(inputHistory[newIndex].message);
      }
    }
    
    if (e.key === 'ArrowDown' && e.ctrlKey) {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        onChange(inputHistory[newIndex].message);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        onChange('');
      }
    }

    // Suggestion navigation
    if (showSuggestions && filteredSuggestions.length > 0) {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestion(prev => prev > 0 ? prev - 1 : filteredSuggestions.length - 1);
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestion(prev => prev < filteredSuggestions.length - 1 ? prev + 1 : 0);
      }
      if (e.key === 'Tab' || (e.key === 'Enter' && e.shiftKey)) {
        e.preventDefault();
        applySuggestion(filteredSuggestions[selectedSuggestion]);
      }
    }

    // Save draft (Ctrl+S)
    if (e.key === 's' && e.ctrlKey) {
      e.preventDefault();
      saveDraft();
    }

    // Toggle quick actions (Ctrl+/)
    if (e.key === '/' && e.ctrlKey) {
      e.preventDefault();
      setShowQuickActions(!showQuickActions);
    }
  };

  // Apply command suggestion
  const applySuggestion = (suggestion: CommandSuggestion) => {
    const words = value.split(' ');
    words[words.length - 1] = suggestion.command + ' ';
    onChange(words.join(' '));
    setShowSuggestions(false);
    textareaRef.current?.focus();
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Show suggestions for commands
    const lastWord = newValue.split(' ').pop() || '';
    const shouldShowSuggestions = lastWord.startsWith('/') || lastWord.startsWith('@') || lastWord.startsWith('#');
    setShowSuggestions(shouldShowSuggestions);
    
    if (shouldShowSuggestions) {
      setSelectedSuggestion(0);
    }
  };

  // Send message
  const handleSend = () => {
    if (value.trim()) {
      saveToHistory(value);
      onSend(value);
      setIsDraftSaved(false);
    }
  };

  // Save draft
  const saveDraft = () => {
    if (value.trim()) {
      localStorage.setItem('agent-input-draft', value);
      setIsDraftSaved(true);
      setTimeout(() => setIsDraftSaved(false), 2000);
    }
  };

  // Load draft
  const loadDraft = () => {
    const draft = localStorage.getItem('agent-input-draft');
    if (draft) {
      onChange(draft);
    }
  };

  // Apply quick action
  const applyQuickAction = (template: string) => {
    onChange(template);
    setShowQuickActions(false);
    textareaRef.current?.focus();
  };

  return (
    <div className="relative">
      {/* Command Suggestions */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <Card className="absolute bottom-full left-0 right-0 mb-2 border border-gray-200 shadow-lg z-50">
          <CardContent className="p-2">
            <div className="text-xs text-gray-500 mb-2 flex items-center">
              <Zap className="w-3 h-3 mr-1" />
              Commands (Tab to select)
            </div>
            <div className="space-y-1">
              {filteredSuggestions.map((suggestion, index) => (
                <div
                  key={suggestion.command}
                  className={`flex items-center space-x-2 p-2 rounded text-sm cursor-pointer ${
                    index === selectedSuggestion ? 'bg-black text-white' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => applySuggestion(suggestion)}
                >
                  {suggestion.icon}
                  <span className="font-medium">{suggestion.command}</span>
                  <span className="text-xs opacity-60">{suggestion.description}</span>
                  <Badge variant="outline" className="ml-auto text-xs">
                    {suggestion.category}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      {showQuickActions && (
        <Card className="absolute bottom-full left-0 right-0 mb-2 border border-gray-200 shadow-lg z-50">
          <CardContent className="p-2">
            <div className="text-xs text-gray-500 mb-2 flex items-center">
              <Zap className="w-3 h-3 mr-1" />
              Quick Actions
            </div>
            <div className="grid grid-cols-1 gap-1">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className="flex items-center space-x-2 p-2 rounded text-sm hover:bg-gray-100 text-left"
                  onClick={() => applyQuickAction(action.template)}
                >
                  {action.icon}
                  <span className="font-medium">{action.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Input Container */}
      <div className="flex items-end space-x-2 p-3 bg-white border border-gray-200 rounded-lg">
        {/* File Upload */}
        <div className="flex flex-col space-y-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => onFileUpload?.(e.target.files)}
            className="hidden"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="h-8 w-8 p-0 hover:bg-gray-100"
            title="Upload files"
          >
            <Paperclip className="w-4 h-4" />
          </Button>
        </div>

        {/* Enhanced Textarea */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={`${placeholder} (Use / for commands, @ for agents, # for tags)`}
            className="w-full resize-none border-0 outline-none text-sm min-h-[40px] max-h-[200px] overflow-y-auto"
            rows={1}
            disabled={disabled}
          />
          
          {/* Input Indicators */}
          <div className="absolute bottom-1 right-1 flex items-center space-x-1">
            {isDraftSaved && (
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                <Save className="w-3 h-3 mr-1" />
                Saved
              </Badge>
            )}
            {historyIndex >= 0 && (
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                <History className="w-3 h-3 mr-1" />
                History {historyIndex + 1}
              </Badge>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-1">
          {/* Quick Actions Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="h-8 w-8 p-0 hover:bg-gray-100"
            title="Quick actions (Ctrl+/)"
          >
            <Zap className="w-4 h-4" />
          </Button>

          {/* History Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (inputHistory.length > 0) {
                const randomHistoryIndex = Math.floor(Math.random() * inputHistory.length);
                onChange(inputHistory[randomHistoryIndex].message);
                setHistoryIndex(randomHistoryIndex);
              } else {
                toast({
                  title: 'No History',
                  description: 'No message history available',
                });
              }
            }}
            className="h-8 w-8 p-0 hover:bg-gray-100"
            title="Load from history (or use Ctrl+Arrow keys)"
          >
            <History className="w-4 h-4" />
          </Button>

          {/* Send Button */}
          <Button
            size="sm"
            onClick={handleSend}
            disabled={!value.trim() || isLoading || disabled}
            className="h-8 w-8 p-0 bg-black text-white hover:bg-gray-800"
            title="Send message (Enter)"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Input Helper */}
      <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
        <div className="flex items-center space-x-3">
          <span>Enter to send, Shift+Enter for new line</span>
          <span>Ctrl+↑/↓ for history</span>
          <span>Ctrl+S to save draft</span>
        </div>
        <div className="flex items-center space-x-1">
          <span>{value.length} chars</span>
          {value.length > 1000 && (
            <Badge variant="secondary" className="text-xs">
              Long message
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}