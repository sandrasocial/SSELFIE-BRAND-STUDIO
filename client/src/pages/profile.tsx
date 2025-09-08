import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { AccountSettings } from '@stackframe/react';
import { MemberNavigation } from '../components/member-navigation';
import { useAuth } from '../hooks/use-auth';
import { Settings, CreditCard, User, Shield, Bell } from 'lucide-react';

export default function Profile() {
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
          <p className="text-sm text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Custom subscription/billing component to integrate with our existing system
  const SubscriptionManagement = () => (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-6">
        <h2 className="text-2xl font-serif text-black mb-2" style={{ fontFamily: "Times New Roman, serif" }}>
          Subscription & Billing
        </h2>
        <p className="text-gray-600 text-sm">
          Manage your SSELFIE Studio subscription and billing preferences
        </p>
      </div>

      {/* Current Plan */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-medium text-black mb-4">Current Plan</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-black">SSELFIE Studio</p>
            <p className="text-sm text-gray-600">€47/month • {user?.monthlyGenerationLimit || 100} images per month</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Next billing date</p>
            <p className="font-medium text-black">
              {user?.subscriptionRenewDate 
                ? new Date(user.subscriptionRenewDate).toLocaleDateString('en-GB', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })
                : 'Updating...'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Usage */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-medium text-black mb-4">Current Usage</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Images Generated</span>
            <span className="font-medium text-black">
              {user?.monthlyGenerationsUsed || 0} / {user?.monthlyGenerationLimit === -1 ? '∞' : user?.monthlyGenerationLimit || 100}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-black h-2 rounded-full" 
              style={{ 
                width: user?.monthlyGenerationLimit === -1 
                  ? '0%' 
                  : `${Math.min(((user?.monthlyGenerationsUsed || 0) / (user?.monthlyGenerationLimit || 100)) * 100, 100)}%`
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Billing Management */}
      <div className="space-y-4">
        <h3 className="font-medium text-black">Billing Management</h3>
        <div className="space-y-3">
          <button 
            onClick={() => window.open('/api/payments/customer-portal', '_blank')}
            className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-black">Manage Payment Methods</p>
                <p className="text-sm text-gray-600">Update cards, billing address, and payment preferences</p>
              </div>
              <CreditCard className="h-5 w-5 text-gray-400" />
            </div>
          </button>
          
          <button 
            onClick={() => window.open('/api/payments/customer-portal', '_blank')}
            className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-black">Download Invoices</p>
                <p className="text-sm text-gray-600">Access and download your billing history</p>
              </div>
              <Settings className="h-5 w-5 text-gray-400" />
            </div>
          </button>

          <button 
            onClick={() => window.open('/api/payments/customer-portal', '_blank')}
            className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-black">Pause or Cancel Subscription</p>
                <p className="text-sm text-gray-600">Temporarily pause or permanently cancel your plan</p>
              </div>
              <Shield className="h-5 w-5 text-gray-400" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <MemberNavigation transparent={false} />
      
      {/* Profile Header */}
      <div className="pt-24 pb-8 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-serif text-black mb-2" style={{ fontFamily: "Times New Roman, serif" }}>
            Account Settings
          </h1>
          <p className="text-gray-600">
            Manage your profile, subscription, and account preferences
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Custom styled AccountSettings with subscription integration */}
        <div className="bg-white">
          <AccountSettings
            fullPage={false}
            extraItems={[
              {
                title: 'Subscription & Billing',
                icon: <CreditCard className="h-5 w-5" />,
                content: <SubscriptionManagement />,
                subpath: '/billing'
              }
            ]}
          />
        </div>
      </div>

      {/* Custom CSS to style Stack Auth components with Maya's design */}
      <style jsx global>{`
        /* Override Stack Auth default styling to match Maya's luxury design */
        [data-stack-auth] {
          --stack-bg-primary: white !important;
          --stack-text-primary: black !important;
          --stack-border-primary: #e5e7eb !important;
          --stack-accent: black !important;
        }
        
        /* Navigation sidebar styling */
        [data-stack-auth] nav {
          background: #f9fafb !important;
          border-right: 1px solid #e5e7eb !important;
        }
        
        /* Navigation items */
        [data-stack-auth] nav button {
          color: #374151 !important;
          font-size: 14px !important;
          font-weight: 400 !important;
          text-transform: none !important;
          letter-spacing: normal !important;
        }
        
        /* Active navigation item */
        [data-stack-auth] nav button[aria-current="page"] {
          background: white !important;
          color: black !important;
          font-weight: 500 !important;
          border-right: 2px solid black !important;
        }
        
        /* Form inputs */
        [data-stack-auth] input, [data-stack-auth] textarea {
          border: 1px solid #d1d5db !important;
          border-radius: 6px !important;
          font-size: 14px !important;
          color: black !important;
        }
        
        /* Buttons */
        [data-stack-auth] button[type="submit"] {
          background: black !important;
          color: white !important;
          border: none !important;
          font-size: 14px !important;
          font-weight: 400 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.1em !important;
          transition: all 0.2s ease !important;
        }
        
        [data-stack-auth] button[type="submit"]:hover {
          background: #374151 !important;
        }
        
        /* Content headings */
        [data-stack-auth] h1, [data-stack-auth] h2 {
          font-family: "Times New Roman", serif !important;
          color: black !important;
          font-weight: 400 !important;
        }
        
        /* Content text */
        [data-stack-auth] p, [data-stack-auth] label {
          color: #374151 !important;
          font-size: 14px !important;
        }
      `}</style>
    </div>
  );
}