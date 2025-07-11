import { useState } from 'react';
import { Navigation } from '@/components/navigation';

export default function ShannonMurrayDemo() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate email capture
    setIsSubmitted(true);
  };

  const coastalImages = {
    hero: 'https://i.postimg.cc/2SFWHG1Y/11.png',
    portrait1: 'https://i.postimg.cc/qvXDHWmZ/20.png',
    meditation1: 'https://i.postimg.cc/CK7jK707/3.png',
    lifestyle1: 'https://i.postimg.cc/m2ZtSHvz/56.png',
    peaceful1: 'https://i.postimg.cc/jSL2prdR/58.png',
    nature1: 'https://i.postimg.cc/hGmjGbdw/60.png',
    flatlay1: 'https://i.postimg.cc/pL4rx1pz/59.png'
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        
        {/* Success Message */}
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <img 
                src={coastalImages.peaceful1} 
                alt="Thank you" 
                className="w-32 h-32 object-cover mx-auto mb-8"
                style={{ clipPath: 'circle(50%)' }}
              />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-light mb-6 text-[#2c5f5d]" style={{ fontFamily: 'Times New Roman, serif' }}>
              WELCOME TO YOUR HEALING JOURNEY
            </h1>
            
            <p className="text-lg text-[#5a7c7a] mb-8 font-light">
              Your meditation bundle is on its way to your inbox. Check your email in the next few minutes.
            </p>
            
            <div className="bg-[#f8faf9] p-8 text-left">
              <h3 className="text-xl font-light mb-4 text-[#2c5f5d]" style={{ fontFamily: 'Times New Roman, serif' }}>
                What You'll Receive:
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-[#7ba3a0] mr-4"></div>
                  <span className="text-[#5a7c7a]">Sleep Meditation (20 minutes) - Fall asleep naturally</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-[#7ba3a0] mr-4"></div>
                  <span className="text-[#5a7c7a]">Morning Meditation (15 minutes) - Start your day centered</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-[#7ba3a0] mr-4"></div>
                  <span className="text-[#5a7c7a]">Bonus: 5-Minute Reset - For overwhelm moments</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Full-Bleed Hero Section */}
      <section className="relative h-screen overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${coastalImages.hero})` }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-xs uppercase tracking-[0.4em] text-white mb-6 font-light opacity-90">
              SHANNON MURRAY
            </div>
            
            <h1 className="text-8xl md:text-9xl font-light text-white leading-none mb-12" style={{ fontFamily: 'Times New Roman, serif', letterSpacing: '0.1em' }}>
              SOUL RESETS
            </h1>
            
            <p className="text-xl md:text-2xl font-light text-white mb-16 leading-relaxed opacity-95 max-w-3xl mx-auto">
              Transform your sleep and mornings with guided sound healing meditations
            </p>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="text-white text-xs uppercase tracking-wider opacity-70">
            SCROLL TO TRANSFORM
          </div>
        </div>
      </section>

      {/* Email Capture Section with Image Overlay */}
      <section className="relative py-0">
        <div className="grid md:grid-cols-2 min-h-screen">
          {/* Left - Image */}
          <div 
            className="relative bg-cover bg-center"
            style={{ backgroundImage: `url(${coastalImages.meditation1})` }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          </div>
          
          {/* Right - Form */}
          <div className="bg-[#f8faf9] flex items-center justify-center p-8 md:p-16">
            <div className="max-w-md w-full">
              <h2 className="text-4xl md:text-5xl font-light mb-6 text-[#2c5f5d] leading-tight" style={{ fontFamily: 'Times New Roman, serif' }}>
                YOUR FREE MEDITATION BUNDLE
              </h2>
              
              <p className="text-lg text-[#5a7c7a] mb-8 font-light leading-relaxed">
                Download my signature sleep & morning meditations. 
                <br />No spam, just healing.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="w-full px-6 py-4 text-lg border-0 border-b-2 border-[#e0e8e7] focus:outline-none focus:border-[#2c5f5d] bg-transparent text-[#2c5f5d] placeholder-[#7ba3a0]"
                />
                
                <button
                  type="submit"
                  className="w-full bg-[#2c5f5d] text-white py-4 px-8 text-sm uppercase tracking-[0.2em] font-light hover:bg-[#1e4341] transition-all duration-300"
                >
                  DOWNLOAD FREE MEDITATIONS
                </button>
              </form>
              
              <div className="mt-6 text-sm text-[#7ba3a0] font-light">
                Join 2,000+ souls finding peace through sound healing
              </div>
              
              {/* What's Included */}
              <div className="mt-12 pt-8 border-t border-[#e0e8e7]">
                <h3 className="text-lg font-light mb-4 text-[#2c5f5d]" style={{ fontFamily: 'Times New Roman, serif' }}>
                  What You'll Receive:
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-1 h-1 bg-[#7ba3a0] mr-4"></div>
                    <span className="text-[#5a7c7a] font-light">Sleep Meditation (20 minutes)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-1 h-1 bg-[#7ba3a0] mr-4"></div>
                    <span className="text-[#5a7c7a] font-light">Morning Meditation (15 minutes)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-1 h-1 bg-[#7ba3a0] mr-4"></div>
                    <span className="text-[#5a7c7a] font-light">Bonus: 5-Minute Reset</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-32">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-24 items-center">
            <div className="space-y-8">
              <img 
                src={coastalImages.portrait1} 
                alt="Shannon Murray" 
                className="w-full h-96 object-cover"
              />
              <img 
                src={coastalImages.nature1} 
                alt="Sound healing practice" 
                className="w-full h-64 object-cover"
              />
            </div>
            
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-[#7ba3a0] mb-6 font-light">
                THE HEALER
              </div>
              
              <h2 className="text-5xl font-light mb-12 text-[#2c5f5d] leading-tight" style={{ fontFamily: 'Times New Roman, serif' }}>
                HEALING THROUGH SOUND
              </h2>
              
              <div className="space-y-8 text-lg text-[#5a7c7a] font-light leading-relaxed">
                <p>
                  After years of struggling with anxiety and sleepless nights, I discovered the 
                  transformative power of sound healing. Now I guide others to find their own 
                  inner peace through carefully crafted meditations.
                </p>
                
                <p>
                  Each meditation combines ancient sound healing techniques with modern mindfulness 
                  practices. Whether you're seeking deeper sleep or a centered morning, these 
                  recordings will become your daily sanctuary.
                </p>
                
                <div className="pt-8 border-t border-[#e0e8e7]">
                  <div className="text-sm uppercase tracking-[0.2em] text-[#7ba3a0] mb-2 font-light">
                    SHANNON MURRAY
                  </div>
                  <div className="text-base text-[#5a7c7a] font-light">
                    Certified Sound Healer & Meditation Guide
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meditation Bundle Grid */}
      <section className="py-32 bg-[#f8faf9]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <div className="text-xs uppercase tracking-[0.3em] text-[#7ba3a0] mb-6 font-light">
              THE BUNDLE
            </div>
            <h2 className="text-5xl md:text-6xl font-light mb-8 text-[#2c5f5d] leading-tight" style={{ fontFamily: 'Times New Roman, serif' }}>
              YOUR MEDITATION BUNDLE
            </h2>
            <p className="text-xl text-[#5a7c7a] max-w-3xl mx-auto font-light leading-relaxed">
              Three carefully crafted meditations to transform your sleep and morning routine
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {/* Sleep Meditation */}
            <div className="group">
              <div className="relative overflow-hidden mb-8">
                <img 
                  src={coastalImages.lifestyle1} 
                  alt="Sleep meditation" 
                  className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="absolute top-6 left-6">
                  <div className="text-xs uppercase tracking-[0.2em] text-white font-light opacity-90">
                    01
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-light mb-4 text-[#2c5f5d]" style={{ fontFamily: 'Times New Roman, serif' }}>
                DEEP SLEEP MEDITATION
              </h3>
              <div className="text-sm uppercase tracking-[0.2em] text-[#7ba3a0] mb-4 font-light">
                20 MINUTES
              </div>
              <p className="text-[#5a7c7a] font-light leading-relaxed">
                Release the day's stress and drift into restorative sleep with gentle sound healing frequencies
              </p>
            </div>
            
            {/* Morning Meditation */}
            <div className="group">
              <div className="relative overflow-hidden mb-8">
                <img 
                  src={coastalImages.peaceful1} 
                  alt="Morning meditation" 
                  className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="absolute top-6 left-6">
                  <div className="text-xs uppercase tracking-[0.2em] text-white font-light opacity-90">
                    02
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-light mb-4 text-[#2c5f5d]" style={{ fontFamily: 'Times New Roman, serif' }}>
                MORNING AWAKENING
              </h3>
              <div className="text-sm uppercase tracking-[0.2em] text-[#7ba3a0] mb-4 font-light">
                15 MINUTES
              </div>
              <p className="text-[#5a7c7a] font-light leading-relaxed">
                Start your day with intention and clarity through energizing breathwork and affirmations
              </p>
            </div>
            
            {/* Bonus Reset */}
            <div className="group">
              <div className="relative overflow-hidden mb-8">
                <img 
                  src={coastalImages.flatlay1} 
                  alt="Quick reset" 
                  className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="absolute top-6 left-6">
                  <div className="text-xs uppercase tracking-[0.2em] text-white font-light opacity-90">
                    BONUS
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-light mb-4 text-[#2c5f5d]" style={{ fontFamily: 'Times New Roman, serif' }}>
                INSTANT RESET
              </h3>
              <div className="text-sm uppercase tracking-[0.2em] text-[#7ba3a0] mb-4 font-light">
                5 MINUTES
              </div>
              <p className="text-[#5a7c7a] font-light leading-relaxed">
                Quick centering practice for overwhelming moments throughout your day
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-32">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="mb-16">
            <div className="text-xs uppercase tracking-[0.3em] text-[#7ba3a0] mb-6 font-light">
              CLIENT LOVE
            </div>
          </div>
          
          <blockquote className="text-3xl md:text-4xl font-light text-[#2c5f5d] mb-12 leading-relaxed max-w-4xl mx-auto" style={{ fontFamily: 'Times New Roman, serif' }}>
            "Shannon's meditations have transformed my relationship with sleep. I actually look forward to bedtime now."
          </blockquote>
          
          <div className="text-sm uppercase tracking-[0.2em] text-[#7ba3a0] mb-2 font-light">
            SARAH M.
          </div>
          <div className="text-base text-[#5a7c7a] font-light">
            Busy Mom & Entrepreneur
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2c5f5d] text-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
            SOUL RESETS
          </h3>
          <p className="text-[#b5d0ce] font-light mb-6">
            Sound healing meditations for modern souls
          </p>
          <div className="text-sm text-[#b5d0ce]">
            © 2025 Shannon Murray • All Rights Reserved
          </div>
        </div>
      </footer>
    </div>
  );
}