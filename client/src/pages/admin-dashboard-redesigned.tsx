// app/admin/page.tsx
import React from 'react';
import { AdminHeroSection } from '@/components/admin/AdminHeroSection';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero takes full width, no padding */}
      <AdminHeroSection />
      
      {/* Main dashboard content with proper spacing */}
      <div className="container mx-auto px-4 py-8">
        <AdminDashboard />
      </div>
    </div>
  );
}