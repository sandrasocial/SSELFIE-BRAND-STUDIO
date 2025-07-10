import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';

export function EnhancedNavigation() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check user's subscription status for navigation
  const { data: subscription } = useQuery({
    queryKey: ['/api/subscription'],
    enabled: isAuthenticated,
    retry: 1
  });

  const hasValidSubscription = subscription && subscription.status === 'active';

  // Pre-login navigation items
  const preLoginItems = [
    { href: '/about', label: 'About' },
    { href: '/how-it-works', label: 'How It Works' },
    { href: '/blog', label: 'Journal' },
    { href: '/pricing', label: 'Pricing' },
  ];

  // Member navigation items (show for authenticated users, admin gets full access)
  const memberItems = (hasValidSubscription || user?.email === 'ssa@ssasocial.com') ? [
    { href: '/workspace', label: 'STUDIO' },
    { href: '/ai-generator', label: 'AI Generator' },
    { href: '/sandra-chat', label: 'Sandra Chat' },
    { href: '/brandbook-designer', label: 'Brandbook' },
    { href: '/landing-builder', label: 'Landing Pages' },
    { href: '/profile', label: 'Profile' },
  ] : [];

  // Admin navigation items (only for Sandra)
  const adminItems = user?.email === 'ssa@ssasocial.com' ? [
    { href: '/admin', label: 'Admin Dashboard' },
    { href: '/admin/progress', label: 'Progress' },
    { href: '/admin/roadmap', label: 'Roadmap' },
    { href: '/sandbox', label: 'Agent Sandbox' },
  ] : [];

  const navigationItems = isAuthenticated ? [...memberItems, ...adminItems] : preLoginItems;

  const isActiveLink = (href: string) => {
    if (href === '/') return location === '/';
    return location.startsWith(href);
  };

  return (
    <nav className="bg-white border-b border-[#e5e5e5] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href={isAuthenticated ? '/workspace' : '/'}>
            <div className="text-2xl font-light text-[#0a0a0a]" style={{ fontFamily: 'Times New Roman, serif' }}>
              SSELFIE
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <span className={`text-xs uppercase tracking-wider transition-colors ${
                  isActiveLink(item.href) 
                    ? 'text-[#0a0a0a] border-b border-[#0a0a0a] pb-1' 
                    : 'text-[#666666] hover:text-[#0a0a0a]'
                }`}>
                  {item.label}
                </span>
              </Link>
            ))}
            
            {/* Authentication Links */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-6">
                <div className="text-xs text-[#666666]">
                  {user?.firstName || 'Member'}
                </div>
                <a
                  href="/api/logout"
                  className="text-xs uppercase tracking-wider text-[#666666] hover:text-[#0a0a0a] transition-colors"
                >
                  Logout
                </a>
              </div>
            ) : (
              <div className="flex items-center space-x-6">
                <a
                  href="/api/login"
                  className="text-xs uppercase tracking-wider text-[#666666] hover:text-[#0a0a0a] transition-colors"
                >
                  Sign In
                </a>
                <Link href="/pricing">
                  <span className="bg-[#0a0a0a] text-white px-6 py-2 text-xs uppercase tracking-wider hover:bg-[#333] transition-colors">
                    Get Started
                  </span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-[#0a0a0a]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <span className={`block w-6 h-0.5 bg-[#0a0a0a] transition-all duration-300 ${
                isMobileMenuOpen ? 'rotate-45 translate-y-0.5' : ''
              }`} />
              <span className={`block w-6 h-0.5 bg-[#0a0a0a] mt-1 transition-all duration-300 ${
                isMobileMenuOpen ? 'opacity-0' : ''
              }`} />
              <span className={`block w-6 h-0.5 bg-[#0a0a0a] mt-1 transition-all duration-300 ${
                isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
              }`} />
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-[#e5e5e5] py-4">
            <div className="space-y-4">
              {navigationItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <span 
                    className={`block text-xs uppercase tracking-wider transition-colors ${
                      isActiveLink(item.href) 
                        ? 'text-[#0a0a0a]' 
                        : 'text-[#666666]'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
              
              {/* Mobile Authentication Links */}
              {isAuthenticated ? (
                <div className="pt-4 border-t border-[#e5e5e5]">
                  <div className="text-xs text-[#666666] mb-2">
                    {user?.firstName || 'Member'}
                  </div>
                  <a
                    href="/api/logout"
                    className="block text-xs uppercase tracking-wider text-[#666666]"
                  >
                    Logout
                  </a>
                </div>
              ) : (
                <div className="pt-4 border-t border-[#e5e5e5] space-y-2">
                  <a
                    href="/api/login"
                    className="block text-xs uppercase tracking-wider text-[#666666]"
                  >
                    Sign In
                  </a>
                  <Link href="/pricing">
                    <span className="block bg-[#0a0a0a] text-white px-4 py-2 text-xs uppercase tracking-wider text-center">
                      Get Started
                    </span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}