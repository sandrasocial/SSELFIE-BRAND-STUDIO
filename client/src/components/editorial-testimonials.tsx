interface Testimonial {
  quote: string;
  author: string;
  context?: string;
  featured?: boolean;
}

interface EditorialTestimonialsProps {
  testimonials?: Testimonial[];
  backgroundColor?: string;
  className?: string;
  title?: string;
  subtitle?: string;
}

const defaultTestimonials: Testimonial[] = [
  {
    quote: "Thank you for sharing your knowledge and being so true. I feel so motivated to start taking pictures of myself. I heard the words that I've always wanted to say but never expressed before. Today, I posted three stories talking about my journey in a raw and authentic way. I'm pursuing my dream. Thank you so much.",
    author: "Olha",
    context: "Community Member",
    featured: true
  },
  {
    quote: "You literally changed my picture taking from boring selfies to professional pictures. Like, HOW?!",
    author: "Sarah",
    context: "Instagram"
  },
  {
    quote: "You're helping me develop my 'just do it' attitude. No more waiting for perfect!",
    author: "Roxanne",
    context: "Studio Member"
  }
];

export default function EditorialTestimonials({ 
  testimonials = defaultTestimonials,
  backgroundColor = "#F1F1F1",
  className = "",
  title = "Real transformations",
  subtitle = "VOICES FROM THE COMMUNITY"
}: EditorialTestimonialsProps) {
  return (
    <section 
      className={`py-20 md:py-32 px-6 md:px-12 lg:px-20 ${className}`}
      style={{ backgroundColor }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <span 
            className="text-xs tracking-[0.4em] uppercase text-[#B5B5B3] block mb-6 font-inter"
          >
            {subtitle}
          </span>
          <h2 
            className="text-4xl md:text-5xl lg:text-6xl font-light text-[#171719] leading-tight"
            style={{ fontFamily: 'Times New Roman, serif', fontWeight: 300 }}
          >
            {title}
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className={`
                ${testimonial.featured 
                  ? 'lg:col-span-3 bg-[#171719] text-[#F1F1F1] p-12 md:p-16' 
                  : 'bg-white p-8 md:p-12'
                }
                relative
              `}
            >
              {/* Quote Mark */}
              <div className="mb-8">
                <span 
                  className={`text-6xl md:text-7xl font-light leading-none ${
                    testimonial.featured ? 'text-[#F1F1F1]/20' : 'text-[#171719]/10'
                  }`}
                  style={{ fontFamily: 'Times New Roman, serif', fontWeight: 300 }}
                >
                  "
                </span>
              </div>

              {/* Quote Text */}
              <blockquote 
                className={`
                  ${testimonial.featured 
                    ? 'text-xl md:text-2xl leading-relaxed mb-8 text-[#F1F1F1]' 
                    : 'text-lg md:text-xl leading-relaxed mb-8 text-[#171719]'
                  }
                  font-light font-inter
                `}
              >
                {testimonial.quote}
              </blockquote>

              {/* Attribution */}
              <div className={`
                ${testimonial.featured ? 'border-t border-[#F1F1F1]/20 pt-6' : 'border-t border-[#B5B5B3]/30 pt-6'}
              `}>
                <cite 
                  className={`
                    not-italic text-sm tracking-[0.3em] uppercase font-inter
                    ${testimonial.featured ? 'text-[#F1F1F1]/80' : 'text-[#B5B5B3]'}
                  `}
                >
                  {testimonial.author}
                  {testimonial.context && (
                    <span 
                      className={`
                        block text-xs mt-1 tracking-[0.2em] font-light font-inter
                        ${testimonial.featured ? 'text-[#F1F1F1]/60' : 'text-[#B5B5B3]/80'}
                      `}
                    >
                      {testimonial.context}
                    </span>
                  )}
                </cite>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}