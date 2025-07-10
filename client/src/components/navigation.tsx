import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { MobileMenu } from './mobile-menu';

export const Navigation: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => {
    if (path === '/' && location === '/') return true;
    if (path !== '/' && location.startsWith(path)) return true;
    return false;
  };

  // Check if user is admin (Sandra)
  const isAdmin = user?.email === 'ssa@ssasocial.com';

  // Member navigation - only authenticated pages
  const memberNavItems = [
    { path: '/workspace', label: 'STUDIO' },
    { path: '/ai-generator', label: 'AI GENERATOR' },
    { path: '/styleguide-demo', label: 'STYLEGUIDE' },
    { path: '/styleguide-landing-builder', label: 'LANDING PAGES' },
    { path: '/sandra-chat', label: 'SANDRA CHAT' },
    { path: '/profile', label: 'PROFILE' },
    ...(isAdmin ? [{ path: '/admin', label: 'ADMIN' }] : []),
  ];

  // Pre-login navigation - public pages
  const publicNavItems = [
    { path: '/about', label: 'About' },
    { path: '/how-it-works', label: 'How It Works' },
    { path: '/blog', label: 'Blog' },
    { path: '/pricing', label: 'Pricing' },
  ];

  const navItems = isAuthenticated ? memberNavItems : publicNavItems;

  const handleLogin = () => {
    // Use proper Replit Auth login endpoint
    window.location.href = '/api/login';
  };

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  if (isLoading) {
    return (
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/10 backdrop-blur-md' : 'bg-transparent'
      }`}>
        <div className="container-editorial">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="text-white text-xs sm:text-sm tracking-[0.3em] uppercase font-inter font-light">
              SSELFIE STUDIO
            </div>
            <div className="w-4 h-4 sm:w-6 sm:h-6 bg-white/20 animate-pulse"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/10 backdrop-blur-md' : 'bg-transparent'
      }`}>
        <div className="container-editorial">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link href="/">
              <div className="text-white text-xs sm:text-sm tracking-[0.3em] uppercase cursor-pointer font-inter font-light hover:opacity-80 transition-opacity">
                SSELFIE STUDIO
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="nav-mobile-hidden items-center space-x-8 lg:space-x-12">
              {navItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <span className={`text-white text-xs tracking-[0.2em] uppercase cursor-pointer transition-opacity font-inter font-light ${
                    isActive(item.path) ? 'opacity-100' : 'opacity-80 hover:opacity-100'
                  }`}>
                    {item.label}
                  </span>
                </Link>
              ))}
              
              {/* Auth Button */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  {user?.profileImageUrl && (
                    <img 
                      src={user.profileImageUrl} 
                      alt="Profile" 
                      className="w-6 h-6 lg:w-8 lg:h-8 object-cover"
                      style={{ objectFit: 'cover' }}
                    />
                  )}
                  <button 
                    onClick={handleLogout}
                    className="text-white text-xs tracking-[0.2em] uppercase opacity-80 hover:opacity-100 transition-opacity font-inter font-light"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleLogin}
                  className="text-white text-xs tracking-[0.2em] uppercase opacity-80 hover:opacity-100 transition-opacity font-inter font-light"
                >
                  Login
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="nav-desktop-hidden text-white text-xs tracking-[0.3em] uppercase hover:opacity-80 transition-opacity font-inter font-light"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              MENU
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        isAuthenticated={isAuthenticated}
        user={user}
      />
    </>
  );
};