import { stackClientApp } from '../../../stack/client.js';

export function getStackApp() {
  return stackClientApp;
}

// 🔥 CRITICAL FIX: Clear invalid tokens before Stack Auth initializes
if (typeof window !== 'undefined') {
  // Clear any cookies or localStorage that contain "undefined" for Stack Auth tokens
  const clearInvalidTokens = () => {
    // Clear cookies
    document.cookie.split(';').forEach(c => {
      const eqPos = c.indexOf('=');
      const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
      if (name.includes('stack') && document.cookie.includes(`${name}=undefined`)) {
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
      }
    });

    // Clear localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.toLowerCase().includes('stack') && localStorage.getItem(key) === 'undefined') {
        localStorage.removeItem(key);
      }
    });

    // Clear sessionStorage
    Object.keys(sessionStorage).forEach(key => {
      if (key.toLowerCase().includes('stack') && sessionStorage.getItem(key) === 'undefined') {
        sessionStorage.removeItem(key);
      }
    });
  };

  clearInvalidTokens();
}


