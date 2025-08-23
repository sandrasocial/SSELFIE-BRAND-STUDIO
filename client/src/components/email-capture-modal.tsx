import React, { FC, FormEvent, useState } from 'react';
import { SandraImages } from '../lib/sandra-images';
import { useToast } from '../hooks/use-toast';

interface EmailCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmailCaptured?: (email: string) => void;
  plan: 'free' | 'sselfie-studio' | 'basic' | 'full-access';
}

export const EmailCaptureModal: FC<EmailCaptureModalProps> = ({
  isOpen,
  onClose,
  onEmailCaptured,
  plan
}) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Email Required",
        description: "Please enter a valid email address",
        
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
      
      // Success! Now redirect to authentication
      toast({
        title: "Email Captured!",
        description: "Redirecting to authentication...",
      });
      
      if (onEmailCaptured) {
        onEmailCaptured(email);
      }
      
      onClose();
      
      // Redirect to authentication after brief delay for user feedback
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);

    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again or contact support",
        
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isFreePlan = plan === 'free';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-black hover:text-gray-600 text-2xl font-light z-10"
        >
          ×
        </button>

        <div className="flex flex-col lg:flex-row min-h-[500px]">
          {/* Image Side */}
          <div className="lg:w-1/2 relative min-h-[300px] lg:min-h-[500px]">
            <img
              src={SandraImages.emailCapture}
              alt="SSELFIE Studio"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
          </div>

          {/* Form Side */}
          <div className="lg:w-1/2 p-6 sm:p-8 lg:p-12 flex flex-col justify-center min-h-[400px]">
            <div className="max-w-md mx-auto w-full">
              <div className="text-xs uppercase tracking-[0.4em] text-gray-500 mb-6">
                {plan === 'basic' ? 'Start Basic' : 'Join Full Access'}
              </div>
              
              <h2 className="font-serif text-3xl lg:text-4xl font-light text-black mb-4 leading-tight">
                Ready to build<br />your brand?
              </h2>
              
              <p className="text-gray-600 mb-8 leading-relaxed">
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
                    className="w-full px-4 py-4 border border-gray-200 focus:border-black focus:outline-none text-sm"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-black text-white text-xs uppercase tracking-[0.3em] hover:bg-gray-800 transition-all duration-300 disabled:opacity-50"
                >
                  {isSubmitting ? 'Getting Started...' : (plan === 'basic' ? 'Start Basic €29/mo' : 'Start Full Access €67/mo')}
                </button>
              </form>

              <p className="text-xs text-gray-500 mt-4 text-center">
                Both plans include your personal AI model training. Cancel anytime.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};