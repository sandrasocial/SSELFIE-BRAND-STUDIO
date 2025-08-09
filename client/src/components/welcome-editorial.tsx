import { SandraImages } from '@/lib/sandra-images';

export default function WelcomeEditorial() {
  return (
    <section className="py-24 md:py-40 bg-[#fefefe]">
      <div className="container mx-auto px-8 md:px-16 lg:px-24 max-w-8xl">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
          {/* Image */}
          <div className="relative h-[500px] lg:h-[80vh] w-full lg:w-3/5 flex-shrink-0 overflow-hidden group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[rgba(10,10,10,0.1)] z-10"></div>
            <img
              src={SandraImages.journey.building}
              alt="Sandra's SSELFIE editorial example"
              className="w-full h-full object-cover transition-all duration-1000 ease-out group-hover:scale-105"
            />
          </div>
          
          {/* Content */}
          <div className="space-y-12 w-full lg:w-2/5">
            {/* Main Headline */}
            <h2 
              className="text-4xl md:text-5xl lg:text-6xl font-light leading-[1.1] tracking-[-0.02em] text-[#0a0a0a]"
              style={{ fontFamily: 'Times New Roman, serif', fontWeight: 300 }}
            >
              Okay, here's what actually happened...
            </h2>
            
            {/* Story Content */}
            <div className="space-y-8 text-lg md:text-xl leading-relaxed text-[#0a0a0a] font-light">
              <p className="text-2xl md:text-3xl" style={{ fontFamily: 'Times New Roman, serif' }}>One year ago my marriage ended. Single mom, three kids, zero plan.</p>
              <div className="space-y-6 opacity-90">
                <p>But I had a phone. And I figured out that was all I needed.</p>
                <p>90 days later: 120K followers. Today: A business that actually works. Now: Teaching you exactly how I did it.</p>
                <p>No fancy equipment. No design degree. Just strategy that actually works.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}