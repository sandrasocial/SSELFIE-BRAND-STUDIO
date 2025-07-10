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
    hero: 'https://i.postimg.cc/FsJFsKvn/115.png',
    portrait1: 'https://i.postimg.cc/sXqXwGy7/131.png',
    portrait2: 'https://i.postimg.cc/JhyCK6hY/148.png',
    meditation1: 'https://i.postimg.cc/httBQPRB/147.png',
    lifestyle1: 'https://i.postimg.cc/DyzjqW0B/175.png',
    lifestyle2: 'https://i.postimg.cc/nV3p1DFW/3.png',
    soundbowl1: 'https://i.postimg.cc/ZRvSVfwK/423.png',
    nature1: 'https://i.postimg.cc/KYpCMnr7/46.png',
    nature2: 'https://i.postimg.cc/FFLwYkfc/50.png',
    flatlay1: 'https://i.postimg.cc/0yQfJht3/72.png',
    flatlay2: 'https://i.postimg.cc/d0Zj5rcj/75.png',
    peaceful1: 'https://i.postimg.cc/MpCQKLg1/94.png',
    peaceful2: 'https://i.postimg.cc/rw04TTZ8/92.png',
    serene: 'https://i.postimg.cc/qvXDHWmZ/20.png',
    background: 'https://i.postimg.cc/NG79bW1J/92.png'
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
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${coastalImages.hero})` }}
        >
          <div className="absolute inset-0 bg-white bg-opacity-40"></div>
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-20">
          <div className="max-w-3xl">
            <div className="mb-8">
              <div className="text-xs uppercase tracking-[0.3em] text-[#7ba3a0] mb-4 font-light">
                SHANNON MURRAY
              </div>
              
              <h1 className="text-5xl md:text-7xl font-light mb-8 text-[#2c5f5d] leading-none" style={{ fontFamily: 'Times New Roman, serif' }}>
                SOUL RESETS
              </h1>
              
              <p className="text-xl md:text-2xl font-light text-[#5a7c7a] mb-12 leading-relaxed">
                Transform your sleep and mornings with guided sound healing meditations. 
                Find peace in the chaos, one breath at a time.
              </p>
            </div>
            
            {/* Email Capture Form */}
            <div className="bg-white bg-opacity-90 p-8 max-w-md">
              <h3 className="text-2xl font-light mb-4 text-[#2c5f5d]" style={{ fontFamily: 'Times New Roman, serif' }}>
                GET YOUR FREE MEDITATION BUNDLE
              </h3>
              
              <p className="text-sm text-[#5a7c7a] mb-6 font-light">
                Download my signature sleep & morning meditations. No spam, just healing.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="w-full px-4 py-3 border border-[#e0e8e7] focus:outline-none focus:border-[#7ba3a0] text-[#2c5f5d]"
                />
                
                <button
                  type="submit"
                  className="w-full bg-[#2c5f5d] text-white py-3 px-6 text-sm uppercase tracking-wider font-light hover:bg-[#1e4341] transition-colors"
                >
                  SEND MY MEDITATIONS
                </button>
              </form>
              
              <div className="mt-4 text-xs text-[#7ba3a0] font-light">
                Join 2,000+ souls finding peace through sound healing
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-[#f8faf9]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-light mb-8 text-[#2c5f5d]" style={{ fontFamily: 'Times New Roman, serif' }}>
                HEALING THROUGH SOUND
              </h2>
              
              <div className="space-y-6 text-[#5a7c7a] font-light leading-relaxed">
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
                
                <div className="pt-4">
                  <div className="text-sm uppercase tracking-wider text-[#7ba3a0] mb-2">
                    SHANNON MURRAY
                  </div>
                  <div className="text-sm text-[#5a7c7a]">
                    Certified Sound Healer & Meditation Guide
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <img 
                src={coastalImages.portrait1} 
                alt="Shannon Murray" 
                className="w-full h-64 object-cover"
              />
              <img 
                src={coastalImages.soundbowl1} 
                alt="Sound healing tools" 
                className="w-full h-48 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Receive */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light mb-6 text-[#2c5f5d]" style={{ fontFamily: 'Times New Roman, serif' }}>
              YOUR MEDITATION BUNDLE
            </h2>
            <p className="text-lg text-[#5a7c7a] max-w-2xl mx-auto font-light">
              Three carefully crafted meditations to transform your sleep and morning routine
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Sleep Meditation */}
            <div className="text-center">
              <img 
                src={coastalImages.meditation1} 
                alt="Sleep meditation" 
                className="w-full h-48 object-cover mb-6"
              />
              <h3 className="text-xl font-light mb-4 text-[#2c5f5d]" style={{ fontFamily: 'Times New Roman, serif' }}>
                DEEP SLEEP MEDITATION
              </h3>
              <div className="text-sm uppercase tracking-wider text-[#7ba3a0] mb-3">
                20 MINUTES
              </div>
              <p className="text-[#5a7c7a] font-light leading-relaxed">
                Release the day's stress and drift into restorative sleep with gentle sound healing frequencies
              </p>
            </div>
            
            {/* Morning Meditation */}
            <div className="text-center">
              <img 
                src={coastalImages.peaceful1} 
                alt="Morning meditation" 
                className="w-full h-48 object-cover mb-6"
              />
              <h3 className="text-xl font-light mb-4 text-[#2c5f5d]" style={{ fontFamily: 'Times New Roman, serif' }}>
                MORNING AWAKENING
              </h3>
              <div className="text-sm uppercase tracking-wider text-[#7ba3a0] mb-3">
                15 MINUTES
              </div>
              <p className="text-[#5a7c7a] font-light leading-relaxed">
                Start your day with intention and clarity through energizing breathwork and affirmations
              </p>
            </div>
            
            {/* Bonus Reset */}
            <div className="text-center">
              <img 
                src={coastalImages.nature1} 
                alt="Quick reset" 
                className="w-full h-48 object-cover mb-6"
              />
              <h3 className="text-xl font-light mb-4 text-[#2c5f5d]" style={{ fontFamily: 'Times New Roman, serif' }}>
                INSTANT RESET
              </h3>
              <div className="text-sm uppercase tracking-wider text-[#7ba3a0] mb-3">
                5 MINUTES • BONUS
              </div>
              <p className="text-[#5a7c7a] font-light leading-relaxed">
                Quick centering practice for overwhelming moments throughout your day
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 bg-[#f8faf9]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="mb-8">
            <img 
              src={coastalImages.lifestyle1} 
              alt="Peaceful moment" 
              className="w-24 h-24 object-cover mx-auto mb-8"
              style={{ clipPath: 'circle(50%)' }}
            />
          </div>
          
          <blockquote className="text-2xl font-light text-[#2c5f5d] mb-8 leading-relaxed" style={{ fontFamily: 'Times New Roman, serif' }}>
            "Shannon's meditations have transformed my relationship with sleep. I actually look forward to bedtime now."
          </blockquote>
          
          <div className="text-sm uppercase tracking-wider text-[#7ba3a0] mb-2">
            SARAH M.
          </div>
          <div className="text-sm text-[#5a7c7a]">
            Busy Mom & Entrepreneur
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-light mb-6 text-[#2c5f5d]" style={{ fontFamily: 'Times New Roman, serif' }}>
            READY TO TRANSFORM YOUR SLEEP?
          </h2>
          
          <p className="text-lg text-[#5a7c7a] mb-12 font-light max-w-2xl mx-auto">
            Join thousands who've discovered the power of sound healing. Your free meditation bundle is waiting.
          </p>
          
          <div className="bg-white border border-[#e0e8e7] p-8 max-w-md mx-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="w-full px-4 py-3 border border-[#e0e8e7] focus:outline-none focus:border-[#7ba3a0] text-[#2c5f5d]"
              />
              
              <button
                type="submit"
                className="w-full bg-[#2c5f5d] text-white py-3 px-6 text-sm uppercase tracking-wider font-light hover:bg-[#1e4341] transition-colors"
              >
                DOWNLOAD FREE MEDITATIONS
              </button>
            </form>
            
            <div className="mt-4 text-xs text-[#7ba3a0] font-light">
              No spam. Just healing. Unsubscribe anytime.
            </div>
          </div>
        </div>
      </section>

      {/* Image Gallery Footer */}
      <section className="py-12 bg-[#f8faf9]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <img src={coastalImages.nature2} alt="Gallery 1" className="w-full h-24 object-cover" />
            <img src={coastalImages.flatlay1} alt="Gallery 2" className="w-full h-24 object-cover" />
            <img src={coastalImages.peaceful2} alt="Gallery 3" className="w-full h-24 object-cover" />
            <img src={coastalImages.serene} alt="Gallery 4" className="w-full h-24 object-cover" />
            <img src={coastalImages.lifestyle2} alt="Gallery 5" className="w-full h-24 object-cover" />
            <img src={coastalImages.flatlay2} alt="Gallery 6" className="w-full h-24 object-cover" />
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