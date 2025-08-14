// NO WOUTER IMPORTS - Pure React test
function TestApp() {
  const pathname = window.location.pathname;
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>SSELFIE Studio - Pure React Test</h1>
      <p>Current path: {pathname}</p>
      
      {pathname === '/' && (
        <div>
          <h2>Home Page</h2>
          <p>This is the home page. Manual routing is working!</p>
        </div>
      )}
      
      {pathname === '/login' && (
        <div>
          <h2>Login Page</h2>
          <p>This is the login page. Login routing is working!</p>
        </div>
      )}
      
      {pathname === '/test' && (
        <div>
          <h2>Test Page</h2>
          <p>This is the test page. Test routing is working!</p>
        </div>
      )}
      
      {pathname !== '/' && pathname !== '/login' && pathname !== '/test' && (
        <div>
          <h2>Unknown Route</h2>
          <p>Path: {pathname}</p>
        </div>
      )}
    </div>
  );
}

export default TestApp;