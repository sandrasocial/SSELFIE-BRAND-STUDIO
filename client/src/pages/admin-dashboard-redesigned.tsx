import React from 'react';
import QuickAccessPanel from '@/components/QuickAccessPanel';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header - Editorial Masthead Style */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-light tracking-tight text-black uppercase" 
                  style={{ fontFamily: 'Times New Roman, serif' }}>
                SSELFIE STUDIO
              </h1>
              <p className="mt-2 text-sm font-light text-gray-600 tracking-wide">
                CREATIVE COMMAND CENTER
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => window.open('/', '_blank')}
                className="px-6 py-3 bg-gray-100 text-black border border-gray-300 hover:bg-gray-200 transition-colors"
              >
                Open Full Preview
              </button>
              <button
                onClick={() => window.location.href = '/visual-editor'}
                className="px-6 py-3 bg-black text-white border border-black hover:bg-gray-800 transition-colors"
              >
                Visual Editor
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Grid - Gallery Layout */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Stats Panel - Minimalist Cards */}
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-50 p-8 border border-gray-200">
                <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">
                  TOTAL USERS
                </h3>
                <div className="text-3xl font-light text-black" 
                     style={{ fontFamily: 'Times New Roman, serif' }}>
                  2,847
                </div>
              </div>
              
              <div className="bg-gray-50 p-8 border border-gray-200">
                <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">
                  ACTIVE SUBSCRIPTIONS
                </h3>
                <div className="text-3xl font-light text-black" 
                     style={{ fontFamily: 'Times New Roman, serif' }}>
                  1,203
                </div>
              </div>
              
              <div className="bg-gray-50 p-8 border border-gray-200">
                <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">
                  REVENUE TODAY
                </h3>
                <div className="text-3xl font-light text-black" 
                     style={{ fontFamily: 'Times New Roman, serif' }}>
                  €4,720
                </div>
              </div>
            </div>

            {/* Recent Activity - Editorial List */}
            <div className="bg-white border border-gray-200 p-8">
              <h2 className="text-2xl font-light mb-8 text-black uppercase tracking-wide" 
                  style={{ fontFamily: 'Times New Roman, serif' }}>
                Recent Transformations
              </h2>
              
              <div className="space-y-6">
                {[
                  { name: 'Sarah M.', action: 'Launched personal brand', time: '2 hours ago' },
                  { name: 'Emma K.', action: 'Generated AI photoshoot', time: '4 hours ago' },
                  { name: 'Lisa R.', action: 'Upgraded to Studio', time: '6 hours ago' },
                  { name: 'Anna B.', action: 'Created luxury website', time: '8 hours ago' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
                    <div>
                      <div className="font-light text-black">{item.name}</div>
                      <div className="text-sm text-gray-500">{item.action}</div>
                    </div>
                    <div className="text-xs text-gray-400 uppercase tracking-widest">
                      {item.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions - Luxury Sidebar */}
          <div className="space-y-8">
            <div className="bg-black text-white p-8">
              <h3 className="text-xl font-light mb-6 uppercase tracking-wide" 
                  style={{ fontFamily: 'Times New Roman, serif' }}>
                Quick Actions
              </h3>
              
              <div className="space-y-4">
                <button className="w-full text-left py-3 px-4 bg-white bg-opacity-10 hover:bg-opacity-20 transition-all duration-200 border border-white border-opacity-20">
                  <div className="text-sm font-light">Send Weekly Newsletter</div>
                </button>
                
                <button className="w-full text-left py-3 px-4 bg-white bg-opacity-10 hover:bg-opacity-20 transition-all duration-200 border border-white border-opacity-20">
                  <div className="text-sm font-light">Review User Feedback</div>
                </button>
                
                <button className="w-full text-left py-3 px-4 bg-white bg-opacity-10 hover:bg-opacity-20 transition-all duration-200 border border-white border-opacity-20">
                  <div className="text-sm font-light">Update AI Models</div>
                </button>
                
                <button className="w-full text-left py-3 px-4 bg-white bg-opacity-10 hover:bg-opacity-20 transition-all duration-200 border border-white border-opacity-20">
                  <div className="text-sm font-light">Analyze Growth Metrics</div>
                </button>
              </div>
            </div>

            {/* Inspiration Quote - Sandra's Voice */}
            <div className="bg-gray-50 p-8 border border-gray-200">
              <blockquote className="text-lg font-light italic text-black leading-relaxed" 
                          style={{ fontFamily: 'Times New Roman, serif' }}>
                "Your phone + My strategy = Your empire"
              </blockquote>
              <div className="mt-4 text-xs uppercase tracking-widest text-gray-500">
                — SANDRA'S PHILOSOPHY
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Panel */}
      <QuickAccessPanel />
    </div>
  );
}