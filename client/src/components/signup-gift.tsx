import { FormEvent } from 'react';
import { SandraImages } from "@/lib/sandra-images";

export default function SignupGift() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/signup-gift', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          source: 'homepage-gift'
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        console.error('Failed to send gift email');
        // Still show success for UX
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error('Error sending gift email:', error);
      // Still show success for UX
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <section className="py-20 bg-[#f1f1f1]">
        <div className="max-w-6xl mx-auto px-6">
          <div 
            className="relative h-[650px] md:h-[600px] overflow-hidden group flex items-center justify-center"
            style={{
              backgroundImage: `url(${SandraImages.editorial.laptop1})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundColor: '#171719'
            }}
          >
            <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#171719]/80 via-[#171719]/60 to-[#171719]/40" />
            
            <div className="relative z-20 text-center px-8 md:px-12">
              <h2 
                className="text-3xl md:text-5xl lg:text-6xl font-light text-[#f1f1f1] mb-6 leading-tight"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                Check Your Email
              </h2>
              <p 
                className="text-lg md:text-xl text-[#f1f1f1]/90 max-w-lg leading-relaxed mx-auto font-inter"
              >
                Your Selfie Queen Guide is on its way. Get ready to transform how you show up.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-[#f1f1f1]">
      <div className="max-w-6xl mx-auto px-6">
        {/* Editorial Card with Image Background */}
        <div 
          className="relative h-[650px] md:h-[600px] overflow-hidden group"
          style={{
            backgroundImage: `url(${SandraImages.editorial.phone1})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundColor: '#171719'
          }}
        >
          
          {/* Gradient Overlay for Better Text Readability */}
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#171719]/80 via-[#171719]/60 to-[#171719]/40" />
          
          {/* Content Overlay */}
          <div 
            className="absolute inset-0 z-20 flex flex-col justify-between py-8 md:py-12"
            style={{ 
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              height: '100%',
              textAlign: 'center'
            }}
          >
            {/* Text Content - Higher up */}
            <div 
              className="w-full max-w-2xl mx-auto px-8 md:px-12 text-center pt-8 md:pt-12"
              style={{
                textAlign: 'center',
                alignSelf: 'center'
              }}
            >
              {/* Editorial Tagline */}
              <span 
                className="inline-block text-[10px] md:text-[11px] tracking-[0.5em] uppercase text-[#f1f1f1]/80 mb-4 md:mb-6 font-inter"
                style={{ 
                  textAlign: 'center',
                  display: 'block'
                }}
              >
                My gift to you
              </span>
              
              {/* Main Headline */}
              <h2 
                className="text-3xl md:text-6xl lg:text-7xl font-light text-[#f1f1f1] mb-4 md:mb-6 leading-tight"
                style={{ 
                  fontFamily: 'Times New Roman, serif',
                  textAlign: 'center'
                }}
              >
                The Selfie
                <br />
                Queen Guide
              </h2>
            </div>
            
            {/* Email Signup Form - Lower down */}
            <div 
              className="w-full max-w-md mx-auto px-8 md:px-12 relative z-30 pb-8 md:pb-12"
              style={{
                alignSelf: 'center',
                textAlign: 'center'
              }}
            >
              {/* Description - Part of the form section */}
              <p 
                className="text-base md:text-xl text-[#f1f1f1]/90 max-w-lg leading-relaxed mx-auto mb-8 font-inter"
                style={{ 
                  textAlign: 'center',
                  margin: '0 auto 2rem auto'
                }}
              >
                Not just another PDF. This is everything I wish someone handed me when I started—angles, light, editing, confidence, and a challenge for when you're ready to show up for real.
              </p>
              
              <form className="space-y-6" onSubmit={handleSubmit} autoComplete="off">
                <div>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-6 py-4 bg-transparent border-2 border-[#f1f1f1]/50 text-[#f1f1f1] placeholder-[#f1f1f1]/60 focus:outline-none focus:border-[#f1f1f1] transition-colors duration-300 font-inter"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-transparent border-2 border-[#f1f1f1]/50 text-[#f1f1f1] py-4 px-8 text-[13px] tracking-[0.3em] uppercase hover:border-[#f1f1f1] hover:bg-[#f1f1f1]/10 transition-all duration-300 disabled:opacity-50 font-inter"
                >
                  {isLoading ? 'Sending...' : 'Get the Guide'}
                </button>
                
                <p 
                  className="text-xs text-[#f1f1f1]/60 text-center font-inter"
                >
                  No spam. Unsubscribe anytime.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}