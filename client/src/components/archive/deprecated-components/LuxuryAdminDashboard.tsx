import React from 'react';

const LuxuryAdminDashboard = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Luxury Editorial Header */}
      <header className="border-b border-gray-200 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-serif text-black tracking-wide">
            Sandra Command Center
          </h1>
          <p className="text-lg text-gray-600 mt-2 font-light">
            Business Dashboard & AI Agent Management
          </p>
        </div>
      </header>

      {/* Main Dashboard Grid */}
      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-12 gap-8">
          
          {/* Business Metrics Section */}
          <section className="col-span-12 lg:col-span-8">
            <h2 className="text-2xl font-serif text-black mb-8">Platform Analytics</h2>
            
            <div className="grid grid-cols-4 gap-6 mb-12">
              <div className="bg-gray-50 p-6 border border-gray-200">
                <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-2">Total Users</h3>
                <p className="text-3xl font-serif text-black">1,247</p>
              </div>
              <div className="bg-gray-50 p-6 border border-gray-200">
                <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-2">Revenue</h3>
                <p className="text-3xl font-serif text-black">€15,132</p>
              </div>
              <div className="bg-gray-50 p-6 border border-gray-200">
                <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-2">AI Images</h3>
                <p className="text-3xl font-serif text-black">8,543</p>
              </div>
              <div className="bg-gray-50 p-6 border border-gray-200">
                <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-2">Active Plans</h3>
                <p className="text-3xl font-serif text-black">342</p>
              </div>
            </div>

            {/* AI Agent Grid */}
            <h2 className="text-2xl font-serif text-black mb-8">AI Agent Team</h2>
            <div className="grid grid-cols-3 gap-6">
              
              <LuxuryAgentCard 
                name="Victoria"
                role="UX Designer AI"
                status="active"
                efficiency={94}
                tasks={45}
              />
              
              <LuxuryAgentCard 
                name="Maya"
                role="Dev AI"
                status="working"
                efficiency={98}
                tasks={123}
              />
              
              <LuxuryAgentCard 
                name="Rachel"
                role="Voice AI"
                status="active"
                efficiency={89}
                tasks={67}
              />
              
              <LuxuryAgentCard 
                name="Ava"
                role="Automation AI"
                status="active"
                efficiency={96}
                tasks={234}
              />
              
              <LuxuryAgentCard 
                name="Quinn"
                role="QA AI"
                status="monitoring"
                efficiency={92}
                tasks={78}
              />
              
              <LuxuryAgentCard 
                name="Sophia"
                role="Social Media AI"
                status="active"
                efficiency={87}
                tasks={156}
              />
              
            </div>
          </section>

          {/* Quick Actions Sidebar */}
          <aside className="col-span-12 lg:col-span-4">
            <h2 className="text-2xl font-serif text-black mb-8">Quick Actions</h2>
            
            <div className="space-y-4">
              <button className="w-full text-left p-4 border border-gray-200 hover:bg-gray-50 transition-colors">
                <h3 className="font-semibold text-black">Deploy Updates</h3>
                <p className="text-sm text-gray-600 mt-1">Push latest changes to production</p>
              </button>
              
              <button className="w-full text-left p-4 border border-gray-200 hover:bg-gray-50 transition-colors">
                <h3 className="font-semibold text-black">Monitor Training</h3>
                <p className="text-sm text-gray-600 mt-1">Check AI model training status</p>
              </button>
              
              <button className="w-full text-left p-4 border border-gray-200 hover:bg-gray-50 transition-colors">
                <h3 className="font-semibold text-black">Export Analytics</h3>
                <p className="text-sm text-gray-600 mt-1">Download platform performance data</p>
              </button>
            </div>
          </aside>
          
        </div>
      </main>
    </div>
  );
};

// Luxury Agent Card Component
interface LuxuryAgentCardProps {
  name: string;
  role: string;
  status: 'active' | 'working' | 'monitoring' | 'offline';
  efficiency: number;
  tasks: number;
}

const LuxuryAgentCard: React.FC<LuxuryAgentCardProps> = ({
  name, role, status, efficiency, tasks
}) => {
  const statusColors = {
    active: 'text-green-600',
    working: 'text-blue-600', 
    monitoring: 'text-yellow-600',
    offline: 'text-gray-400'
  };

  return (
    <div className="bg-white border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-serif text-black">{name}</h3>
          <p className="text-sm text-gray-600">{role}</p>
        </div>
        <span className={`text-xs uppercase tracking-wide ${statusColors[status]}`}>
          {status}
        </span>
      </div>
      
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Efficiency</span>
            <span className="text-black font-medium">{efficiency}%</span>
          </div>
          <div className="w-full bg-gray-200 h-1">
            <div 
              className="bg-black h-1 transition-all duration-300"
              style={{ width: `${efficiency}%` }}
            />
          </div>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tasks Completed</span>
          <span className="text-black font-medium">{tasks}</span>
        </div>
      </div>
      
      <button className="w-full mt-4 py-2 border border-gray-300 text-black text-sm hover:bg-gray-50 transition-colors">
        Open Chat Interface
      </button>
    </div>
  );
};

export default LuxuryAdminDashboard;