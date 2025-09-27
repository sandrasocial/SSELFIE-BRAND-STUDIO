import React from 'react';
import { useAuth } from '../hooks/use-auth.js';
import { User, Mail, Calendar, CreditCard, Settings, Edit3 } from 'lucide-react';

const ProfileScreen: React.FC = () => {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border border-stone-300 rounded-full animate-spin mx-auto mb-8 flex items-center justify-center">
            <div className="w-3 h-3 bg-stone-600 rounded-full animate-pulse"></div>
          </div>
          <h1 className="text-stone-900 text-4xl font-serif font-thin tracking-[0.5em] mb-6 leading-none">SSELFIE</h1>
          <p className="text-xs font-light tracking-[0.4em] uppercase text-stone-500 opacity-70">Loading Profile</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-stone-400 mx-auto mb-6" strokeWidth={1} />
          <h2 className="text-2xl font-serif font-thin text-stone-900 mb-2 tracking-[0.3em] uppercase">Authentication Required</h2>
          <p className="text-stone-600 font-light">Please sign in to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center gap-6">
            {/* Profile Image */}
            <div className="w-20 h-20 bg-stone-200 rounded-full flex items-center justify-center overflow-hidden">
              {user.profileImageUrl ? (
                <img 
                  src={user.profileImageUrl} 
                  alt={user.displayName || 'Profile'} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-stone-500" />
              )}
            </div>
            
            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-light text-stone-900">
                {user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Profile'}
              </h1>
              <p className="text-stone-600 mt-1">{user.email}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-800">
                  {user.plan === 'admin' ? 'Admin' : 'Studio Member'}
                </span>
                {user.role === 'admin' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    Admin Access
                  </span>
                )}
              </div>
            </div>

            {/* Edit Button */}
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors">
              <Edit3 className="h-4 w-4" />
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid gap-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <h2 className="text-lg font-medium text-stone-900 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">First Name</label>
                <div className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900">
                  {user.firstName || 'Not specified'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Last Name</label>
                <div className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900">
                  {user.lastName || 'Not specified'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
                <div className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900">
                  {user.email}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Gender</label>
                <div className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900">
                  {user.gender || 'Not specified'}
                </div>
              </div>
            </div>
          </div>

          {/* Brand Information */}
          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <h2 className="text-lg font-medium text-stone-900 mb-4">Brand Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Profession</label>
                <div className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900">
                  {user.profession || 'Not specified'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Brand Style</label>
                <div className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900">
                  {user.brandStyle || 'Not specified'}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-stone-700 mb-1">Photo Goals</label>
                <div className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 min-h-[60px]">
                  {user.photoGoals || 'Not specified'}
                </div>
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <h2 className="text-lg font-medium text-stone-900 mb-4">Account Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-stone-700">Onboarding Progress</span>
                <span className="text-sm text-stone-600">
                  {user.preferredOnboardingMode === 'completed' ? 'Completed' : 'In Progress'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-stone-700">Training Coaching</span>
                <span className="text-sm text-stone-600">
                  {user.trainingCoachingCompleted ? 'Completed' : 'Available'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-stone-700">Maya AI Access</span>
                <span className={`text-sm ${user.mayaAiAccess ? 'text-green-600' : 'text-stone-600'}`}>
                  {user.mayaAiAccess ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
