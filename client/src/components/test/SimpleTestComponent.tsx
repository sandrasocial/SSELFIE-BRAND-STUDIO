import React from 'react';

/**
 * SimpleTestComponent - Luxury styled test component
 * Technical Implementation by Zara
 */
const SimpleTestComponent: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto bg-white/5 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
          {/* Luxury Typography Section */}
          <h1 
            className="font-['Times_New_Roman'] text-4xl text-gold-100 mb-6 tracking-wide"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            SSELFIE Luxury Experience
          </h1>
          
          <p 
            className="font-['Times_New_Roman'] text-xl text-gray-200 leading-relaxed mb-8"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            Elevating digital presence through meticulous design and flawless execution.
          </p>

          {/* Luxury Interactive Element */}
          <button 
            className="bg-gradient-to-r from-gold-400 to-gold-600 
                     text-black font-['Times_New_Roman'] text-lg px-8 py-3 
                     rounded-full transform transition-all duration-300
                     hover:scale-105 hover:shadow-gold"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            Experience Luxury
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleTestComponent;