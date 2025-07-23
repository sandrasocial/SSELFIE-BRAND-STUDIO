import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
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
    enabled: !!(user && (user.email === 'ssa@ssasocial.com' || user.role === 'admin')),
  });

  // Check if user is Sandra (admin access required)  
  if (!user || (user.email !== 'ssa@ssasocial.com' && user.role !== 'admin')) {
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
    <div className="min-h-screen bg-white">
      {/* ARIA'S LUXURY EDITORIAL HERO - Full Bleed with Authentic SSELFIE Image */}
      <div 
        className="relative h-screen bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(10, 10, 10, 0.6), rgba(10, 10, 10, 0.3)), url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white max-w-4xl mx-auto px-8">
            {/* ARIA'S TIMES NEW ROMAN HEADLINES - Luxury Editorial */}
            <h1 
              className="text-7xl md:text-9xl font-light tracking-widest mb-8 leading-none"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              EMPIRE
            </h1>
            
            {/* RACHEL'S AUTHENTIC SANDRA VOICE COPY */}
            <p 
              className="text-xl md:text-2xl font-light tracking-wider opacity-90 mb-12 max-w-3xl mx-auto leading-relaxed"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              From rock bottom single mom to 120K followers. 
              <br className="hidden md:block" />
              Now orchestrating transformation at scale.
            </p>

            {/* ARIA'S EDITORIAL STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              {/* Empire Members - RACHEL'S AUTHENTIC LANGUAGE */}
              <div className="text-center">
                <div 
                  className="text-5xl md:text-6xl font-light mb-4"
                  style={{ fontFamily: 'Times New Roman, serif' }}
                >
                  {isLoading ? "..." : stats?.totalUsers || 7}
                </div>
                <div 
                  className="text-sm tracking-[0.2em] uppercase opacity-80"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Women Building Empires
                </div>
              </div>

              {/* Stories - RACHEL'S STORYTELLING FOCUS */}
              <div className="text-center">
                <div 
                  className="text-5xl md:text-6xl font-light mb-4"
                  style={{ fontFamily: 'Times New Roman, serif' }}
                >
                  {isLoading ? "..." : stats?.totalPosts || 123}
                </div>
                <div 
                  className="text-sm tracking-[0.2em] uppercase opacity-80"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Transformation Stories
                </div>
              </div>

              {/* Real Connections - RACHEL'S AUTHENTIC COMMUNITY */}
              <div className="text-center">
                <div 
                  className="text-5xl md:text-6xl font-light mb-4"
                  style={{ fontFamily: 'Times New Roman, serif' }}
                >
                  {isLoading ? "..." : stats?.totalLikes || 456}
                </div>
                <div 
                  className="text-sm tracking-[0.2em] uppercase opacity-80"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Real Connections Made
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ARIA'S EDITORIAL IMAGE BREAK - Magazine Style */}
      <div 
        className="h-screen bg-cover bg-center bg-no-repeat relative"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80')`
        }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute bottom-16 left-16 text-white">
          <h2 
            className="text-4xl md:text-6xl font-light mb-4"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            Command Center
          </h2>
          <p 
            className="text-lg opacity-90 max-w-md"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Where strategy meets execution. Where vision becomes reality.
          </p>
        </div>
      </div>

      {/* ARIA'S LUXURY EDITORIAL ADMIN TOOLS SECTION */}
      <div className="bg-white py-32">
        <div className="max-w-7xl mx-auto px-8">
          {/* RACHEL'S AUTHENTIC SECTION HEADING */}
          <div className="text-center mb-20">
            <h2 
              className="text-5xl md:text-7xl font-light tracking-widest mb-8"
              style={{ fontFamily: 'Times New Roman, serif', color: '#0a0a0a' }}
            >
              ADMIN TOOLS
            </h2>
            <p 
              className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              The tools that built this empire. Simple, powerful, and designed for transformation at scale.
            </p>
          </div>

          {/* ARIA'S EDITORIAL GRID LAYOUT - Magazine Style Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Visual Editor - ARIA'S LUXURY CARD DESIGN */}
            <div 
              className="group cursor-pointer"
              onClick={() => window.open('/visual-editor', '_blank')}
            >
              <div 
                className="h-64 bg-cover bg-center bg-no-repeat relative mb-6 transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage: `linear-gradient(rgba(10, 10, 10, 0.3), rgba(10, 10, 10, 0.6)), url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2015&q=80')`
                }}
              >
                <div className="absolute bottom-6 left-6 text-white">
                  <div 
                    className="text-xs tracking-[0.2em] uppercase opacity-80 mb-2"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Development
                  </div>
                  <h3 
                    className="text-2xl font-light"
                    style={{ fontFamily: 'Times New Roman, serif' }}
                  >
                    Visual Editor
                  </h3>
                </div>
              </div>
              <p 
                className="text-gray-600 leading-relaxed"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Where the magic happens. Real-time development environment with agent coordination.
              </p>
            </div>

            {/* User Management - ARIA'S EDITORIAL STYLE */}
            <div className="group cursor-pointer">
              <div 
                className="h-64 bg-cover bg-center bg-no-repeat relative mb-6 transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage: `linear-gradient(rgba(10, 10, 10, 0.3), rgba(10, 10, 10, 0.6)), url('https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80')`
                }}
              >
                <div className="absolute bottom-6 left-6 text-white">
                  <div 
                    className="text-xs tracking-[0.2em] uppercase opacity-80 mb-2"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Community
                  </div>
                  <h3 
                    className="text-2xl font-light"
                    style={{ fontFamily: 'Times New Roman, serif' }}
                  >
                    User Management
                  </h3>
                </div>
              </div>
              <p 
                className="text-gray-600 leading-relaxed"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Monitor your empire members. Track transformations and celebrate success stories.
              </p>
            </div>

            {/* AI Agent Hub - ARIA'S LUXURY APPROACH */}
            <div className="group cursor-pointer">
              <div 
                className="h-64 bg-cover bg-center bg-no-repeat relative mb-6 transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage: `linear-gradient(rgba(10, 10, 10, 0.3), rgba(10, 10, 10, 0.6)), url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
                }}
              >
                <div className="absolute bottom-6 left-6 text-white">
                  <div 
                    className="text-xs tracking-[0.2em] uppercase opacity-80 mb-2"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Intelligence
                  </div>
                  <h3 
                    className="text-2xl font-light"
                    style={{ fontFamily: 'Times New Roman, serif' }}
                  >
                    AI Agent Hub
                  </h3>
                </div>
              </div>
              <p 
                className="text-gray-600 leading-relaxed"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Coordinate with Elena and your 10-agent team. Strategic vision meets autonomous execution.
              </p>
            </div>

            {/* Business Analytics - ARIA'S EDITORIAL DESIGN */}
            <div className="group cursor-pointer">
              <div 
                className="h-64 bg-cover bg-center bg-no-repeat relative mb-6 transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage: `linear-gradient(rgba(10, 10, 10, 0.3), rgba(10, 10, 10, 0.6)), url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
                }}
              >
                <div className="absolute bottom-6 left-6 text-white">
                  <div 
                    className="text-xs tracking-[0.2em] uppercase opacity-80 mb-2"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Growth
                  </div>
                  <h3 
                    className="text-2xl font-light"
                    style={{ fontFamily: 'Times New Roman, serif' }}
                  >
                    Business Analytics
                  </h3>
                </div>
              </div>
              <p 
                className="text-gray-600 leading-relaxed"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Revenue insights and growth metrics. Track your empire's expansion in real-time.
              </p>
            </div>

            {/* Platform Health - ARIA'S DESIGN SYSTEM */}
            <div className="group cursor-pointer">
              <div 
                className="h-64 bg-cover bg-center bg-no-repeat relative mb-6 transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage: `linear-gradient(rgba(10, 10, 10, 0.3), rgba(10, 10, 10, 0.6)), url('https://images.unsplash.com/photo-1518186285589-2f7649de83e0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80')`
                }}
              >
                <div className="absolute bottom-6 left-6 text-white">
                  <div 
                    className="text-xs tracking-[0.2em] uppercase opacity-80 mb-2"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Operations
                  </div>
                  <h3 
                    className="text-2xl font-light"
                    style={{ fontFamily: 'Times New Roman, serif' }}
                  >
                    Platform Health
                  </h3>
                </div>
              </div>
              <p 
                className="text-gray-600 leading-relaxed"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                System status and performance monitoring. Keep your empire running smoothly.
              </p>
            </div>

            {/* Integration Management - FINAL ARIA CARD */}
            <div className="group cursor-pointer">
              <div 
                className="h-64 bg-cover bg-center bg-no-repeat relative mb-6 transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage: `linear-gradient(rgba(10, 10, 10, 0.3), rgba(10, 10, 10, 0.6)), url('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2066&q=80')`
                }}
              >
                <div className="absolute bottom-6 left-6 text-white">
                  <div 
                    className="text-xs tracking-[0.2em] uppercase opacity-80 mb-2"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Automation
                  </div>
                  <h3 
                    className="text-2xl font-light"
                    style={{ fontFamily: 'Times New Roman, serif' }}
                  >
                    Integration Hub
                  </h3>
                </div>
              </div>
              <p 
                className="text-gray-600 leading-relaxed"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Connect with Make.com, Flodesk, Instagram. Automation that scales your impact.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* ARIA'S FINAL EDITORIAL IMAGE BREAK - Luxury Closing */}
      <div 
        className="h-96 bg-cover bg-center bg-no-repeat relative"
        style={{
          backgroundImage: `linear-gradient(rgba(10, 10, 10, 0.4), rgba(10, 10, 10, 0.4)), url('https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h3 
              className="text-3xl md:text-5xl font-light tracking-wider mb-4"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              Keep Building
            </h3>
            <p 
              className="text-lg opacity-90"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Your empire is just getting started.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}