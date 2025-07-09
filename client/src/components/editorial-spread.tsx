import { SandraImages } from '@/lib/sandra-images';

export default function EditorialSpread() {
  return (
    <div>
      {/* Power Quote */}
      <section className="min-h-[70vh] flex items-center justify-center bg-[#0a0a0a] py-16 px-10">
        <div className="max-w-[900px] text-center">
          <h2 className="text-4xl md:text-6xl font-light leading-tight text-white mb-8 tracking-[-0.01em]" style={{ fontFamily: 'Times New Roman, serif', fontWeight: 300 }}>
            "I didn't need a full plan.<br />
            I needed one brave post.<br />
            One real story.<br />
            One step back to myself."
          </h2>
          <p className="text-[11px] tracking-[0.4em] uppercase text-white/60 font-light font-inter">Sandra Sigurjonsdottir</p>
        </div>
      </section>

      {/* Split Layout */}
      <section className="min-h-[80vh] grid grid-cols-1 lg:grid-cols-2 bg-[#f5f5f5]">
        <div className="bg-[#0a0a0a] relative overflow-hidden min-h-[320px]">
          <img
            src={SandraImages.editorial.laptop1}
            alt="Sandra's SSELFIE editorial example"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="py-20 px-15 flex flex-col justify-center">
          <p className="text-[11px] tracking-[0.4em] uppercase text-[#666666] mb-6 font-light font-inter">welcome to sselfie studio</p>
          <h2 className="text-3xl md:text-5xl font-light leading-tight text-[#0a0a0a] mb-7 tracking-[-0.01em]" style={{ fontFamily: 'Times New Roman, serif', fontWeight: 300 }}>
            The digital studio where your face is the brand.
          </h2>
          <blockquote className="italic text-lg text-[#0a0a0a]/70 border-l-4 border-[#e5e5e5] pl-4 mb-4 font-light font-inter">
            "One year ago my marriage ended. Single mom, three kids, zero plan. But I had a phone. And I figured out that was all I needed."
          </blockquote>
          <p className="text-base leading-relaxed text-[#0a0a0a]/70 mb-4 font-light font-inter">
            SSELFIE STUDIO is for women who are done waiting for perfect. Upload your actual selfies. No fancy camera, no design degree, no pretending. My AI just brings out what's already there. Your face. Your story. Your brand, all done in minutes.
          </p>
          <h2 className="text-3xl md:text-5xl font-light leading-tight text-[#0a0a0a] mb-7 tracking-[-0.01em]" style={{ fontFamily: 'Times New Roman, serif', fontWeight: 300 }}>
            This didn't start as a business. It started as survival.
          </h2>
          <p className="text-base leading-relaxed text-[#0a0a0a]/70 mb-4 font-light font-inter">
            One year ago, I hit rock bottom. Divorced. Three kids. No backup plan. I was heartbroken, exhausted, and completely disconnected from the woman I used to be.
          </p>
          <p className="text-base leading-relaxed text-[#0a0a0a]/70 mb-6 font-light font-inter">
            And one day, in the middle of all that mess—I picked up my phone. Took a selfie. Posted something honest. Not perfect. Just true.
          </p>
          <button className="inline-block text-[11px] tracking-[0.4em] uppercase text-[#0a0a0a] pb-2 border-b border-[#e5e5e5] hover:border-[#0a0a0a] transition-all duration-300 self-start font-light font-inter bg-transparent cursor-pointer">
            Read My Full Story
          </button>
        </div>
      </section>

      {/* Magazine Columns */}
      <section className="max-w-[1200px] mx-auto mt-25 px-10">
        <div className="text-center mb-15">
          <h2 className="text-4xl md:text-6xl font-light mb-4 tracking-[-0.01em]" style={{ fontFamily: 'Times New Roman, serif', fontWeight: 300 }}>The SSELFIE Method</h2>
          <p className="text-[11px] tracking-[0.4em] uppercase text-[#666666] font-light font-inter">90 Days to Your First 100K</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-15">
          <div className="text-base leading-loose text-[#0a0a0a]/70 font-light font-inter">
            <span className="float-left text-6xl leading-[0.7] mr-2 font-light" style={{ fontFamily: 'Times New Roman, serif', fontWeight: 300 }}>T</span>
            hat one moment sparked something. I didn't need a full plan. I needed one brave post. One real story. One step back to myself. From there, I kept showing up—camera in one hand, coffee in the other.
          </div>
          <div className="text-base leading-loose text-[#0a0a0a]/70 font-light font-inter">
            <span className="float-left text-6xl leading-[0.7] mr-2 font-light" style={{ fontFamily: 'Times New Roman, serif', fontWeight: 300 }}>A</span>
            nd over time, I built a real audience, a real brand, and eventually, a real business. Not because I had it all together. But because I didn't—and I stopped hiding that.
          </div>
        </div>
      </section>

      {/* Stats Spread */}
      <section className="bg-[#0a0a0a] py-20 px-10">
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-center text-white">
          <div>
            <h3 className="text-5xl md:text-8xl font-light leading-none mb-3 tracking-[-0.01em]" style={{ fontFamily: 'Times New Roman, serif', fontWeight: 300 }}>120K</h3>
            <p className="text-[11px] tracking-[0.4em] uppercase text-white/65 font-light font-inter">Followers in 90 Days</p>
          </div>
          <div>
            <h3 className="text-5xl md:text-8xl font-light leading-none mb-3 tracking-[-0.01em]" style={{ fontFamily: 'Times New Roman, serif', fontWeight: 300 }}>3</h3>
            <p className="text-[11px] tracking-[0.4em] uppercase text-white/65 font-light font-inter">Kids I'm Raising</p>
          </div>
          <div>
            <h3 className="text-5xl md:text-8xl font-light leading-none mb-3 tracking-[-0.01em]" style={{ fontFamily: 'Times New Roman, serif', fontWeight: 300 }}>1</h3>
            <p className="text-[11px] tracking-[0.4em] uppercase text-white/65 font-light font-inter">Phone That Changed Everything</p>
          </div>
          <div>
            <h3 className="text-5xl md:text-8xl font-light leading-none mb-3 tracking-[-0.01em]" style={{ fontFamily: 'Times New Roman, serif', fontWeight: 300 }}>100%</h3>
            <p className="text-[11px] tracking-[0.4em] uppercase text-white/65 font-light font-inter">Real, No BS</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-10 bg-[#fafafa]">
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-9 border border-gray-200">
            <p className="text-base leading-relaxed mb-5 font-light italic text-[#0a0a0a] font-inter">
              "Sandra showed me that my mess was actually my message. Now I have a business that works around my life, not the other way around."
            </p>
            <p className="text-[11px] tracking-[0.4em] uppercase text-[#666666] font-light font-inter">Maria, Single Mom of Two</p>
          </div>
          <div className="bg-white p-9 border border-gray-200">
            <p className="text-base leading-relaxed mb-5 font-light italic text-[#0a0a0a] font-inter">
              "I went from hiding my divorce to sharing my story. 60K followers later, I have clients begging to work with me."
            </p>
            <p className="text-[11px] tracking-[0.4em] uppercase text-[#666666] font-light font-inter">Jessica, Divorce Coach</p>
          </div>
          <div className="bg-white p-9 border border-gray-200">
            <p className="text-base leading-relaxed mb-5 font-light italic text-[#0a0a0a] font-inter">
              "The SSELFIE method isn't just about selfies. It's about finally showing up as yourself and getting paid for it."
            </p>
            <p className="text-[11px] tracking-[0.4em] uppercase text-[#666666] font-light font-inter">Anna, Business Owner</p>
          </div>
        </div>
      </section>
    </div>
  );
}