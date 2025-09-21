import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/use-auth';
import { UserButton } from '@stackframe/react';
import { Menu, X, Home, Camera, User, CreditCard, LogOut, Shield } from 'lucide-react';

interface MemberNavigationProps {
  transparent?: boolean;
  darkText?: boolean;
}

export function MemberNavigation({ transparent = true, darkText = false }: MemberNavigationProps) {
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Ensure page starts at top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const isActive = (path: string) => {
    if (path === '/workspace' && (location === '/workspace' || location === '/studio')) return true;
    if (path !== '/workspace' && location.startsWith(path)) return true;
    return false;
  };

  // Check if user is admin (Sandra) or if we're in impersonation mode
  const isAdmin = user?.email === 'ssa@ssasocial.com';
  const isImpersonating = user?.email === 'shannon@soulresets.com' && user?.role === 'user';

  // Editorial Navigation Items with Icons
  const navItems = [
    { path: '/maya', label: 'Studio', icon: Home },
    { path: '/sselfie-gallery', label: 'Gallery', icon: Camera },
    { path: '/account-settings', label: 'Account', icon: User },
  ];

  const handleLogout = () => {
    window.location.href = '/api/auth/logout';
  };



  return (
    <nav 
      role="navigation" 
      aria-label="Main navigation"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-sophisticated ${
        scrolled || !transparent 
          ? 'bg-neutral-900/90 backdrop-blur-editorial border-b border-neutral-800/30 shadow-subtle' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-editorial-sm sm:px-editorial-md lg:px-editorial-lg py-editorial-sm">
        <div className="flex items-center justify-between">
            <button 
              onClick={(e) => {
                e.preventDefault();
                if (location === '/maya' || location === '/studio') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  setLocation("/maya");
                }
              }}
              aria-label="SSELFIE home page"
              className={`font-serif text-2xl font-extralight tracking-ultra-wide transition-all duration-500 ease-luxury hover:tracking-ultra-wide hover:scale-105 ${
                darkText 
                  ? 'text-black hover:text-neutral-700' 
                  : 'text-neutral-200 hover:text-white'
              }`}
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              SSELFIE
            </button>
          
          {/* Editorial Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-editorial-sm" role="menubar">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => setLocation(item.path)}
                  role="menuitem"
                  aria-current={isActive(item.path) ? 'page' : undefined}
                  aria-label={`Navigate to ${item.label}`}
                  className={`editorial-nav-item group flex items-center space-x-3 px-4 py-3 text-xs uppercase tracking-normal-wide font-extralight transition-all duration-500 ease-luxury rounded-xl ${
                    isActive(item.path)
                      ? `${
                          darkText 
                            ? 'text-black bg-neutral-200/15 border border-black/20 shadow-luxury' 
                            : 'text-neutral-200 bg-neutral-800/50 border border-neutral-200/20 shadow-luxury'
                        } transform scale-105`
                      : `${
                          darkText 
                            ? 'text-black/60 hover:text-black hover:bg-black/8 hover:scale-102' 
                            : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/30 hover:scale-102'
                        } hover:tracking-wide`
                  }`}
                >
                  <div className={`p-2 rounded-lg transition-all duration-500 ${
                    isActive(item.path) 
                      ? (darkText ? 'bg-black/10' : 'bg-neutral-700/50')
                      : 'group-hover:bg-neutral-700/30'
                  }`}>
                    <Icon 
                      size={16} 
                      strokeWidth={1.2}
                      className="transition-all duration-500 group-hover:scale-110" 
                    />
                  </div>
                  <span className="font-serif tracking-wide">{item.label}</span>
                </button>
              );
            })}

            {/* Editorial UserButton with Sophisticated Styling */}
            <div className="flex items-center editorial-scale-in" role="menuitem">
              <UserButton 
                showUserInfo={false}
                extraItems={[
                  {
                    text: 'Subscription & Billing',
                    icon: <CreditCard size={16} strokeWidth={1.5} />,
                    onClick: () => setLocation('/account-settings?tab=billing')
                  },
                  {
                    text: 'Business Profile', 
                    icon: <User size={16} strokeWidth={1.5} />,
                    onClick: () => setLocation('/profile')
                  }
                ]}
              />
            </div>

            {isImpersonating && (
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/admin/stop-impersonation', {
                      method: 'POST',
                      headers: { 
                        'Content-Type': 'application/json',
                        'x-admin-token': 'sandra-admin-2025'
                      }
                    });
                    if (response.ok) {
                      window.location.href = '/admin-dashboard';
                    }
                  } catch (error) {
                    console.error('Failed to stop impersonation:', error);
                  }
                }}
                aria-label="Stop impersonation and return to admin dashboard"
                className={`editorial-button-secondary flex items-center space-x-2 text-xs uppercase tracking-wide font-light transition-all duration-300 ease-sophisticated`}
              >
                <Shield size={14} strokeWidth={1.5} />
                <span>Back to Admin</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              aria-label="Logout from account"
              className={`editorial-button-secondary flex items-center space-x-3 text-xs uppercase tracking-normal-wide px-6 py-3 font-extralight transition-all duration-500 ease-luxury hover:scale-105 active:scale-95 rounded-xl border border-neutral-700/20 hover:border-neutral-600/30`}
            >
              <div className="p-1.5 bg-neutral-800/30 rounded-lg">
                <LogOut size={14} strokeWidth={1.2} />
              </div>
              <span className="font-serif tracking-wide">Logout</span>
            </button>
          </div>
          
          {/* Editorial Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            className={`md:hidden p-2 rounded-editorial-md transition-all duration-300 ease-sophisticated ${
              darkText 
                ? 'text-black/80 hover:text-black hover:bg-black/5' 
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/20'
            }`}
          >
            {mobileMenuOpen ? (
              <X size={20} strokeWidth={1.5} />
            ) : (
              <Menu size={20} strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>
      
      {/* Editorial Mobile Menu - Sophisticated Overlay */}
      {mobileMenuOpen && (
        <div 
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
          className="md:hidden fixed inset-0 z-[999] editorial-modal-overlay editorial-fade-in"
        >
          <div className="flex flex-col items-center justify-center h-full space-y-editorial-md px-editorial-md" role="menu">
            <div className="editorial-card bg-neutral-900/95 p-editorial-lg rounded-editorial-xl backdrop-blur-editorial-lg border border-neutral-800/50">
              <div className="flex flex-col space-y-editorial-sm">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        setLocation(item.path);
                        setMobileMenuOpen(false);
                      }}
                      role="menuitem"
                      aria-current={isActive(item.path) ? 'page' : undefined}
                      aria-label={`Navigate to ${item.label}`}
                      className={`editorial-nav-item flex items-center space-x-4 p-4 rounded-xl text-sm uppercase tracking-normal-wide font-extralight transition-all duration-500 ease-luxury ${
                        isActive(item.path)
                          ? 'text-neutral-200 bg-neutral-800/70 border border-neutral-700/30 transform scale-105'
                          : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40 hover:scale-102'
                      }`}
                    >
                      <div className={`p-2 rounded-lg transition-all duration-500 ${
                        isActive(item.path) 
                          ? 'bg-neutral-700/50'
                          : 'hover:bg-neutral-700/30'
                      }`}>
                        <Icon size={18} strokeWidth={1.2} />
                      </div>
                      <span className="font-serif tracking-wide">{item.label}</span>
                    </button>
                  );
                })}
                
                <div className="editorial-divider my-editorial-sm" />

                {isImpersonating && (
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/admin/stop-impersonation', {
                          method: 'POST',
                          headers: { 
                            'Content-Type': 'application/json',
                            'x-admin-token': 'sandra-admin-2025'
                          }
                        });
                        if (response.ok) {
                          window.location.href = '/admin-dashboard';
                        }
                      } catch (error) {
                        console.error('Failed to stop impersonation:', error);
                      }
                      setMobileMenuOpen(false);
                    }}
                    className="editorial-nav-item flex items-center space-x-4 p-editorial-sm rounded-editorial-md text-sm uppercase tracking-wide text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/30 transition-all duration-300 ease-sophisticated"
                  >
                    <Shield size={18} strokeWidth={1.5} />
                    <span>Back to Admin</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="editorial-nav-item flex items-center space-x-4 p-editorial-sm rounded-editorial-md text-sm uppercase tracking-wide text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/30 transition-all duration-300 ease-sophisticated"
                >
                  <LogOut size={18} strokeWidth={1.5} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
            
            {/* Editorial Close Button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-editorial-sm right-editorial-sm p-3 rounded-editorial-md text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/20 transition-all duration-300 ease-sophisticated"
              aria-label="Close navigation menu"
            >
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}