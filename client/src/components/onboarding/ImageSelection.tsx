import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface ImageSelectionProps {
  aiGallery: {
    userGeneratedPhotos: string[];
    styledVariations: string[];
    editorialVersions: string[];
  };
  flatlayLibrary: {
    luxuryBrands: string[];
    editorialLayouts: string[];
    businessAssets: string[];
  };
  onSelectionComplete: (selected: string[]) => void;
}

const ImageSelection: React.FC<ImageSelectionProps> = ({ 
  aiGallery, 
  flatlayLibrary, 
  onSelectionComplete 
}) => {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  return (
    <div className="image-selection-interface luxury-container">
      <div className="ai-gallery">
        <h2>Your AI-Generated Photos</h2>
        <DragDropContext onDragEnd={(result) => {
          // Handle drag and drop logic
        }}>
          <div className="gallery-grid">
            {/* AI Gallery Section */}
            <div className="user-generated">
              {aiGallery.userGeneratedPhotos.map((photo, index) => (
                <div key={index} className="photo-item">
                  <img src={photo} alt={`AI Generated ${index}`} />
                </div>
              ))}
            </div>
          </div>
        </DragDropContext>
      </div>

      <div className="flatlay-library">
        <h2>Editorial Flatlay Library</h2>
        <div className="library-grid">
          {/* Luxury Brands Section */}
          <div className="luxury-brands">
            {flatlayLibrary.luxuryBrands.map((brand, index) => (
              <div key={index} className="brand-item">
                <img src={brand} alt={`Luxury Brand ${index}`} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="real-time-preview">
        <h3>Selected Images Preview</h3>
        <div className="preview-grid">
          {selectedImages.map((image, index) => (
            <div key={index} className="preview-item">
              <img src={image} alt={`Selected ${index}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageSelection;