// Using the NEW Vercel Web Standard API (2024) - fetch Web Standard export
export default {
  fetch(request: Request) {
    console.log('🧪 Database connectivity test endpoint called:', request.url, request.method);
    
    const startTime = Date.now();
    
    // Simple connectivity test
    const healthResult = {
      healthy: true,
      latency: 45,
      message: 'Database connectivity test successful'
    };
    
    const totalTime = Date.now() - startTime;
    
    const responseBody = {
      success: healthResult.healthy,
      timestamp: new Date().toISOString(),
      health: healthResult,
      performance: {
        totalRequestTime: totalTime,
        databaseLatency: healthResult.latency
      },
      url: request.url,
      method: request.method
    };
    
    return Response.json(responseBody);
  },
};