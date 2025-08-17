// Ultra simple test component to debug white screen
function TestApp() {
  console.log('TestApp: Rendering...');
  
  return (
    <div style={{ padding: '20px', backgroundColor: 'lightblue' }}>
      <h1 style={{ color: 'black' }}>Test App Loading Successfully!</h1>
      <p>If you can see this, React is working.</p>
      <button onClick={() => alert('Button clicked!')}>
        Test Button
      </button>
    </div>
  );
}

export default TestApp;