// /client/src/components/admin/AdminHero.tsx
import { FC } from 'react';

interface AdminHeroProps {
  userName: string;
  dashboardStats?: {
    totalUsers: number;
    activeProjects: number;
    revenue: string;
  };
}

export const AdminHero: FC<AdminHeroProps> = ({ userName, dashboardStats }) => {
  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-neutral-900 via-neutral-800 to-black overflow-hidden">
      {/* Background Pattern - Coordinated by Aria */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0id2hpdGUiLz4KPC9zdmc+')] opacity-30"></div>
      </div>
      
      {/* Hero Content - Strategic Layout */}
      <div className="relative z-10 h-full flex items-center justify-between px-12">
        {/* Left: Welcome Message */}
        <div className="flex-1">
          <h1 className="font-['Times_New_Roman'] text-6xl font-bold text-white mb-4 tracking-tight">
            Welcome Back,
            <span className="block text-amber-400 mt-2">Sandra</span>
          </h1>
          <p className="font-['Times_New_Roman'] text-xl text-neutral-300 max-w-2xl leading-relaxed">
            Your SSELFIE Studio empire continues to grow. 
            <span className="text-amber-400"> Luxury meets innovation</span> in every detail.
          </p>
        </div>
        
        {/* Right: Dashboard Stats - Coordinated by Zara */}
        {dashboardStats && (
          <div className="flex-shrink-0 ml-12">
            <div className="grid grid-cols-1 gap-6 text-right">
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                <div className="text-3xl font-bold text-amber-400 font-['Times_New_Roman']">
                  {dashboardStats.totalUsers.toLocaleString()}
                </div>
                <div className="text-neutral-300 text-sm uppercase tracking-widest mt-1">
                  Total Users
                </div>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                <div className="text-3xl font-bold text-amber-400 font-['Times_New_Roman']">
                  {dashboardStats.activeProjects}
                </div>
                <div className="text-neutral-300 text-sm uppercase tracking-widest mt-1">
                  Active Projects
                </div>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                <div className="text-3xl font-bold text-amber-400 font-['Times_New_Roman']">
                  {dashboardStats.revenue}
                </div>
                <div className="text-neutral-300 text-sm uppercase tracking-widest mt-1">
                  Monthly Revenue
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-neutral-50 to-transparent"></div>
    </div>
  );
};