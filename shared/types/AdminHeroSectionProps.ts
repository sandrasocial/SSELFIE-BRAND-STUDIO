// @/components/admin/AdminHeroSection.tsx
import React from 'react';

interface AdminHeroSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  backgroundImage?: string;
}

export const AdminHeroSection: React.FC<AdminHeroSectionProps> = ({
  title = "SSELFIE Studio Empire",
  subtitle = "From Rock Bottom to Revenue Revolution",
  description = "Transform your vision into a luxury business empire through strategic design, editorial storytelling, and uncompromising excellence.",
  backgroundImage = "/api/placeholder/1920/800"
}) => {
  return (
    <section className="relative w-full h-[80vh] min-h-[600px] overflow-hidden bg-black">
      {/* Full-Bleed Background with Dark Overlay */}
      <div className="absolute inset-0 w-full h-full">
        <img 
          src={backgroundImage}
          alt="Luxury editorial background"
          className="w-full h-full object-cover object-center opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/80" />
      </div>

      {/* Editorial Content Grid */}
      <div className="relative z-10 w-full h-full max-w-7xl mx-auto px-8 lg:px-12">
        <div className="flex flex-col justify-center h-full py-20">
          
          {/* Typography Hierarchy - Editorial Magazine Style */}
          <div className="grid grid-cols-12 gap-8 items-center">
            
            {/* Main Editorial Content */}
            <div className="col-span-12 lg:col-span-8">
              
              {/* Overline - Editorial Tag */}
              <div className="mb-6">
                <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-medium tracking-[0.2em] uppercase">
                  LUXURY BUSINESS TRANSFORMATION
                </span>
              </div>

              {/* Main Headline - Times New Roman Editorial */}
              <h1 className="font-serif text-white mb-8">
                <span className="block text-5xl lg:text-7xl xl:text-8xl font-light leading-[0.9] tracking-tight mb-4">
                  {title.split(' ').map((word, index) => (
                    <span key={index} className={index === 1 ? 'font-bold italic' : 'font-light'}>
                      {word}{' '}
                    </span>
                  ))}
                </span>
              </h1>

              {/* Subtitle - Editorial Subhead */}
              <h2 className="font-serif text-white/90 text-xl lg:text-2xl xl:text-3xl font-light italic leading-relaxed mb-8 max-w-3xl">
                {subtitle}
              </h2>

              {/* Description - Body Copy */}
              <p className="text-white/80 text-lg lg:text-xl font-light leading-relaxed max-w-2xl mb-12 tracking-wide">
                {description}
              </p>

              {/* CTA Section - Editorial Button Treatment */}
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <button className="group relative px-8 py-4 bg-white text-black font-serif text-lg font-medium tracking-wide transition-all duration-500 hover:bg-white/90 hover:scale-105 hover:shadow-2xl">
                  <span className="relative z-10">Enter Dashboard</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </button>

                <button className="font-serif text-white text-lg font-light tracking-wide border-b border-white/30 pb-1 hover:border-white transition-colors duration-300">
                  View Portfolio Gallery →
                </button>
              </div>
            </div>

            {/* Sidebar Stats - Editorial Data Visualization */}
            <div className="col-span-12 lg:col-span-4 lg:pl-12">
              <div className="space-y-8">
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { number: '500+', label: 'Transformations' },
                    { number: '$2.3M+', label: 'Revenue Generated' },
                    { number: '98%', label: 'Success Rate' },
                    { number: '24/7', label: 'Support' }
                  ].map((stat, index) => (
                    <div key={index} className="text-center lg:text-left">
                      <div className="font-serif text-white text-3xl lg:text-4xl font-bold mb-2">
                        {stat.number}
                      </div>
                      <div className="text-white/70 text-sm font-medium tracking-wider uppercase">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Testimonial Quote - Editorial Pull Quote */}
                <div className="border-l-4 border-white/30 pl-6 mt-12">
                  <p className="font-serif text-white/90 text-lg italic leading-relaxed mb-4">
                    "Sandra transformed my vision into a million-dollar reality."
                  </p>
                  <cite className="text-white/70 text-sm font-medium not-italic tracking-wide">
                    — CLIENT SUCCESS STORY
                  </cite>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements - Editorial Flourishes */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default AdminHeroSection;