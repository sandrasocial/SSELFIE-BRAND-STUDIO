import React from 'react';

interface UnifiedLoginButtonProps {
  text: string;
  showBrand: boolean;
}

export default function UnifiedLoginButton({ text, showBrand }: UnifiedLoginButtonProps) {
  const handleLogin = () => {
    // Open OAuth in popup window instead of redirecting main window
    const popup = window.open(
      '/api/login?popup=true',
      'oauth_popup',
      'width=600,height=700,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no'
    );
    
    if (!popup) {
      // Fallback if popup is blocked
      console.log('🔄 Popup blocked, falling back to main window redirect');
      window.location.href = '/api/login';
      return;
    }
    
    // Listen for popup completion
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        console.log('✅ OAuth popup closed, redirecting to workspace');
        // Redirect to workspace instead of just refreshing
        window.location.href = '/workspace';
      }
    }, 1000);
    
    // Handle popup messages (if OAuth sends postMessage)
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      console.log('📨 Received message from popup:', event.data);
      
      if (event.data.type === 'OAUTH_SUCCESS') {
        console.log('✅ OAuth success received from popup');
        popup.close();
        clearInterval(checkClosed);
        window.removeEventListener('message', handleMessage);
        window.location.href = '/workspace';
      } else if (event.data.type === 'OAUTH_ERROR') {
        console.error('❌ OAuth error received from popup:', event.data.error);
        popup.close();
        clearInterval(checkClosed);
        window.removeEventListener('message', handleMessage);
        // Stay on current page to show error
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    // Cleanup after 5 minutes
    setTimeout(() => {
      if (!popup.closed) {
        console.log('⏰ OAuth popup timeout, closing');
        popup.close();
        clearInterval(checkClosed);
        window.removeEventListener('message', handleMessage);
      }
    }, 5 * 60 * 1000);
  };

  return (
    <div className="text-center">
      {showBrand && (
        <h1 className="text-3xl font-bold mb-4">SSELFIE Studio</h1>
      )}
      <button 
        onClick={handleLogin}
        className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
      >
        {text}
      </button>
    </div>
  );
}