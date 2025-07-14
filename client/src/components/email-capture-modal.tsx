import React, { useState } from 'react';
import { SandraImages } from '@/lib/sandra-images';
import { useToast } from '@/hooks/use-toast';

interface EmailCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmailCaptured: (email: string) => void;
  plan: 'free' | 'sselfie-studio';
}

export const EmailCaptureModal: React.FC<EmailCaptureModalProps> = ({
  isOpen,
  onClose,
  onEmailCaptured,
  plan
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
          source: 'landing_page'
        }),
      });

      if (!response.ok) throw new Error('Failed to capture email');

      // Store email captured flag
      localStorage.setItem('emailCaptured', 'true');
      localStorage.setItem('capturedEmail', email);
      
      onEmailCaptured(email);
      onClose();

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

  if (!isOpen) return null;

  const isFreePlan = plan === 'free';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white max-w-4xl w-full max-h-[90vh] overflow-hidden relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-black hover:text-gray-600 text-2xl font-light z-10"
        >
          ×
        </button>

        <div className="flex flex-col lg:flex-row min-h-[500px]">
          {/* Image Side */}
          <div className="lg:w-1/2 relative">
            <img
              src={SandraImages.editorial.laptop1}
              alt="SSELFIE Studio"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
          </div>

          {/* Form Side */}
          <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              <div className="text-xs uppercase tracking-[0.4em] text-gray-500 mb-6">
                {isFreePlan ? 'Start Free' : 'Join SSELFIE Studio'}
              </div>
              
              <h2 className="font-serif text-3xl lg:text-4xl font-light text-black mb-4 leading-tight">
                {isFreePlan ? (
                  <>Your first 5 AI photos<br />are on me</>
                ) : (
                  <>Ready to build<br />your empire?</>
                )}
              </h2>
              
              <p className="text-gray-600 mb-8 leading-relaxed">
                {isFreePlan ? (
                  "Upload your phone selfies, get photos that look like you hired a fancy photographer. No studio required."
                ) : (
                  "Join 1,000+ women building their personal brands with AI. Get 100 monthly images, Maya & Victoria AI, and everything you need to launch."
                )}
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full px-4 py-4 border border-gray-200 focus:border-black focus:outline-none text-sm"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-black text-white text-xs uppercase tracking-[0.3em] hover:bg-gray-800 transition-all duration-300 disabled:opacity-50"
                >
                  {isSubmitting ? 'Getting Started...' : (isFreePlan ? 'Get My 5 Free Photos' : 'Start Studio $47/mo')}
                </button>
              </form>

              <p className="text-xs text-gray-500 mt-4 text-center">
                {isFreePlan ? 
                  "No credit card required. Start creating immediately." :
                  "30-day money-back guarantee. Cancel anytime."
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};