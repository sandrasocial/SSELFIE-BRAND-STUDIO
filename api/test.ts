// Using the NEW Vercel Web Standard API (2024) - fetch Web Standard export
export default {
  fetch(request: Request) {
    console.log('🧪 Test endpoint called:', request.url, request.method);
    
    return Response.json({
      message: 'Test endpoint working with NEW Vercel fetch API!',
      url: request.url,
      method: request.method,
      timestamp: new Date().toISOString()
    });
  },
};
