import React from 'react';

export default function TestMinimal() {
  console.log('TestMinimal component rendering');
  
  return (
    <div style={{ padding: '2rem', backgroundColor: 'red', color: 'white', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '3rem' }}>REACT IS WORKING</h1>
      <p>If you see this, React is rendering properly!</p>
      <div style={{ margin: '2rem 0' }}>
        <p>Current time: {new Date().toISOString()}</p>
        <p>Location: {window.location.href}</p>
      </div>
    </div>
  );
}