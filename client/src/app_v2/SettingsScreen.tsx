import React from 'react';
import { useAuth } from '../hooks/use-auth.js';
import { 
  CreditCard, 
  Settings as SettingsIcon, 
  Shield, 
  LogOut, 
  ExternalLink, 
  Zap, 
  Calendar, 
  TrendingUp,
  ChevronRight,
  Bell,
  Camera,
  User as UserIcon
} from 'lucide-react';

const SettingsScreen: React.FC = () => {
  const { user, isLoading, isAuthenticated, hasActiveSubscription, requiresPayment } = useAuth();

  if (isLoading) {
    return (
      <div className="space-y-8 pb-4 pt-4 sm:pt-6">
        <div className="text-center">
          <div className="w-16 h-16 border border-stone-300 rounded-full animate-spin mx-auto mb-8 flex items-center justify-center">
            <div className="w-2 h-2 bg-stone-600 rounded-full"></div>
          </div>
          <h1 className="text-stone-950 text-4xl font-serif font-extralight tracking-[0.4em] mb-4 leading-none">SSELFIE</h1>
          <p className="text-xs font-light tracking-[0.3em] uppercase text-stone-500">Loading Settings</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="space-y-8 pb-4 pt-4 sm:pt-6">
        <div className="text-center">
          <SettingsIcon className="h-16 w-16 text-stone-400 mx-auto mb-6" strokeWidth={1} />
          <h2 className="text-2xl font-serif font-extralight tracking-[0.3em] text-stone-950 uppercase mb-2">Authentication Required</h2>
          <p className="text-stone-600 font-light">Please sign in to view your settings</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    window.location.href = '/api/auth/logout';
  };

  const openCustomerPortal = () => {
    window.open('/api/payments/customer-portal', '_blank');
  };

  const settingsGroups = [
    { 
      title: 'Notifications', 
      icon: Bell, 
      items: [
        { name: 'Photo completion alerts', status: 'On', type: 'toggle' },
        { name: 'Maya updates', status: 'Weekly', type: 'select' },
        { name: 'Tips & inspiration', status: 'On', type: 'toggle' }
      ] 
    },
    { 
      title: 'Photo Quality', 
      icon: Camera, 
      items: [
        { name: 'Image resolution', status: 'High', type: 'select' },
        { name: 'Auto-enhance', status: 'On', type: 'toggle' },
        { name: 'Background removal', status: 'Auto', type: 'select' }
      ] 
    },
    { 
      title: 'Account', 
      icon: UserIcon, 
      items: [
        { name: 'Profile visibility', status: 'Public', type: 'select' },
        { name: 'Data backup', status: 'Cloud', type: 'select' },
        { name: 'Photo sharing', status: 'On', type: 'toggle' }
      ] 
    },
  ];

  return (
    <div className="space-y-8 pb-4">
      {/* Header */}
      <div className="pt-4 sm:pt-6 text-center">
        <h1 className="text-3xl sm:text-5xl font-serif font-extralight tracking-[0.3em] text-stone-950 uppercase leading-none mb-3">
          SETTINGS
        </h1>
        <p className="text-xs tracking-[0.2em] uppercase font-light text-stone-500">
          Your Preferences
        </p>
      </div>

      {/* Current Plan */}
      <div className="bg-stone-100/50 border border-stone-200/40 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-serif font-extralight tracking-[0.15em] text-stone-950 uppercase">Current Plan</h2>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              hasActiveSubscription ? 'bg-stone-900' : requiresPayment ? 'bg-amber-500' : 'bg-stone-400'
            }`}></div>
            <span className="text-xs tracking-[0.1em] uppercase font-light text-stone-600">
              {hasActiveSubscription ? 'Active' : requiresPayment ? 'Payment Required' : 'Inactive'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 sm:p-6 bg-stone-200/30 rounded-2xl mb-6">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center flex-shrink-0">
              <Zap className="h-5 w-5 text-stone-50" strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <h3 className="font-light text-stone-950 mb-1 truncate">
                {user.plan === 'admin' ? 'Admin Plan' : 'SSELFIE Studio'}
              </h3>
              <p className="text-sm text-stone-600 font-light truncate">
                {user.plan === 'admin' 
                  ? 'Unlimited access to all features' 
                  : '€47/month • 100 images per month'
                }
              </p>
            </div>
          </div>
          {user.plan !== 'admin' && (
            <button
              onClick={openCustomerPortal}
              className="ml-4 flex items-center gap-2 px-4 py-2 text-sm font-light text-stone-700 bg-stone-100/50 border border-stone-200/40 rounded-xl hover:bg-stone-100/70 transition-colors flex-shrink-0"
            >
              <ExternalLink size={14} strokeWidth={1.5} />
              <span className="hidden sm:inline">Manage</span>
            </button>
          )}
        </div>

        {/* Usage Statistics */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-stone-500" strokeWidth={1.5} />
              <span className="text-sm font-light text-stone-600">Images Generated</span>
            </div>
            <span className="text-sm text-stone-950 font-light">
              {user.generationsUsedThisMonth || 0} / {user.monthlyGenerationLimit === -1 ? '∞' : user.monthlyGenerationLimit || 100}
            </span>
          </div>
          
          {user.monthlyGenerationLimit !== -1 && (
            <div className="w-full bg-stone-200 rounded-full h-1.5">
              <div 
                className="bg-stone-900 h-1.5 rounded-full transition-all duration-300" 
                style={{ 
                  width: `${Math.min(((user.generationsUsedThisMonth || 0) / (user.monthlyGenerationLimit || 100)) * 100, 100)}%`
                }}
              ></div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-stone-500" strokeWidth={1.5} />
              <span className="text-sm font-light text-stone-600">Billing Cycle</span>
            </div>
            <span className="text-sm text-stone-600 font-light">
              Resets monthly
            </span>
          </div>
        </div>
      </div>

      {/* Features Access */}
      <div className="bg-stone-100/50 border border-stone-200/40 rounded-3xl p-6 sm:p-8">
        <h2 className="text-lg font-serif font-extralight tracking-[0.15em] text-stone-950 uppercase mb-6">Feature Access</h2>
        
        <div className="space-y-1">
          <div className="flex items-center justify-between py-4 border-b border-stone-200/30 last:border-b-0">
            <span className="text-sm font-light text-stone-600">Maya AI Chat</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${user.mayaAiAccess ? 'bg-stone-900' : 'bg-stone-400'}`}></div>
              <span className={`text-xs tracking-[0.1em] uppercase font-light ${
                user.mayaAiAccess ? 'text-stone-900' : 'text-stone-500'
              }`}>
                {user.mayaAiAccess ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between py-4 border-b border-stone-200/30 last:border-b-0">
            <span className="text-sm font-light text-stone-600">Victoria AI Access</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${user.victoriaAiAccess ? 'bg-stone-900' : 'bg-stone-400'}`}></div>
              <span className={`text-xs tracking-[0.1em] uppercase font-light ${
                user.victoriaAiAccess ? 'text-stone-900' : 'text-stone-500'
              }`}>
                {user.victoriaAiAccess ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between py-4 border-b border-stone-200/30 last:border-b-0">
            <span className="text-sm font-light text-stone-600">Model Retraining</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${user.hasRetrainingAccess ? 'bg-stone-900' : 'bg-stone-400'}`}></div>
              <span className={`text-xs tracking-[0.1em] uppercase font-light ${
                user.hasRetrainingAccess ? 'text-stone-900' : 'text-stone-500'
              }`}>
                {user.hasRetrainingAccess ? 'Available' : 'Not Available'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Groups */}
      <div className="space-y-6">
        {settingsGroups.map((group, index) => {
          const Icon = group.icon;
          return (
            <div key={index} className="bg-stone-100/40 rounded-3xl p-6 sm:p-8 border border-stone-200/40">
              <div className="flex items-center space-x-4 mb-8">
                <div className="p-3 bg-stone-500/10 rounded-2xl border border-stone-400/20">
                  <Icon size={20} className="text-stone-600" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-serif font-extralight tracking-[0.15em] text-stone-950 uppercase">{group.title}</h3>
              </div>
              
              <div className="space-y-2">
                {group.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center justify-between py-5 hover:bg-stone-200/30 rounded-2xl px-6 -mx-6 transition-all duration-200 cursor-pointer group min-h-[60px]">
                    <span className="text-sm sm:text-base text-stone-950 font-light flex-1 min-w-0 truncate">{item.name}</span>
                    <div className="flex items-center space-x-4 ml-4">
                      <span className="text-xs sm:text-sm font-light text-stone-600">{item.status}</span>
                      {item.type === 'toggle' ? (
                        <div className={`w-12 h-6 sm:w-14 sm:h-7 rounded-full relative transition-colors duration-200 ${
                          item.status === 'On' ? 'bg-stone-600/30' : 'bg-stone-300'
                        }`}>
                          <div className={`w-5 h-5 sm:w-6 sm:h-6 bg-stone-50 rounded-full absolute top-0.5 transition-transform duration-200 ${
                            item.status === 'On' ? 'translate-x-6 sm:translate-x-7' : 'translate-x-0.5'
                          }`}></div>
                        </div>
                      ) : (
                        <ChevronRight size={16} className="text-stone-500 group-hover:text-stone-700 transition-colors" strokeWidth={1.5} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sign Out */}
      <div className="pt-6 border-t border-stone-200/30">
        <button 
          onClick={handleLogout}
          className="w-full text-sm tracking-[0.15em] uppercase font-light border rounded-2xl py-5 transition-colors hover:text-stone-950 hover:bg-stone-100/30 min-h-[56px] text-stone-600 border-stone-300/40 flex items-center justify-center gap-2"
        >
          <LogOut size={16} strokeWidth={1.5} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default SettingsScreen;
