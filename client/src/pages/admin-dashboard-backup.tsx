import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { UnifiedAgentInterface } from '@/components/admin/UnifiedAgentInterface';

export default function AdminDashboardPage() {
  const { user } = useAuth();
import { TestButton } from "@/components/admin/TestButton"

  // Check if user is Sandra (admin access required)
  if (!user || user.email !== 'ssa@ssasocial.com') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light text-white mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
        
        {/* Admin Test Suite */}
        <TestButton />
        
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
        <UnifiedAgentInterface />
      </div>
    </div>
  );
}