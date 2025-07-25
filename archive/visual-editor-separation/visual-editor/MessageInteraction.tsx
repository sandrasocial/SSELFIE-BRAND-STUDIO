import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Copy, 
  Edit3, 
  GitBranch, 
  MoreHorizontal, 
  Reply, 
  Share, 
  Trash2,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Bookmark,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MessageInteractionProps {
  messageId: string;
  content: string;
  type: 'user' | 'agent';
  agentName?: string;
  timestamp: Date;
  isEditable?: boolean;
  onEdit?: (newContent: string) => void;
  onDelete?: () => void;
  onBranch?: (fromMessageId: string) => void;
  onRegenerate?: () => void;
  onReply?: (content: string) => void;
  showActions?: boolean;
}

export function MessageInteraction({
  messageId,
  content,
  type,
  agentName,
  timestamp,
  isEditable = false,
  onEdit,
  onDelete,
  onBranch,
  onRegenerate,
  onReply,
  showActions = true
}: MessageInteractionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [showMenu, setShowMenu] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const { toast } = useToast();

  // Copy message content
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: 'Copied',
        description: 'Message copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Could not copy message',
        variant: 'destructive',
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
        });
      } catch (error) {
        // User cancelled sharing or share failed
        handleCopy(); // Fallback to copy
      }
    } else {
      handleCopy(); // Fallback for browsers without Web Share API
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

  // Branch conversation
  const handleBranch = () => {
    onBranch?.(messageId);
    setShowMenu(false);
    toast({
      title: 'Conversation Branched',
      description: 'Created new conversation thread from this message',
    });
  };

  // Toggle bookmark
  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast({
      title: isBookmarked ? 'Bookmark removed' : 'Bookmarked',
      description: isBookmarked ? 'Message removed from bookmarks' : 'Message added to bookmarks',
    });
  };

  // Provide feedback
  const handleFeedback = (type: 'up' | 'down') => {
    setFeedback(feedback === type ? null : type);
    toast({
      title: 'Feedback submitted',
      description: `Thank you for your ${type === 'up' ? 'positive' : 'negative'} feedback`,
    });
  };

  // Flag message
  const handleFlag = () => {
    toast({
      title: 'Message flagged',
      description: 'Thank you for reporting this message',
    });
    setShowMenu(false);
  };

  return (
    <div className="group relative">
      {/* Message Actions Bar */}
      {showActions && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
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

            {/* Edit (user messages only) */}
            {type === 'user' && isEditable && (
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

            {/* Regenerate (agent messages only) */}
            {type === 'agent' && onRegenerate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRegenerate}
                className="h-6 w-6 p-0 hover:bg-gray-100"
                title="Regenerate response"
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
            )}

            {/* Branch */}
            {onBranch && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBranch}
                className="h-6 w-6 p-0 hover:bg-gray-100"
                title="Branch conversation"
              >
                <GitBranch className="w-3 h-3" />
              </Button>
            )}

            {/* More options */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMenu(!showMenu)}
                className="h-6 w-6 p-0 hover:bg-gray-100"
                title="More options"
              >
                <MoreHorizontal className="w-3 h-3" />
              </Button>

              {/* Dropdown Menu */}
              {showMenu && (
                <Card className="absolute top-8 right-0 w-48 border border-gray-200 shadow-lg z-50">
                  <CardContent className="p-2">
                    <div className="space-y-1">
                      {/* Reply */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          onReply?.(content);
                          setShowMenu(false);
                        }}
                        className="w-full justify-start text-sm"
                      >
                        <Reply className="w-3 h-3 mr-2" />
                        Reply to this
                      </Button>

                      {/* Share */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleShare}
                        className="w-full justify-start text-sm"
                      >
                        <Share className="w-3 h-3 mr-2" />
                        Share
                      </Button>

                      {/* Bookmark */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBookmark}
                        className="w-full justify-start text-sm"
                      >
                        <Bookmark className={`w-3 h-3 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
                        {isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                      </Button>

                      <div className="border-t border-gray-200 my-1" />

                      {/* Feedback (agent messages only) */}
                      {type === 'agent' && (
                        <>
                          <div className="flex items-center space-x-1 px-2 py-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFeedback('up')}
                              className={`h-6 w-6 p-0 ${feedback === 'up' ? 'bg-green-100 text-green-600' : ''}`}
                              title="Good response"
                            >
                              <ThumbsUp className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFeedback('down')}
                              className={`h-6 w-6 p-0 ${feedback === 'down' ? 'bg-red-100 text-red-600' : ''}`}
                              title="Poor response"
                            >
                              <ThumbsDown className="w-3 h-3" />
                            </Button>
                            <span className="text-xs text-gray-500 ml-2">Rate response</span>
                          </div>
                          <div className="border-t border-gray-200 my-1" />
                        </>
                      )}

                      {/* Flag */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleFlag}
                        className="w-full justify-start text-sm text-red-600 hover:bg-red-50"
                      >
                        <Flag className="w-3 h-3 mr-2" />
                        Report issue
                      </Button>

                      {/* Delete (if allowed) */}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            onDelete();
                            setShowMenu(false);
                          }}
                          className="w-full justify-start text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3 mr-2" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Message Content */}
      {isEditing ? (
        <div className="mt-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full p-2 border border-gray-200 rounded text-sm resize-none min-h-[60px]"
            rows={3}
          />
          <div className="flex items-center space-x-2 mt-2">
            <Button size="sm" onClick={handleEdit} className="bg-black text-white">
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancelEdit}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Message metadata */}
          <div className="flex items-center space-x-2 mb-1">
            {agentName && (
              <Badge variant="secondary" className="text-xs">
                {agentName}
              </Badge>
            )}
            <span className="text-xs text-gray-500">
              {timestamp.toLocaleTimeString()}
            </span>
            {isBookmarked && (
              <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                <Bookmark className="w-3 h-3 mr-1 fill-current" />
                Bookmarked
              </Badge>
            )}
            {feedback && (
              <Badge 
                variant="secondary" 
                className={`text-xs ${
                  feedback === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {feedback === 'up' ? (
                  <ThumbsUp className="w-3 h-3 mr-1" />
                ) : (
                  <ThumbsDown className="w-3 h-3 mr-1" />
                )}
                {feedback === 'up' ? 'Helpful' : 'Not helpful'}
              </Badge>
            )}
          </div>
        </>
      )}
    </div>
  );
}