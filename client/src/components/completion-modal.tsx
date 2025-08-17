import React from 'react';
import { Button } from '@/components/ui/button';

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  liveUrl: string;
  brandName: string;
}

export function CompletionModal({ isOpen, onClose, liveUrl, brandName }: CompletionModalProps) {
  if (!isOpen) return null;

  const copyUrlToClipboard = () => {
    navigator.clipboard.writeText(liveUrl);
    // Show brief feedback without toast
    const button = document.getElementById('copy-url-btn');
    if (button) {
      const originalText = button.textContent;
      button.textContent = 'Copied';
      setTimeout(() => {
        button.textContent = originalText;
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md mx-4 rounded-none shadow-2xl">
        {/* Header with luxury styling */}
        <div className="text-center p-8 border-b border-gray-100">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto bg-black rounded-full flex items-center justify-center mb-4">
              <span className="text-white text-2xl">✓</span>
            </div>
          </div>
          <h2 
            className="text-2xl mb-2 text-black font-light tracking-wide"
            style={{ fontFamily: "'Times New Roman', serif" }}
          >
            Your Brand Is Live
          </h2>
          <p className="text-gray-600 text-sm tracking-wide uppercase" style={{ letterSpacing: '0.1em' }}>
            {brandName} • Published Successfully
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="text-center mb-8">
            <p className="text-gray-700 mb-6 leading-relaxed">
              Your professional landing page is now live and ready for your audience.
            </p>
            
            {/* Live URL Display */}
            <div className="bg-gray-50 p-4 mb-6 border">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-2" style={{ letterSpacing: '0.1em' }}>
                Live URL
              </p>
              <p className="text-sm font-mono text-black break-all">
                {liveUrl}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={() => window.open(liveUrl, '_blank')}
                className="w-full bg-black text-white hover:bg-gray-800 h-12 text-sm tracking-wide uppercase border-none rounded-none"
                style={{ letterSpacing: '0.1em' }}
              >
                View Live Page
              </Button>
              
              <Button 
                id="copy-url-btn"
                onClick={copyUrlToClipboard}
                variant="outline"
                className="w-full border-black text-black hover:bg-black hover:text-white h-12 text-sm tracking-wide uppercase rounded-none"
                style={{ letterSpacing: '0.1em' }}
              >
                Copy URL to Share
              </Button>
              
              <Button 
                onClick={onClose}
                variant="ghost"
                className="w-full text-gray-600 hover:text-black h-12 text-sm tracking-wide uppercase rounded-none"
                style={{ letterSpacing: '0.1em' }}
              >
                Close
              </Button>
            </div>
          </div>

          {/* Next Steps */}
          <div className="border-t border-gray-100 pt-6">
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-3" style={{ letterSpacing: '0.1em' }}>
              Next Steps
            </p>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• Share your live URL with your audience</li>
              <li>• Update your social media bio links</li>
              <li>• Add the URL to your email signature</li>
              <li>• Chat with Victoria for advanced customization</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}