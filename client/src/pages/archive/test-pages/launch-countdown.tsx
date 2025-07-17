import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

export default function LaunchCountdown() {
  const [, setLocation] = useLocation();
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLaunched, setIsLaunched] = useState(false);

  // Set target launch time to 23:11 today (or tomorrow if past)
  const getLaunchTime = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 11, 0);
    
    // If it's already past 23:11 today, set for tomorrow
    if (now > today) {
      today.setDate(today.getDate() + 1);
    }
    
    return today;
  };

  const launchTime = getLaunchTime();

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchTime.getTime() - now;

      if (distance > 0) {
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft({ hours, minutes, seconds });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        setIsLaunched(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [launchTime]);

  const handleGoLive = () => {
    setShowConfetti(true);
    
    // Add confetti animation
    const confettiColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b'];
    
    // Create confetti particles
    for (let i = 0; i < 150; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti-particle';
      confetti.style.cssText = `
        position: fixed;
        width: 8px;
        height: 8px;
        background-color: ${confettiColors[Math.floor(Math.random() * confettiColors.length)]};
        left: ${Math.random() * 100}vw;
        top: -10px;
        z-index: 9999;
        animation: confetti-fall ${2 + Math.random() * 3}s linear forwards;
        transform: rotate(${Math.random() * 360}deg);
      `;
      document.body.appendChild(confetti);
      
      // Remove confetti after animation
      setTimeout(() => {
        if (confetti.parentNode) {
          confetti.parentNode.removeChild(confetti);
        }
      }, 5000);
    }
    
    // Redirect to landing page after confetti
    setTimeout(() => {
      setLocation('/');
    }, 2000);
  };

  // Add confetti CSS animation
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes confetti-fall {
        0% {
          transform: translateY(-100vh) rotate(0deg);
          opacity: 1;
        }
        100% {
          transform: translateY(100vh) rotate(720deg);
          opacity: 0;
        }
      }
      
      @keyframes pulse-glow {
        0%, 100% {
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
        }
        50% {
          box-shadow: 0 0 40px rgba(255, 255, 255, 0.6);
        }
      }
      
      .pulse-glow {
        animation: pulse-glow 2s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-50"></div>
      
      {/* Main content */}
      <div className="text-center z-10">
        {/* SSELFIE STUDIO branding */}
        <div className="mb-16">
          <h1 
            className="text-6xl md:text-8xl font-light tracking-[0.3em] mb-4"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            S S E L F I E
          </h1>
          <div 
            className="text-2xl md:text-3xl font-light tracking-[0.2em] opacity-80"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            S T U D I O
          </div>
        </div>

        {/* Angel Numbers Message */}
        <div className="mb-12">
          <p className="text-lg md:text-xl text-white/80 mb-2">
            ✨ Launching at the sacred hour ✨
          </p>
          <p className="text-3xl md:text-4xl font-light tracking-wider">
            2 3 : 1 1
          </p>
          <p className="text-sm text-white/60 mt-2">
            When angel numbers align with dreams
          </p>
        </div>

        {/* Countdown Timer */}
        {!isLaunched ? (
          <div className="mb-16">
            <div className="flex items-center justify-center space-x-8 md:space-x-12">
              <div className="text-center">
                <div className="text-5xl md:text-7xl font-light tabular-nums">
                  {timeLeft.hours.toString().padStart(2, '0')}
                </div>
                <div className="text-sm md:text-base text-white/60 mt-2 tracking-wider">
                  HOURS
                </div>
              </div>
              
              <div className="text-4xl md:text-6xl font-light text-white/40">:</div>
              
              <div className="text-center">
                <div className="text-5xl md:text-7xl font-light tabular-nums">
                  {timeLeft.minutes.toString().padStart(2, '0')}
                </div>
                <div className="text-sm md:text-base text-white/60 mt-2 tracking-wider">
                  MINUTES
                </div>
              </div>
              
              <div className="text-4xl md:text-6xl font-light text-white/40">:</div>
              
              <div className="text-center">
                <div className="text-5xl md:text-7xl font-light tabular-nums">
                  {timeLeft.seconds.toString().padStart(2, '0')}
                </div>
                <div className="text-sm md:text-base text-white/60 mt-2 tracking-wider">
                  SECONDS
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-16">
            <div className="text-4xl md:text-6xl font-light mb-4 text-emerald-400">
              🚀 IT'S TIME! 🚀
            </div>
            <p className="text-xl md:text-2xl text-white/80">
              The moment has arrived
            </p>
          </div>
        )}

        {/* Launch Button */}
        <div className="mb-8">
          <button
            onClick={handleGoLive}
            disabled={!isLaunched && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0 ? false : !isLaunched}
            className={`
              px-16 py-6 
              border-2 border-white 
              text-xl md:text-2xl 
              font-light 
              tracking-[0.2em] 
              transition-all 
              duration-500
              ${isLaunched || (timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0)
                ? 'bg-white text-black hover:bg-gray-100 pulse-glow cursor-pointer' 
                : 'bg-transparent text-white/50 cursor-not-allowed'
              }
            `}
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            {isLaunched || (timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) 
              ? 'G O   L I V E' 
              : 'W A I T I N G . . .'
            }
          </button>
        </div>

        {/* Motivational message */}
        <div className="text-center text-white/60 max-w-2xl mx-auto px-8">
          <p className="text-lg md:text-xl font-light leading-relaxed">
            "Every empire begins with a single brave decision.<br />
            Tonight, we make history."
          </p>
          <p className="text-sm mt-4 tracking-wider">
            - Sandra
          </p>
        </div>
      </div>

      {/* Ambient particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Bottom timestamp */}
      <div className="absolute bottom-8 left-8 text-white/40 text-sm">
        Launch Date: {launchTime.toLocaleDateString()} at 23:11
      </div>
      
      <div className="absolute bottom-8 right-8 text-white/40 text-sm">
        Angel Numbers: 2311
      </div>
    </div>
  );
}