import React, { useState } from 'react';

const TestimonialShowcase = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Fashion Influencer",
      image: "/testimonials/sarah.jpg",
      quote: "SSELFIE Studio simplified my content creation process. What used to take me 5 hours now takes just 1 hour!",
      savings: "Saves €150/month on tools"
    },
    {
      name: "Mark Rodriguez",
      role: "Business Coach",
      image: "/testimonials/mark.jpg",
      quote: "The AI personal branding features helped me stand out in a crowded market. My engagement has increased by 300%.",
      savings: "Saves €200/month on tools"
    },
    {
      name: "Lisa Chen",
      role: "Lifestyle Blogger",
      image: "/testimonials/lisa.jpg",
      quote: "Finally, an all-in-one solution that actually delivers. The style guide generation alone is worth the investment.",
      savings: "Saves €120/month on tools"
    }
  ];

  return (
    <div className="testimonial-showcase">
      <h2>Success Stories</h2>
      <div className="testimonial-carousel">
        {testimonials.map((testimonial, index) => (
          <div 
            key={index}
            className={`testimonial-card ${index === activeTestimonial ? 'active' : ''}`}
          >
            <div className="testimonial-header">
              <img src={testimonial.image} alt={testimonial.name} />
              <div className="testimonial-meta">
                <h3>{testimonial.name}</h3>
                <p>{testimonial.role}</p>
              </div>
            </div>
            <blockquote>{testimonial.quote}</blockquote>
            <div className="testimonial-savings">{testimonial.savings}</div>
          </div>
        ))}
      </div>
      
      <div className="testimonial-nav">
        {testimonials.map((_, index) => (
          <button
            key={index}
            className={index === activeTestimonial ? 'active' : ''}
            onClick={() => setActiveTestimonial(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default TestimonialShowcase;