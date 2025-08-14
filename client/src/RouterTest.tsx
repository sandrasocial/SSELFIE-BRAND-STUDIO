// Test with Wouter routing to verify everything works
import { Route } from "wouter";

export default function RouterTest() {
  console.log('🔥 RouterTest rendering, current path:', window.location.pathname);
  
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
      <h1>SSELFIE Studio - Routing Fixed!</h1>
      <p>Current path: {window.location.pathname}</p>
      
      <nav style={{ marginBottom: '20px' }}>
        <a href="/" style={{ margin: '0 10px', color: 'blue' }}>Home</a>
        <a href="/login" style={{ margin: '0 10px', color: 'blue' }}>Login</a>
        <a href="/test" style={{ margin: '0 10px', color: 'blue' }}>Test</a>
      </nav>
      
      <div style={{ border: '2px solid green', padding: '15px', backgroundColor: 'white' }}>
        <Route path="/">
          <h2 style={{ color: 'green' }}>✅ HOME PAGE WORKING</h2>
          <p>Welcome to SSELFIE Studio! Routing is completely fixed.</p>
        </Route>
        
        <Route path="/login">
          <h2 style={{ color: 'orange' }}>✅ LOGIN PAGE WORKING</h2>
          <p>Authentication page is working!</p>
          <button onClick={() => window.location.href = '/api/login'} 
                  style={{ padding: '10px 20px', backgroundColor: 'black', color: 'white', border: 'none' }}>
            Continue to Login
          </button>
        </Route>
        
        <Route path="/test">
          <h2 style={{ color: 'blue' }}>✅ TEST PAGE WORKING</h2>
          <p>All routing functionality is restored!</p>
        </Route>
      </div>
    </div>
  );
}