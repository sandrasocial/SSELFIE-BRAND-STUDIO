import React from 'react';

interface EditorialSpreadProps {
  leftImage?: string;
  rightImage?: string;
  title?: string;
  description?: string;
  leftCaption?: string;
  rightCaption?: string;
  className?: string;
}

export default function EditorialSpread({
  leftImage = "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop",
  rightImage = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
  title = "Editorial Collection",
  description = "Curated moments that tell your story with editorial sophistication and timeless elegance.",
  leftCaption = "Left Image",
  rightCaption = "Right Image",
  className = ""
}: EditorialSpreadProps) {
  return (
    <div className={`bg-white ${className}`}>
      {/* Title Section */}
      <div className="text-center py-16 px-4">
        <h2 
          className="text-4xl md:text-5xl font-light text-black mb-6 tracking-wide"
          style={{ fontFamily: 'Times New Roman, serif' }}
        >
          {title}
        </h2>
        <div className="max-w-2xl mx-auto">
          <p className="text-lg text-gray-600 leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {/* Image Spread */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Left Image */}
        <div className="relative group overflow-hidden bg-gray-100">
          <div className="aspect-[4/5]">
            <img 
              src={leftImage}
              alt={leftCaption}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          
          {/* Left Caption Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6 md:p-8">
            <p 
              className="text-white text-lg font-light tracking-wide"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              {leftCaption}
            </p>
          </div>
        </div>

        {/* Right Image */}
        <div className="relative group overflow-hidden bg-gray-100">
          <div className="aspect-[4/5]">
            <img 
              src={rightImage}
              alt={rightCaption}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          
          {/* Right Caption Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6 md:p-8">
            <p 
              className="text-white text-lg font-light tracking-wide"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              {rightCaption}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Spacer */}
      <div className="h-24"></div>
    </div>
  );
}