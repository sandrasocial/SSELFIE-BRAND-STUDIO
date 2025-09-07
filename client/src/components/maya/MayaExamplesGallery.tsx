import React from 'react';
import { Camera, CheckCircle, AlertTriangle } from 'lucide-react';
import { SandraImages } from '../../lib/sandra-images';

interface MayaExamplesGalleryProps {
  className?: string;
}

export function MayaExamplesGallery({ className = "" }: MayaExamplesGalleryProps) {
  // Use Sandra's professional selfie examples
  const examplePhotos = SandraImages.portraits.professional;
  
  return (
    <div className={`maya-examples-gallery ${className}`}>
      {/* Header with guidance */}
      <div className="mb-8">
        <h3 className="font-serif text-xl font-light tracking-wide mb-4">
          Perfect Training Photos
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed mb-6">
          These are the types of selfies that work best for AI training. Notice the clear facial expressions, 
          good lighting, and authentic moments - this is what creates professional results.
        </p>
      </div>

      {/* Example Photos Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {examplePhotos.slice(0, 6).map((imageUrl, index) => (
          <div key={index} className="relative aspect-square group">
            <img 
              src={imageUrl}
              alt={`Training example ${index + 1}`}
              className="w-full h-full object-cover rounded border border-gray-200 group-hover:shadow-md transition-shadow"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded">
              <div className="absolute bottom-2 right-2">
                <CheckCircle className="w-4 h-4 text-green-600 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Photo Guidelines */}
      <div className="space-y-6">
        <div className="border-t border-gray-200 pt-6">
          <h4 className="font-medium text-sm tracking-[0.1em] uppercase text-gray-700 mb-4">
            What Makes These Work
          </h4>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-sm">Clear, Natural Expression</div>
                <div className="text-xs text-gray-600">Authentic facial expressions that show personality</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-sm">Good Lighting</div>
                <div className="text-xs text-gray-600">Well-lit face with natural or window lighting</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-sm">Direct Eye Contact</div>
                <div className="text-xs text-gray-600">Looking at camera creates connection</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-sm">Variety of Angles</div>
                <div className="text-xs text-gray-600">Different poses and perspectives for better training</div>
              </div>
            </div>
          </div>
        </div>

        {/* What to Avoid */}
        <div className="border-t border-gray-200 pt-6">
          <h4 className="font-medium text-sm tracking-[0.1em] uppercase text-gray-700 mb-4">
            Avoid These Common Issues
          </h4>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-sm">Heavily Filtered Photos</div>
                <div className="text-xs text-gray-600">Filters change facial features and confuse AI training</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-sm">Dark or Blurry Images</div>
                <div className="text-xs text-gray-600">Poor quality photos lead to poor AI results</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-sm">Sunglasses or Face Coverage</div>
                <div className="text-xs text-gray-600">AI needs to see facial features clearly</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-sm">Group Photos</div>
                <div className="text-xs text-gray-600">Use individual selfies for best training results</div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="border-t border-gray-200 pt-6">
          <div className="bg-gray-50 rounded p-4 text-center">
            <Camera className="w-6 h-6 mx-auto mb-2 text-gray-600" />
            <div className="text-sm font-medium mb-1">Ready to Start Training?</div>
            <div className="text-xs text-gray-600">
              Upload 10-15 selfies like these examples to train your AI model
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}