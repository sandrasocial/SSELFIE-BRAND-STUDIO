// React initialization - this runs at module load time
// Using ES module imports to ensure proper module resolution

import * as React from 'react';
import * as ReactDOM from 'react-dom';

declare global {
  interface Window {
    React: any;
    ReactDOM: any;
    __REACT_INIT_TIME__: number;
    __REACT_INIT_STATUS__: string;
    __REACT_INITIALIZED__: boolean;
  }
}

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