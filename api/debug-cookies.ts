import { VercelRequest, VercelResponse } from '@vercel/node';

// Debug endpoint to see what cookies are being sent
export default function handler(req: VercelRequest, res: VercelResponse) {
  console.log('🔍 Cookie Debug - All headers:', req.headers);
  
  const cookieHeader = req.headers.cookie;
  console.log('🔍 Raw cookie header:', cookieHeader);
  
  if (cookieHeader) {
    const cookies: Record<string, string> = {};
    
    cookieHeader.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = decodeURIComponent(value);
      }
    });
    
    console.log('🔍 Parsed cookies:', Object.keys(cookies));
    
    // Look for Stack Auth related cookies
    const stackCookies = Object.keys(cookies).filter(name => 
      name.includes('stack') || name.includes('auth') || name.includes('token')
    );
    
    console.log('🔍 Stack-related cookies:', stackCookies);
    
    res.status(200).json({
      allCookies: Object.keys(cookies),
      stackCookies: stackCookies.map(name => ({ 
        name, 
        value: cookies[name].substring(0, 50) + '...',
        length: cookies[name].length
      })),
      hasStackAccess: !!cookies['stack-access-token'],
      hasStackSession: !!cookies['stack_session'],
    });
  } else {
    res.status(200).json({
      message: 'No cookies found',
      headers: req.headers
    });
  }
}