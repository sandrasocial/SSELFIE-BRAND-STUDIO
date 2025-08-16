import { FC } from 'react';
interface DashboardHeroProps {
  totalUsers: number;
  totalRevenue: number;
  premiumUsers: number;
  monthlyGrowth: number;
}

export const DashboardHero: FC<DashboardHeroProps> = ({
  totalUsers,
  totalRevenue,
  premiumUsers,
  monthlyGrowth
}) => {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-8 py-16">
        {/* Hero Header */}
        <div className="mb-16">
          <h1 className="text-6xl font-normal text-black mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
            SSELFIE Studio
          </h1>
          <p className="text-2xl text-gray-600 font-light leading-relaxed max-w-2xl">
            Administrative Dashboard
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Total Users */}
          <div className="bg-gray-50 p-8 border border-gray-200">
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-2">
                Total Users
              </h3>
              <p className="text-4xl font-light text-black" style={{ fontFamily: 'Times New Roman, serif' }}>
                {totalUsers.toLocaleString()}
              </p>
            </div>
            <div className="text-sm text-gray-600">
              Active community members
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-gray-50 p-8 border border-gray-200">
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-2">
                Total Revenue
              </h3>
              <p className="text-4xl font-light text-black" style={{ fontFamily: 'Times New Roman, serif' }}>
                €{totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="text-sm text-gray-600">
              Platform earnings
            </div>
          </div>

          {/* Premium Users */}
          <div className="bg-gray-50 p-8 border border-gray-200">
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-2">
                Premium Users
              </h3>
              <p className="text-4xl font-light text-black" style={{ fontFamily: 'Times New Roman, serif' }}>
                {premiumUsers.toLocaleString()}
              </p>
            </div>
            <div className="text-sm text-gray-600">
              FLUX Pro subscribers
            </div>
          </div>

          {/* Monthly Growth */}
          <div className="bg-gray-50 p-8 border border-gray-200">
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-2">
                Monthly Growth
              </h3>
              <p className="text-4xl font-light text-black" style={{ fontFamily: 'Times New Roman, serif' }}>
                {monthlyGrowth > 0 ? '+' : ''}{monthlyGrowth}%
              </p>
            </div>
            <div className="text-sm text-gray-600">
              User acquisition rate
            </div>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="mt-16 pt-16 border-t border-gray-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-3xl font-light text-black mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
                Platform Overview
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                SSELFIE Studio serves as the luxury AI-powered personal branding platform, 
                transforming how female entrepreneurs build their businesses through innovative 
                FLUX Pro technology.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-light text-black mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
                System Status
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">AI Training System</span>
                  <span className="text-green-600 font-medium">Operational</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">FLUX Pro Generation</span>
                  <span className="text-green-600 font-medium">Operational</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment Processing</span>
                  <span className="text-green-600 font-medium">Operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHero;