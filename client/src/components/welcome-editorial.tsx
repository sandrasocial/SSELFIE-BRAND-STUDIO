import { SandraImages } from '@/lib/sandra-images';

export default function WelcomeEditorial() {
  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="container mx-auto px-6 md:px-12 lg:px-20 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
          {/* Image */}
          <div className="relative h-96 lg:h-[600px] w-full lg:w-1/2 flex-shrink-0 overflow-hidden group cursor-pointer">
            <img
              src={SandraImages.editorial.laptop1}
              alt="Sandra's SSELFIE editorial example"
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </div>
          
          {/* Content */}
          <div className="space-y-8 w-full lg:w-1/2">
            {/* Eyebrow */}
            <p 
              className="text-xs tracking-[0.4em] uppercase text-[#B5B5B3] font-inter"
            >
              WELCOME TO SSELFIE STUDIO
            </p>
            
            {/* Main Headline */}
            <h2 
              className="text-3xl md:text-4xl lg:text-5xl font-light leading-tight tracking-[-0.01em] text-[#171719]"
              style={{ fontFamily: 'Times New Roman, serif', fontWeight: 300 }}
            >
              The digital studio where your face is the brand.
            </h2>
            
            {/* Quote */}
            <blockquote 
              className="text-lg md:text-xl leading-relaxed text-[#171719]/80 font-light italic border-l-2 border-[#B5B5B3]/30 pl-6 font-inter"
            >
              "One year ago my marriage ended. Single mom, three kids, zero plan. But I had a phone. And I figured out that was all I needed."
            </blockquote>
            
            {/* Description */}
            <p 
              className="text-base md:text-lg leading-relaxed text-[#171719]/70 font-light font-inter"
            >
              SSELFIE STUDIO is for women who are done waiting for perfect. Upload your actual selfies. No fancy camera, no design degree, no pretending. My AI just brings out what's already there. Your face. Your story. Your brand, all done in minutes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}