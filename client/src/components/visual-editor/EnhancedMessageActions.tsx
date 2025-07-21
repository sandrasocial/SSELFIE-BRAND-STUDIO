import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Bookmark, 
  Flag, 
  Share2, 
  ThumbsUp, 
  ThumbsDown,
  MoreHorizontal,
  Copy,
  Edit3,
  GitBranch,
  Reply,
  Download,
  Tag,
  Clock,
  User,
  Bot,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface EnhancedMessageActionsProps {
  messageId: string;
  content: string;
  type: 'user' | 'agent';
  agentName?: string;
  timestamp: Date;
  isBookmarked?: boolean;
  feedback?: 'up' | 'down' | null;
  tags?: string[];
  onEdit?: (newContent: string) => void;
  onBranch?: (fromMessageId: string) => void;
  onReply?: (content: string) => void;
  onRegenerate?: () => void;
  showAdvanced?: boolean;
}

export function EnhancedMessageActions({
  messageId,
  content,
  type,
  agentName,
  timestamp,
  isBookmarked = false,
  feedback = null,
  tags = [],
  onEdit,
  onBranch,
  onReply,
  onRegenerate,
  showAdvanced = true
}: EnhancedMessageActionsProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [showTagging, setShowTagging] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [currentBookmarked, setCurrentBookmarked] = useState(isBookmarked);
  const [currentFeedback, setCurrentFeedback] = useState(feedback);
  const [messageTags, setMessageTags] = useState(tags);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Bookmark message mutation
  const bookmarkMutation = useMutation({
    mutationFn: async (bookmark: boolean) => {
      const response = await fetch('/api/admin/messages/bookmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId,
          bookmarked: bookmark,
          adminToken: 'sandra-admin-2025'
        })
      });
      if (!response.ok) throw new Error('Failed to bookmark message');
      return response.json();
    },
    onSuccess: (data, bookmark) => {
      setCurrentBookmarked(bookmark);
      toast({
        title: bookmark ? 'Bookmarked' : 'Bookmark Removed',
        description: bookmark ? 'Message added to bookmarks' : 'Message removed from bookmarks'
      });
    }
  });

  // Feedback mutation
  const feedbackMutation = useMutation({
    mutationFn: async (feedbackType: 'up' | 'down' | null) => {
      const response = await fetch('/api/admin/messages/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId,
          feedback: feedbackType,
          adminToken: 'sandra-admin-2025'
        })
      });
      if (!response.ok) throw new Error('Failed to submit feedback');
      return response.json();
    },
    onSuccess: (data, feedbackType) => {
      setCurrentFeedback(feedbackType);
      toast({
        title: 'Feedback Submitted',
        description: feedbackType ? `Thank you for your ${feedbackType === 'up' ? 'positive' : 'negative'} feedback` : 'Feedback removed'
      });
    }
  });

  // Tag message mutation
  const tagMutation = useMutation({
    mutationFn: async (tagList: string[]) => {
      const response = await fetch('/api/admin/messages/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId,
          tags: tagList,
          adminToken: 'sandra-admin-2025'
        })
      });
      if (!response.ok) throw new Error('Failed to update tags');
      return response.json();
    },
    onSuccess: (data, tagList) => {
      setMessageTags(tagList);
      toast({
        title: 'Tags Updated',
        description: `Message tagged with: ${tagList.join(', ')}`
      });
    }
  });

  // Flag message mutation
  const flagMutation = useMutation({
    mutationFn: async (reason: string) => {
      const response = await fetch('/api/admin/messages/flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId,
          reason,
          adminToken: 'sandra-admin-2025'
        })
      });
      if (!response.ok) throw new Error('Failed to flag message');
      return response.json();
    },
    onSuccess: () => {
      setShowMenu(false);
      toast({
        title: 'Message Flagged',
        description: 'Thank you for reporting this message'
      });
    }
  });

  // Copy message content
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: 'Copied',
        description: 'Message copied to clipboard'
      });
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Could not copy message',
        variant: 'destructive'
      });
    }
  };

  // Share message
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Message from ${agentName || 'Agent'}`,
          text: content,
          url: window.location.href + `#message-${messageId}`
        });
      } catch (error) {
        handleCopy(); // Fallback to copy
      }
    } else {
      handleCopy();
    }
  };

  // Edit message
  const handleEdit = () => {
    if (isEditing) {
      onEdit?.(editContent);
      setIsEditing(false);
    } else {
      setIsEditing(true);
      setEditContent(content);
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(content);
  };

  // Toggle bookmark
  const handleBookmark = () => {
    bookmarkMutation.mutate(!currentBookmarked);
  };

  // Provide feedback
  const handleFeedback = (feedbackType: 'up' | 'down') => {
    const newFeedback = currentFeedback === feedbackType ? null : feedbackType;
    feedbackMutation.mutate(newFeedback);
  };

  // Add tag
  const handleAddTag = () => {
    if (!newTag.trim() || messageTags.includes(newTag.trim())) return;
    
    const updatedTags = [...messageTags, newTag.trim()];
    tagMutation.mutate(updatedTags);
    setNewTag('');
  };

  // Remove tag
  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = messageTags.filter(tag => tag !== tagToRemove);
    tagMutation.mutate(updatedTags);
  };

  // Branch conversation
  const handleBranch = () => {
    onBranch?.(messageId);
    setShowMenu(false);
    toast({
      title: 'Conversation Branched',
      description: 'Created new conversation thread from this message'
    });
  };

  return (
    <div className="group relative">
      {/* Quick Actions - Always Visible on Hover */}
      <div className="absolute -top-1 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
        <div className="flex items-center space-x-1 bg-white border border-gray-200 rounded-md shadow-sm p-1">
          {/* Copy */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-6 w-6 p-0 hover:bg-gray-100"
            title="Copy message"
          >
            <Copy className="w-3 h-3" />
          </Button>

          {/* Bookmark */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBookmark}
            className="h-6 w-6 p-0 hover:bg-gray-100"
            title={currentBookmarked ? "Remove bookmark" : "Bookmark message"}
            disabled={bookmarkMutation.isPending}
          >
            <Bookmark className={`w-3 h-3 ${currentBookmarked ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
          </Button>

          {/* Feedback for Agent Messages */}
          {type === 'agent' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFeedback('up')}
                className="h-6 w-6 p-0 hover:bg-gray-100"
                title="Good response"
                disabled={feedbackMutation.isPending}
              >
                <ThumbsUp className={`w-3 h-3 ${currentFeedback === 'up' ? 'text-green-500 fill-current' : 'text-gray-400'}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFeedback('down')}
                className="h-6 w-6 p-0 hover:bg-gray-100"
                title="Poor response"
                disabled={feedbackMutation.isPending}
              >
                <ThumbsDown className={`w-3 h-3 ${currentFeedback === 'down' ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
              </Button>
            </>
          )}

          {/* Edit for User Messages */}
          {type === 'user' && onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="h-6 w-6 p-0 hover:bg-gray-100"
              title="Edit message"
            >
              <Edit3 className="w-3 h-3" />
            </Button>
          )}

          {/* More Actions */}
          {showAdvanced && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMenu(!showMenu)}
              className="h-6 w-6 p-0 hover:bg-gray-100"
              title="More actions"
            >
              <MoreHorizontal className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Actions Menu */}
      {showMenu && showAdvanced && (
        <Card className="absolute top-8 right-2 z-50 w-56 shadow-lg border border-gray-200">
          <CardContent className="p-2">
            <div className="space-y-1">
              {/* Share */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="w-full justify-start text-left"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Message
              </Button>

              {/* Reply */}
              {onReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onReply(content);
                    setShowMenu(false);
                  }}
                  className="w-full justify-start text-left"
                >
                  <Reply className="w-4 h-4 mr-2" />
                  Reply to Message
                </Button>
              )}

              {/* Branch */}
              {onBranch && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBranch}
                  className="w-full justify-start text-left"
                >
                  <GitBranch className="w-4 h-4 mr-2" />
                  Branch Conversation
                </Button>
              )}

              {/* Regenerate for Agent Messages */}
              {type === 'agent' && onRegenerate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onRegenerate();
                    setShowMenu(false);
                  }}
                  className="w-full justify-start text-left"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Regenerate Response
                </Button>
              )}

              {/* Tagging */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowTagging(!showTagging);
                }}
                className="w-full justify-start text-left"
              >
                <Tag className="w-4 h-4 mr-2" />
                Manage Tags
              </Button>

              {/* Flag */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => flagMutation.mutate('inappropriate')}
                className="w-full justify-start text-left text-red-600 hover:text-red-700 hover:bg-red-50"
                disabled={flagMutation.isPending}
              >
                <Flag className="w-4 h-4 mr-2" />
                Flag Message
              </Button>

              {/* View Permalink */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  window.location.hash = `message-${messageId}`;
                  setShowMenu(false);
                }}
                className="w-full justify-start text-left"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Permalink
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tagging Interface */}
      {showTagging && (
        <Card className="absolute top-8 right-2 z-50 w-64 shadow-lg border border-gray-200">
          <CardContent className="p-3">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-sm mb-2">Message Tags</h4>
                <div className="flex flex-wrap gap-1 mb-2">
                  {messageTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-xs cursor-pointer hover:bg-red-100"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Add tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  className="text-xs"
                />
                <Button
                  size="sm"
                  onClick={handleAddTag}
                  disabled={!newTag.trim() || tagMutation.isPending}
                >
                  Add
                </Button>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTagging(false)}
                className="w-full"
              >
                Done
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Message Tags Display */}
      {messageTags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {messageTags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Edit Mode */}
      {isEditing && (
        <Card className="absolute top-8 left-0 right-0 z-50 shadow-lg border border-gray-200">
          <CardContent className="p-3">
            <div className="space-y-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded text-sm min-h-[100px] resize-y"
                placeholder="Edit your message..."
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleEdit}>
                  Save Changes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}