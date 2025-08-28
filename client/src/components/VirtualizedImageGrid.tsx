import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useMemoryCleanup } from '../hooks/useMemoryCleanup';

interface ImageItem {
  id: number;
  url: string;
  thumbnail?: string;
  alt?: string;
}

interface VirtualizedImageGridProps {
  images: ImageItem[];
  onImageSelect?: (image: ImageItem) => void;
  onImageSave?: (imageId: number) => void;
  itemHeight?: number;
  columnsPerRow?: number;
  className?: string;
}

/**
 * High-performance virtualized image grid for SSELFIE Studio
 * Optimized for large galleries with smooth scrolling
 */
export const VirtualizedImageGrid: React.FC<VirtualizedImageGridProps> = ({
  images,
  onImageSelect,
  onImageSave,
  itemHeight = 280,
  columnsPerRow = 3,
  className = ""
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(800);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const { createTimeout, addCleanup } = useMemoryCleanup();

  // Calculate visible items
  const { visibleItems, totalHeight, startIndex, endIndex } = useMemo(() => {
    const rowHeight = itemHeight + 16; // Add gap
    const totalRows = Math.ceil(images.length / columnsPerRow);
    const visibleRows = Math.ceil(containerHeight / rowHeight) + 2; // Buffer rows
    
    const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - 1);
    const endRow = Math.min(totalRows, startRow + visibleRows);
    
    const startIdx = startRow * columnsPerRow;
    const endIdx = Math.min(images.length, endRow * columnsPerRow);
    
    const visible = images.slice(startIdx, endIdx);
    
    return {
      visibleItems: visible,
      totalHeight: totalRows * rowHeight,
      startIndex: startIdx,
      endIndex: endIdx
    };
  }, [images, scrollTop, containerHeight, itemHeight, columnsPerRow]);

  // Optimized scroll handler
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    setScrollTop(target.scrollTop);
  }, []);

  // Intersection Observer for progressive image loading
  useEffect(() => {
    const imageElements = document.querySelectorAll('[data-image-id]');
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const imageId = parseInt(entry.target.getAttribute('data-image-id') || '0');
            setLoadedImages(prev => new Set([...prev, imageId]));
          }
        });
      },
      {
        root: null,
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    imageElements.forEach(el => observer.observe(el));

    addCleanup(() => {
      observer.disconnect();
    });

    return () => observer.disconnect();
  }, [visibleItems, addCleanup]);

  // Handle container resize
  useEffect(() => {
    const container = document.getElementById('gallery-container');
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerHeight(entry.contentRect.height);
      }
    });

    resizeObserver.observe(container);
    addCleanup(() => resizeObserver.disconnect());

    return () => resizeObserver.disconnect();
  }, [addCleanup]);

  // Optimized image component
  const ImageCard = React.memo<{ image: ImageItem; style: React.CSSProperties }>(
    ({ image, style }) => {
      const isLoaded = loadedImages.has(image.id);
      
      return (
        <div
          style={style}
          className="absolute bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
          data-image-id={image.id}
          onClick={() => onImageSelect?.(image)}
        >
          {isLoaded ? (
            <img
              src={image.thumbnail || image.url}
              alt={image.alt || `Image ${image.id}`}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                // Fallback to main URL if thumbnail fails
                const img = e.target as HTMLImageElement;
                if (img.src !== image.url) {
                  img.src = image.url;
                }
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center">
              <div className="text-gray-400 text-sm">Loading...</div>
            </div>
          )}
          
          {/* Save button overlay */}
          {onImageSave && (
            <button
              className="absolute top-2 right-2 bg-black/70 text-white p-2 rounded-full opacity-0 hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onImageSave(image.id);
              }}
            >
              ♡
            </button>
          )}
        </div>
      );
    }
  );

  return (
    <div
      id="gallery-container"
      className={`relative overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div
        className="relative"
        style={{ height: totalHeight }}
      >
        {visibleItems.map((image, index) => {
          const actualIndex = startIndex + index;
          const row = Math.floor(actualIndex / columnsPerRow);
          const col = actualIndex % columnsPerRow;
          
          const style: React.CSSProperties = {
            position: 'absolute',
            top: row * (itemHeight + 16),
            left: col * (100 / columnsPerRow) + '%',
            width: `calc(${100 / columnsPerRow}% - 12px)`,
            height: itemHeight,
            margin: '0 6px'
          };

          return (
            <ImageCard
              key={image.id}
              image={image}
              style={style}
            />
          );
        })}
      </div>
    </div>
  );
};

export default VirtualizedImageGrid;