import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';

// Luxury Editorial Admin Dashboard by Aria
export default function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/stats');
      return res.json();
    }
  });

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      {/* Luxury Editorial Header */}
      <header className="border-b border-zinc-800 py-12">
        <div className="container mx-auto px-6">
          <h1 className="font-serif text-4xl tracking-[0.2em] text-white uppercase font-light">
            S S E L F I E
          </h1>
          <p className="mt-2 text-zinc-400 tracking-widest text-sm uppercase">Admin Studio</p>
        </div>
      </header>

      {/* Editorial Navigation */}
      <nav className="border-b border-zinc-800 bg-black">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-8">
            <Link href="/admin" className="text-zinc-100 tracking-widest text-sm uppercase hover:text-white">
              Dashboard
            </Link>
            <Link href="/admin/clients" className="text-zinc-500 tracking-widest text-sm uppercase hover:text-white">
              Clients
            </Link>
            <Link href="/admin/gallery" className="text-zinc-500 tracking-widest text-sm uppercase hover:text-white">
              Gallery
            </Link>
            <Link href="/admin/analytics" className="text-zinc-500 tracking-widest text-sm uppercase hover:text-white">
              Analytics
            </Link>
          </div>
        </div>
      </nav>

      {/* Luxury Stats Grid */}
      <section className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Active Clients Card */}
          <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="absolute top-0 right-0 p-4">
              <svg className="w-8 h-8 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="font-serif text-2xl text-white mb-1">{stats?.activeClients || '0'}</h3>
            <p className="text-zinc-400 text-sm tracking-widest uppercase">Active Clients</p>
          </div>

          {/* Monthly Revenue Card */}
          <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="absolute top-0 right-0 p-4">
              <svg className="w-8 h-8 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-serif text-2xl text-white mb-1">${stats?.monthlyRevenue || '0'}</h3>
            <p className="text-zinc-400 text-sm tracking-widest uppercase">Monthly Revenue</p>
          </div>

          {/* Total Photos Card */}
          <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="absolute top-0 right-0 p-4">
              <svg className="w-8 h-8 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-serif text-2xl text-white mb-1">{stats?.totalPhotos || '0'}</h3>
            <p className="text-zinc-400 text-sm tracking-widest uppercase">Total Photos</p>
          </div>

          {/* Conversion Rate Card */}
          <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="absolute top-0 right-0 p-4">
              <svg className="w-8 h-8 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="font-serif text-2xl text-white mb-1">{stats?.conversionRate || '0'}%</h3>
            <p className="text-zinc-400 text-sm tracking-widest uppercase">Conversion Rate</p>
          </div>
        </div>
      </section>

      {/* Recent Activity Section */}
      <section className="container mx-auto px-6 py-12">
        <h2 className="font-serif text-2xl text-white mb-8 tracking-widest">Recent Activity</h2>
        <div className="space-y-4">
          {/* Activity Item */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-serif text-lg">New Client Onboarded</h3>
                <p className="text-zinc-400 text-sm mt-1">Sarah Johnson - Premium Package</p>
              </div>
              <span className="text-zinc-500 text-sm">2 hours ago</span>
            </div>
          </div>

          {/* Activity Item */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-serif text-lg">Photoshoot Completed</h3>
                <p className="text-zinc-400 text-sm mt-1">Emma Smith - 45 photos delivered</p>
              </div>
              <span className="text-zinc-500 text-sm">5 hours ago</span>
            </div>
          </div>

          {/* Activity Item */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-serif text-lg">Package Upgraded</h3>
                <p className="text-zinc-400 text-sm mt-1">Michelle Davis - From Basic to Premium</p>
              </div>
              <span className="text-zinc-500 text-sm">1 day ago</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}