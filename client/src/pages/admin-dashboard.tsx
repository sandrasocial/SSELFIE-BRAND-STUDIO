import React from 'react';
import { useAuth } from '../hooks/use-auth';
import AdminLayout from '../components/AdminLayout';
import { Link } from 'wouter';

export default function AdminDashboardPage() {
  const { user } = useAuth();

  // Check if user is Sandra (admin access required)
  if (!user || user.email !== 'ssa@ssasocial.com') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light text-white mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
            Admin Access Required
          </h1>
          <p className="text-gray-400">Only Sandra can access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout title="OVERVIEW" subtitle="System Status & Controls">
      <div className="p-8 space-y-8">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 uppercase tracking-wide">System Status</p>
                <p className="text-2xl font-light text-black mt-1">OPERATIONAL</p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 uppercase tracking-wide">Active Users</p>
                <p className="text-2xl font-light text-black mt-1">2,847</p>
              </div>
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 uppercase tracking-wide">Revenue MTD</p>
                <p className="text-2xl font-light text-black mt-1">€48,392</p>
              </div>
              <div className="w-3 h-3 bg-gold-500 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-gray-100 p-8 shadow-sm">
          <h2 className="text-lg font-light text-black mb-6 tracking-wide uppercase" style={{ fontFamily: 'Times New Roman, serif' }}>
            Quick Actions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/consulting-agents">
              <div className="p-4 border border-gray-200 hover:border-black transition-colors cursor-pointer">
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto mb-3 bg-black rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">◊</span>
                  </div>
                  <p className="text-sm uppercase tracking-wide text-gray-700">CONSULTING AGENTS</p>
                </div>
              </div>
            </Link>
            
            <Link href="/admin/business-overview">
              <div className="p-4 border border-gray-200 hover:border-black transition-colors cursor-pointer">
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto mb-3 bg-black rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">◊</span>
                  </div>
                  <p className="text-sm uppercase tracking-wide text-gray-700">BUSINESS OVERVIEW</p>
                </div>
              </div>
            </Link>
            
            <Link href="/admin/subscriber-import">
              <div className="p-4 border border-gray-200 hover:border-black transition-colors cursor-pointer">
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto mb-3 bg-black rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">◊</span>
                  </div>
                  <p className="text-sm uppercase tracking-wide text-gray-700">SUBSCRIBER IMPORT</p>
                </div>
              </div>
            </Link>
            
            <Link href="/admin/bridge-monitor">
              <div className="p-4 border border-gray-200 hover:border-black transition-colors cursor-pointer">
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto mb-3 bg-black rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">◊</span>
                  </div>
                  <p className="text-sm uppercase tracking-wide text-gray-700">BRIDGE MONITOR</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-gray-100 p-8 shadow-sm">
          <h2 className="text-lg font-light text-black mb-6 tracking-wide uppercase" style={{ fontFamily: 'Times New Roman, serif' }}>
            Recent Activity
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="text-sm text-black">Elena agent coordination activated</p>
                <p className="text-xs text-gray-500">2 minutes ago</p>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="text-sm text-black">New subscriber imported: user@example.com</p>
                <p className="text-xs text-gray-500">15 minutes ago</p>
              </div>
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="text-sm text-black">Business metrics updated</p>
                <p className="text-xs text-gray-500">1 hour ago</p>
              </div>
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}