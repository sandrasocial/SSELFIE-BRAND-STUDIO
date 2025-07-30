import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, RefreshCw, Grid, List } from 'lucide-react';
import { WebsiteCard } from './WebsiteCard';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

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

export function WebsiteManager() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user websites
  const { data: websites = [], isLoading, error } = useQuery({
    queryKey: ['/api/websites'],
    retry: false,
  });

  // Create new website mutation
  const createWebsiteMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/websites', 'POST', {
        title: 'New Website',
        status: 'draft'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/websites'] });
      toast({
        title: "Website Created",
        description: "Your new website has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create website. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Refresh screenshots mutation
  const refreshScreenshotsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/websites/refresh-screenshots', 'POST');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/websites'] });
      toast({
        title: "Screenshots Updated",
        description: "Website screenshots have been refreshed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to refresh screenshots.",
        variant: "destructive",
      });
    },
  });

  // Filter websites based on search query
  const filteredWebsites = (websites as Website[]).filter((website: Website) =>
    website.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    website.url?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Unable to load websites
          </h3>
          <p className="text-gray-600 mb-4">
            There was an error loading your websites. Please try again.
          </p>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/websites'] })}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="font-serif text-3xl text-black mb-2">Your Websites</h1>
          <p className="text-gray-600">
            Manage and preview your Victoria-generated websites
          </p>
        </div>
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          <Button
            onClick={() => createWebsiteMutation.mutate()}
            disabled={createWebsiteMutation.isPending}
            className="bg-black text-white hover:bg-gray-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Website
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search websites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshScreenshotsMutation.mutate()}
            disabled={refreshScreenshotsMutation.isPending}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Screenshots
          </Button>
          
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="px-3"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="px-3"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Website Grid/List */}
      {filteredWebsites.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-gray-50 rounded-lg p-12 max-w-md mx-auto">
            <h3 className="font-serif text-xl text-black mb-3">
              No websites yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first website to get started with Victoria's website builder.
            </p>
            <Button
              onClick={() => createWebsiteMutation.mutate()}
              disabled={createWebsiteMutation.isPending}
              className="bg-black text-white hover:bg-gray-800"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Website
            </Button>
          </div>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          {filteredWebsites.map((website: Website) => (
            <WebsiteCard
              key={website.id}
              website={website}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}
    </div>
  );
}