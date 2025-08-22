import { ChangeEvent, FormEvent, useState } from 'react';
import { PreLoginNavigationUnified } from '../components/pre-login-navigation-unified';
import { HeroFullBleed } from '../components/hero-full-bleed';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitted(true);
      setIsSubmitting(false);
    }, 1000);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <PreLoginNavigationUnified />
      
      <HeroFullBleed
        backgroundImage="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600"
        title="CONTACT"
        tagline="YOUR STORY, YOUR IMAGE, YOUR WAY"
        ctaText="START YOUR STORY"
        ctaLink="#contact-form"
      />
      
      <main>
        {/* Contact Form Section */}
        <section id="contact-form" className="py-20 md:py-32 bg-white">
          <div className="container mx-auto px-6 md:px-12 lg:px-20 max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-light text-[#0a0a0a] leading-tight mb-8 tracking-[-0.01em]" style={{ fontFamily: 'Times New Roman, serif', fontWeight: 300 }}>
                Tell me what's going on
              </h2>
            </div>

            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8">
                <div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="NAME"
                    required
                    className="w-full px-4 py-6 border border-[#e5e5e5] bg-transparent font-inter text-lg text-[#0a0a0a] placeholder:text-[11px] placeholder:tracking-[0.4em] placeholder:uppercase placeholder-[#666666] focus:outline-none focus:border-[#0a0a0a] transition-all duration-300"
                  />
                </div>
                
                <div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="EMAIL ADDRESS"
                    required
                    className="w-full px-4 py-6 border border-[#e5e5e5] bg-transparent font-inter text-lg text-[#0a0a0a] placeholder:text-[11px] placeholder:tracking-[0.4em] placeholder:uppercase placeholder-[#666666] focus:outline-none focus:border-[#0a0a0a] transition-all duration-300"
                  />
                </div>
                
                <div>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="WHAT'S ON YOUR MIND?"
                    required
                    rows={6}
                    className="w-full px-4 py-6 border border-[#e5e5e5] bg-transparent font-inter text-lg text-[#0a0a0a] placeholder:text-[11px] placeholder:tracking-[0.4em] placeholder:uppercase placeholder-[#666666] focus:outline-none focus:border-[#0a0a0a] transition-all duration-300 resize-none"
                  />
                </div>
                
                <div className="text-center pt-8">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-12 py-4 bg-transparent border border-[#0a0a0a] text-[#0a0a0a] text-[11px] tracking-[0.3em] uppercase hover:bg-[#0a0a0a] hover:text-white transition-all duration-300 disabled:opacity-50"
                  >
                    {isSubmitting ? 'SENDING...' : 'SEND'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="max-w-2xl mx-auto text-center">
                <h3 className="text-3xl font-light text-[#0a0a0a] mb-6 tracking-[-0.01em]" style={{ fontFamily: 'Times New Roman, serif', fontWeight: 300 }}>
                  Thank you for reaching out.
                </h3>
                <p className="text-lg text-[#0a0a0a]/70 leading-relaxed font-light" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 300 }}>
                  I'll reply as soon as I can, usually with coffee in hand and a few tabs open.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Social Links Section */}
        <section className="py-20 md:py-24 bg-[#f8f8f8]">
          <div className="container mx-auto px-8 md:px-16 lg:px-24 max-w-4xl text-center">
            <div className="space-y-6 font-inter text-base text-[#0a0a0a]/70 py-8">
              <p>Prefer DMs? Message me on Instagram <a href="https://instagram.com/sandra.social" target="_blank" rel="noopener noreferrer" className="text-[#0a0a0a] hover:text-[#0a0a0a]/70 transition-colors duration-300">@sandra.social</a></p>
              <p>Or email: <a href="mailto:hello@sselfie.com" className="text-[#0a0a0a] hover:text-[#0a0a0a]/70 transition-colors duration-300">hello@sselfie.com</a></p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}