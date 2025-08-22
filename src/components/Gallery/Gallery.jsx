import React, { useState, useEffect } from 'react';
import ErrorBoundary from '../ErrorBoundary';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/gallery');
      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }
      const data = await response.json();
      setImages(data);
    } catch (err) {
      setError(err.message);
      // Report error to our error tracking system
      reportError(err);
    } finally {
      setLoading(false);
    }
  };

  const reportError = async (error) => {
    try {
      await fetch('/api/log-error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: error.toString(),
          component: 'Gallery',
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.error('Failed to report error:', err);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Unable to load gallery</h3>
        <p>{error}</p>
        <button onClick={fetchImages}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="gallery-container">
      {images.map((image) => (
        <div key={image.id} className="gallery-item">
          <img src={image.url} alt={image.title} />
        </div>
      ))}
    </div>
  );
};

// Wrap the gallery component with error boundary
const GalleryWithErrorBoundary = () => (
  <ErrorBoundary>
    <Gallery />
  </ErrorBoundary>
);

export default GalleryWithErrorBoundary;