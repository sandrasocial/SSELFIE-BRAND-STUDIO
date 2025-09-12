import React, { useState } from 'react';

interface GeneratedImagePreviewProps {
  imageUrls: string[];
  isLoading: boolean;
  concept?: any;
  onSave?: (imageUrls: string[]) => void;
}

const skeletons = Array.from({ length: 2 });

const GeneratedImagePreview: React.FC<GeneratedImagePreviewProps> = ({ 
  imageUrls, 
  isLoading, 
  concept,
  onSave 
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [savedImages, setSavedImages] = useState<Set<string>>(new Set());
  
  const downloadImage = (imageUrl: string, filename: string) => {
    try {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const handleSaveImage = async (imageUrl: string) => {
    try {
      console.log('🔄 Attempting to save image:', imageUrl);
      console.log('🔄 Concept data:', concept);
      
      const response = await fetch('/api/save-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          source: 'maya_generation',
          prompt: concept?.fluxPrompt || concept?.title || 'Maya AI Generation'
        }),
        credentials: 'include'
      });

      console.log('📊 Save response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Save response:', result);
        setSavedImages(prev => new Set([...prev, imageUrl]));
        console.log('✅ Image saved to gallery successfully');
        
        // Show success feedback
        alert('Image saved to gallery!');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Failed to save image:', response.status, errorData);
        alert(`Failed to save image: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error saving image:', error);
      alert(`Error saving image: ${error.message}`);
    }
  };

  const handleSaveAll = async () => {
    console.log('🔄 Attempting to save all images:', imageUrls);
    
    try {
      // Save each image individually 
      for (const imageUrl of imageUrls) {
        await handleSaveImage(imageUrl);
      }
      
      // Also call the onSave callback if provided
      if (onSave && imageUrls.length > 0) {
        onSave(imageUrls);
      }
      
      console.log('✅ All images saved successfully');
    } catch (error) {
      console.error('❌ Error saving all images:', error);
      alert(`Error saving images: ${error.message}`);
    }
  };

  return (
    <>
      <div style={{ marginTop: '16px' }}>
        {isLoading ? (
          <div>
            <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
              Generating images...
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {skeletons.map((_, i) => (
                <div 
                  key={i} 
                  style={{ 
                    background: '#f0f0f0', 
                    borderRadius: '8px', 
                    aspectRatio: '4/5',
                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                  }} 
                />
              ))}
            </div>
          </div>
        ) : imageUrls.length > 0 ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <p style={{ fontSize: '12px', color: '#666', margin: 0, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                Generated Images
              </p>
              <button
                onClick={handleSaveAll}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#666',
                  cursor: 'pointer',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.2em',
                  textDecoration: 'underline'
                }}
              >
                Save All to Gallery
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {imageUrls.map((url, index) => (
                <div key={index} style={{ position: 'relative', cursor: 'pointer' }}>
                  <img
                    src={url}
                    alt={`Generated ${index + 1}`}
                    style={{ 
                      width: '100%', 
                      aspectRatio: '4/5',
                      objectFit: 'cover', 
                      borderRadius: '8px',
                      background: '#f0f0f0'
                    }}
                    onClick={() => setSelectedImage(url)}
                  />
                  
                  {/* Overlay with actions */}
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    display: 'flex',
                    gap: '4px'
                  }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveImage(url);
                      }}
                      style={{
                        background: savedImages.has(url) ? '#ff4444' : 'rgba(255,255,255,0.9)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '28px',
                        height: '28px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title={savedImages.has(url) ? 'Saved to gallery' : 'Save to gallery'}
                    >
                      {savedImages.has(url) ? '♥' : '♡'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Full-screen preview modal */}
      {selectedImage && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.95)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          padding: '20px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '500px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <img
              src={selectedImage}
              alt="Full preview"
              style={{
                width: '100%',
                height: 'auto',
                objectFit: 'contain',
                borderRadius: '12px',
                marginBottom: '24px',
                maxHeight: '70vh'
              }}
            />
            
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <button
                onClick={() => handleSaveImage(selectedImage)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: savedImages.has(selectedImage) ? '#ff4444' : '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {savedImages.has(selectedImage) ? '♥' : '♡'} 
                {savedImages.has(selectedImage) ? 'Saved' : 'Save to Gallery'}
              </button>
              
              <button
                onClick={() => downloadImage(selectedImage, `maya-generation-${Date.now()}.png`)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                ⬇ Download
              </button>
              
              <button
                onClick={() => setSelectedImage(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#888',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                ✕ Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GeneratedImagePreview;
