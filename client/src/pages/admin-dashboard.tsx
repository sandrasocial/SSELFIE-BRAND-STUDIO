import React from 'react';
import { useAuth } from '../hooks/use-auth';

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
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-black mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Unified agent coordination system</p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
          <h2 className="text-xl font-semibold mb-4">Admin Dashboard</h2>
          <p className="text-gray-600 mb-6">Use the consulting agents system for full admin functionality.</p>
          <a 
            href="/admin/consulting-agents" 
            className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors"
          >
            Access Consulting Agents
          </a>
        </div>
      </div>
    </div>
  );
}