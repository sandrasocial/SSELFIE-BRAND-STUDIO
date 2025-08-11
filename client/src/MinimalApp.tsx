import React from 'react';

// Ultra minimal component to test React rendering
export default function MinimalApp() {
  console.log('MinimalApp: Component rendering...');
  
  return React.createElement('div', {
    style: {
      padding: '20px',
      backgroundColor: '#f0f0f0',
      fontFamily: 'Arial, sans-serif',
      minHeight: '100vh'
    }
  }, 
    React.createElement('h1', { style: { color: 'green' } }, 'SSELFIE Studio - Minimal Test'),
    React.createElement('p', { style: { color: 'black' } }, 'React is working! Server connected successfully.'),
    React.createElement('button', {
      onClick: () => console.log('Button clicked - React events working!'),
      style: {
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }
    }, 'Test Click')
  );
}