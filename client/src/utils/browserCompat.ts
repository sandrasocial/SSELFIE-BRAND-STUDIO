// Browser compatibility utilities
export function redirectToHttps() {
  if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
    location.replace(`https:${location.href.substring(location.protocol.length)}`);
  }
}

export function detectBrowserIssues() {
  const userAgent = navigator.userAgent.toLowerCase();
  const isIE = userAgent.indexOf('msie') !== -1 || userAgent.indexOf('trident') !== -1;
  
  if (isIE) {
    console.warn('Internet Explorer detected - some features may not work properly');
    return 'ie';
  }
  
  return null;
}

export function showDomainHelp() {
  console.log('Domain help available at /domain-help');
}