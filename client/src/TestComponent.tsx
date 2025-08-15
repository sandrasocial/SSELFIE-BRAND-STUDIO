import React from "react";

export default function TestComponent() {
  return (
    <div style={{ 
      padding: '40px', 
      textAlign: 'center', 
      fontFamily: 'Times New Roman, serif',
      background: '#000',
      color: '#fff',
      minHeight: '100vh'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>SSELFIE Studio</h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>React Application Successfully Loaded</p>
      <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '8px' }}>
        <h2>✅ System Status</h2>
        <p>✅ Vite Development Server: Running</p>
        <p>✅ TypeScript Compilation: Working</p>
        <p>✅ React Components: Rendering</p>
        <p>✅ CSS Processing: Active</p>
      </div>
    </div>
  );
}