/**
 * StageControls Component
 * Controls and toggles for Stage Mode presenter
 */

import React from 'react';

export interface StageControlsProps {
  showPoll: boolean;
  showQR: boolean;
  showCTA: boolean;
  onTogglePoll: (show: boolean) => void;
  onToggleQR: (show: boolean) => void;
  onToggleCTA: (show: boolean) => void;
  onFullscreen: () => void;
  isFullscreen: boolean;
  ctaUrl?: string;
  sessionId: string;
}

export default function StageControls({
  showPoll,
  showQR,
  showCTA,
  onTogglePoll,
  onToggleQR,
  onToggleCTA,
  onFullscreen,
  isFullscreen,
  ctaUrl,
  sessionId,
}: StageControlsProps) {
  // Generate QR URL with UTM parameters
  const guestUrl = `${window.location.origin}/hair/guest/${sessionId}?utm_source=stage&utm_campaign=hair_experience`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(guestUrl)}`;

  return (
    <div className="bg-gray-800 border-t border-gray-700 p-4">
      <h3 className="text-sm font-medium text-gray-300 mb-4">Stage Controls</h3>
      
      {/* Primary Controls */}
      <div className="space-y-3 mb-6">
        <button
          onClick={onFullscreen}
          className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
            isFullscreen 
              ? 'bg-red-600 text-white hover:bg-red-700' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isFullscreen ? 'Exit Fullscreen (Esc)' : 'Enter Fullscreen (F)'}
        </button>
        
        <button
          onClick={() => onToggleQR(!showQR)}
          className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
            showQR 
              ? 'bg-green-600 text-white hover:bg-green-700' 
              : 'bg-gray-700 text-white hover:bg-gray-600'
          }`}
        >
          {showQR ? 'Hide QR Code' : 'Show QR Code'}
        </button>
      </div>

      {/* Toggle Controls */}
      <div className="space-y-2 mb-6">
        <label className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <span className="text-sm text-gray-300">Interactive Poll</span>
          <input
            type="checkbox"
            checked={showPoll}
            onChange={(e) => onTogglePoll(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500 focus:ring-2"
          />
        </label>

        {ctaUrl && (
          <label className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <span className="text-sm text-gray-300">Call to Action</span>
            <input
              type="checkbox"
              checked={showCTA}
              onChange={(e) => onToggleCTA(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500 focus:ring-2"
            />
          </label>
        )}
      </div>

      {/* QR Code Display */}
      {showQR && (
        <div className="bg-gray-900 rounded-lg p-4 mb-4">
          <div className="text-center">
            <h4 className="text-sm font-medium text-gray-300 mb-3">Join Session</h4>
            <img 
              src={qrCodeUrl} 
              alt="Join Session QR Code" 
              className="mx-auto mb-3 rounded"
              style={{ maxWidth: '200px' }}
            />
            <p className="text-xs text-gray-400 break-all">
              {guestUrl}
            </p>
          </div>
        </div>
      )}

      {/* CTA Display */}
      {showCTA && ctaUrl && (
        <div className="bg-green-900 rounded-lg p-4 mb-4">
          <div className="text-center">
            <h4 className="text-sm font-medium text-green-300 mb-3">Call to Action Active</h4>
            <a
              href={ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              View CTA Link
            </a>
          </div>
        </div>
      )}

      {/* Keyboard Hints */}
      <div className="text-xs text-gray-500 space-y-1">
        <div className="flex justify-between">
          <span>F Key:</span>
          <span>Toggle Fullscreen</span>
        </div>
        <div className="flex justify-between">
          <span>Esc Key:</span>
          <span>Exit Fullscreen</span>
        </div>
        <div className="flex justify-between">
          <span>Q Key:</span>
          <span>Toggle QR Code</span>
        </div>
      </div>
    </div>
  );
}