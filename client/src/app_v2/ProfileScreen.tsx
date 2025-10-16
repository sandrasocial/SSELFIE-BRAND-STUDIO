import * as React from 'react';
import { useAuth } from '../hooks/use-auth.js';
import { User, Camera, Settings } from 'lucide-react';

const ProfileScreen: React.FC = () => {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="space-y-8 pb-4 pt-4 sm:pt-6">
        <div className="text-center">
          <div className="w-16 h-16 border border-stone-300 rounded-full animate-spin mx-auto mb-8 flex items-center justify-center">
            <div className="w-2 h-2 bg-stone-600 rounded-full"></div>
          </div>
          <h1 className="text-stone-950 text-4xl font-serif font-extralight tracking-[0.4em] mb-4 leading-none">SSELFIE</h1>
          <p className="text-xs font-light tracking-[0.3em] uppercase text-stone-500">Loading Profile</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="space-y-8 pb-4 pt-4 sm:pt-6">
        <div className="text-center">
          <User className="h-16 w-16 text-stone-400 mx-auto mb-6" strokeWidth={1} />
          <h2 className="text-2xl font-serif font-extralight tracking-[0.3em] text-stone-950 uppercase mb-2">Authentication Required</h2>
          <p className="text-stone-600 font-light">Please sign in to view your profile</p>
        </div>
      </div>
    );
  }

  const stats = [
    { value: user.generationsUsedThisMonth || '0', label: 'Photos' },
    { value: user.monthlyGenerationLimit === -1 ? '∞' : (user.monthlyGenerationLimit || '100'), label: 'Limit' },
    { value: user.plan === 'admin' ? 'Admin' : 'Studio', label: 'Plan' }
  ];

  return (
    <div className="space-y-8 pb-4">
      {/* Profile Header */}
      <div className="text-center space-y-8 pt-4">
        <div className="relative inline-block">
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-2 border-stone-200/60 shadow-sm bg-stone-200/40">
            {user.profileImageUrl ? (
              <img 
                src={user.profileImageUrl} 
                alt={user.displayName || 'Profile'} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="h-12 w-12 text-stone-500" strokeWidth={1} />
              </div>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-9 h-9 bg-stone-50 rounded-full border-2 border-stone-100 flex items-center justify-center shadow-sm">
            <div className="w-4 h-4 bg-stone-900 rounded-full"></div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-3xl sm:text-5xl font-serif font-extralight tracking-[0.25em] text-stone-950 uppercase">
            {user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'}
          </h2>
          <p className="text-xs tracking-[0.3em] uppercase font-light bg-stone-500/10 px-4 py-2 rounded-full inline-block text-stone-600">
            {user.plan === 'admin' ? 'Admin' : 'Studio'} Member
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 pt-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center space-y-3">
              <div className="text-3xl sm:text-4xl font-serif font-extralight text-stone-950">{stat.value}</div>
              <div className="text-xs tracking-[0.15em] uppercase font-light text-stone-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button className="group relative bg-stone-950 text-stone-50 px-6 py-5 rounded-2xl font-light tracking-[0.15em] uppercase text-sm transition-all duration-300 hover:scale-[1.01] overflow-hidden shadow-sm min-h-[56px]">
          <div className="absolute inset-0 bg-stone-800 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
          <span className="relative z-10 group-hover:text-stone-50 transition-colors duration-500">Edit Profile</span>
        </button>
        <button 
          className="bg-stone-100/50 text-stone-950 px-6 py-5 rounded-2xl font-light tracking-[0.15em] uppercase text-sm border border-stone-200/40 transition-all duration-300 hover:bg-stone-100/70 hover:border-stone-300/50 hover:scale-[1.01] flex items-center justify-center gap-3 min-h-[56px]"
        >
          <Settings size={16} strokeWidth={1.5} />
          Settings
        </button>
      </div>

      {/* Personal Information */}
      <div className="bg-stone-100/50 border border-stone-200/40 rounded-3xl p-6 sm:p-8">
        <h3 className="text-lg font-serif font-extralight tracking-[0.15em] text-stone-950 uppercase mb-6">Personal Information</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-4 border-b border-stone-200/30 last:border-b-0">
            <span className="text-sm font-light text-stone-600">Email</span>
            <span className="text-sm text-stone-950 font-light">{user.email}</span>
          </div>
          {user.firstName && (
            <div className="flex items-center justify-between py-4 border-b border-stone-200/30 last:border-b-0">
              <span className="text-sm font-light text-stone-600">First Name</span>
              <span className="text-sm text-stone-950 font-light">{user.firstName}</span>
            </div>
          )}
          {user.lastName && (
            <div className="flex items-center justify-between py-4 border-b border-stone-200/30 last:border-b-0">
              <span className="text-sm font-light text-stone-600">Last Name</span>
              <span className="text-sm text-stone-950 font-light">{user.lastName}</span>
            </div>
          )}
          {user.gender && (
            <div className="flex items-center justify-between py-4 border-b border-stone-200/30 last:border-b-0">
              <span className="text-sm font-light text-stone-600">Gender</span>
              <span className="text-sm text-stone-950 font-light capitalize">{user.gender}</span>
            </div>
          )}
        </div>
      </div>

      {/* Brand Information */}
      {(user.profession || user.brandStyle || user.photoGoals) && (
        <div className="bg-stone-100/50 border border-stone-200/40 rounded-3xl p-6 sm:p-8">
          <h3 className="text-lg font-serif font-extralight tracking-[0.15em] text-stone-950 uppercase mb-6">Brand Profile</h3>
          <div className="space-y-4">
            {user.profession && (
              <div className="flex items-center justify-between py-4 border-b border-stone-200/30 last:border-b-0">
                <span className="text-sm font-light text-stone-600">Profession</span>
                <span className="text-sm text-stone-950 font-light">{user.profession}</span>
              </div>
            )}
            {user.brandStyle && (
              <div className="flex items-center justify-between py-4 border-b border-stone-200/30 last:border-b-0">
                <span className="text-sm font-light text-stone-600">Brand Style</span>
                <span className="text-sm text-stone-950 font-light">{user.brandStyle}</span>
              </div>
            )}
            {user.photoGoals && (
              <div className="py-4">
                <span className="text-sm font-light text-stone-600 block mb-2">Photo Goals</span>
                <p className="text-sm text-stone-950 font-light leading-relaxed">{user.photoGoals}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Account Status */}
      <div className="bg-stone-100/50 border border-stone-200/40 rounded-3xl p-6 sm:p-8">
        <h3 className="text-lg font-serif font-extralight tracking-[0.15em] text-stone-950 uppercase mb-6">Account Status</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-4 border-b border-stone-200/30 last:border-b-0">
            <span className="text-sm font-light text-stone-600">Onboarding</span>
            <span className={`text-xs tracking-[0.1em] uppercase font-light ${
              user.preferredOnboardingMode === 'completed' ? 'text-stone-900' : 'text-stone-500'
            }`}>
              {user.preferredOnboardingMode === 'completed' ? 'Completed' : 'In Progress'}
            </span>
          </div>
          <div className="flex items-center justify-between py-4 border-b border-stone-200/30 last:border-b-0">
            <span className="text-sm font-light text-stone-600">Training Coaching</span>
            <span className={`text-xs tracking-[0.1em] uppercase font-light ${
              user.trainingCoachingCompleted ? 'text-stone-900' : 'text-stone-500'
            }`}>
              {user.trainingCoachingCompleted ? 'Completed' : 'Available'}
            </span>
          </div>
          <div className="flex items-center justify-between py-4 border-b border-stone-200/30 last:border-b-0">
            <span className="text-sm font-light text-stone-600">Maya AI Access</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${user.mayaAiAccess ? 'bg-stone-900' : 'bg-stone-400'}`}></div>
              <span className={`text-xs tracking-[0.1em] uppercase font-light ${
                user.mayaAiAccess ? 'text-stone-900' : 'text-stone-500'
              }`}>
                {user.mayaAiAccess ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Work */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl sm:text-2xl font-serif font-extralight tracking-[0.15em] text-stone-950 uppercase">Recent Work</h3>
          <button className="text-sm tracking-[0.15em] uppercase font-light transition-colors duration-200 text-stone-600 hover:text-stone-800">
            View All
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-square bg-stone-200/30 rounded-2xl border border-stone-300/30 flex items-center justify-center cursor-pointer group transition-all duration-200 hover:scale-[1.02] hover:bg-stone-200/50">
              <Camera size={24} strokeWidth={1.5} className="text-stone-500 group-hover:text-stone-700 transition-colors" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
