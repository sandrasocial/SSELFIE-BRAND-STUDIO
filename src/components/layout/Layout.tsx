import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-times tracking-wider text-black">
                SSELFIE
              </h1>
            </div>
            <nav className="flex space-x-8">
              <a href="/app" className="text-gray-600 hover:text-black transition-colors">
                Dashboard
              </a>
              <a href="/chat" className="text-gray-600 hover:text-black transition-colors">
                Chat
              </a>
              <a href="/training" className="text-gray-600 hover:text-black transition-colors">
                Training
              </a>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default Layout;