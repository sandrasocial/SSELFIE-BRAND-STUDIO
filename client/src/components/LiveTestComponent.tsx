import React, { useState, useEffect } from 'react';

export default function LiveTestComponent() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [counter, setCounter] = useState(0);
  const [isHeartbeat, setIsHeartbeat] = useState(false);
  const [colorPhase, setColorPhase] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setCounter(prev => prev + 1);
      setIsHeartbeat(true);
      setColorPhase(prev => (prev + 1) % 4);
      setTimeout(() => setIsHeartbeat(false), 200);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getBackgroundColor = () => {
    switch(colorPhase) {
      case 0: return 'bg-white';
      case 1: return 'bg-gray-50';
      case 2: return 'bg-gray-100';
      case 3: return 'bg-gray-50';
      default: return 'bg-white';
    }
  };

  const getTextColor = () => {
    return colorPhase === 2 ? 'text-gray-900' : 'text-black';
  };

  return (
    <div className={`min-h-screen flex items-center justify-center transition-all duration-1000 ${getBackgroundColor()}`}>
      <div className="max-w-4xl mx-auto px-8 text-center">
        <h1 
          className={`text-6xl font-serif tracking-wide mb-8 uppercase transition-all duration-1000 ${getTextColor()}`}
          style={{ fontFamily: 'Times New Roman, serif', fontWeight: 200 }}
        >
          Live Test
        </h1>
        
        <div className="mb-12">
          <div className={`text-8xl font-serif transition-all duration-200 ${getTextColor()} ${
            isHeartbeat ? 'scale-110 opacity-90' : 'scale-100 opacity-100'
          }`}>
            {counter}
          </div>
          <p className={`text-xl mt-4 tracking-wide transition-all duration-1000 ${
            colorPhase === 2 ? 'text-gray-700' : 'text-gray-600'
          }`}>
            Heartbeats of Excellence
          </p>
        </div>

        {/* Heartbeat visual indicator */}
        <div className="flex justify-center mb-8">
          <div className={`w-4 h-4 rounded-full transition-all duration-200 ${
            colorPhase === 2 ? 'bg-gray-800' : 'bg-black'
          } ${isHeartbeat ? 'scale-150 opacity-60' : 'scale-100 opacity-100'}`} />
        </div>

        <div className={`border-t pt-8 transition-all duration-1000 ${
          colorPhase === 2 ? 'border-gray-300' : 'border-gray-200'
        }`}>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="text-2xl font-mono tracking-wider mb-2">
                {currentTime.toLocaleTimeString()}
              </div>
              <p className={`text-sm tracking-widest uppercase ${
                colorPhase === 2 ? 'text-gray-600' : 'text-gray-500'
              }`}>
                Current Time
              </p>
            </div>
            <div>
              <div className="text-2xl font-mono tracking-wider mb-2">
                ACTIVE
              </div>
              <p className={`text-sm tracking-widest uppercase ${
                colorPhase === 2 ? 'text-gray-600' : 'text-gray-500'
              }`}>
                Platform Status
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}