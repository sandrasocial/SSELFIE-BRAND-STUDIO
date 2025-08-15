import React, { useState } from 'react';
import { SandraImages } from '@/lib/sandra-images';
import { useToast } from '@/hooks/use-toast';

interface InlineEmailCaptureProps {
  plan: 'free' | 'sselfie-studio' | 'basic' | 'full-access';
  onEmailCaptured?: (email: string) => void;
}

export const InlineEmailCapture: React.FC<InlineEmailCaptureProps> = ({
  plan,
  onEmailCaptured
}) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Email Required",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Send email to your list via Resend
      const response = await fetch('/api/email-capture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          plan,
          source: 'inline_form'
        }),
      });

      if (!response.ok) throw new Error('Failed to capture email');

      // Store email captured flag
      localStorage.setItem('emailCaptured', 'true');
      localStorage.setItem('capturedEmail', email);
      
      // Success! Now redirect to authentication
      toast({
        title: "Email Captured!",
        description: "Redirecting to authentication...",
        variant: "default",
      });
      
      if (onEmailCaptured) {
        onEmailCaptured(email);
      }
      
      // Redirect to authentication after brief delay for user feedback
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);

    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again or contact support",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFreePlan = plan === 'free';

  return (
    <section className="py-16 sm:py-24 md:py-32 bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left side - Image */}
          <div className="order-2 lg:order-1">
            <img
              src={SandraImages.emailCapture}
              alt="SSELFIE Studio"
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Right side - Form */}
          <div className="order-1 lg:order-2">
            <div className="text-xs uppercase tracking-[0.4em] text-white/60 mb-6">
              {plan === 'basic' ? 'Start Basic' : 'Join Full Access'}
            </div>
            
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-white mb-6 leading-tight">
              Ready to build<br />your brand?
            </h2>
            
            <p className="text-white/80 mb-8 leading-relaxed text-lg">
              {plan === 'basic' ? (
                "Get your personal AI model trained on your selfies. Start creating professional photos with Maya's help for €29/month."
              ) : (
                "Join thousands of women building their personal brands with AI. Get your trained model, 100 monthly photos, Maya & Victoria, and everything you need to launch for €67/month."
              )}
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-6 py-4 bg-white text-black border-0 focus:outline-none text-base"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-white text-black text-xs uppercase tracking-[0.3em] hover:bg-gray-100 transition-all duration-300 disabled:opacity-50"
              >
                {isSubmitting ? 'Getting Started...' : (plan === 'basic' ? 'Start Basic €29/mo' : 'Start Full Access €67/mo')}
              </button>
            </form>

            <p className="text-xs text-white/60 mt-4">
              Both plans include your personal AI model training. Cancel anytime.
            </p>

            {/* Features list */}
            <div className="mt-8 space-y-3">
              {isFreePlan ? (
                <>
                  <div className="flex items-center text-white/80">
                    <span className="text-white mr-3">•</span>
                    <span className="text-sm">Maya AI photographer chat</span>
                  </div>
                  <div className="flex items-center text-white/80">
                    <span className="text-white mr-3">•</span>
                    <span className="text-sm">Victoria AI brand strategist chat</span>
                  </div>
                  <div className="flex items-center text-white/80">
                    <span className="text-white mr-3">•</span>
                    <span className="text-sm">Basic luxury flatlay collections</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center text-white/80">
                    <span className="text-white mr-3">•</span>
                    <span className="text-sm">100 AI images monthly</span>
                  </div>
                  <div className="flex items-center text-white/80">
                    <span className="text-white mr-3">•</span>
                    <span className="text-sm">Complete Maya & Victoria AI access</span>
                  </div>
                  <div className="flex items-center text-white/80">
                    <span className="text-white mr-3">•</span>
                    <span className="text-sm">All premium flatlay collections</span>
                  </div>
                  <div className="flex items-center text-white/80">
                    <span className="text-white mr-3">•</span>
                    <span className="text-sm">Landing page builder & custom domains</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};