// Training Progress Component
// Consistent progress UI with luxury design and animations

import React from 'react';
import { ProgressUIProps, TrainingStage } from '../../../../shared/types/client-training.js';
import { Colors, Typography, Spacing, Transitions } from '../../styles/designSystem.js';

export const TrainingProgress: React.FC<ProgressUIProps> = ({
  stage,
  progress,
  timeRemaining,
  className = ''
}) => {
  // Format time remaining
  const formatTimeRemaining = (ms: number): string => {
    if (ms <= 0) return '';
    
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${seconds}s`;
  };

  const progressPercentage = Math.max(5, Math.min(100, progress));
  const timeRemainingText = timeRemaining ? formatTimeRemaining(timeRemaining) : '';

  return (
    <div className={`training-progress ${className}`} style={{
      width: '100%',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      {/* Stage Indicator */}
      <div style={{
        fontSize: Typography.body.fontSize.sm,
        fontFamily: Typography.body.fontFamily,
        fontWeight: Typography.body.fontWeight.normal,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: Colors.text.secondary,
        marginBottom: Spacing[4],
        textAlign: 'center'
      }}>
        {stage.name} • {stage.description}
      </div>

      {/* Progress Bar Container */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '12px',
        backgroundColor: Colors.background.alt,
        borderRadius: '16px',
        overflow: 'hidden',
        marginBottom: Spacing[6],
        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Progress Bar Fill */}
        <div 
          style={{
            width: `${progressPercentage}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${Colors.primary} 0%, rgba(0, 0, 0, 0.8) 50%, ${Colors.primary} 100%)`,
            borderRadius: '16px',
            transition: Transitions.luxury.transform,
            position: 'relative'
          }}
        >
          {/* Shimmer Effect */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
            animation: progressPercentage < 100 ? 'shimmer 2s infinite' : 'none'
          }} />
        </div>
      </div>

      {/* Progress Stats */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: Typography.body.fontSize.sm,
        fontFamily: Typography.body.fontFamily,
        fontWeight: Typography.body.fontWeight.light,
        color: Colors.text.secondary,
        marginBottom: Spacing[4]
      }}>
        <span>Progress: {Math.round(progressPercentage)}%</span>
        {timeRemainingText && (
          <span>Time Remaining: {timeRemainingText}</span>
        )}
      </div>

      {/* Stage Progress Indicators */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: Spacing[2]
      }}>
        {['preprocessing', 'training', 'finalizing'].map((stageName, index) => {
          const isActive = stage.name === stageName;
          const isCompleted = ['preprocessing', 'training', 'finalizing'].indexOf(stage.name) > index;
          
          return (
            <div
              key={stageName}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: Spacing[2]
              }}
            >
              {/* Stage Dot */}
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isCompleted || isActive 
                  ? Colors.primary 
                  : Colors.border.light,
                transition: Transitions.luxury.hover
              }} />
              
              {/* Stage Label */}
              <span style={{
                fontSize: Typography.body.fontSize.xs,
                textTransform: 'capitalize',
                color: isCompleted || isActive 
                  ? Colors.text.primary 
                  : Colors.text.muted,
                transition: Transitions.luxury.hover
              }}>
                {stageName}
              </span>
              
              {/* Connector Line */}
              {index < 2 && (
                <div style={{
                  flex: 1,
                  height: '1px',
                  backgroundColor: Colors.border.light,
                  marginLeft: Spacing[2]
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Add shimmer animation styles */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
};

// Luxury Training Animation Component
export const TrainingAnimation: React.FC<{ size?: number }> = ({ size = 100 }) => {
  return (
    <div style={{
      position: 'relative',
      width: `${size}px`,
      height: `${size}px`,
      margin: '0 auto'
    }}>
      {/* Outer Ring */}
      <div style={{
        position: 'absolute',
        inset: 0,
        border: `2px solid ${Colors.border.light}`,
        borderRadius: '50%'
      }} />
      
      {/* Spinning Ring */}
      <div style={{
        position: 'absolute',
        inset: 0,
        border: `2px solid ${Colors.primary}`,
        borderTop: '2px solid transparent',
        borderRadius: '50%',
        animation: 'spin 2s linear infinite'
      }} />
      
      {/* Inner Pulse Ring */}
      <div style={{
        position: 'absolute',
        inset: '12px',
        border: `1px solid ${Colors.text.secondary}`,
        borderRadius: '50%',
        animation: 'pulse 2s ease-in-out infinite',
        opacity: 0.6
      }} />
      
      {/* Center Dot */}
      <div style={{
        position: 'absolute',
        inset: '24px',
        background: Colors.background.alt,
        borderRadius: '50%'
      }} />

      {/* Animation Styles */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};