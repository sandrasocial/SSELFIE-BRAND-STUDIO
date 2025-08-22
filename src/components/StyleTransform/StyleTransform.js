import React, { useState } from 'react';
import './StyleTransform.css';

const STYLE_PRESETS = {
  // Professional Presets
  'Executive': {
    filters: { brightness: 1.1, contrast: 1.1, saturation: 0.95 },
    lighting: 'professional',
    background: 'office',
    pose: 'confident',
  },
  'Creative Professional': {
    filters: { brightness: 1.05, contrast: 1.05, saturation: 1.1 },
    lighting: 'artistic',
    background: 'studio',
    pose: 'expressive',
  },
  
  // Social Media Presets
  'Influencer': {
    filters: { brightness: 1.15, contrast: 1.15, saturation: 1.2 },
    lighting: 'bright',
    background: 'lifestyle',
    pose: 'casual',
  },
  'Content Creator': {
    filters: { brightness: 1.1, contrast: 1.2, saturation: 1.15 },
    lighting: 'dynamic',
    background: 'custom',
    pose: 'engaging',
  },

  // Personal Branding Presets
  'Thought Leader': {
    filters: { brightness: 1.05, contrast: 1.1, saturation: 0.9 },
    lighting: 'dramatic',
    background: 'minimal',
    pose: 'authoritative',
  },
  'Entrepreneur': {
    filters: { brightness: 1.1, contrast: 1.15, saturation: 1 },
    lighting: 'natural',
    background: 'modern',
    pose: 'approachable',
  }
};

const StyleTransform = ({ image, onTransform }) => {
  const [selectedPreset, setSelectedPreset] = useState('');
  const [customSettings, setCustomSettings] = useState({
    filters: { brightness: 1, contrast: 1, saturation: 1 },
    lighting: 'natural',
    background: 'none',
    pose: 'natural'
  });

  const applyTransformation = () => {
    const settings = selectedPreset ? STYLE_PRESETS[selectedPreset] : customSettings;
    onTransform(settings);
  };

  const handlePresetChange = (preset) => {
    setSelectedPreset(preset);
    setCustomSettings(STYLE_PRESETS[preset]);
  };

  return (
    <div className="style-transform-container">
      <h2>Style Your Image</h2>
      
      <div className="preset-selection">
        <h3>Choose Your Style</h3>
        <div className="preset-grid">
          {Object.keys(STYLE_PRESETS).map((preset) => (
            <button
              key={preset}
              className={`preset-button ${selectedPreset === preset ? 'active' : ''}`}
              onClick={() => handlePresetChange(preset)}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      <div className="custom-controls">
        <h3>Fine-tune Your Look</h3>
        {/* Add custom control sliders here */}
      </div>

      <button className="transform-button" onClick={applyTransformation}>
        Transform Image
      </button>
    </div>
  );
};

export default StyleTransform;