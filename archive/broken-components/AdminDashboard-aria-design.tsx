import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface DashboardStats {
  totalUsers: number;
  totalPosts: number;
  totalLikes: number;
  recentActivity: Array<{
    id: string;
    type: 'user_joined' | 'post_created' | 'like_given';
    description: string;
    timestamp: string;
  }>;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<'overview' | 'users' | 'content' | 'analytics'>('overview');

  // Fetch dashboard stats
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/dashboard-stats"],
    enabled: !!user?.isAdmin,
  });

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-serif text-white mb-4">Access Denied</h1>
          <p className="text-gray-400">You don't have permission to access this area.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Full-Bleed Hero Section - Editorial Magazine Style */}
      <div className="relative h-screen bg-gradient-to-b from-black via-gray-900 to-black">
        {/* Hero Background Image - Full Bleed */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{
            backgroundImage: `url('/gallery-luxury-workspace.jpg')`,
            filter: 'grayscale(20%)'
          }}
        />
        
        {/* Hero Content Overlay */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-8">
          <div className="max-w-4xl mx-auto">
            {/* Main Headline - Times New Roman Editorial Style */}
            <h1 className="font-serif text-6xl lg:text-8xl text-white mb-8 leading-tight tracking-tight">
              Empire
              <span className="block text-gray-300 text-4xl lg:text-6xl mt-4">
                Command Center
              </span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-xl lg:text-2xl text-gray-300 mb-12 font-light tracking-wide max-w-2xl mx-auto leading-relaxed">
              From rock bottom to empire builder — now orchestrating transformation at scale
            </p>

            {/* Stats Cards - Luxury Editorial Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {/* Total Users Card */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8 text-center hover:bg-white/10 transition-all duration-300">
                <div className="text-4xl font-serif text-white mb-2">
                  {isLoading ? "..." : stats?.totalUsers || 0}
                </div>
                <div className="text-gray-400 text-sm uppercase tracking-widest">
                  Empire Members
                </div>
              </div>

              {/* Total Posts Card */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8 text-center hover:bg-white/10 transition-all duration-300">
                <div className="text-4xl font-serif text-white mb-2">
                  {isLoading ? "..." : stats?.totalPosts || 0}
                </div>
                <div className="text-gray-400 text-sm uppercase tracking-widest">
                  Stories Shared
                </div>
              </div>

              {/* Total Engagement Card */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8 text-center hover:bg-white/10 transition-all duration-300">
                <div className="text-4xl font-serif text-white mb-2">
                  {isLoading ? "..." : stats?.totalLikes || 0}
                </div>
                <div className="text-gray-400 text-sm uppercase tracking-widest">
                  Connections Made
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs - Editorial Style */}
      <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-8">
          <nav className="flex space-x-12 py-6">
            {[
              { key: 'overview', label: 'Empire Overview' },
              { key: 'users', label: 'Community' },
              { key: 'content', label: 'Content Studio' },
              { key: 'analytics', label: 'Intelligence' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveSection(tab.key as any)}
                className={`text-sm uppercase tracking-widest transition-all duration-300 ${
                  activeSection === tab.key
                    ? 'text-white border-b-2 border-white pb-2'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        {activeSection === 'overview' && (
          <div className="space-y-16">
            {/* Recent Activity Section */}
            <section>
              <h2 className="text-3xl font-serif text-white mb-8">Empire Pulse</h2>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8">
                {isLoading ? (
                  <div className="text-center text-gray-400 py-12">
                    Loading empire intelligence...
                  </div>
                ) : (
                  <div className="space-y-6">
                    {stats?.recentActivity?.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between border-b border-white/10 pb-4 last:border-b-0">
                        <div>
                          <p className="text-white">{activity.description}</p>
                          <p className="text-gray-400 text-sm mt-1">{activity.timestamp}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs uppercase tracking-wide ${
                          activity.type === 'user_joined' ? 'bg-green-500/20 text-green-300' :
                          activity.type === 'post_created' ? 'bg-blue-500/20 text-blue-300' :
                          'bg-purple-500/20 text-purple-300'
                        }`}>
                          {activity.type.replace('_', ' ')}
                        </div>
                      </div>
                    )) || (
                      <div className="text-center text-gray-400 py-8">
                        No recent activity to display
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {activeSection === 'users' && (
          <div>
            <h2 className="text-3xl font-serif text-white mb-8">Community Management</h2>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8">
              <p className="text-gray-400 text-center py-12">
                User management interface coming soon...
              </p>
            </div>
          </div>
        )}

        {activeSection === 'content' && (
          <div>
            <h2 className="text-3xl font-serif text-white mb-8">Content Studio</h2>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8">
              <p className="text-gray-400 text-center py-12">
                Content management tools coming soon...
              </p>
            </div>
          </div>
        )}

        {activeSection === 'analytics' && (
          <div>
            <h2 className="text-3xl font-serif text-white mb-8">Empire Intelligence</h2>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8">
              <p className="text-gray-400 text-center py-12">
                Advanced analytics dashboard coming soon...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Full-Bleed Page Break Image */}
      <div 
        className="h-64 bg-cover bg-center bg-no-repeat relative"
        style={{
          backgroundImage: `url('/flatlay-luxury-planning.jpg')`,
        }}
      >
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <p className="text-white text-xl font-serif text-center px-8">
            "Every empire starts with a single decision to rise."
          </p>
        </div>
      </div>
    </div>
  );
}