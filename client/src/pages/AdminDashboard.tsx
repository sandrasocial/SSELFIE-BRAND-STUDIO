import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'wouter';

interface DashboardStats {
  totalUsers: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  completedSessions: number;
}

export default function AdminDashboard() {
  const [selectedSection, setSelectedSection] = useState('overview');

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    }
  });

  const navigationItems = [
    { id: 'overview', label: 'O V E R V I E W', icon: '◊' },
    { id: 'users', label: 'U S E R S', icon: '◊' },
    { id: 'content', label: 'C O N T E N T', icon: '◊' },
    { id: 'analytics', label: 'A N A L Y T I C S', icon: '◊' },
    { id: 'settings', label: 'S E T T I N G S', icon: '◊' }
  ];

  const statCards = [
    { 
      title: 'Total Users', 
      value: stats?.totalUsers || 0, 
      change: '+12%',
      image: '/gallery/sandra-power-pose-1.jpg'
    },
    { 
      title: 'Active Subscriptions', 
      value: stats?.activeSubscriptions || 0, 
      change: '+8%',
      image: '/gallery/sandra-confidence-2.jpg'
    },
    { 
      title: 'Monthly Revenue', 
      value: `$${stats?.monthlyRevenue || 0}`, 
      change: '+24%',
      image: '/gallery/sandra-success-3.jpg'
    },
    { 
      title: 'Completed Sessions', 
      value: stats?.completedSessions || 0, 
      change: '+16%',
      image: '/gallery/sandra-transformation-4.jpg'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-2xl font-light tracking-[0.3em] text-black" style={{ fontFamily: 'Times New Roman, serif' }}>
          {'L O A D I N G . . .'.split('').join(' ')}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-black text-white py-6 px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/">
            <div className="text-2xl font-light tracking-[0.2em]" style={{ fontFamily: 'Times New Roman, serif' }}>
              {'S S E L F I E   S T U D I O'.split('').join(' ')}
            </div>
          </Link>
          <div className="flex space-x-12">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedSection(item.id)}
                className={`text-sm font-light tracking-[0.2em] transition-all duration-200 ${
                  selectedSection === item.id 
                    ? 'text-white border-b border-white pb-1' 
                    : 'text-gray-400 hover:text-white'
                }`}
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero Section - Full Bleed */}
      <div 
        className="h-96 bg-cover bg-center relative"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/gallery/sandra-empire-hero.jpg')`,
          backgroundPosition: '50% 30%'
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 
              className="text-5xl font-light tracking-[0.3em] uppercase mb-4 opacity-90"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              {'A D M I N   D A S H B O A R D'.split('').join(' ')}
            </h1>
            <p 
              className="text-xl font-light tracking-[0.2em] opacity-80"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              {'E M P I R E   M A N A G E M E N T'.split('').join(' ')}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {statCards.map((stat, index) => (
            <div key={index} className="relative bg-white rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-all duration-200 shadow-lg">
              <div 
                className="h-96 bg-cover bg-center relative"
                style={{
                  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('${stat.image}')`,
                  backgroundPosition: '50% 30%'
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h3 
                      className="text-2xl font-light tracking-[0.3em] uppercase opacity-90 mb-4"
                      style={{ fontFamily: 'Times New Roman, serif' }}
                    >
                      {stat.title.split('').join(' ')}
                    </h3>
                    <div className="text-4xl font-light mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
                      {stat.value}
                    </div>
                    <div className="text-sm opacity-80 tracking-[0.1em]">
                      {stat.change}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Full Bleed Image Break */}
        <div 
          className="h-64 bg-cover bg-center relative mb-16 -mx-8"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url('/gallery/sandra-workspace-luxury.jpg')`,
            backgroundPosition: 'center'
          }}
        />

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gray-50 p-8 text-center">
            <h3 
              className="text-2xl font-light tracking-[0.2em] uppercase mb-4 text-black"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              {'U S E R   M A N A G E M E N T'.split('').join(' ')}
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Manage user accounts, subscriptions, and access levels with editorial precision.
            </p>
            <button className="bg-black text-white px-8 py-3 text-sm tracking-[0.2em] uppercase hover:bg-gray-800 transition-colors">
              {'M A N A G E   U S E R S'.split('').join(' ')}
            </button>
          </div>

          <div className="bg-gray-50 p-8 text-center">
            <h3 
              className="text-2xl font-light tracking-[0.2em] uppercase mb-4 text-black"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              {'C O N T E N T   S T U D I O'.split('').join(' ')}
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Create and manage transformation content with luxury editorial standards.
            </p>
            <button className="bg-black text-white px-8 py-3 text-sm tracking-[0.2em] uppercase hover:bg-gray-800 transition-colors">
              {'C R E A T E   C O N T E N T'.split('').join(' ')}
            </button>
          </div>

          <div className="bg-gray-50 p-8 text-center">
            <h3 
              className="text-2xl font-light tracking-[0.2em] uppercase mb-4 text-black"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              {'A N A L Y T I C S   H U B'.split('').join(' ')}
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Deep insights into user engagement and transformation success metrics.
            </p>
            <button className="bg-black text-white px-8 py-3 text-sm tracking-[0.2em] uppercase hover:bg-gray-800 transition-colors">
              {'V I E W   A N A L Y T I C S'.split('').join(' ')}
            </button>
          </div>
        </div>

        {/* Portfolio-Style Recent Activity */}
        <div className="bg-white">
          <h2 
            className="text-3xl font-light tracking-[0.3em] uppercase text-center mb-12 text-black"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            {'R E C E N T   A C T I V I T Y'.split('').join(' ')}
          </h2>
          
          <div className="space-y-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-center justify-between border-b border-gray-100 pb-6">
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                  <div>
                    <h4 className="text-lg font-light text-black" style={{ fontFamily: 'Times New Roman, serif' }}>
                      New user registration
                    </h4>
                    <p className="text-gray-600 text-sm">2 minutes ago</p>
                  </div>
                </div>
                <div className="text-sm text-gray-500 tracking-[0.1em]">
                  VIEW DETAILS
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}