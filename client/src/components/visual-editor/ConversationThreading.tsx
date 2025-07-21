import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  GitBranch, 
  Search, 
  Calendar, 
  Star,
  Archive,
  Trash2,
  Share2,
  Download,
  Edit3,
  ChevronRight,
  Clock,
  User,
  Bot
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface ConversationThread {
  id: string;
  title: string;
  agentId: string;
  agentName: string;
  messageCount: number;
  lastMessage: string;
  lastActivity: Date;
  isBookmarked: boolean;
  isArchived: boolean;
  branchedFrom?: string;
  branchPoint?: number;
  tags: string[];
  participants: string[];
}

interface ConversationMessage {
  id: string;
  threadId: string;
  type: 'user' | 'agent';
  content: string;
  agentName?: string;
  timestamp: Date;
  isBookmarked: boolean;
  feedback?: 'up' | 'down';
  branchedThreads?: string[];
  fileOperations?: Array<{
    type: 'read' | 'write' | 'create' | 'delete';
    path: string;
    success: boolean;
    preview?: string;
  }>;
}

interface ConversationThreadingProps {
  agentId: string;
  currentConversation?: ConversationMessage[];
  onLoadThread: (thread: ConversationThread, messages: ConversationMessage[]) => void;
  onCreateBranch: (fromMessageId: string, newTitle: string) => void;
  onDeleteThread: (threadId: string) => void;
  onArchiveThread: (threadId: string) => void;
  onBookmarkThread: (threadId: string) => void;
}

export function ConversationThreading({
  agentId,
  currentConversation = [],
  onLoadThread,
  onCreateBranch,
  onDeleteThread,
  onArchiveThread,
  onBookmarkThread
}: ConversationThreadingProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'bookmarked' | 'archived'>('all');
  const [showBranchDialog, setShowBranchDialog] = useState<string | null>(null);
  const [branchTitle, setBranchTitle] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch conversation threads
  const { data: threads = [], isLoading } = useQuery({
    queryKey: ['conversation-threads', agentId, selectedFilter],
    queryFn: async () => {
      const response = await fetch(`/api/admin/conversation-threads/${agentId}?filter=${selectedFilter}&search=${searchTerm}`);
      if (!response.ok) throw new Error('Failed to fetch conversation threads');
      return response.json();
    }
  });

  // Save current conversation as thread
  const saveThreadMutation = useMutation({
    mutationFn: async ({ title, messages }: { title: string; messages: ConversationMessage[] }) => {
      const response = await fetch('/api/admin/conversation-threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          agentId,
          messages,
          adminToken: 'sandra-admin-2025'
        })
      });
      if (!response.ok) throw new Error('Failed to save conversation thread');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation-threads'] });
      toast({
        title: 'Thread Saved',
        description: 'Conversation thread saved successfully'
      });
    }
  });

  // Load thread messages
  const loadThreadMutation = useMutation({
    mutationFn: async (threadId: string) => {
      const response = await fetch(`/api/admin/conversation-threads/${threadId}/messages`);
      if (!response.ok) throw new Error('Failed to load thread messages');
      return response.json();
    },
    onSuccess: (data, threadId) => {
      const thread = threads.find(t => t.id === threadId);
      if (thread) {
        onLoadThread(thread, data.messages);
      }
    }
  });

  // Create conversation branch
  const createBranchMutation = useMutation({
    mutationFn: async ({ fromMessageId, title }: { fromMessageId: string; title: string }) => {
      const response = await fetch('/api/admin/conversation-branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromMessageId,
          title,
          agentId,
          adminToken: 'sandra-admin-2025'
        })
      });
      if (!response.ok) throw new Error('Failed to create conversation branch');
      return response.json();
    },
    onSuccess: (data, { fromMessageId, title }) => {
      onCreateBranch(fromMessageId, title);
      queryClient.invalidateQueries({ queryKey: ['conversation-threads'] });
      setShowBranchDialog(null);
      setBranchTitle('');
      toast({
        title: 'Branch Created',
        description: `New conversation branch "${title}" created successfully`
      });
    }
  });

  // Delete thread
  const deleteThreadMutation = useMutation({
    mutationFn: async (threadId: string) => {
      const response = await fetch(`/api/admin/conversation-threads/${threadId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminToken: 'sandra-admin-2025' })
      });
      if (!response.ok) throw new Error('Failed to delete thread');
      return response.json();
    },
    onSuccess: (data, threadId) => {
      onDeleteThread(threadId);
      queryClient.invalidateQueries({ queryKey: ['conversation-threads'] });
      toast({
        title: 'Thread Deleted',
        description: 'Conversation thread deleted successfully'
      });
    }
  });

  // Handle save current conversation
  const handleSaveCurrentConversation = () => {
    if (currentConversation.length === 0) {
      toast({
        title: 'No Conversation',
        description: 'No messages to save',
        variant: 'destructive'
      });
      return;
    }

    const title = currentConversation[0]?.content.slice(0, 50) + '...' || 'Untitled Conversation';
    saveThreadMutation.mutate({ title, messages: currentConversation });
  };

  // Handle create branch
  const handleCreateBranch = () => {
    if (!showBranchDialog || !branchTitle.trim()) return;
    
    createBranchMutation.mutate({
      fromMessageId: showBranchDialog,
      title: branchTitle.trim()
    });
  };

  // Filter threads based on search and filter
  const filteredThreads = threads.filter(thread => {
    const matchesSearch = thread.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         thread.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
    
    switch (selectedFilter) {
      case 'bookmarked':
        return matchesSearch && thread.isBookmarked;
      case 'archived':
        return matchesSearch && thread.isArchived;
      default:
        return matchesSearch && !thread.isArchived;
    }
  });

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium" style={{ fontFamily: 'Times New Roman, serif' }}>
            Conversation Threads
          </h3>
          <Button
            onClick={handleSaveCurrentConversation}
            disabled={currentConversation.length === 0 || saveThreadMutation.isPending}
            size="sm"
          >
            <Archive className="w-4 h-4 mr-2" />
            Save Current
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex space-x-2">
            {['all', 'bookmarked', 'archived'].map((filter) => (
              <Button
                key={filter}
                variant={selectedFilter === filter ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter(filter as typeof selectedFilter)}
              >
                {filter === 'all' && <MessageSquare className="w-3 h-3 mr-1" />}
                {filter === 'bookmarked' && <Star className="w-3 h-3 mr-1" />}
                {filter === 'archived' && <Archive className="w-3 h-3 mr-1" />}
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Thread List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {isLoading ? (
            <div className="text-center text-gray-500 py-8">Loading threads...</div>
          ) : filteredThreads.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <div>No conversation threads found</div>
              <div className="text-sm">Start a new conversation to create your first thread</div>
            </div>
          ) : (
            filteredThreads.map((thread) => (
              <Card
                key={thread.id}
                className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-blue-500"
                onClick={() => loadThreadMutation.mutate(thread.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm truncate">{thread.title}</h4>
                        {thread.isBookmarked && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                        {thread.branchedFrom && <GitBranch className="w-3 h-3 text-blue-500" />}
                      </div>
                      <p className="text-xs text-gray-600 truncate">{thread.lastMessage}</p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="outline" className="text-xs">
                        {thread.agentName}
                      </Badge>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(thread.lastActivity).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{thread.messageCount} messages</span>
                      {thread.tags.length > 0 && (
                        <div className="flex gap-1">
                          {thread.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs py-0">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onBookmarkThread(thread.id);
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <Star className={`w-3 h-3 ${thread.isBookmarked ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onArchiveThread(thread.id);
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <Archive className="w-3 h-3 text-gray-400" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteThreadMutation.mutate(thread.id);
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Branch Creation Dialog */}
      {showBranchDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Create Conversation Branch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Branch Title</label>
                <Input
                  value={branchTitle}
                  onChange={(e) => setBranchTitle(e.target.value)}
                  placeholder="Enter branch title..."
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowBranchDialog(null);
                    setBranchTitle('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateBranch}
                  disabled={!branchTitle.trim() || createBranchMutation.isPending}
                >
                  <GitBranch className="w-4 h-4 mr-2" />
                  Create Branch
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}