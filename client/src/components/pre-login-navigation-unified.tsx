import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { InstallButton } from '@/components/ui/install-button';

interface PreLoginNavigationUnifiedProps {
  transparent?: boolean;
}

export function PreLoginNavigationUnified({ transparent = true }: PreLoginNavigationUnifiedProps) {
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled || !transparent ? 'bg-black/80 backdrop-blur-md' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setLocation("/")}
            className="font-serif text-xl font-light tracking-wide text-white hover:opacity-70 transition-opacity duration-300"
          >
            SSELFIE
          </button>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-10">
            <button 
              onClick={() => setLocation("/about")}
              className="text-xs uppercase tracking-[0.4em] text-white/80 hover:text-white transition-all duration-300"
            >
              About
            </button>
            <button 
              onClick={() => setLocation("/how-it-works")}
              className="text-xs uppercase tracking-[0.4em] text-white/80 hover:text-white transition-all duration-300"
            >
              How It Works
            </button>
            <button 
              onClick={() => setLocation("/pricing")}
              className="text-xs uppercase tracking-[0.4em] text-white/80 hover:text-white transition-all duration-300"
            >
              Pricing
            </button>
            <button 
              onClick={() => setLocation("/blog")}
              className="text-xs uppercase tracking-[0.4em] text-white/80 hover:text-white transition-all duration-300"
            >
              Blog
            </button>
            <InstallButton 
              variant="minimal" 
              className="text-xs uppercase tracking-[0.4em] text-white/80 hover:text-white no-underline"
            />
            <button
              onClick={() => setLocation('/login')}
              className="text-xs uppercase tracking-[0.4em] text-white/80 hover:text-white transition-all duration-300"
            >
              Login
            </button>
          </div>
          
          {/* Mobile Menu Button - Minimalistic MENU text */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-xs uppercase tracking-[0.4em] text-white/80 hover:text-white transition-all duration-300"
          >
            MENU
          </button>
        </div>
      </div>
      
      {/* Mobile Menu - Minimalistic Black Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-0 left-0 right-0 bottom-0 z-[999] bg-black/95 backdrop-blur-md">
          <div className="flex flex-col items-center justify-center h-full space-y-8 px-6">
            <button 
              onClick={() => {
                setLocation("/about");
                setMobileMenuOpen(false);
              }}
              className="text-sm uppercase tracking-[0.4em] text-white/70 hover:text-white transition-all duration-300"
            >
              About
            </button>
            <button 
              onClick={() => {
                setLocation("/how-it-works");
                setMobileMenuOpen(false);
              }}
              className="text-sm uppercase tracking-[0.4em] text-white/70 hover:text-white transition-all duration-300"
            >
              How It Works
            </button>
            <button 
              onClick={() => {
                setLocation("/pricing");
                setMobileMenuOpen(false);
              }}
              className="text-sm uppercase tracking-[0.4em] text-white/70 hover:text-white transition-all duration-300"
            >
              Pricing
            </button>
            <button 
              onClick={() => {
                setLocation("/blog");
                setMobileMenuOpen(false);
              }}
              className="text-sm uppercase tracking-[0.4em] text-white/70 hover:text-white transition-all duration-300"
            >
              Blog
            </button>
            <button
              onClick={() => {
                setLocation('/login');
                setMobileMenuOpen(false);
              }}
              className="text-sm uppercase tracking-[0.4em] text-white/70 hover:text-white transition-all duration-300 mt-8"
            >
              Login
            </button>
            
            {/* Close button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-6 right-6 text-xs uppercase tracking-[0.4em] text-white/80 hover:text-white transition-all duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}