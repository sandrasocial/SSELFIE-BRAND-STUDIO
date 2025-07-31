import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

export function AdminNavigation() {
  const [, setLocation] = useLocation();
  const [currentAccount, setCurrentAccount] = useState('ssa@ssasocial.com');
  const [isLoading, setIsLoading] = useState(false);

  const accounts = [
    { email: 'ssa@ssasocial.com', label: 'SSA Admin' },
    { email: 'shannon@soulresets.com', label: 'Shannon' }
  ];

  const switchAccount = async (email: string) => {
    if (email === currentAccount || isLoading) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/switch-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (response.ok) {
        setCurrentAccount(email);
        // Reload to refresh session
        window.location.reload();
      }
    } catch (error) {
      console.error('Account switch failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setLocation("/")}
            className="font-serif text-xl font-light tracking-wide text-white hover:opacity-70 transition-opacity duration-300"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            SSELFIE ADMIN
          </button>
          
          <div className="hidden md:flex items-center space-x-6 lg:space-x-10">
            <button 
              onClick={() => setLocation("/workspace")}
              className="text-xs uppercase tracking-[0.4em] text-white/80 hover:text-white transition-all duration-300"
            >
              Workspace
            </button>
            <button 
              onClick={() => setLocation("/visual-editor")}
              className="text-xs uppercase tracking-[0.4em] text-white/80 hover:text-white transition-all duration-300"
            >
              Visual Editor
            </button>
            <button 
              onClick={() => setLocation("/analytics")}
              className="text-xs uppercase tracking-[0.4em] text-white/80 hover:text-white transition-all duration-300"
            >
              Analytics
            </button>
            
            {/* Elegant Account Switcher */}
            <div className="relative group">
              <div className="flex items-center space-x-2">
                <div className="w-px h-4 bg-white/20"></div>
                <div className="text-xs text-white/60" style={{ fontFamily: 'Times New Roman, serif' }}>
                  {accounts.find(acc => acc.email === currentAccount)?.label}
                </div>
                <button
                  onClick={() => {
                    const nextAccount = accounts.find(acc => acc.email !== currentAccount);
                    if (nextAccount) switchAccount(nextAccount.email);
                  }}
                  disabled={isLoading}
                  className="text-xs uppercase tracking-[0.4em] text-white/80 hover:text-white transition-all duration-300 disabled:opacity-50"
                  style={{ fontFamily: 'Times New Roman, serif' }}
                >
                  {isLoading ? '...' : '⇄'}
                </button>
                <div className="w-px h-4 bg-white/20"></div>
              </div>
              
              {/* Elegant Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap"
                   style={{ fontFamily: 'Times New Roman, serif' }}>
                Switch to {accounts.find(acc => acc.email !== currentAccount)?.label}
              </div>
            </div>

            <button
              onClick={() => setLocation('/api/logout')}
              className="text-xs uppercase tracking-[0.4em] text-white/80 hover:text-white transition-all duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}