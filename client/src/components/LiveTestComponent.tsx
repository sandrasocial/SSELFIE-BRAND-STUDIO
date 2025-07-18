import React, { useState, useEffect } from 'react';

export default function LiveTestComponent() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 
          className="text-6xl font-serif text-black uppercase tracking-wide mb-8"
          style={{ fontFamily: 'Times New Roman, serif', fontWeight: 200 }}
        >
          Live Test
        </h1>
        
        <div className="bg-black text-white px-8 py-4 inline-block">
          <div className="text-2xl font-mono tracking-wider">
            {currentTime.toLocaleTimeString()}
          </div>
        </div>
        
        <p className="mt-8 text-gray-600 tracking-wide">
          File system connection active
        </p>
      </div>
    </div>
  );
}