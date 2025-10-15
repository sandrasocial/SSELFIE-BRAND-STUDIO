import * as React from 'react';
import * as ReactDOM from 'react-dom';

// Ensure React is initialized before any other code runs
try {
  if (typeof window !== 'undefined') {
    // Only set in browser environment
    window.React = React;
    window.ReactDOM = ReactDOM;
    
    // Add diagnostic info
    window.__REACT_INIT_TIME__ = Date.now();
    window.__REACT_INIT_STATUS__ = 'completed';
  }
} catch (error) {
  console.error('React initialization error:', error);
}

export { React, ReactDOM };