import * as React from 'react';
import { useAuth } from '../../../hooks/use-auth.js';
import { useLocation } from 'wouter';
import { User, Camera, Settings } from 'lucide-react';
import { useProfileSummary, useRecentImages } from '../hooks/useProfile.js';
import SettingsScreen from '../../settings/components/SettingsScreen.js';

// @ts-ignore - FC type compatibility with JSX.Element
const ProfileScreen: React.FC = () => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { data: profile } = useProfileSummary();
  const { data: recentImages } = useRecentImages(6);
  const initialSection: 'profile' | 'settings' = 'profile';
  const [activeSection, setActiveSection] = React.useState(initialSection);

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

  if (activeSection === 'settings') {
    return <SettingsScreen onBack={() => setActiveSection('profile')} />;
  }

  const photosCount = profile?.stats?.photos ?? 0;
  const stats = [
    { value: String(photosCount), label: 'Photos' },
    { value: user.monthlyGenerationLimit === -1 ? '∞' : String(user.monthlyGenerationLimit || 100), label: 'Limit' },
    { value: user.plan === 'admin' ? 'Admin' : 'Studio', label: 'Plan' }
  ];

  return (
    <div className="space-y-8 pb-4">
      {/* Screen Header */}
      <div className="pt-3 sm:pt-4 md:pt-6 text-center">
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-serif font-extralight tracking-[0.3em] text-stone-950 uppercase leading-none mb-2 sm:mb-3">
          Profile
        </h1>
        <p className="text-[10px] sm:text-xs tracking-[0.2em] uppercase font-light text-stone-500">
          Your Account • Settings
        </p>
      </div>

      {/* Profile Avatar and Info */}
      <div className="text-center space-y-6">
        <div className="relative inline-block">
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-2 border-white/60 shadow-2xl shadow-stone-900/20 bg-white/40 backdrop-blur-xl">
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
          <div className="absolute -bottom-1 -right-1 w-9 h-9 sm:w-10 sm:h-10 bg-stone-50 rounded-full border-2 sm:border-3 border-stone-100 flex items-center justify-center shadow-lg shadow-stone-900/30">
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-stone-900 rounded-full"></div>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-extralight tracking-[0.2em] text-stone-950 uppercase">
            {user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'}
          </h2>
          <p className="text-xs sm:text-sm tracking-[0.15em] uppercase font-light bg-stone-500/10 px-4 py-2 sm:py-2.5 rounded-full inline-block text-stone-600 border border-stone-200/40">
            {user.plan === 'admin' ? 'Admin' : 'Studio'} Member
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 sm:gap-8 pt-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center space-y-3">
              <div className="text-3xl sm:text-4xl md:text-5xl font-serif font-extralight text-stone-950">{stat.value}</div>
              <div className="text-xs sm:text-sm tracking-[0.15em] uppercase font-light text-stone-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        <button className="group relative bg-stone-950 text-white px-6 sm:px-8 py-5 sm:py-6 rounded-xl sm:rounded-[1.5rem] font-semibold tracking-wide text-sm sm:text-base transition-all duration-300 hover:shadow-2xl hover:shadow-stone-900/40 hover:scale-105 active:scale-95 min-h-[60px] sm:min-h-[64px] overflow-hidden">
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span className="relative z-10">Edit Profile</span>
        </button>
        <button
          onClick={() => setActiveSection('settings')}
          className="group bg-white/50 backdrop-blur-2xl text-stone-950 px-6 sm:px-8 py-5 sm:py-6 rounded-xl sm:rounded-[1.5rem] font-semibold text-sm sm:text-base border border-white/60 transition-all duration-300 hover:bg-white/70 hover:border-white/80 hover:scale-105 active:scale-95 flex items-center justify-center gap-3 min-h-[60px] sm:min-h-[64px] shadow-lg shadow-stone-900/10 hover:shadow-2xl hover:shadow-stone-900/20"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-stone-600 to-stone-700 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
            <Settings size={16} strokeWidth={2.5} className="text-white" />
          </div>
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
          <button onClick={() => setLocation('/app/gallery')} className="text-sm tracking-[0.15em] uppercase font-light transition-colors duration-200 text-stone-600 hover:text-stone-800">
            View All
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {(recentImages ?? []).map((img) => (
            <div key={img.id} className="aspect-square rounded-2xl border border-white/60 overflow-hidden bg-white/40 backdrop-blur-xl hover:bg-white/60 hover:shadow-xl hover:shadow-stone-900/10 transition-all duration-300">
              {img.url ? (
                <img src={img.url} alt="Recent" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Camera size={24} strokeWidth={1.5} className="text-stone-500" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;

