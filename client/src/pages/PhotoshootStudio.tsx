import React from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';

export default function PhotoshootStudio() {
  const [, navigate] = useLocation();

  // Get user data
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['/api/photoshoot/user'],
    retry: false,
  });

  // Get training status (mock for now)
  const { data: trainingStatus } = useQuery({
    queryKey: ['/api/photoshoot/training-status'],
    retry: false,
  });

  // Get gallery count
  const { data: gallery } = useQuery({
    queryKey: ['/api/photoshoot/gallery'],
    retry: false,
  });

  const handleLogout = async () => {
    try {
      await fetch('/api/photoshoot/logout', { method: 'POST' });
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm tracking-[0.3em] uppercase font-light">Loading studio...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-8 py-5 flex justify-between items-center">
          <div className="font-serif text-xl font-light tracking-wide">SSELFIE</div>
          <div className="flex items-center gap-8">
            <div className="text-xs tracking-[0.4em] uppercase text-gray-500 font-light">
              Studio
            </div>
            <button
              onClick={handleLogout}
              className="text-xs tracking-[0.3em] uppercase font-light hover:opacity-60 transition-opacity"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Dashboard */}
      <section className="relative min-h-[60vh] flex items-center justify-center bg-black text-white overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 opacity-30">
          <img 
            src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=1600&h=1200&fit=crop&crop=face" 
            alt="Studio dashboard" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center px-8">
          <div className="text-xs tracking-[0.4em] uppercase text-white/70 mb-10 font-light">
            Welcome back, {user.firstName || 'Creator'}
          </div>
          
          <h1 className="font-serif font-extralight tracking-[0.5em] uppercase mb-8 leading-none text-[clamp(3rem,8vw,8rem)]">
            Your Studio
          </h1>
          
          <div className="text-base tracking-[0.1em] uppercase opacity-80 font-light max-w-2xl mx-auto">
            Transform your selfies into professional brand photos with AI
          </div>
        </div>
      </section>

      {/* Progress Overview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-xs tracking-[0.4em] uppercase text-gray-500 mb-12 font-light text-center">
            Your Progress
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 mb-16">
            <div className="bg-white p-8 text-center border border-gray-200">
              <div className="w-12 h-12 bg-black text-white rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-lg">
                  {trainingStatus?.completed ? '✓' : '1'}
                </span>
              </div>
              <h3 className="font-serif text-lg uppercase font-light mb-2">AI Training</h3>
              <p className="text-sm text-gray-600 font-light">
                {trainingStatus?.completed ? 'Complete' : 'Upload 10+ selfies'}
              </p>
            </div>
            
            <div className="bg-white p-8 text-center border border-gray-200">
              <div className="w-12 h-12 bg-gray-200 text-gray-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-lg">2</span>
              </div>
              <h3 className="font-serif text-lg uppercase font-light mb-2">Sandra Chat</h3>
              <p className="text-sm text-gray-600 font-light">
                Discuss your vision
              </p>
            </div>
            
            <div className="bg-white p-8 text-center border border-gray-200">
              <div className="w-12 h-12 bg-gray-200 text-gray-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-lg">3</span>
              </div>
              <h3 className="font-serif text-lg uppercase font-light mb-2">Generate</h3>
              <p className="text-sm text-gray-600 font-light">
                Create professional photos
              </p>
            </div>
            
            <div className="bg-white p-8 text-center border border-gray-200">
              <div className="w-12 h-12 bg-gray-200 text-gray-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-lg">4</span>
              </div>
              <h3 className="font-serif text-lg uppercase font-light mb-2">Gallery</h3>
              <p className="text-sm text-gray-600 font-light">
                {gallery?.length || 0} saved photos
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Studio Tools */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-xs tracking-[0.4em] uppercase text-gray-500 mb-12 font-light text-center">
            Studio Tools
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* AI Training */}
            <Link href="/studio/training" className="group">
              <div className="bg-white border border-gray-200 overflow-hidden hover:bg-black hover:text-white transition-all duration-500">
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face" 
                    alt="AI Training"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 right-4 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center">
                    <span className="text-sm">1</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-xl uppercase font-light mb-2">AI Training</h3>
                  <p className="text-sm font-light opacity-80">
                    {trainingStatus?.completed ? 'Model ready' : 'Upload selfies to start'}
                  </p>
                </div>
              </div>
            </Link>

            {/* Sandra Chat */}
            <Link href="/studio/chat" className="group">
              <div className="bg-white border border-gray-200 overflow-hidden hover:bg-black hover:text-white transition-all duration-500">
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face" 
                    alt="Sandra Chat"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 right-4 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center">
                    <span className="text-sm">2</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-xl uppercase font-light mb-2">Sandra Chat</h3>
                  <p className="text-sm font-light opacity-80">
                    Discuss your photoshoot vision
                  </p>
                </div>
              </div>
            </Link>

            {/* Generate Images */}
            <Link href="/studio/generate" className="group">
              <div className="bg-white border border-gray-200 overflow-hidden hover:bg-black hover:text-white transition-all duration-500">
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop&crop=face" 
                    alt="Generate Images"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 right-4 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center">
                    <span className="text-sm">3</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-xl uppercase font-light mb-2">Generate</h3>
                  <p className="text-sm font-light opacity-80">
                    Create professional photos
                  </p>
                </div>
              </div>
            </Link>

            {/* Gallery */}
            <Link href="/studio/gallery" className="group">
              <div className="bg-white border border-gray-200 overflow-hidden hover:bg-black hover:text-white transition-all duration-500">
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face" 
                    alt="Gallery"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 right-4 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center">
                    <span className="text-sm">{gallery?.length || 0}</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-xl uppercase font-light mb-2">Gallery</h3>
                  <p className="text-sm font-light opacity-80">
                    {gallery?.length || 0} saved photos
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="font-serif text-4xl font-light mb-2">€97</div>
              <div className="text-xs tracking-[0.4em] uppercase text-gray-500 font-light">
                Monthly Plan
              </div>
            </div>
            
            <div>
              <div className="font-serif text-4xl font-light mb-2">
                {trainingStatus?.completed ? '15min' : '---'}
              </div>
              <div className="text-xs tracking-[0.4em] uppercase text-gray-500 font-light">
                Training Time
              </div>
            </div>
            
            <div>
              <div className="font-serif text-4xl font-light mb-2">
                {gallery?.length || 0}
              </div>
              <div className="text-xs tracking-[0.4em] uppercase text-gray-500 font-light">
                Generated Photos
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-8 text-center">
          <div className="font-serif text-xl font-light tracking-wide mb-8">SSELFIE</div>
          <div className="text-sm text-gray-500 font-light">
            Your AI Brand Photoshoot Studio
          </div>
        </div>
      </footer>
    </div>
  );
}