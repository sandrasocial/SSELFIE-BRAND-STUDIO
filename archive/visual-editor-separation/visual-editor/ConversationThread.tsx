import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  MessageSquare, 
  Edit3, 
  Copy, 
  Share, 
  MoreHorizontal,
  GitBranch,
  ChevronDown,
  ChevronRight,
  Search,
  Filter,
  Clock
} from 'lucide-react';
import { FormattedAgentMessage } from './FormattedAgentMessage';

interface ThreadMessage {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
  agentName?: string;
  parentId?: string;
  threadId: string;
  isEdited?: boolean;
  originalContent?: string;
}

interface ConversationThread {
  id: string;
  title: string;
  agentId: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
  isActive: boolean;
  parentThreadId?: string;
  branchedFromMessageId?: string;
  tags: string[];
}

interface ConversationThreadProps {
  agentId: string;
  conversations: any[];
  onLoadConversation: (conversation: any) => void;
  onDeleteConversation: (conversationId: string) => void;
  onThreadChange?: (threadId: string) => void;
  onMessageBranch?: (messageId: string, newThreadId: string) => void;
}

export function ConversationThread({ 
  agentId,
  conversations,
  onLoadConversation,
  onDeleteConversation,
  onThreadChange, 
  onMessageBranch 
}: ConversationThreadProps) {
  const [threads, setThreads] = useState<ConversationThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [isLoadingThreads, setIsLoadingThreads] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showThreadList, setShowThreadList] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  // Load all threads for the agent
  useEffect(() => {
    loadThreads();
  }, [agentId]);

  const loadThreads = async () => {
    setIsLoadingThreads(true);
    try {
      const response = await fetch(`/api/conversations/threads/${agentId}`);
      
      if (response.ok) {
        const threadsData = await response.json();
        setThreads(threadsData);
        
        // Set active thread to most recent if none selected
        if (!activeThreadId && threadsData.length > 0) {
          const mostRecent = threadsData.sort((a: ConversationThread, b: ConversationThread) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )[0];
          setActiveThreadId(mostRecent.id);
          loadThreadMessages(mostRecent.id);
        }
      }
    } catch (error) {
      console.error('Failed to load threads:', error);
    } finally {
      setIsLoadingThreads(false);
    }
  };

  const loadThreadMessages = async (threadId: string) => {
    try {
      const response = await fetch(`/api/admin/conversation-threads/${threadId}/messages`, {
        headers: { 'Authorization': 'Bearer sandra-admin-2025' }
      });
      
      if (response.ok) {
        const messagesData = await response.json();
        setMessages(messagesData);
      }
    } catch (error) {
      console.error('Failed to load thread messages:', error);
    }
  };

  const createNewThread = async (title?: string, parentMessageId?: string) => {
    try {
      const response = await fetch('/api/admin/conversation-threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sandra-admin-2025'
        },
        body: JSON.stringify({
          agentId,
          title: title || `New conversation - ${new Date().toLocaleDateString()}`,
          branchedFromMessageId: parentMessageId
        })
      });

      if (response.ok) {
        const newThread = await response.json();
        setThreads(prev => [newThread, ...prev]);
        setActiveThreadId(newThread.id);
        setMessages([]);
        onThreadChange?.(newThread.id);
        
        if (parentMessageId) {
          onMessageBranch?.(parentMessageId, newThread.id);
        }
        
        return newThread;
      }
    } catch (error) {
      console.error('Failed to create new thread:', error);
    }
  };

  const updateThreadTitle = async (threadId: string, newTitle: string) => {
    try {
      const response = await fetch(`/api/admin/conversation-threads/${threadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sandra-admin-2025'
        },
        body: JSON.stringify({ title: newTitle })
      });

      if (response.ok) {
        setThreads(prev => prev.map(thread => 
          thread.id === threadId ? { ...thread, title: newTitle } : thread
        ));
      }
    } catch (error) {
      console.error('Failed to update thread title:', error);
    }
  };

  const editMessage = async (messageId: string, newContent: string) => {
    try {
      const response = await fetch(`/api/admin/conversation-messages/${messageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sandra-admin-2025'
        },
        body: JSON.stringify({ content: newContent })
      });

      if (response.ok) {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, content: newContent, isEdited: true, originalContent: msg.content }
            : msg
        ));
        setEditingMessageId(null);
        setEditingContent('');
      }
    } catch (error) {
      console.error('Failed to edit message:', error);
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const shareThread = (threadId: string) => {
    const shareUrl = `${window.location.origin}/admin/visual-editor?thread=${threadId}`;
    navigator.clipboard.writeText(shareUrl);
  };

  const filteredThreads = (threads || []).filter(thread =>
    thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    thread.agentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeThread = threads.find(t => t.id === activeThreadId);

  return (
    <div className="flex flex-col h-full">
      {/* Thread Management Header */}
      <div className="border-b border-gray-200 p-4 bg-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowThreadList(!showThreadList)}
              className="flex items-center space-x-1"
            >
              {showThreadList ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              <MessageSquare className="w-4 h-4" />
              <span>Threads ({threads.length})</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => createNewThread()}
              className="flex items-center space-x-1"
            >
              <GitBranch className="w-4 h-4" />
              <span>New Thread</span>
            </Button>
          </div>

          {activeThread && (
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => shareThread(activeThread.id)}
                className="flex items-center space-x-1"
              >
                <Share className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Active Thread Title */}
        {activeThread && (
          <div className="flex items-center space-x-2">
            <Input
              value={activeThread.title}
              onChange={(e) => updateThreadTitle(activeThread.id, e.target.value)}
              className="font-medium text-sm"
              placeholder="Thread title..."
            />
            <div className="text-xs text-gray-500 flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{new Date(activeThread.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* Thread List (Collapsible) */}
      {showThreadList && (
        <div className="border-b border-gray-200 bg-gray-50 p-4 max-h-64 overflow-y-auto">
          <div className="mb-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            {filteredThreads.map((thread) => (
              <div
                key={thread.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  thread.id === activeThreadId
                    ? 'border-black bg-white shadow-sm'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => {
                  setActiveThreadId(thread.id);
                  loadThreadMessages(thread.id);
                  onThreadChange?.(thread.id);
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-black truncate">
                      {thread.title}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {thread.messageCount} messages
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(thread.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {thread.parentThreadId && (
                      <div className="flex items-center space-x-1 mt-1">
                        <GitBranch className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-400">Branched conversation</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="group relative">
            {/* Message Actions Overlay */}
            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <div className="flex items-center space-x-1 bg-white border rounded-lg shadow-sm p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => createNewThread(undefined, message.id)}
                  className="h-7 w-7 p-0"
                  title="Branch conversation from this message"
                >
                  <GitBranch className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyMessage(message.content)}
                  className="h-7 w-7 p-0"
                  title="Copy message"
                >
                  <Copy className="w-3 h-3" />
                </Button>
                {message.type === 'user' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingMessageId(message.id);
                      setEditingContent(message.content);
                    }}
                    className="h-7 w-7 p-0"
                    title="Edit message"
                  >
                    <Edit3 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>

            {/* Message Content */}
            {editingMessageId === message.id ? (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <textarea
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  className="w-full min-h-[100px] p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-black"
                  placeholder="Edit your message..."
                />
                <div className="flex justify-end space-x-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingMessageId(null);
                      setEditingContent('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => editMessage(message.id, editingContent)}
                    className="bg-black text-white hover:bg-gray-800"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            ) : (
              <div className={`${
                message.type === 'user' 
                  ? 'bg-gray-50 border border-gray-200' 
                  : 'bg-white border border-gray-200'
              } rounded-lg p-4`}>
                {message.type === 'agent' ? (
                  <FormattedAgentMessage
                    content={message.content}
                    agentName={message.agentName}
                    timestamp={message.timestamp}
                  />
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-black">You</span>
                      <div className="flex items-center space-x-2">
                        {message.isEdited && (
                          <span className="text-xs text-gray-400">(edited)</span>
                        )}
                        <span className="text-xs text-gray-400">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}