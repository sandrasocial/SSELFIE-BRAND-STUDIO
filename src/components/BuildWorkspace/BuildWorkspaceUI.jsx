import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './BuildWorkspaceUI.css';

const BuildWorkspaceUI = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  
  const templates = [
    {
      id: 'minimal-01',
      name: 'Editorial Portfolio',
      description: 'Sophisticated minimalist design with Times New Roman typography',
      preview: '/templates/editorial-portfolio.jpg'
    },
    {
      id: 'gallery-02', 
      name: 'Gallery Showcase',
      description: 'Art gallery-inspired layout for visual storytelling',
      preview: '/templates/gallery-showcase.jpg'
    },
    {
      id: 'vogue-03',
      name: 'Fashion Editorial',
      description: 'High-fashion editorial style with dramatic imagery',
      preview: '/templates/fashion-editorial.jpg'
    }
  ];

  return (
    <div className="build-workspace">
      <header className="build-workspace-header">
        <h1>BUILD Your Vision</h1>
        <p className="subtitle">Create a stunning presence that demands attention</p>
      </header>

      <div className="template-gallery">
        {templates.map(template => (
          <motion.div
            key={template.id}
            className="template-card"
            whileHover={{ scale: 1.02 }}
            onClick={() => setSelectedTemplate(template)}
          >
            <img src={template.preview} alt={template.name} />
            <h3>{template.name}</h3>
            <p>{template.description}</p>
          </motion.div>
        ))}
      </div>

      <div className="editing-tools">
        <section className="tool-section">
          <h2>Essential Elements</h2>
          <div className="tool-grid">
            <button className="tool-btn">Hero Section</button>
            <button className="tool-btn">Gallery Grid</button>
            <button className="tool-btn">About Story</button>
            <button className="tool-btn">Contact Form</button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default BuildWorkspaceUI;