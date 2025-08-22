import React from 'react';
import styles from './ResponsiveGallery.module.css';

interface GalleryProps {
  images: {
    id: string;
    url: string;
    alt: string;
  }[];
}

export const ResponsiveGallery: React.FC<GalleryProps> = ({ images }) => {
  return (
    <div className={styles.galleryContainer}>
      <div className={styles.galleryGrid}>
        {images.map((image) => (
          <div key={image.id} className={styles.imageWrapper}>
            <img 
              src={image.url} 
              alt={image.alt}
              loading="lazy"
              className={styles.galleryImage}
            />
          </div>
        ))}
      </div>
    </div>
  );
};