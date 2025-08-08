import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Star, 
  Archive, 
  Trash2, 
  Download, 
  Upload,
  FolderOpen,
  Tag,
  Calendar,
  MessageSquare,
  GitBranch,
  MoreHorizontal
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ConversationSummary {
  id: string;
  title: string;
  agentId: string;
  agentName: string;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
  lastMessage: string;
  tags: string[];
  isStarred: boolean;
  isArchived: boolean;
  threadCount?: number;
  parentThreadId?: string;
}

interface ConversationManagerProps {
  currentAgentId?: string;
  onConversationSelect?: (conversationId: string) => void;
  onConversationCreate?: (agentId: string) => void;
}

export function ConversationManager({ 
  currentAgentId,
  onConversationSelect,
  onConversationCreate 
}: ConversationManagerProps) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<ConversationSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'recent' | 'created' | 'agent' | 'messages'>('recent');
  const [filterBy, setFilterBy] = useState<'all' | 'starred' | 'archived'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [allTags, setAllTags] = useState<string[]>([]);

  // Load conversations
  useEffect(() => {
    loadConversations();
  }, []);

  // Filter and sort conversations
  useEffect(() => {
    let filtered = conversations;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(conv =>
        conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.agentName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(conv =>
        selectedTags.every(tag => conv.tags.includes(tag))
      );
    }

    // Apply status filter
    if (filterBy === 'starred') {
      filtered = filtered.filter(conv => conv.isStarred);
    } else if (filterBy === 'archived') {
      filtered = filtered.filter(conv => conv.isArchived);
    } else if (filterBy === 'all') {
      filtered = filtered.filter(conv => !conv.isArchived);
    }

    // Apply agent filter
    if (currentAgentId) {
      filtered = filtered.filter(conv => conv.agentId === currentAgentId);
    }

    // Sort conversations
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'agent':
          return a.agentName.localeCompare(b.agentName);
        case 'messages':
          return b.messageCount - a.messageCount;
        default:
          return 0;
      }
    });

    setFilteredConversations(filtered);
  }, [conversations, searchQuery, selectedTags, sortBy, filterBy, currentAgentId]);

  const loadConversations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/conversation-summaries', {
        headers: { 'Authorization': 'Bearer sandra-admin-2025' }
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations);
        
        // Extract all unique tags
        const tags = new Set<string>();
        data.conversations.forEach((conv: ConversationSummary) => {
          conv.tags.forEach(tag => tags.add(tag));
        });
        setAllTags(Array.from(tags).sort());
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateConversation = async (
    conversationId: string, 
    updates: Partial<ConversationSummary>
  ) => {
    try {
      const response = await fetch(`/api/admin/conversations/${conversationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sandra-admin-2025'
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        setConversations(prev => prev.map(conv =>
          conv.id === conversationId ? { ...conv, ...updates } : conv
        ));
      }
    } catch (error) {
      console.error('Failed to update conversation:', error);
    }
  };

  const deleteConversation = async (conversationId: string) => {
    if (!confirm('Are you sure you want to permanently delete this conversation?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer sandra-admin-2025' }
      });

      if (response.ok) {
        setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const exportConversation = async (conversationId: string, format: 'json' | 'markdown') => {
    try {
      const response = await fetch(`/api/admin/conversations/${conversationId}/export?format=${format}`, {
        headers: { 'Authorization': 'Bearer sandra-admin-2025' }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `conversation-${conversationId}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to export conversation:', error);
    }
  };

  const addTag = async (conversationId: string, tag: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation || conversation.tags.includes(tag)) return;

    const newTags = [...conversation.tags, tag];
    await updateConversation(conversationId, { tags: newTags });
  };

  const removeTag = async (conversationId: string, tag: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) return;

    const newTags = conversation.tags.filter(t => t !== tag);
    await updateConversation(conversationId, { tags: newTags });
  };

  const toggleFilter = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const ConversationCard = ({ conversation }: { conversation: ConversationSummary }) => (
    <div
      className="border border-gray-200 rounded-lg p-4 bg-white hover:border-gray-300 transition-all cursor-pointer group"
      onClick={() => onConversationSelect?.(conversation.id)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-black truncate mb-1">
            {conversation.title}
          </h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>{conversation.agentName}</span>
            <span>•</span>
            <span>{conversation.messageCount} messages</span>
            {conversation.threadCount && conversation.threadCount > 1 && (
              <>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <GitBranch className="w-3 h-3" />
                  <span>{conversation.threadCount} threads</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              updateConversation(conversation.id, { isStarred: !conversation.isStarred });
            }}
            className="h-7 w-7 p-0"
          >
            <Star className={`w-3 h-3 ${conversation.isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              exportConversation(conversation.id, 'markdown');
            }}
            className="h-7 w-7 p-0"
          >
            <Download className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              updateConversation(conversation.id, { isArchived: !conversation.isArchived });
            }}
            className="h-7 w-7 p-0"
          >
            <Archive className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Last message preview */}
      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
        {conversation.lastMessage}
      </p>

      {/* Tags */}
      {conversation.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {conversation.tags.map(tag => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-xs py-0 px-2"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Metadata */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>Updated {new Date(conversation.updatedAt).toLocaleDateString()}</span>
        {conversation.isStarred && (
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
        )}
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl text-black">Conversation Manager</h2>
          <Button
            onClick={() => onConversationCreate?.(currentAgentId || 'elena')}
            className="bg-black text-white hover:bg-gray-800"
          >
            New Conversation
          </Button>
        </div>

        {/* Search and filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value="recent">Sort by Recent</option>
              <option value="created">Sort by Created</option>
              <option value="agent">Sort by Agent</option>
              <option value="messages">Sort by Messages</option>
            </select>

            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as any)}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value="all">All Conversations</option>
              <option value="starred">Starred</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Tag filters */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {allTags.map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                  onClick={() => toggleFilter(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin w-6 h-6 border-2 border-black border-t-transparent rounded-full"></div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-gray-500 font-medium mb-2">No conversations found</h3>
            <p className="text-gray-400 text-sm">
              {conversations.length === 0
                ? "Start your first conversation with an AI agent"
                : "Try adjusting your search or filters"
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredConversations.map(conversation => (
              <ConversationCard
                key={conversation.id}
                conversation={conversation}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            {filteredConversations.length} of {conversations.length} conversations
          </span>
          <div className="flex items-center space-x-4">
            <span>{conversations.filter(c => c.isStarred).length} starred</span>
            <span>{conversations.filter(c => c.isArchived).length} archived</span>
          </div>
        </div>
      </div>
    </div>
  );
}