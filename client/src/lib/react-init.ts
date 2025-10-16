// This module MUST be imported first to ensure React is available globally
// before any third-party libraries (like lucide-react, react-icons) try to use it

import * as React from 'react';
import * as ReactDOM from 'react-dom';

declare global {
  interface Window {
    React: typeof React;
    ReactDOM: typeof ReactDOM;
    __REACT_INIT_TIME__: number;
    __REACT_INIT_STATUS__: string;
    __REACT_INITIALIZED__: boolean;
  }
}

// Ensure React is initialized IMMEDIATELY before any other code runs
// This prevents circular dependency issues and ensures third-party libraries can access React
if (typeof window !== 'undefined' && !window.__REACT_INITIALIZED__) {
  try {
    // Set React globally so third-party libraries can access it
    window.React = React;
    window.ReactDOM = ReactDOM;
    window.__REACT_INITIALIZED__ = true;

    // Add diagnostic info
    window.__REACT_INIT_TIME__ = Date.now();
    window.__REACT_INIT_STATUS__ = 'completed';

    console.log('✅ React initialized globally');
  } catch (error) {
    console.error('❌ React initialization error:', error);
    window.__REACT_INIT_STATUS__ = 'failed';
  }
}

export { React, ReactDOM };