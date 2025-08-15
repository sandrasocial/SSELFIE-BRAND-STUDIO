import React from 'react';
import { cn } from "./lib/utils";

const AriaEditorialShowcase: React.FC = () => {
  return (
    <div className="bg-white py-16 px-8 max-w-6xl mx-auto">
      <h1 className="font-serif text-5xl font-normal text-black tracking-tight leading-tight mb-8">
        The Art of Luxury Transformation
      </h1>
      
      <div className="bg-gray-50 p-12 my-8 border border-black">
        <p className="font-serif text-xl leading-relaxed text-black mb-6">
          From rock bottom to empire, every journey begins with a single step into transformation. 
          This is where ambition meets destiny, where your future self emerges from the shadows of doubt.
        </p>
      </div>

      <div className="bg-gray-50 p-12 my-8 border border-black">
        <p className="font-serif text-xl leading-relaxed text-black mb-6">
          Embrace the power of your narrative. Your story, crafted with intention, 
          becomes the foundation of your legacy. This is more than change – 
          this is metamorphosis.
        </p>
      </div>
    </div>
  );
};

export default AriaEditorialShowcase;