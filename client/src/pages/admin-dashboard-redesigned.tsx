// /client/src/pages/AdminDashboard.tsx - Updated Integration
import { AdminHero } from '../components/admin/AdminHero';
import { useQuery } from '@tanstack/react-query';

export default function AdminDashboard() {
  // Coordinated data fetching for hero stats
  const { data: dashboardStats, isLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/dashboard-stats');
      if (!response.ok) throw new Error('Failed to fetch dashboard stats');
      return response.json();
    }
  });

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Full-Bleed Hero Section - Coordinated Implementation */}
      <AdminHero 
        userName="Sandra" 
        dashboardStats={!isLoading ? dashboardStats : undefined}
      />
      
      {/* Existing Dashboard Content */}
      <div className="px-8 py-12">
        {/* Rest of admin dashboard content */}
      </div>
    </div>
  );
}