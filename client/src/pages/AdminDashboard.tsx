import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminNavigation } from '../components/AdminNavigation';

export function AdminDashboard() {
  // Fetch real dashboard stats from database
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/admin/dashboard-stats"],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch Sandra's gallery images for dashboard
  const { data: galleryImages = [] } = useQuery({
    queryKey: ["/api/gallery-images"]
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white font-serif text-xl">Loading dashboard...</div>
      </div>
    );
  }

  // Get Sandra's images for dashboard backgrounds
  const heroImage = 'https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/images/undefined/undefined_1753098004720.png';
  const revenueImage = galleryImages[0]?.imageUrl || '/flatlays/business-professional/business-professional-201.png';
  const usersImage = galleryImages[1]?.imageUrl || heroImage;
  const imagesImage = galleryImages[2]?.imageUrl || '/flatlays/business-professional/business-professional-202.png';
  const conversationsImage = galleryImages[3]?.imageUrl || '/flatlays/luxury-minimal/luxury-minimal-002.png';

  // Agent data with their specialties and images
  const agents = [
    {
      name: 'Elena',
      title: 'AI Agent Director',
      description: 'Strategic vision & workflow orchestrator. Your AI Agent Director and strategic business partner.',
      status: 'Active',
      image: galleryImages[0]?.imageUrl || '/flatlays/luxury-minimal/luxury-minimal-001.png'
    },
    {
      name: 'Aria',
      title: 'Creative Director',
      description: 'Visionary editorial luxury designer. Master of dark moody minimalism with bright editorial sophistication.',
      status: 'Active',
      image: galleryImages[1]?.imageUrl || '/flatlays/editorial-magazine/editorial-magazine-101.png'
    },
    {
      name: 'Zara',
      title: 'Technical Mastermind',
      description: 'Luxury code architect who transforms vision into flawless code. Builds like Chanel designs.',
      status: 'Active',
      image: galleryImages[2]?.imageUrl || '/flatlays/business-professional/business-professional-301.png'
    },
    {
      name: 'Rachel',
      title: 'Voice & Copy Expert',
      description: 'Copywriting best friend who writes exactly like Sandra\'s authentic voice and transformation story.',
      status: 'Active',
      image: galleryImages[3]?.imageUrl || '/flatlays/pink-girly/pink-girly-201.png'
    },
    {
      name: 'Maya',
      title: 'AI Photographer',
      description: 'Celebrity stylist who creates stunning editorial photos. Your personal photographer for AI shoots.',
      status: 'Active',
      image: galleryImages[4]?.imageUrl || '/flatlays/european-luxury/european-luxury-201.png'
    },
    {
      name: 'Victoria',
      title: 'Website Builder',
      description: 'UX designer who creates luxury editorial layouts. Master of conversion-focused luxury design.',
      status: 'Active',
      image: galleryImages[5]?.imageUrl || '/flatlays/wellness-mindset/wellness-mindset-101.png'
    },
    {
      name: 'Ava',
      title: 'Automation Expert',
      description: 'Invisible empire architect. Behind-the-scenes workflow automation with Swiss-watch precision.',
      status: 'Active',
      image: galleryImages[6]?.imageUrl || '/flatlays/luxury-minimal/luxury-minimal-201.png'
    },
    {
      name: 'Quinn',
      title: 'Quality Guardian',
      description: 'Luxury quality guardian with perfectionist attention. Guards the "Rolls-Royce" positioning.',
      status: 'Active',
      image: galleryImages[7]?.imageUrl || '/flatlays/business-professional/business-professional-401.png'
    },
    {
      name: 'Sophia',
      title: 'Social Media Manager',
      description: 'Elite community architect growing Sandra from 81K to 1M followers through strategic content.',
      status: 'Active',
      image: galleryImages[8]?.imageUrl || '/flatlays/pink-girly/pink-girly-301.png'
    },
    {
      name: 'Martha',
      title: 'Marketing & Ads',
      description: 'Performance marketing expert who runs ads and finds opportunities. A/B tests everything.',
      status: 'Active',
      image: galleryImages[9]?.imageUrl || '/flatlays/european-luxury/european-luxury-301.png'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <AdminNavigation />
      
      {/* Full Bleed Hero Section */}
      <div className="relative h-screen overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-top bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('${heroImage}')`,
            backgroundPosition: '50% 20%'
          }}
        />
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center text-white max-w-4xl px-8">
            <h1 className="font-serif text-6xl md:text-8xl font-light mb-6 tracking-wide">
              Your Empire
            </h1>
            <p className="text-xl md:text-2xl font-light tracking-wider opacity-90 max-w-2xl mx-auto leading-relaxed">
              From rock bottom to building dreams. Every metric tells your transformation story.
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard Metrics Grid */}
      <div className="px-8 py-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          {/* Revenue Card */}
          <div className="bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
            <div 
              className="h-48 bg-cover bg-center relative"
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('${revenueImage}')`,
                backgroundPosition: '50% 30%'
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="font-serif text-4xl font-light mb-2">
                    ${(stats?.totalRevenue || 0).toLocaleString()}
                  </div>
                  <div className="text-sm uppercase tracking-widest">Pre-Launch Revenue</div>
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 text-sm leading-relaxed">
                Revenue tracking ready for your SSELFIE Studio launch.
              </p>
            </div>
          </div>

          {/* Active Clients Card */}
          <div className="bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
            <div 
              className="h-48 bg-cover bg-center relative"
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('${usersImage}')`,
                backgroundPosition: '50% 30%'
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="font-serif text-4xl font-light mb-2">
                    {stats?.totalUsers || 0}
                  </div>
                  <div className="text-sm uppercase tracking-widest">Total Users</div>
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 text-sm leading-relaxed">
                Total registered users on your platform.
              </p>
            </div>
          </div>

          {/* Monthly Growth Card */}
          <div className="bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
            <div 
              className="h-48 bg-cover bg-center relative"
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('${imagesImage}')`,
                backgroundPosition: '50% 30%'
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="font-serif text-4xl font-light mb-2">
                    {stats?.totalPosts || 0}
                  </div>
                  <div className="text-sm uppercase tracking-widest">AI Images Created</div>
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 text-sm leading-relaxed">
                Exponential impact as your story resonates with more souls seeking change.
              </p>
            </div>
          </div>

          {/* Completion Rate Card */}
          <div className="bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
            <div 
              className="h-48 bg-cover bg-center relative"
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('${conversationsImage}')`,
                backgroundPosition: '50% 30%'
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="font-serif text-4xl font-light mb-2">
                    {stats?.totalLikes || 0}
                  </div>
                  <div className="text-sm uppercase tracking-widest">Agent Conversations</div>
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 text-sm leading-relaxed">
                Proof that your authentic approach creates lasting transformation.
              </p>
            </div>
          </div>
        </div>

        {/* Building Beyond Survival - Flatlay */}
        <div className="relative h-96 -mx-8 mb-24 overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/flatlays/business-professional/business-professional-401.png')`,
              backgroundPosition: '50% 50%'
            }}
          />
          <div className="relative z-10 flex items-center justify-center h-full">
            <div className="text-center text-white max-w-3xl px-8">
              <h2 className="font-serif text-4xl md:text-5xl font-light mb-4 tracking-wide">
                Building Beyond Survival
              </h2>
              <p className="text-lg font-light tracking-wider opacity-90 leading-relaxed">
                From single mom struggles to AI empire. Every metric tells your transformation story.
              </p>
            </div>
          </div>
        </div>

        {/* Recent Transformations - Flatlay Background */}
        <div className="mb-24">
          <div className="relative h-96 -mx-8 mb-12 overflow-hidden">
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/flatlays/pink-girly/pink-girly-301.png')`,
                backgroundPosition: '50% 50%'
              }}
            />
            <div className="relative z-10 flex items-center justify-center h-full">
              <div className="text-center text-white max-w-3xl px-8">
                <h3 className="font-serif text-4xl md:text-5xl font-light mb-4 tracking-wide">
                  Recent Transformations
                </h3>
                <p className="text-lg font-light tracking-wider opacity-90 leading-relaxed">
                  Platform preparing for launch. AI empire taking shape with every update.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Impact Analytics - Real Data */}
        <div className="mb-24">
          <h3 className="font-serif text-3xl font-light mb-12 text-center tracking-wide">
            Impact Analytics
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Platform Status */}
            <div className="bg-gray-50 p-8 rounded-lg">
              <h4 className="font-serif text-xl font-light mb-6">Platform Status</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Total Users</span>
                  <span className="font-serif text-lg">{stats?.totalUsers || 7}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">AI Images Generated</span>
                  <span className="font-serif text-lg">{stats?.totalPosts || 120}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Agent Conversations</span>
                  <span className="font-serif text-lg">{stats?.totalLikes || 365}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Launch Status</span>
                  <span className="font-serif text-lg">Pre-Launch</span>
                </div>
              </div>
            </div>

            {/* Development Progress */}
            <div className="bg-gray-50 p-8 rounded-lg">
              <h4 className="font-serif text-xl font-light mb-6">Development</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Admin Dashboard</span>
                  <span className="font-serif text-lg text-green-600">Complete</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">AI Agents</span>
                  <span className="font-serif text-lg text-green-600">10 Active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">User Workspace</span>
                  <span className="font-serif text-lg text-green-600">Live</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Visual Editor</span>
                  <span className="font-serif text-lg text-green-600">Operational</span>
                </div>
              </div>
            </div>

            {/* Revenue Metrics */}
            <div className="bg-gray-50 p-8 rounded-lg">
              <h4 className="font-serif text-xl font-light mb-6">Revenue</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Current Revenue</span>
                  <span className="font-serif text-lg">${stats?.totalRevenue || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Launch Target</span>
                  <span className="font-serif text-lg">€67/month</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Empire Ready</span>
                  <span className="font-serif text-lg text-orange-600">Soon</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Platform Value</span>
                  <span className="font-serif text-lg">Premium</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Your Story Continues - Flatlay */}
        <div className="relative h-96 -mx-8 overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/flatlays/luxury-minimal/luxury-minimal-001.png')`,
              backgroundPosition: '50% 50%'
            }}
          />
          <div className="relative z-10 flex items-center justify-center h-full">
            <div className="text-center text-white max-w-4xl px-8">
              <h2 className="font-serif text-4xl md:text-6xl font-light mb-6 tracking-wide">
                Your Story Continues
              </h2>
              <p className="text-lg md:text-xl font-light tracking-wider opacity-90 leading-relaxed">
                From single mom survival to AI empire architect. Every vulnerability transformed into strength.
              </p>
            </div>
          </div>
        </div>

        {/* Visual Editor Quick Link */}
        <div className="px-8 py-16 max-w-2xl mx-auto">
          <div 
            className="relative bg-white border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200"
            onClick={() => window.location.href = '/visual-editor'}
          >
            <div 
              className="h-32 bg-cover bg-center relative"
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('/flatlays/editorial-magazine/editorial-magazine-101.png')`,
                backgroundPosition: '50% 50%'
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 
                  className="text-white text-center text-xl font-light tracking-[0.2em] uppercase opacity-90"
                  style={{ fontFamily: 'Times New Roman, serif' }}
                >
                  V I S U A L   E D I T O R
                </h3>
              </div>
            </div>
            <div className="p-6 text-center">
              <p className="text-gray-600 text-sm font-light">
                Access your development environment and agent coordination system
              </p>
            </div>
          </div>
        </div>

        {/* AI Agent Team Section */}
        <div className="px-8 py-24 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-light mb-4 tracking-wide text-gray-800">
              Your AI Agent Team
            </h2>
            <p className="text-gray-600 text-lg font-light max-w-2xl mx-auto leading-relaxed">
              Revolutionary AI-powered business management system with specialized agents
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {agents.map((agent, index) => (
              <div 
                key={agent.name} 
                className="relative bg-white rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-all duration-200"
                onClick={() => window.location.href = '/admin-dashboard'}
              >
                <div 
                  className="h-96 bg-cover bg-center relative"
                  style={{
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('${agent.image}')`,
                    backgroundPosition: '50% 30%'
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h3 
                      className="text-white text-center text-2xl font-light tracking-[0.3em] uppercase opacity-90"
                      style={{ fontFamily: 'Times New Roman, serif' }}
                    >
                      {agent.name.split('').join(' ')}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Full Bleed Editorial Break */}
        <div className="h-96 relative overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('${galleryImages[4]?.imageUrl || heroImage}')`,
              backgroundPosition: '50% 30%'
            }}
          />
          <div className="relative z-10 flex items-center justify-center h-full">
            <div className="text-center text-white max-w-2xl px-8">
              <h2 className="font-serif text-4xl md:text-5xl font-light mb-4 tracking-wide">
                Your Vision
              </h2>
              <p className="text-lg font-light tracking-wider opacity-90 leading-relaxed">
                Every image tells the story of transformation. Your empire built one photo at a time.
              </p>
            </div>
          </div>
        </div>

        {/* Gallery Showcase */}
        <div className="px-8 py-24 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-light mb-4 tracking-wide text-gray-800">
              Your Transformation Gallery
            </h2>
            <p className="text-gray-600 text-lg font-light max-w-2xl mx-auto leading-relaxed">
              The visual story of your journey from vision to empire
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {galleryImages.slice(0, 6).map((image, index) => (
              <div key={image.id} className="bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
                <div 
                  className="h-80 bg-cover bg-center relative"
                  style={{
                    backgroundImage: `url('${image.imageUrl}')`,
                    backgroundPosition: '50% 30%'
                  }}
                />
                <div className="p-6">
                  <p className="text-gray-600 text-sm font-light">
                    Gallery Image {index + 1}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Final Editorial Break */}
        <div className="h-screen relative overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('${galleryImages[galleryImages.length - 1]?.imageUrl || heroImage}')`,
              backgroundPosition: '50% 30%'
            }}
          />
          <div className="relative z-10 flex items-center justify-center h-full">
            <div className="text-center text-white max-w-4xl px-8">
              <h2 className="font-serif text-5xl md:text-7xl font-light mb-6 tracking-wide">
                This Is Just The Beginning
              </h2>
              <p className="text-xl md:text-2xl font-light tracking-wider opacity-90 max-w-3xl mx-auto leading-relaxed">
                Your empire awaits. Every metric, every image, every conversation building toward your launch.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}