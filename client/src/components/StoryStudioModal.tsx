import React, { useState, useEffect } from 'react';
import { apiRequest } from '../lib/queryClient';

interface StoryStudioModalProps {
  imageId: string;
  imageUrl: string;
  onClose: () => void;
  onSuccess: () => void;
}

const StoryStudioModal: React.FC<StoryStudioModalProps> = ({ imageId, imageUrl, onClose, onSuccess }) => {
  const [motionPrompt, setMotionPrompt] = useState('');
  const [mayaVideoPrompt, setMayaVideoPrompt] = useState<string>('');
  const [isLoadingPrompt, setIsLoadingPrompt] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get Maya's video direction when component mounts
  useEffect(() => {
    const getMayaDirection = async () => {
      try {
        setIsLoadingPrompt(true);
        setError(null);
        
        console.log('🎬 Requesting Maya\'s video direction for image:', imageUrl);
        
        const response = await apiRequest('/api/maya/get-video-prompt', 'POST', {
          imageUrl: imageUrl
        });
        
        console.log('✅ Maya video direction received:', response);
        
        if (response.videoPrompt) {
          setMayaVideoPrompt(response.videoPrompt);
          setMotionPrompt(response.videoPrompt); // Pre-fill the input
        } else {
          throw new Error('No video prompt received from Maya');
        }
        
      } catch (error: any) {
        console.error('❌ Error getting Maya\'s video direction:', error);
        
        // Provide specific error feedback
        let errorMessage = 'Failed to get Maya\'s direction. You can still create your own prompt.';
        
        if (error.message?.includes('401')) {
          errorMessage = 'Authentication required. Please log in and try again.';
        } else if (error.message?.includes('400')) {
          errorMessage = 'Invalid image URL. Please try a different image.';
        } else if (error.message?.includes('500')) {
          errorMessage = 'Maya service is temporarily unavailable. You can create your own prompt.';
        }
        
        setError(errorMessage);
        setMotionPrompt('Slow zoom in with subtle movement and gentle lighting'); // Better fallback prompt
      } finally {
        setIsLoadingPrompt(false);
      }
    };

    getMayaDirection();
  }, [imageUrl]);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🎥 Starting video generation with prompt:', motionPrompt);
      
      const res = await fetch('/api/video/generate-from-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          imageId: parseInt(imageId), 
          motionPrompt: motionPrompt.trim() 
        }),
        credentials: 'include'
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to generate video');
      }
      
      const result = await res.json();
      console.log('✅ Video generation started:', result);
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('❌ Video generation error:', err);
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.96)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        padding: '0 16px'
      }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        margin: '0 auto',
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '32px 24px 24px 24px',
      }}>
        <h2 style={{ 
          fontFamily: "'Times New Roman', serif", 
          fontWeight: 200, 
          letterSpacing: '0.2em',
          fontSize: '18px',
          marginBottom: '16px',
          textAlign: 'center'
        }}>
          STORY STUDIO
        </h2>
        
        <img src={imageUrl} alt="Selected" style={{ width: '100%', borderRadius: '8px', marginBottom: 20 }} />
        
        {/* Maya's Direction Section */}
        {isLoadingPrompt ? (
          <div style={{ 
            width: '100%', 
            padding: '12px', 
            background: '#f8f9fa', 
            borderRadius: '8px', 
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid #ddd',
                borderTop: '2px solid #000',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <span style={{ fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
                Maya is analyzing your image...
              </span>
            </div>
          </div>
        ) : mayaVideoPrompt && (
          <div style={{ 
            width: '100%', 
            padding: '12px', 
            background: 'linear-gradient(135deg, #f8f4ff 0%, #fff0f5 100%)', 
            borderRadius: '8px', 
            marginBottom: '16px',
            border: '1px solid #e8d5ff'
          }}>
            <p style={{ 
              fontSize: '11px', 
              color: '#666', 
              textTransform: 'uppercase', 
              letterSpacing: '0.1em', 
              marginBottom: '4px',
              fontWeight: 500
            }}>
              Maya's Direction
            </p>
            <p style={{ 
              fontSize: '14px', 
              color: '#333', 
              fontStyle: 'italic', 
              lineHeight: '1.4',
              margin: '0 0 4px 0'
            }}>
              "{mayaVideoPrompt}"
            </p>
            <p style={{ 
              fontSize: '10px', 
              color: '#8b5cf6', 
              margin: 0,
              textAlign: 'right'
            }}>
              — Maya, AI Creative Director
            </p>
          </div>
        )}
        
        <textarea
          placeholder="Describe the motion (e.g. 'slow pan up', 'zoom in on face')"
          value={motionPrompt}
          onChange={e => setMotionPrompt(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            marginBottom: 16,
            fontSize: 15,
            fontFamily: 'inherit',
            resize: 'vertical',
            minHeight: '80px'
          }}
          disabled={loading || isLoadingPrompt}
        />
        <button
          onClick={handleGenerate}
          disabled={loading || isLoadingPrompt || !motionPrompt.trim()}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '6px',
            background: (loading || isLoadingPrompt || !motionPrompt.trim()) ? '#ccc' : '#0a0a0a',
            color: '#fff',
            fontWeight: 600,
            fontSize: 16,
            border: 'none',
            cursor: (loading || isLoadingPrompt) ? 'wait' : 'pointer',
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {loading ? (
            <>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid transparent',
                borderTop: '2px solid #fff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              Generating Clip...
            </>
          ) : isLoadingPrompt ? (
            'Waiting for Maya...'
          ) : (
            'Generate Video Clip'
          )}
        </button>
        {error && <div style={{ color: '#ff4444', marginBottom: 8 }}>{error}</div>}
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#888',
            textDecoration: 'underline',
            cursor: 'pointer',
            fontSize: 15
          }}
        >
          Cancel
        </button>
      </div>
      </div>
    </>
  );
};

export default StoryStudioModal;
