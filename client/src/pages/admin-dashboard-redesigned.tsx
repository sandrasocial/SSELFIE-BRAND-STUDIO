import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');

  const { data: stats } = useQuery({
    queryKey: ['/api/admin/stats'],
    enabled: user?.email === 'ssa@ssasocial.com'
  });

  const navigationItems = [
    { id: 'overview', label: 'Empire Overview', count: stats?.totalUsers || 0 },
    { id: 'users', label: 'Community', count: stats?.activeUsers || 0 },
    { id: 'generations', label: 'AI Creations', count: stats?.totalGenerations || 0 },
    { id: 'subscriptions', label: 'Revenue', count: `€${stats?.monthlyRevenue || 0}` },
    { id: 'content', label: 'Content Library', count: stats?.totalContent || 0 },
    { id: 'analytics', label: 'Performance', count: stats?.conversionRate || '0%' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Editorial Header */}
      <header className="border-b border-gray-200 px-12 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 
              className="text-5xl font-serif text-black uppercase tracking-wider mb-2"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              Sandra Command Center
            </h1>
            <p className="text-sm text-gray-600 tracking-wide">
              Where empires are built, one transformation at a time
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 mb-1">Today's Impact</div>
            <div className="text-2xl font-light">{stats?.todaySignups || 0} new dreams launched</div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Luxury Navigation Sidebar */}
        <nav className="w-80 bg-gray-50 min-h-screen p-8">
          <div className="space-y-6">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full text-left p-6 border transition-all duration-300 ${
                  activeSection === item.id
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-black border-gray-200 hover:border-black'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-lg font-light tracking-wide">{item.label}</span>
                  <span className="text-sm font-mono">{item.count}</span>
                </div>
              </button>
            ))}
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 p-12">
          {activeSection === 'overview' && <OverviewSection stats={stats} />}
          {activeSection === 'users' && <UsersSection />}
          {activeSection === 'generations' && <GenerationsSection />}
          {activeSection === 'subscriptions' && <SubscriptionsSection />}
          {activeSection === 'content' && <ContentSection />}
          {activeSection === 'analytics' && <AnalyticsSection />}
        </main>
      </div>
    </div>
  );
}

function OverviewSection({ stats }) {
  return (
    <div className="space-y-12">
      <div>
        <h2 
          className="text-4xl font-serif text-black uppercase tracking-wide mb-8"
          style={{ fontFamily: 'Times New Roman, serif' }}
        >
          Empire Status Report
        </h2>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-3 gap-8">
        <div className="bg-gray-50 p-8 border border-gray-200">
          <div className="text-sm text-gray-600 mb-2 uppercase tracking-wide">Total Transformations</div>
          <div className="text-4xl font-light mb-2">{stats?.totalUsers || 0}</div>
          <div className="text-sm text-gray-500">Women who stopped hiding</div>
        </div>
        
        <div className="bg-gray-50 p-8 border border-gray-200">
          <div className="text-sm text-gray-600 mb-2 uppercase tracking-wide">AI Generations</div>
          <div className="text-4xl font-light mb-2">{stats?.totalGenerations || 0}</div>
          <div className="text-sm text-gray-500">Confidence created</div>
        </div>
        
        <div className="bg-gray-50 p-8 border border-gray-200">
          <div className="text-sm text-gray-600 mb-2 uppercase tracking-wide">Monthly Revenue</div>
          <div className="text-4xl font-light mb-2">€{stats?.monthlyRevenue || 0}</div>
          <div className="text-sm text-gray-500">Empire growth</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="border-t border-gray-200 pt-12">
        <h3 
          className="text-2xl font-serif text-black uppercase tracking-wide mb-8"
          style={{ fontFamily: 'Times New Roman, serif' }}
        >
          Recent Transformations
        </h3>
        
        <div className="space-y-4">
          {stats?.recentActivity?.map((activity, index) => (
            <div key={index} className="flex justify-between items-center p-4 bg-gray-50 border border-gray-200">
              <div>
                <div className="font-light">{activity.user}</div>
                <div className="text-sm text-gray-600">{activity.action}</div>
              </div>
              <div className="text-sm text-gray-500">{activity.timestamp}</div>
            </div>
          )) || (
            <div className="text-center py-12 text-gray-500">
              Loading the latest empire updates...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UsersSection() {
  return (
    <div className="space-y-8">
      <h2 
        className="text-4xl font-serif text-black uppercase tracking-wide"
        style={{ fontFamily: 'Times New Roman, serif' }}
      >
        Community Management
      </h2>
      <div className="text-gray-600">
        User management interface coming soon...
      </div>
    </div>
  );
}

function GenerationsSection() {
  return (
    <div className="space-y-8">
      <h2 
        className="text-4xl font-serif text-black uppercase tracking-wide"
        style={{ fontFamily: 'Times New Roman, serif' }}
      >
        AI Creation Analytics
      </h2>
      <div className="text-gray-600">
        Generation analytics coming soon...
      </div>
    </div>
  );
}

function SubscriptionsSection() {
  return (
    <div className="space-y-8">
      <h2 
        className="text-4xl font-serif text-black uppercase tracking-wide"
        style={{ fontFamily: 'Times New Roman, serif' }}
      >
        Revenue Dashboard
      </h2>
      <div className="text-gray-600">
        Revenue analytics coming soon...
      </div>
    </div>
  );
}

function ContentSection() {
  return (
    <div className="space-y-8">
      <h2 
        className="text-4xl font-serif text-black uppercase tracking-wide"
        style={{ fontFamily: 'Times New Roman, serif' }}
      >
        Content Management
      </h2>
      <div className="text-gray-600">
        Content library coming soon...
      </div>
    </div>
  );
}

function AnalyticsSection() {
  return (
    <div className="space-y-8">
      <h2 
        className="text-4xl font-serif text-black uppercase tracking-wide"
        style={{ fontFamily: 'Times New Roman, serif' }}
      >
        Performance Analytics
      </h2>
      <div className="text-gray-600">
        Advanced analytics coming soon...
      </div>
    </div>
  );
}