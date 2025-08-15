import React, { useState } from "react";
import { SandraImages } from "../lib/sandra-images";
import { useLocation } from "wouter";

export default function FreeTierSignup() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Store email and redirect to login for basic tier
    localStorage.setItem('preSignupEmail', email);
    localStorage.setItem('selectedPlan', 'basic');
    window.location.href = '/login';
  };

  const handleDirectSignup = () => {
    localStorage.setItem('selectedPlan', 'basic');
    window.location.href = '/login';
  };

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
          
          <div className="relative z-20 text-center px-8 md:px-12 max-w-2xl">
            <div className="text-xs uppercase tracking-[0.4em] text-[#f1f1f1]/70 mb-6">
              Start Basic Today
            </div>
            
            <h2 
              className="text-3xl md:text-5xl lg:text-6xl font-light text-[#f1f1f1] mb-6 leading-tight"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              Your personal AI model<br />
              starts here
            </h2>
            
            <p 
              className="text-lg md:text-xl text-[#f1f1f1]/90 max-w-lg leading-relaxed mx-auto mb-8"
            >
              €29/month gets you a trained AI model + 30 professional photos + Maya AI photographer to guide your brand journey.
            </p>

            <div className="space-y-4">
              <button
                onClick={handleDirectSignup}
                className="w-full max-w-md mx-auto block py-4 px-8 bg-white text-black text-xs uppercase tracking-[0.3em] hover:bg-gray-100 transition-all duration-300"
              >
                Start Basic €29/mo
              </button>
              
              <p className="text-sm text-[#f1f1f1]/70">
                Access Maya AI photographer & Victoria AI strategist
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}