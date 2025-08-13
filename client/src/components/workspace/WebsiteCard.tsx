import { ReactNode, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { 
  ExternalLink, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  Eye,
  Calendar,
  Globe
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { WebsiteScreenshot } from './WebsiteScreenshot';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
// Simple formatDistanceToNow utility
const formatDistanceToNow = (date: Date, options?: { addSuffix?: boolean }) => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ${options?.addSuffix ? 'ago' : ''}`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ${options?.addSuffix ? 'ago' : ''}`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ${options?.addSuffix ? 'ago' : ''}`;
};

// Simple Badge component for status display
const Badge = ({ children, className }: { children: ReactNode; className?: string }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
    {children}
  </span>
);

interface Website {
  id: number;
  userId: string;
  title: string;
  url: string;
  screenshotUrl?: string;
  status: 'draft' | 'published' | 'updating';
  createdAt: string;
  updatedAt: string;
}

interface WebsiteCardProps {
  website: Website;
  viewMode: 'grid' | 'list';
}

export function WebsiteCard({ website, viewMode }: WebsiteCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Delete website mutation
  const deleteWebsiteMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/websites/${website.id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/websites'] });
      toast({
        title: "Website Deleted",
        description: "Your website has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete website. Please try again.",
        
      });
    },
    onSettled: () => {
      setIsDeleting(false);
    },
  });

  // Update screenshot mutation
  const updateScreenshotMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/websites/${website.id}/screenshot`, 'POST');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/websites'] });
      toast({
        title: "Screenshot Updated",
        description: "Website screenshot has been refreshed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update screenshot.",
        
      });
    },
  });

  const handleDelete = () => {
    if (isDeleting) return;
    setIsDeleting(true);
    deleteWebsiteMutation.mutate();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'updating':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published':
        return 'Live';
      case 'draft':
        return 'Draft';
      case 'updating':
        return 'Updating';
      default:
        return status;
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
              <WebsiteScreenshot
                websiteId={website.id}
                screenshotUrl={website.screenshotUrl}
                title={website.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-black truncate">
                {website.title}
              </h3>
              <div className="flex items-center space-x-3 text-sm text-gray-500 mt-1">
                {website.url && (
                  <div className="flex items-center">
                    <Globe className="w-3 h-3 mr-1" />
                    <span className="truncate">{website.url}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>
                    {formatDistanceToNow(new Date(website.updatedAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Badge className={getStatusColor(website.status)}>
              {getStatusText(website.status)}
            </Badge>
            
            <div className="flex items-center space-x-1">
              {website.url && website.status === 'published' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(website.url, '_blank')}
                  className="h-8 w-8 p-0"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {}} // TODO: Navigate to website editor
                className="h-8 w-8 p-0"
              >
                <Edit className="w-4 h-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => updateScreenshotMutation.mutate()}
                    disabled={updateScreenshotMutation.isPending}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Update Screenshot
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDelete}
                    disabled={isDeleting || deleteWebsiteMutation.isPending}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Website
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow group">
      {/* Screenshot Preview */}
      <div className="aspect-video bg-gray-100 relative overflow-hidden">
        <WebsiteScreenshot
          websiteId={website.id}
          screenshotUrl={website.screenshotUrl}
          title={website.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Overlay with quick actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex items-center space-x-2">
            {website.url && website.status === 'published' && (
              <Button
                size="sm"
                onClick={() => window.open(website.url, '_blank')}
                className="bg-white text-black hover:bg-gray-100"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Visit
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {}} // TODO: Navigate to website editor
              className="bg-white text-black hover:bg-gray-100"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </div>
        </div>

        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <Badge className={getStatusColor(website.status)}>
            {getStatusText(website.status)}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-serif text-lg text-black mb-2 truncate">
          {website.title}
        </h3>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            <span>
              {formatDistanceToNow(new Date(website.updatedAt), { addSuffix: true })}
            </span>
          </div>
          
          {website.url && (
            <div className="flex items-center truncate">
              <Globe className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="truncate text-xs">{website.url}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {}} // TODO: Navigate to website editor
            className="flex-1 mr-2"
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit Website
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="px-2">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => updateScreenshotMutation.mutate()}
                disabled={updateScreenshotMutation.isPending}
              >
                <Eye className="w-4 h-4 mr-2" />
                Update Screenshot
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={isDeleting || deleteWebsiteMutation.isPending}
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Website
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}