import { useState, useEffect } from "react";
import { useLocation } from "wouter";

interface PreLoginNavigationProps {
  transparent?: boolean;
}

export function PreLoginNavigation({ transparent = true }: PreLoginNavigationProps) {
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
            <button
              onClick={() => window.location.href = '/api/login'}
              className="text-xs uppercase tracking-[0.4em] text-white/80 hover:text-white transition-all duration-300"
            >
              Login
            </button>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white hover:opacity-70 transition-opacity duration-300"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <div className={`w-full h-0.5 bg-white transition-all duration-300 ${
                mobileMenuOpen ? 'rotate-45 translate-y-2' : ''
              }`}></div>
              <div className={`w-full h-0.5 bg-white transition-all duration-300 ${
                mobileMenuOpen ? 'opacity-0' : ''
              }`}></div>
              <div className={`w-full h-0.5 bg-white transition-all duration-300 ${
                mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
              }`}></div>
            </div>
          </button>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-6 pb-4 border-t border-white/20">
            <div className="pt-4 space-y-4">
              <button 
                onClick={() => {
                  setLocation("/about");
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left text-sm uppercase tracking-[0.3em] text-white/80 hover:text-white transition-all duration-300"
              >
                About
              </button>
              <button 
                onClick={() => {
                  setLocation("/how-it-works");
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left text-sm uppercase tracking-[0.3em] text-white/80 hover:text-white transition-all duration-300"
              >
                How It Works
              </button>
              <button 
                onClick={() => {
                  setLocation("/pricing");
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left text-sm uppercase tracking-[0.3em] text-white/80 hover:text-white transition-all duration-300"
              >
                Pricing
              </button>
              <button 
                onClick={() => {
                  setLocation("/blog");
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left text-sm uppercase tracking-[0.3em] text-white/80 hover:text-white transition-all duration-300"
              >
                Blog
              </button>
              <button
                onClick={() => {
                  window.location.href = '/api/login';
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left text-sm uppercase tracking-[0.3em] text-white/80 hover:text-white transition-all duration-300"
              >
                Login
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}