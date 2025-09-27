import React, { useState } from 'react';
import { useAuth } from '../hooks/use-auth.js';
import { CreditCard, Settings, Shield, LogOut, ExternalLink, User, Zap, Calendar, TrendingUp } from 'lucide-react';

const SettingsScreen: React.FC = () => {
  const { user, isLoading, isAuthenticated, hasActiveSubscription, requiresPayment } = useAuth();
  const [activeTab, setActiveTab] = useState('subscription');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border border-stone-300 rounded-full animate-spin mx-auto mb-8 flex items-center justify-center">
            <div className="w-3 h-3 bg-stone-600 rounded-full animate-pulse"></div>
          </div>
          <h1 className="text-stone-900 text-4xl font-serif font-thin tracking-[0.5em] mb-6 leading-none">SSELFIE</h1>
          <p className="text-xs font-light tracking-[0.4em] uppercase text-stone-500 opacity-70">Loading Settings</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <Settings className="h-16 w-16 text-stone-400 mx-auto mb-6" strokeWidth={1} />
          <h2 className="text-2xl font-serif font-thin text-stone-900 mb-2 tracking-[0.3em] uppercase">Authentication Required</h2>
          <p className="text-stone-600 font-light">Please sign in to view your account settings</p>
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

  const tabs = [
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'account', label: 'Account Settings', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-light text-stone-900 mb-2">Account Settings</h1>
          <p className="text-stone-600">Manage your subscription, preferences, and security settings</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors duration-200 rounded-lg ${
                      activeTab === tab.id
                        ? 'bg-stone-900 text-white'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'subscription' && (
              <div className="space-y-6">
                {/* Current Plan */}
                <div className="bg-white rounded-lg border border-stone-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-stone-900">Current Plan</h2>
                    {hasActiveSubscription && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    )}
                    {requiresPayment && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        Payment Required
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-4 bg-stone-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-stone-900 rounded-lg flex items-center justify-center">
                        <Zap className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-stone-900">
                          {user.plan === 'admin' ? 'Admin Plan' : 'SSELFIE Studio'}
                        </h3>
                        <p className="text-sm text-stone-600">
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
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Manage Billing
                      </button>
                    )}
                  </div>
                </div>

                {/* Usage Statistics */}
                <div className="bg-white rounded-lg border border-stone-200 p-6">
                  <h2 className="text-lg font-medium text-stone-900 mb-4">Current Usage</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-stone-500" />
                        <span className="text-sm font-medium text-stone-700">Images Generated</span>
                      </div>
                      <span className="text-sm text-stone-900">
                        {user.generationsUsedThisMonth || 0} / {user.monthlyGenerationLimit === -1 ? '∞' : user.monthlyGenerationLimit || 100}
                      </span>
                    </div>
                    
                    {user.monthlyGenerationLimit !== -1 && (
                      <div className="w-full bg-stone-200 rounded-full h-2">
                        <div 
                          className="bg-stone-900 h-2 rounded-full transition-all duration-300" 
                          style={{ 
                            width: `${Math.min(((user.generationsUsedThisMonth || 0) / (user.monthlyGenerationLimit || 100)) * 100, 100)}%`
                          }}
                        ></div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-stone-500" />
                        <span className="text-sm font-medium text-stone-700">Billing Cycle</span>
                      </div>
                      <span className="text-sm text-stone-600">
                        Resets monthly
                      </span>
                    </div>
                  </div>
                </div>

                {/* Features Access */}
                <div className="bg-white rounded-lg border border-stone-200 p-6">
                  <h2 className="text-lg font-medium text-stone-900 mb-4">Feature Access</h2>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-stone-700">Maya AI Chat</span>
                      <span className={`text-sm ${user.mayaAiAccess ? 'text-green-600' : 'text-stone-400'}`}>
                        {user.mayaAiAccess ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-stone-700">Victoria AI Access</span>
                      <span className={`text-sm ${user.victoriaAiAccess ? 'text-green-600' : 'text-stone-400'}`}>
                        {user.victoriaAiAccess ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-stone-700">Model Retraining</span>
                      <span className={`text-sm ${user.hasRetrainingAccess ? 'text-green-600' : 'text-stone-400'}`}>
                        {user.hasRetrainingAccess ? 'Available' : 'Not Available'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="space-y-6">
                {/* Account Information */}
                <div className="bg-white rounded-lg border border-stone-200 p-6">
                  <h2 className="text-lg font-medium text-stone-900 mb-4">Account Information</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Email Address</label>
                      <div className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900">
                        {user.email}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Display Name</label>
                      <div className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900">
                        {user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Not set'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Account Type</label>
                      <div className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900">
                        {user.role === 'admin' ? 'Administrator' : 'Standard User'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preferences */}
                <div className="bg-white rounded-lg border border-stone-200 p-6">
                  <h2 className="text-lg font-medium text-stone-900 mb-4">Preferences</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-stone-700">Onboarding Mode</span>
                        <p className="text-xs text-stone-500">How you prefer to complete setup</p>
                      </div>
                      <span className="text-sm text-stone-600 capitalize">
                        {user.preferredOnboardingMode || 'conversational'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                {/* Security Settings */}
                <div className="bg-white rounded-lg border border-stone-200 p-6">
                  <h2 className="text-lg font-medium text-stone-900 mb-4">Security Settings</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-stone-700">Account Status</span>
                        <p className="text-xs text-stone-500">Your account security status</p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Secure
                      </span>
                    </div>
                  </div>
                </div>

                {/* Logout */}
                <div className="bg-white rounded-lg border border-stone-200 p-6">
                  <h2 className="text-lg font-medium text-stone-900 mb-4">Session Management</h2>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
