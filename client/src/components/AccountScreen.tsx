import React from 'react';

interface AccountScreenProps {
  user: { name?: string; email?: string; image?: string };
}

export function AccountScreen({ user }: AccountScreenProps) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4 pt-8">
        <h1 className="luxury-heading-1">ACCOUNT</h1>
        <p className="luxury-text-caption">Manage your preferences</p>
      </div>
      
      <div className="space-y-6">
        <div className="luxury-card">
          <h3 className="luxury-heading-3 mb-4">Profile Settings</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-4 hover:bg-zinc-700/20 rounded-lg px-4 -mx-4 transition-all duration-300 min-h-[48px]">
              <span className="luxury-text-body">Name</span>
              <span className="luxury-text-caption">{user?.name || 'Not set'}</span>
            </div>
            <div className="flex items-center justify-between py-4 hover:bg-zinc-700/20 rounded-lg px-4 -mx-4 transition-all duration-300 min-h-[48px]">
              <span className="luxury-text-body">Email</span>
              <span className="luxury-text-caption">{user?.email || 'Not set'}</span>
            </div>
            <div className="flex items-center justify-between py-4 hover:bg-zinc-700/20 rounded-lg px-4 -mx-4 transition-all duration-300 min-h-[48px]">
              <span className="luxury-text-body">Member Since</span>
              <span className="luxury-text-caption">2024</span>
            </div>
          </div>
        </div>
        
        <div className="luxury-card">
          <h3 className="luxury-heading-3 mb-4">Preferences</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-4 hover:bg-zinc-700/20 rounded-lg px-4 -mx-4 transition-all duration-300 min-h-[48px]">
              <span className="luxury-text-body">Notifications</span>
              <div className="luxury-toggle"></div>
            </div>
            <div className="flex items-center justify-between py-4 hover:bg-zinc-700/20 rounded-lg px-4 -mx-4 transition-all duration-300 min-h-[48px]">
              <span className="luxury-text-body">Dark Mode</span>
              <div className="luxury-toggle active"></div>
            </div>
            <div className="flex items-center justify-between py-4 hover:bg-zinc-700/20 rounded-lg px-4 -mx-4 transition-all duration-300 min-h-[48px]">
              <span className="luxury-text-body">Auto-save</span>
              <div className="luxury-toggle active"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}