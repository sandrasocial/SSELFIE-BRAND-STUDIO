import React, { useState } from 'react';

interface StoryStudioModalProps {
  imageId: string;
  imageUrl: string;
  onClose: () => void;
  onSuccess: () => void;
}

const StoryStudioModal: React.FC<StoryStudioModalProps> = ({ imageId, imageUrl, onClose, onSuccess }) => {
  const [motionPrompt, setMotionPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/video/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId, motionPrompt })
      });
      if (!res.ok) throw new Error('Failed to generate video');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
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
        <img src={imageUrl} alt="Selected" style={{ width: '100%', borderRadius: '8px', marginBottom: 24 }} />
        <input
          type="text"
          placeholder="Describe the motion (e.g. 'slow pan up', 'zoom in on face')"
          value={motionPrompt}
          onChange={e => setMotionPrompt(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            marginBottom: 16,
            fontSize: 16
          }}
          disabled={loading}
        />
        <button
          onClick={handleGenerate}
          disabled={loading || !motionPrompt.trim()}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '6px',
            background: '#0a0a0a',
            color: '#fff',
            fontWeight: 600,
            fontSize: 16,
            border: 'none',
            cursor: loading ? 'wait' : 'pointer',
            marginBottom: 12
          }}
        >
          {loading ? 'Generating...' : 'Generate Clip'}
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
  );
};

export default StoryStudioModal;
