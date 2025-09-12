import React from 'react';
import { brandStyleCollections, BrandStyleCollection } from '../data/brand-style-collections';

interface StyleSelectorProps {
  onStyleSelect: (style: BrandStyleCollection) => void;
  selectedStyleId?: string;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({
  onStyleSelect,
  selectedStyleId
}) => {
  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          Choose Your Brand Style
        </h2>
        <p className="text-gray-600">
          Select the aesthetic that best represents your vision
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {brandStyleCollections.map((style) => (
          <div
            key={style.id}
            onClick={() => onStyleSelect(style)}
            className={`
              relative group cursor-pointer rounded-xl overflow-hidden
              transform transition-all duration-300 hover:scale-105 hover:shadow-xl
              ${selectedStyleId === style.id 
                ? 'ring-4 ring-blue-500 shadow-lg' 
                : 'hover:shadow-lg'
              }
            `}
          >
            {/* Style Image */}
            <div className="aspect-square relative overflow-hidden">
              <img
                src={style.imageUrl}
                alt={style.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                onError={(e) => {
                  // Fallback to backgroundImage if imageUrl fails
                  e.currentTarget.src = style.backgroundImage;
                }}
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
              
              {/* Selection Indicator */}
              {selectedStyleId === style.id && (
                <div className="absolute top-4 right-4 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>

            {/* Style Info */}
            <div className="p-4 bg-white">
              <h3 className="font-semibold text-lg text-gray-800 mb-1">
                {style.name}
              </h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {style.description}
              </p>
              
              {/* Color Palette Preview */}
              <div className="flex space-x-2 mb-3">
                {style.colors.slice(0, 5).map((color, index) => (
                  <div
                    key={index}
                    className="w-6 h-6 rounded-full border-2 border-gray-200"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              {/* Style Tags */}
              <div className="text-xs text-gray-500">
                {style.aesthetic}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StyleSelector;