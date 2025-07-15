import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.email !== 'ssa@ssasocial.com')) {
      setLocation('/');
      return;
    }
  }, [isAuthenticated, isLoading, user, setLocation]);

  const { data: stats } = useQuery({
    queryKey: ['/api/admin/stats'],
    enabled: isAuthenticated && user?.email === 'ssa@ssasocial.com',
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated || user?.email !== 'ssa@ssasocial.com') {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <AdminNavigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="font-serif text-4xl font-light mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Platform overview and management</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            subtitle="registered accounts"
          />
          <StatCard
            title="Active Subscriptions"
            value={stats?.activeSubscriptions || 0}
            subtitle="paid users"
          />
          <StatCard
            title="AI Images Generated"
            value={stats?.totalImages || 0}
            subtitle="total generations"
          />
          <StatCard
            title="Revenue (MTD)"
            value={`$${stats?.monthlyRevenue || 0}`}
            subtitle="this month"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-50 p-6">
            <h3 className="font-serif text-xl mb-4">Recent Users</h3>
            <div className="space-y-3">
              {stats?.recentUsers?.map((user: any) => (
                <div key={user.id} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                  <div>
                    <div className="font-medium">{user.email}</div>
                    <div className="text-sm text-gray-500">{user.plan || 'free'}</div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              )) || (
                <div className="text-gray-500 text-center py-4">No users yet</div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-6">
            <h3 className="font-serif text-xl mb-4">Platform Health</h3>
            <div className="space-y-3">
              <HealthItem label="Database" status="healthy" />
              <HealthItem label="AI Generation" status="healthy" />
              <HealthItem label="Email Service" status="healthy" />
              <HealthItem label="Payment Processing" status="healthy" />
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickAction
            title="User Management"
            description="View and manage user accounts"
            link="/admin/users"
          />
          <QuickAction
            title="Email Templates"
            description="Edit welcome email templates"
            link="/admin/emails"
          />
          <QuickAction
            title="Platform Settings"
            description="Configure platform settings"
            link="/admin/settings"
          />
        </div>
      </div>
    </div>
  );
}

function AdminNavigation() {
  return (
    <nav className="bg-black text-white px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/admin">
            <div className="font-serif text-lg letter-spacing-wide">SSELFIE ADMIN</div>
          </Link>
          <div className="flex space-x-6">
            <Link href="/admin" className="text-sm uppercase tracking-wide hover:text-gray-300">
              Dashboard
            </Link>
            <Link href="/admin/users" className="text-sm uppercase tracking-wide hover:text-gray-300">
              Users
            </Link>
            <Link href="/admin/emails" className="text-sm uppercase tracking-wide hover:text-gray-300">
              Emails
            </Link>
            <Link href="/admin/settings" className="text-sm uppercase tracking-wide hover:text-gray-300">
              Settings
            </Link>
            <Link href="/admin/ai-models" className="text-sm uppercase tracking-wide hover:text-gray-300">
              AI Models
            </Link>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/workspace" className="text-sm uppercase tracking-wide hover:text-gray-300">
            Back to Platform
          </Link>
          <a href="/api/logout" className="text-sm uppercase tracking-wide hover:text-gray-300">
            Logout
          </a>
        </div>
      </div>
    </nav>
  );
}

function StatCard({ title, value, subtitle }: { title: string; value: string | number; subtitle: string }) {
  return (
    <div className="bg-gray-50 p-6">
      <div className="text-sm text-gray-600 uppercase tracking-wide">{title}</div>
      <div className="text-3xl font-light font-serif mt-2">{value}</div>
      <div className="text-sm text-gray-500 mt-1">{subtitle}</div>
    </div>
  );
}

function HealthItem({ label, status }: { label: string; status: 'healthy' | 'warning' | 'error' }) {
  const statusColors = {
    healthy: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600'
  };

  return (
    <div className="flex justify-between items-center py-2">
      <span>{label}</span>
      <span className={`text-sm font-medium ${statusColors[status]}`}>
        {status.toUpperCase()}
      </span>
    </div>
  );
}

function QuickAction({ title, description, link }: { title: string; description: string; link: string }) {
  return (
    <Link href={link}>
      <div className="border border-gray-200 p-6 hover:bg-gray-50 transition-colors cursor-pointer">
        <h4 className="font-serif text-lg mb-2">{title}</h4>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </Link>
  );
}