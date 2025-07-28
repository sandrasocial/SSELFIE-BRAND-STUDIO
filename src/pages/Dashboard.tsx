import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-times font-light text-black mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your SSELFIE Studio and track your brand growth
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              AI Images Generated
            </h3>
            <p className="text-2xl font-light text-black mt-2">47</p>
          </div>
          
          <div className="bg-white p-6 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Brand Assets
            </h3>
            <p className="text-2xl font-light text-black mt-2">12</p>
          </div>
          
          <div className="bg-white p-6 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Studio Projects
            </h3>
            <p className="text-2xl font-light text-black mt-2">3</p>
          </div>
          
          <div className="bg-white p-6 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Active Campaigns
            </h3>
            <p className="text-2xl font-light text-black mt-2">8</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-gray-200 p-8">
          <h2 className="text-xl font-medium text-black mb-6">Quick Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a
              href="/training"
              className="block p-6 border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-medium text-black mb-2">Train New Model</h3>
              <p className="text-gray-600 text-sm">
                Upload selfies to create your personalized AI model
              </p>
            </a>
            
            <a
              href="/chat"
              className="block p-6 border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-medium text-black mb-2">Chat with AI</h3>
              <p className="text-gray-600 text-sm">
                Get help from Sandra, Zara, or Maya AI assistants
              </p>
            </a>
            
            <a
              href="/activity"
              className="block p-6 border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-medium text-black mb-2">View Activity</h3>
              <p className="text-gray-600 text-sm">
                Track your AI agents and system performance
              </p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;