import { NextRequest, NextResponse } from 'next/server';

export default async function handler(req: NextRequest) {
  try {
    console.log('🔍 API Handler: Request received', req.url);
    
    // Simple health check for now
    if (req.url?.includes('/api/health')) {
      return NextResponse.json({
        status: 'healthy',
        service: 'SSELFIE Studio API',
        timestamp: new Date().toISOString(),
      });
    }
    
    // For auth endpoints, return a simple response for now
    if (req.url?.includes('/api/auth/user')) {
      return NextResponse.json({
        message: 'Authentication endpoint - requires proper setup',
        error: 'Not implemented yet'
      }, { status: 501 });
    }
    
    // Default response
    return NextResponse.json({
      message: 'SSELFIE Studio API',
      endpoint: req.url
    });
    
  } catch (error) {
    console.error('❌ API Handler Error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error.message
    }, { status: 500 });
  }
}
