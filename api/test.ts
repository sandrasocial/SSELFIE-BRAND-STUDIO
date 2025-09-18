// Using the NEW Vercel Web Standard API (2024)
export function GET(request: Request) {
  console.log('🧪 Test endpoint called:', request.url, request.method);
  
  return Response.json({
    message: 'Test endpoint working with NEW Vercel API!',
    url: request.url,
    method: request.method,
    timestamp: new Date().toISOString()
  });
}

export function POST(request: Request) {
  console.log('🧪 Test POST endpoint called:', request.url);
  
  return Response.json({
    message: 'Test POST endpoint working with NEW Vercel API!',
    url: request.url,
    method: 'POST',
    timestamp: new Date().toISOString()
  });
}
