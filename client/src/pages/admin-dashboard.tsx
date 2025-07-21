import { useQuery } from "@tanstack/react-query";
import AdminHeroSection from '@/components/admin/AdminHeroSection';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalSessions: number;
  conversionRate: number;
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json() as AdminStats;
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white font-times text-xl tracking-wider">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Aria's Luxury AdminHeroSection Component */}
      <AdminHeroSection 
        title="SSELFIE Studio Empire"
        subtitle="From Rock Bottom to Revenue Revolution"
        description="Transform your vision into a luxury business empire through strategic design, editorial storytelling, and uncompromising excellence."
      />

      {/* Gallery-Style Statistics */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="font-times text-4xl md:text-5xl font-light tracking-wider mb-6">
            PERFORMANCE GALLERY
          </h2>
          <div className="w-16 h-[1px] bg-white mx-auto"></div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
          {/* Total Users Card */}
          <div className="group border border-white/20 hover:border-white/40 transition-all duration-300">
            <div className="p-12 bg-black">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="text-white/40 font-times text-xs uppercase tracking-[0.3em]">
                    USERS
                  </div>
                  <div className="w-8 h-[1px] bg-white/40"></div>
                </div>
                <h3 className="font-times text-sm tracking-[0.2em] text-white/60 uppercase">
                  Total Users
                </h3>
                <p className="font-times text-5xl font-extralight tracking-wider text-white leading-none">
                  {stats?.totalUsers?.toLocaleString() || '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Active Users Card */}
          <div className="group border border-white/20 hover:border-white/40 transition-all duration-300">
            <div className="p-12 bg-black">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="text-white/40 font-times text-xs uppercase tracking-[0.3em]">
                    ACTIVE
                  </div>
                  <div className="w-8 h-[1px] bg-white/40"></div>
                </div>
                <h3 className="font-times text-sm tracking-[0.2em] text-white/60 uppercase">
                  Active Users
                </h3>
                <p className="font-times text-5xl font-extralight tracking-wider text-white leading-none">
                  {stats?.activeUsers?.toLocaleString() || '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Total Revenue Card */}
          <div className="group border border-white/20 hover:border-white/40 transition-all duration-300">
            <div className="p-12 bg-black">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="text-white/40 font-times text-xs uppercase tracking-[0.3em]">
                    REVENUE
                  </div>
                  <div className="w-8 h-[1px] bg-white/40"></div>
                </div>
                <h3 className="font-times text-sm tracking-[0.2em] text-white/60 uppercase">
                  Total Revenue
                </h3>
                <p className="font-times text-5xl font-extralight tracking-wider text-white leading-none">
                  ${stats?.totalRevenue?.toLocaleString() || '0'}
                </p>
              </div>
            </div>
          </div>

          {/* Monthly Revenue Card */}
          <div className="group border border-white/20 hover:border-white/40 transition-all duration-300">
            <div className="p-12 bg-black">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="text-white/40 font-times text-xs uppercase tracking-[0.3em]">
                    MONTHLY
                  </div>
                  <div className="w-8 h-[1px] bg-white/40"></div>
                </div>
                <h3 className="font-times text-sm tracking-[0.2em] text-white/60 uppercase">
                  Monthly Revenue
                </h3>
                <p className="font-times text-5xl font-extralight tracking-wider text-white leading-none">
                  ${stats?.monthlyRevenue?.toLocaleString() || '0'}
                </p>
              </div>
            </div>
          </div>

          {/* Total Sessions Card */}
          <div className="group border border-white/20 hover:border-white/40 transition-all duration-300">
            <div className="p-12 bg-black">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="text-white/40 font-times text-xs uppercase tracking-[0.3em]">
                    SESSIONS
                  </div>
                  <div className="w-8 h-[1px] bg-white/40"></div>
                </div>
                <h3 className="font-times text-sm tracking-[0.2em] text-white/60 uppercase">
                  Total Sessions
                </h3>
                <p className="font-times text-5xl font-extralight tracking-wider text-white leading-none">
                  {stats?.totalSessions?.toLocaleString() || '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Conversion Rate Card */}
          <div className="group border border-white/20 hover:border-white/40 transition-all duration-300">
            <div className="p-12 bg-black">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="text-white/40 font-times text-xs uppercase tracking-[0.3em]">
                    CONVERSION
                  </div>
                  <div className="w-8 h-[1px] bg-white/40"></div>
                </div>
                <h3 className="font-times text-sm tracking-[0.2em] text-white/60 uppercase">
                  Conversion Rate
                </h3>
                <p className="font-times text-5xl font-extralight tracking-wider text-white leading-none">
                  {stats?.conversionRate || 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Navigation Section */}
      <section className="py-24 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-times text-4xl md:text-5xl font-light tracking-wider mb-6">
              MANAGEMENT SUITE
            </h2>
            <div className="w-16 h-[1px] bg-white mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <button className="group p-8 bg-gradient-to-br from-gray-900 to-black border border-gray-800 hover:border-white/20 transition-all duration-500 text-left">
              <h3 className="font-times text-xl font-light tracking-wider mb-4 group-hover:text-white/90">
                User Management
              </h3>
              <p className="text-white/60 font-times text-sm tracking-wide">
                Curate your community
              </p>
            </button>

            <button className="group p-8 bg-gradient-to-br from-gray-900 to-black border border-gray-800 hover:border-white/20 transition-all duration-500 text-left">
              <h3 className="font-times text-xl font-light tracking-wider mb-4 group-hover:text-white/90">
                Content Studio
              </h3>
              <p className="text-white/60 font-times text-sm tracking-wide">
                Editorial excellence
              </p>
            </button>

            <button className="group p-8 bg-gradient-to-br from-gray-900 to-black border border-gray-800 hover:border-white/20 transition-all duration-500 text-left">
              <h3 className="font-times text-xl font-light tracking-wider mb-4 group-hover:text-white/90">
                Analytics Deep Dive
              </h3>
              <p className="text-white/60 font-times text-sm tracking-wide">
                Performance insights
              </p>
            </button>

            <button className="group p-8 bg-gradient-to-br from-gray-900 to-black border border-gray-800 hover:border-white/20 transition-all duration-500 text-left">
              <h3 className="font-times text-xl font-light tracking-wider mb-4 group-hover:text-white/90">
                Agent Command
              </h3>
              <p className="text-white/60 font-times text-sm tracking-wide">
                AI coordination center
              </p>
            </button>
          </div>
        </div>
      </section>

      {/* Editorial Footer */}
      <footer className="py-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="w-12 h-[1px] bg-white/40 mx-auto mb-8"></div>
          <p className="font-times text-white/40 text-sm tracking-[0.2em] uppercase">
            SSELFIE STUDIO EMPIRE COMMAND CENTER
          </p>
        </div>
      </footer>
    </div>
  );
}