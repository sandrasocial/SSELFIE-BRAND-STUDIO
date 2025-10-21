import * as React from 'react';
import { useAuth } from '../../../hooks/use-auth.js';
import { useUserSettings } from '../../profile/hooks/useProfile.js';
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

type Props = { onBack?: () => void };
// @ts-ignore - FC type compatibility with JSX.Element
const SettingsScreen: React.FC<Props> = ({ onBack }) => {
  const { user, isLoading, isAuthenticated, hasActiveSubscription, requiresPayment, stackUser } = useAuth();
  const { data: settings, isLoading: settingsLoading, updateSettings } = useUserSettings();

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

  const handleLogout = async () => {
    try {
      // Prefer Stack Auth signOut when available
      if (stackUser && typeof (stackUser as any).signOut === 'function') {
        await (stackUser as any).signOut();
        return;
      }
    } catch {}
    // Fallback to server endpoint
    window.location.href = '/api/logout';
  };

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  const cycle = <T,>(arr: readonly T[], current: T): T => {
    const i = arr.findIndex((v) => v === current);
    return arr[(i + 1) % arr.length];
  };

  const applyUpdate = (key: string, value: any) => {
    // Build minimal nested update object from dot key
    const parts = key.split('.');
    const nested: any = {};
    let cursor = nested;
    for (let i = 0; i < parts.length - 1; i++) {
      cursor[parts[i]] = {};
      cursor = cursor[parts[i]];
    }
    cursor[parts[parts.length - 1]] = value;
    updateSettings.mutate(nested);
  };

  const openCustomerPortal = () => {
    window.open('/api/payments/customer-portal', '_blank');
  };

  const groups = [
    {
      title: 'Notifications',
      icon: Bell,
      items: [
        { key: 'notifications.photoComplete', name: 'Photo completion alerts', status: settings?.notifications?.photoComplete ? 'On' : 'Off', type: 'toggle' as const },
        { key: 'notifications.mayaUpdates', name: 'Maya updates', status: capitalize(settings?.notifications?.mayaUpdates || 'weekly'), type: 'select' as const, options: ['off','daily','weekly'] as const },
        { key: 'notifications.tips', name: 'Tips & inspiration', status: settings?.notifications?.tips ? 'On' : 'Off', type: 'toggle' as const }
      ]
    },
    {
      title: 'Photo Quality',
      icon: Camera,
      items: [
        { key: 'photoQuality.resolution', name: 'Image resolution', status: capitalize(settings?.photoQuality?.resolution || 'high'), type: 'select' as const, options: ['standard','high'] as const },
        { key: 'photoQuality.autoEnhance', name: 'Auto-enhance', status: settings?.photoQuality?.autoEnhance ? 'On' : 'Off', type: 'toggle' as const },
        { key: 'photoQuality.backgroundRemoval', name: 'Background removal', status: capitalize(settings?.photoQuality?.backgroundRemoval || 'auto'), type: 'select' as const, options: ['off','auto'] as const }
      ]
    },
    {
      title: 'Account',
      icon: UserIcon,
      items: [
        { key: 'account.profileVisibility', name: 'Profile visibility', status: capitalize(settings?.account?.profileVisibility || 'public'), type: 'select' as const, options: ['private','public'] as const },
        { key: 'account.dataBackup', name: 'Data backup', status: capitalize(settings?.account?.dataBackup || 'cloud'), type: 'select' as const, options: ['cloud','local'] as const },
        { key: 'account.photoSharing', name: 'Photo sharing', status: settings?.account?.photoSharing ? 'On' : 'Off', type: 'toggle' as const }
      ]
    },
  ];

  return (
    <div className="space-y-8 pb-4">
      {/* Header */}
      {onBack ? (
        <div className="flex items-center gap-4 pt-4">
          <button
            onClick={onBack}
            className="p-4 bg-stone-100/50 rounded-2xl border border-stone-200/40 hover:bg-stone-100/70 hover:border-stone-300/50 transition-all duration-200"
          >
            <ChevronRight size={18} className="text-stone-600 transform rotate-180" strokeWidth={1.5} />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-extralight tracking-[0.3em] text-stone-950 uppercase">
              Settings
            </h2>
            <p className="text-xs tracking-[0.15em] uppercase font-light mt-2 text-stone-500">
              Your Preferences
            </p>
          </div>
        </div>
      ) : (
        <div className="pt-4 sm:pt-6 text-center">
          <h1 className="text-3xl sm:text-5xl font-serif font-extralight tracking-[0.3em] text-stone-950 uppercase leading-none mb-3">SETTINGS</h1>
          <p className="text-xs tracking-[0.2em] uppercase font-light text-stone-500">Your Preferences</p>
        </div>
      )}

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
        {groups.map((group, index) => {
          const Icon = group.icon;
          return (
            <div key={index} className="bg-white/50 backdrop-blur-2xl rounded-xl sm:rounded-[1.75rem] p-4 sm:p-6 md:p-8 border border-white/60 shadow-xl shadow-stone-900/10">
              <div className="flex items-center space-x-3 sm:space-x-4 mb-6 sm:mb-8">
                <div className="p-2.5 sm:p-3.5 bg-stone-950 rounded-lg sm:rounded-[1.125rem] shadow-lg">
                  <Icon size={18} className="text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-stone-950">{group.title}</h3>
              </div>

              <div className="space-y-1 sm:space-y-2">
                {group.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    onClick={() => {
                      if (!settings) return;
                      if (item.type === 'toggle') {
                        applyUpdate(item.key, item.status === 'On' ? false : true);
                      } else if (item.type === 'select' && 'options' in item) {
                        const current = (item.status || '').toLowerCase();
                        // @ts-ignore
                        const next = cycle(item.options, current);
                        applyUpdate(item.key, next);
                      }
                    }}
                    className="flex items-center justify-between py-3 sm:py-5 hover:bg-white/30 rounded-lg sm:rounded-[1.25rem] px-3 sm:px-6 -mx-3 sm:-mx-6 transition-all duration-300 cursor-pointer group min-h-[56px] sm:min-h-[68px]"
                  >
                    <span className="text-xs sm:text-sm md:text-base text-stone-950 font-medium flex-1 min-w-0 truncate">{item.name}</span>
                    <div className="flex items-center space-x-3 sm:space-x-4 ml-3 sm:ml-4">
                      <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-stone-600">{item.status}</span>
                      {item.type === 'toggle' ? (
                        <div className={`relative w-12 h-7 sm:w-14 sm:h-8 md:w-16 md:h-9 rounded-full transition-all duration-300 cursor-pointer shadow-inner ${
                          item.status === 'On'
                            ? 'bg-stone-950 shadow-stone-900/30'
                            : 'bg-stone-300/60'
                        }`}>
                          <div className={`absolute top-1 w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 bg-white rounded-full shadow-lg transition-all duration-300 ${
                            item.status === 'On' ? 'translate-x-6 sm:translate-x-7 md:translate-x-8' : 'translate-x-1'
                          }`}></div>
                        </div>
                      ) : (
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/60 backdrop-blur-xl rounded-full flex items-center justify-center group-hover:bg-white/80 transition-all duration-300 shadow-lg">
                          <ChevronRight size={14} className="text-stone-600" strokeWidth={2.5} />
                        </div>
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
          className="w-full text-sm tracking-[0.15em] uppercase font-light border rounded-2xl py-5 transition-colors hover:text-stone-950 hover:bg-stone-100/30 min-h-[56px] text-stone-600 border-stone-300/40"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default SettingsScreen;

