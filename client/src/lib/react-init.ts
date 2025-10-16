// React initialization - this runs at module load time
// We use require() to avoid circular dependency issues with ES6 imports

declare global {
  interface Window {
    React: any;
    ReactDOM: any;
    __REACT_INIT_TIME__: number;
    __REACT_INIT_STATUS__: string;
    __REACT_INITIALIZED__: boolean;
  }
}

// Use require to load React at runtime, avoiding circular dependencies
const React = require('react');
const ReactDOM = require('react-dom');

// Make React available globally IMMEDIATELY
if (typeof window !== 'undefined') {
  window.React = React;
  window.ReactDOM = ReactDOM;
  window.__REACT_INITIALIZED__ = true;
  window.__REACT_INIT_TIME__ = Date.now();
  window.__REACT_INIT_STATUS__ = 'completed';
  console.log('✅ React initialized globally');
}

export { React, ReactDOM };