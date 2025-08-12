import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/use-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../hooks/use-toast';
import { apiRequest } from '../lib/queryClient';
import { MemberNavigation } from '../components/member-navigation';
// Removed PaymentVerification - free users should access profile
import { SandraImages } from '../lib/sandra-images';

export default function Profile() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  // Fetch user profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['/api/profile'],
    enabled: isAuthenticated,
    retry: false
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: any) => {
      return await apiRequest('PUT', '/api/profile', updates);
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed", 
        description: error.message || "Failed to update profile.",
        
      });
    }
  });

  const [formData, setFormData] = useState({
    fullName: profile?.fullName || '',
    phone: profile?.phone || '',
    location: profile?.location || '',
    instagramHandle: profile?.instagramHandle || '',
    websiteUrl: profile?.websiteUrl || '',
    bio: profile?.bio || '',
    brandVibe: profile?.brandVibe || '',
    goals: profile?.goals || ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        phone: profile.phone || '',
        location: profile.location || '',
        instagramHandle: profile.instagramHandle || '',
        websiteUrl: profile.websiteUrl || '',
        bio: profile.bio || '',
        brandVibe: profile.brandVibe || '',
        goals: profile.goals || ''
      });
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <MemberNavigation />
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h1 className="text-3xl font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
            Access Required
          </h1>
          <p className="text-[#666666] mb-8">
            Please sign in to access your profile.
          </p>
          <a
            href="/login"
            className="text-xs uppercase tracking-wider text-[#0a0a0a] border-b border-[#0a0a0a] pb-1"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-white">
        <MemberNavigation />
        
        {/* Full Bleed Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center bg-black text-white overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 opacity-30">
            <img 
              src={user?.profileImageUrl || SandraImages.editorial.luxury1}
              alt="Your Profile"
              className="w-full h-full object-cover object-center-top"
              style={{ objectPosition: 'center top' }}
            />
          </div>
          
          {/* Hero Content - Positioned Low */}
          <div className="relative z-10 text-center max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end min-h-screen pb-16 sm:pb-20">
            {/* Tagline */}
            <div style={{
              fontSize: 'clamp(9px, 2vw, 11px)',
              letterSpacing: 'clamp(0.3em, 0.8vw, 0.4em)',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.7)',
              marginBottom: 'clamp(16px, 3vw, 24px)'
            }}>
              Your Personal Brand Foundation
            </div>
            
            {/* Main Title */}
            <h1 style={{
              fontSize: 'clamp(3rem, 8vw, 8rem)',
              lineHeight: 0.9,
              fontWeight: 200,
              color: 'white',
              marginBottom: 'clamp(16px, 3vw, 24px)',
              fontFamily: 'Times New Roman, serif',
              letterSpacing: 'clamp(0.02em, 0.5vw, 0.05em)',
              textTransform: 'uppercase',
              maxWidth: '100%',
              overflowWrap: 'break-word'
            }}>
              PROFILE
            </h1>
            
            {/* Subtitle */}
            <div style={{
              fontSize: 'clamp(9px, 2vw, 11px)',
              letterSpacing: 'clamp(0.3em, 0.8vw, 0.4em)',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.7)',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Complete your profile to unlock your full potential
            </div>
          </div>
        </section>

        <main className="max-w-4xl mx-auto px-8 py-16">
          <div className="border border-[#0a0a0a] bg-white">
            {/* Header */}
            <div className="px-12 py-8 border-b border-[#0a0a0a] flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-light text-[#0a0a0a]" style={{ fontFamily: 'Times New Roman, serif' }}>
                  Personal Information
                </h2>
                <div className="text-xs uppercase tracking-[0.2em] text-[#666666] mt-1">
                  {user?.email}
                </div>
              </div>
              
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="border border-[#0a0a0a] bg-white text-[#0a0a0a] px-6 py-2 text-xs uppercase tracking-[0.1em] hover:bg-[#0a0a0a] hover:text-white transition-colors"
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {/* Profile Form */}
            <div className="px-12 py-8">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-[#0a0a0a] border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-sm text-[#666666]">Loading profile...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Basic Information */}
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-xs uppercase tracking-[0.1em] text-[#0a0a0a] mb-3">
                        Full Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.fullName}
                          onChange={(e) => handleInputChange('fullName', e.target.value)}
                          className="w-full border border-[#e5e5e5] px-4 py-3 text-sm focus:border-[#0a0a0a] focus:outline-none"
                        />
                      ) : (
                        <div className="text-sm text-[#666666] py-3">
                          {formData.fullName || 'Not specified'}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-[0.1em] text-[#0a0a0a] mb-3">
                        Phone
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full border border-[#e5e5e5] px-4 py-3 text-sm focus:border-[#0a0a0a] focus:outline-none"
                        />
                      ) : (
                        <div className="text-sm text-[#666666] py-3">
                          {formData.phone || 'Not specified'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Location and Social */}
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-xs uppercase tracking-[0.1em] text-[#0a0a0a] mb-3">
                        Location
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          className="w-full border border-[#e5e5e5] px-4 py-3 text-sm focus:border-[#0a0a0a] focus:outline-none"
                        />
                      ) : (
                        <div className="text-sm text-[#666666] py-3">
                          {formData.location || 'Not specified'}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-[0.1em] text-[#0a0a0a] mb-3">
                        Instagram Handle
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.instagramHandle}
                          onChange={(e) => handleInputChange('instagramHandle', e.target.value)}
                          placeholder="@username"
                          className="w-full border border-[#e5e5e5] px-4 py-3 text-sm focus:border-[#0a0a0a] focus:outline-none"
                        />
                      ) : (
                        <div className="text-sm text-[#666666] py-3">
                          {formData.instagramHandle || 'Not specified'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Website */}
                  <div>
                    <label className="block text-xs uppercase tracking-[0.1em] text-[#0a0a0a] mb-3">
                      Website URL
                    </label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={formData.websiteUrl}
                        onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                        className="w-full border border-[#e5e5e5] px-4 py-3 text-sm focus:border-[#0a0a0a] focus:outline-none"
                      />
                    ) : (
                      <div className="text-sm text-[#666666] py-3">
                        {formData.websiteUrl || 'Not specified'}
                      </div>
                    )}
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-xs uppercase tracking-[0.1em] text-[#0a0a0a] mb-3">
                      Bio
                    </label>
                    {isEditing ? (
                      <textarea
                        value={formData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        rows={4}
                        className="w-full border border-[#e5e5e5] px-4 py-3 text-sm focus:border-[#0a0a0a] focus:outline-none resize-none"
                      />
                    ) : (
                      <div className="text-sm text-[#666666] py-3 whitespace-pre-wrap">
                        {formData.bio || 'Not specified'}
                      </div>
                    )}
                  </div>

                  {/* Brand Information */}
                  <div className="border-t border-[#e5e5e5] pt-8">
                    <h3 className="text-lg font-light text-[#0a0a0a] mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
                      Brand Information
                    </h3>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-xs uppercase tracking-[0.1em] text-[#0a0a0a] mb-3">
                          Brand Vibe
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.brandVibe}
                            onChange={(e) => handleInputChange('brandVibe', e.target.value)}
                            className="w-full border border-[#e5e5e5] px-4 py-3 text-sm focus:border-[#0a0a0a] focus:outline-none"
                          />
                        ) : (
                          <div className="text-sm text-[#666666] py-3">
                            {formData.brandVibe || 'Not specified'}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs uppercase tracking-[0.1em] text-[#0a0a0a] mb-3">
                          Goals
                        </label>
                        {isEditing ? (
                          <textarea
                            value={formData.goals}
                            onChange={(e) => handleInputChange('goals', e.target.value)}
                            rows={3}
                            className="w-full border border-[#e5e5e5] px-4 py-3 text-sm focus:border-[#0a0a0a] focus:outline-none resize-none"
                          />
                        ) : (
                          <div className="text-sm text-[#666666] py-3 whitespace-pre-wrap">
                            {formData.goals || 'Not specified'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  {isEditing && (
                    <div className="border-t border-[#e5e5e5] pt-8">
                      <button
                        type="submit"
                        disabled={updateProfileMutation.isPending}
                        className="bg-[#0a0a0a] text-white px-8 py-3 text-xs uppercase tracking-[0.1em] hover:bg-[#333] transition-colors disabled:opacity-50"
                      >
                        {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
                      </button>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
        </main>
      </div>
  );
}