import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye, Check, X, Flag, Image as ImageIcon, User, Clock } from 'lucide-react';

interface ContentItem {
  id: string;
  userId: string;
  userEmail: string;
  type: 'training_image' | 'generated_image' | 'profile_update' | 'custom_content';
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  imageUrl?: string;
  content?: string;
  metadata?: any;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  priority: 'low' | 'medium' | 'high';
}

export function ContentModerationDashboard() {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'flagged'>('pending');
  const [filterType, setFilterType] = useState<'all' | 'training_image' | 'generated_image' | 'profile_update' | 'custom_content'>('all');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data: contentItems, isLoading } = useQuery({
    queryKey: ['/api/admin/content-moderation', { status: filterStatus, type: filterType }],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: moderationStats } = useQuery({
    queryKey: ['/api/admin/moderation-stats'],
    refetchInterval: 60000,
  });

  const moderationMutation = useMutation({
    mutationFn: async ({ id, action, reason }: { id: string; action: 'approve' | 'reject' | 'flag'; reason?: string }) => {
      const response = await fetch(`/api/admin/content-moderation/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason })
      });
      if (!response.ok) throw new Error('Failed to process moderation action');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/content-moderation'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/moderation-stats'] });
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-100 animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Moderation Stats */}
      <div className="grid grid-cols-4 gap-6">
        <div className="border border-gray-200 p-6 text-center">
          <div className="text-3xl font-serif font-light mb-2 text-orange-600">
            {moderationStats?.pendingReview || 0}
          </div>
          <div className="text-xs uppercase tracking-[0.3em] text-gray-600">
            Pending Review
          </div>
        </div>
        <div className="border border-gray-200 p-6 text-center">
          <div className="text-3xl font-serif font-light mb-2 text-green-600">
            {moderationStats?.approvedToday || 0}
          </div>
          <div className="text-xs uppercase tracking-[0.3em] text-gray-600">
            Approved Today
          </div>
        </div>
        <div className="border border-gray-200 p-6 text-center">
          <div className="text-3xl font-serif font-light mb-2 text-red-600">
            {moderationStats?.rejectedToday || 0}
          </div>
          <div className="text-xs uppercase tracking-[0.3em] text-gray-600">
            Rejected Today
          </div>
        </div>
        <div className="border border-gray-200 p-6 text-center">
          <div className="text-3xl font-serif font-light mb-2">
            {moderationStats?.averageReviewTime || 0}m
          </div>
          <div className="text-xs uppercase tracking-[0.3em] text-gray-600">
            Avg Review Time
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex items-center justify-between gap-6 p-6 bg-gray-50">
        <div className="flex items-center gap-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="flagged">Flagged</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black"
          >
            <option value="all">All Types</option>
            <option value="training_image">Training Images</option>
            <option value="generated_image">Generated Images</option>
            <option value="profile_update">Profile Updates</option>
            <option value="custom_content">Custom Content</option>
          </select>
        </div>

        <div className="text-sm text-gray-600">
          {contentItems?.length || 0} items found
        </div>
      </div>

      {/* Content Items */}
      <div className="space-y-4">
        {contentItems?.map((item: ContentItem) => (
          <div key={item.id} className="border border-gray-200 hover:border-black transition-colors">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  {/* Image Preview */}
                  {item.imageUrl && (
                    <div className="w-20 h-20 border border-gray-200 overflow-hidden flex-shrink-0 cursor-pointer" 
                         onClick={() => setSelectedImage(item.imageUrl!)}>
                      <img 
                        src={item.imageUrl} 
                        alt="Content preview" 
                        className="w-full h-full object-cover hover:scale-110 transition-transform"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium">
                        {item.type.replace('_', ' ').toUpperCase()}
                      </h3>
                      
                      <div className={`px-2 py-1 text-xs uppercase tracking-wide ${
                        item.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                        item.status === 'approved' ? 'bg-green-100 text-green-700' :
                        item.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {item.status}
                      </div>
                      
                      <div className={`px-2 py-1 text-xs uppercase tracking-wide ${
                        item.priority === 'high' ? 'bg-red-100 text-red-700' :
                        item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {item.priority} Priority
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-2">
                        <User size={14} />
                        {item.userEmail}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        {new Date(item.submittedAt).toLocaleString()}
                      </div>
                    </div>
                    
                    {item.content && (
                      <p className="text-gray-700 text-sm">{item.content}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Moderation Actions */}
              {item.status === 'pending' && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex gap-3">
                    <button
                      onClick={() => moderationMutation.mutate({ id: item.id, action: 'approve' })}
                      className="flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wide bg-green-600 text-white hover:bg-green-700 transition-colors"
                      disabled={moderationMutation.isPending}
                    >
                      <Check size={14} />
                      Approve
                    </button>
                    
                    <button
                      onClick={() => moderationMutation.mutate({ id: item.id, action: 'reject', reason: 'Content violates guidelines' })}
                      className="flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wide bg-red-600 text-white hover:bg-red-700 transition-colors"
                      disabled={moderationMutation.isPending}
                    >
                      <X size={14} />
                      Reject
                    </button>
                    
                    <button
                      onClick={() => moderationMutation.mutate({ id: item.id, action: 'flag', reason: 'Requires further review' })}
                      className="flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wide border border-gray-300 hover:bg-gray-50 transition-colors"
                      disabled={moderationMutation.isPending}
                    >
                      <Flag size={14} />
                      Flag for Review
                    </button>
                  </div>
                  
                  {item.imageUrl && (
                    <button
                      onClick={() => setSelectedImage(item.imageUrl!)}
                      className="flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wide border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      <Eye size={14} />
                      View Full Size
                    </button>
                  )}
                </div>
              )}
              
              {item.status !== 'pending' && item.reviewedAt && (
                <div className="pt-4 border-t border-gray-100 text-sm text-gray-600">
                  Reviewed on {new Date(item.reviewedAt).toLocaleString()}
                  {item.reviewedBy && ` by ${item.reviewedBy}`}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {(!contentItems || contentItems.length === 0) && (
        <div className="text-center py-12">
          <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
          <div className="text-gray-500 mb-2">No content items found</div>
          <div className="text-sm text-gray-400">
            Try adjusting your filters or check back later
          </div>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" 
             onClick={() => setSelectedImage(null)}>
          <div className="max-w-4xl max-h-4xl p-4">
            <img 
              src={selectedImage} 
              alt="Full size preview" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}