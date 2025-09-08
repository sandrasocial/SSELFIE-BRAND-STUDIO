import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { MemberNavigation } from '../components/member-navigation';
import { useAuth } from '../hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, User, Settings as SettingsIcon, LogOut, ExternalLink } from 'lucide-react';

export default function AccountSettingsPage() {
  const [location, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  // Parse URL tab parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [location]);

  // Fetch user profile and subscription data
  const { data: profile } = useQuery({
    queryKey: ['/api/profile'],
    enabled: !!user,
    retry: false
  });

  const { data: subscriptionData } = useQuery({
    queryKey: ['/api/usage'],
    enabled: !!user,
    retry: false
  });

  // Redirect if not authenticated
  if (!isLoading && !user) {
    setLocation('/auth/signin');
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading account settings...</p>
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
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'billing', label: 'Subscription & Billing', icon: CreditCard },
    { id: 'settings', label: 'Account Settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-white">
      <MemberNavigation transparent={false} darkText={true} />
      
      {/* Account Settings Header */}
      <div className="pt-24 pb-12 bg-white">
        <div className="max-w-6xl mx-auto px-8">
          <h1 className="text-4xl font-light text-black mb-4" style={{ fontFamily: "Times New Roman, serif" }}>
            Account Settings
          </h1>
          <p className="text-gray-600 text-sm">
            Manage your profile, subscription, and account preferences
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 pb-16">
        <div className="flex gap-12">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'bg-black text-white'
                        : 'text-gray-600 hover:text-black hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors duration-200 mt-8"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'profile' && (
              <div className="space-y-8">
                <div className="border-b border-gray-200 pb-6">
                  <h2 className="text-2xl font-light text-black mb-2" style={{ fontFamily: "Times New Roman, serif" }}>
                    Profile Information
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Your basic account information
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Display Name</label>
                    <div className="text-gray-900 py-2 px-0 border-b border-gray-200">
                      {subscriptionData?.userDisplayName || profile?.name || user?.email?.split('@')[0] || 'SSELFIE User'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Email Address</label>
                    <div className="text-gray-900 py-2 px-0 border-b border-gray-200">
                      {user?.email}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Account Type</label>
                    <div className="text-gray-900 py-2 px-0 border-b border-gray-200">
                      {subscriptionData?.accountType || 'SSELFIE Studio Member'}
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => setLocation('/profile')}
                      className="inline-flex items-center gap-2 px-6 py-2 bg-black text-white text-sm hover:bg-gray-800 transition-colors duration-200"
                    >
                      Edit Business Profile
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="space-y-8">
                <div className="border-b border-gray-200 pb-6">
                  <h2 className="text-2xl font-light text-black mb-2" style={{ fontFamily: "Times New Roman, serif" }}>
                    Subscription & Billing
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Manage your SSELFIE Studio subscription and billing
                  </p>
                </div>

                {/* Current Plan */}
                <div className="border border-gray-200 p-6">
                  <h3 className="font-medium text-black mb-4">Current Plan</h3>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-medium text-black">{subscriptionData?.planDisplayName || 'SSELFIE Studio'}</p>
                      <p className="text-sm text-gray-600">
                        €{subscriptionData?.monthlyPrice || 47} per month
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Monthly Images</p>
                      <p className="font-medium text-black">
                        {subscriptionData?.monthlyLimit === -1 ? 'Unlimited' : `${subscriptionData?.monthlyLimit || 100} included`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Usage */}
                {subscriptionData && (
                  <div className="border border-gray-200 p-6">
                    <h3 className="font-medium text-black mb-4">Current Usage</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Images Generated This Month</span>
                        <span className="font-medium text-black">
                          {subscriptionData.monthlyUsed || 0} / {subscriptionData.monthlyLimit === -1 ? '∞' : subscriptionData.monthlyLimit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-black h-2 rounded-full" 
                          style={{ 
                            width: subscriptionData.monthlyLimit === -1 
                              ? '0%' 
                              : `${Math.min(((subscriptionData.monthlyUsed || 0) / subscriptionData.monthlyLimit) * 100, 100)}%`
                          }}
                        ></div>
                      </div>
                      {subscriptionData.nextBillingDate && (
                        <div className="pt-2">
                          <p className="text-sm text-gray-500">
                            Next billing: {new Date(subscriptionData.nextBillingDate).toLocaleDateString('en-GB', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Billing Management */}
                <div className="space-y-4">
                  <h3 className="font-medium text-black">Billing Management</h3>
                  <div className="space-y-3">
                    <button 
                      onClick={openCustomerPortal}
                      className="w-full text-left p-6 border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-black mb-1">Manage Payment Methods</p>
                          <p className="text-sm text-gray-600">Update cards, billing address, and payment preferences</p>
                        </div>
                        <ExternalLink className="h-5 w-5 text-gray-400" />
                      </div>
                    </button>
                    
                    <button 
                      onClick={openCustomerPortal}
                      className="w-full text-left p-6 border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-black mb-1">Download Invoices</p>
                          <p className="text-sm text-gray-600">Access and download your billing history</p>
                        </div>
                        <ExternalLink className="h-5 w-5 text-gray-400" />
                      </div>
                    </button>

                    <button 
                      onClick={openCustomerPortal}
                      className="w-full text-left p-6 border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-black mb-1">Pause or Cancel Subscription</p>
                          <p className="text-sm text-gray-600">Temporarily pause or permanently cancel your plan</p>
                        </div>
                        <ExternalLink className="h-5 w-5 text-gray-400" />
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-8">
                <div className="border-b border-gray-200 pb-6">
                  <h2 className="text-2xl font-light text-black mb-2" style={{ fontFamily: "Times New Roman, serif" }}>
                    Account Settings
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Basic account preferences and security
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="border border-gray-200 p-6">
                    <h3 className="font-medium text-black mb-2">Account Security</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Your account is secured with Stack Auth. Manage your security settings in the customer portal.
                    </p>
                    <button
                      onClick={openCustomerPortal}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 transition-colors duration-200"
                    >
                      Manage Security Settings
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="border border-gray-200 p-6">
                    <h3 className="font-medium text-black mb-2">Privacy</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Your images and data are private and secure. We never share your content with third parties.
                    </p>
                    <button
                      onClick={() => window.open('/privacy', '_blank')}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 transition-colors duration-200"
                    >
                      View Privacy Policy
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}