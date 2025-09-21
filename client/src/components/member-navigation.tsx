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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-sophisticated ${
        scrolled || !transparent ? 'editorial-glass' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={(e) => {
              e.preventDefault();
              // If already on maya/studio, just scroll to top instead of navigating
              if (location === '/maya' || location === '/studio') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                setLocation("/maya");
              }
            }}
            aria-label="SSELFIE home page"
            className={`editorial-headline text-xl font-light tracking-extra-wide ${darkText ? 'text-neutral-900' : 'text-neutral-200'} hover:opacity-70 transition-all duration-300 ease-sophisticated`}
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            SSELFIE
          </button>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8" role="menubar">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => setLocation(item.path)}
                role="menuitem"
                aria-current={isActive(item.path) ? 'page' : undefined}
                aria-label={`Navigate to ${item.label}`}
                className={`editorial-headline text-xs tracking-wide font-light transition-all duration-300 ease-sophisticated flex items-center gap-2 ${
                  isActive(item.path)
                    ? `${darkText ? 'text-neutral-900 border-b border-neutral-700/50' : 'text-neutral-200 border-b border-neutral-500/50'} pb-1`
                    : `${darkText ? 'text-neutral-600 hover:text-neutral-900' : 'text-neutral-400 hover:text-neutral-200'} hover:tracking-extra-wide`
                }`}
              >
                <item.icon size={16} strokeWidth={1.2} />
                {item.label}
              </button>
            ))}

            {/* Stack Auth UserButton with Editorial Luxury styling */}
            <div className="flex items-center" role="menuitem">
              <UserButton 
                showUserInfo={false}
                extraItems={[
                  {
                    text: 'Subscription & Billing',
                    icon: <CreditCard size={16} strokeWidth={1.2} />,
                    onClick: () => setLocation('/account-settings?tab=billing')
                  },
                  {
                    text: 'Business Profile', 
                    icon: <User size={16} strokeWidth={1.2} />,
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
                className={`editorial-headline text-xs tracking-wide font-light ${darkText ? 'text-neutral-600 hover:text-neutral-900' : 'text-neutral-400 hover:text-neutral-200'} hover:tracking-extra-wide transition-all duration-300 ease-sophisticated flex items-center gap-2`}
              >
                <Shield size={16} strokeWidth={1.2} />
                Back to Admin
              </button>
            )}

            <button
              onClick={handleLogout}
              aria-label="Logout from account"
              className={`editorial-headline text-xs tracking-wide px-6 py-2 font-light transition-all duration-300 ease-sophisticated rounded-xl flex items-center gap-2 ${
                darkText 
                  ? 'text-neutral-900 border border-neutral-300 hover:bg-neutral-900 hover:text-neutral-200' 
                  : 'text-neutral-200 border border-neutral-600/30 hover:bg-neutral-200 hover:text-neutral-900'
              }`}
            >
              <LogOut size={16} strokeWidth={1.2} />
              LOGOUT
            </button>
          </div>
          
          {/* Mobile Menu Button - Editorial luxury styling */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            className={`md:hidden editorial-headline text-xs tracking-extra-wide ${darkText ? 'text-neutral-600 hover:text-neutral-900' : 'text-neutral-400 hover:text-neutral-200'} transition-all duration-300 ease-sophisticated p-2 rounded-lg`}
          >
            {mobileMenuOpen ? (
              <X size={20} strokeWidth={1.5} />
            ) : (
              <Menu size={20} strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>
      
      {/* Editorial Mobile Menu - Sophisticated overlay */}
      {mobileMenuOpen && (
        <div 
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
          className="md:hidden fixed top-0 left-0 right-0 bottom-0 z-[999] editorial-glass"
          style={{ background: 'rgba(0, 0, 0, 0.97)' }}
        >
          <div className="flex flex-col items-center justify-center h-full space-y-8 px-6" role="menu">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  setLocation(item.path);
                  setMobileMenuOpen(false);
                }}
                role="menuitem"
                aria-current={isActive(item.path) ? 'page' : undefined}
                aria-label={`Navigate to ${item.label}`}
                className={`editorial-headline text-sm tracking-extra-wide transition-all duration-300 ease-sophisticated flex items-center gap-3 ${
                  isActive(item.path)
                    ? 'text-neutral-200'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <item.icon size={18} strokeWidth={1.2} />
                {item.label}
              </button>
            ))}

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
                className="editorial-headline text-sm tracking-extra-wide text-neutral-400 hover:text-neutral-200 transition-all duration-300 ease-sophisticated mt-8 flex items-center gap-3"
              >
                <Shield size={18} strokeWidth={1.2} />
                Back to Admin
              </button>
            )}

            <button
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="editorial-headline text-sm tracking-extra-wide text-neutral-400 hover:text-neutral-200 transition-all duration-300 ease-sophisticated mt-8 flex items-center gap-3"
            >
              <LogOut size={18} strokeWidth={1.2} />
              LOGOUT
            </button>
            
            {/* Close button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-6 right-6 editorial-headline text-xs tracking-extra-wide text-neutral-400 hover:text-neutral-200 transition-all duration-300 ease-sophisticated p-2 rounded-lg"
            >
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}