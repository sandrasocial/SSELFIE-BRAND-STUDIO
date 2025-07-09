// Vercel serverless API handler
module.exports = async (req, res) => {
  try {
    // Import the built server from dist
    const serverModule = await import('../dist/index.js');
    const server = serverModule.default;
    
    // Handle the request
    return server(req, res);
  } catch (error) {
    console.error('API Error:', error);
    
    // Fallback responses while debugging
    if (req.url === '/api/health') {
      return res.json({ status: 'ok', timestamp: new Date().toISOString() });
    }
    
    if (req.url === '/api/login') {
      return res.json({ 
        message: 'Login redirect',
        url: '/api/login',
        note: 'Backend loading...'
      });
    }
    
    return res.status(500).json({ 
      error: 'Backend initialization failed',
      message: error.message,
      path: req.url,
      stack: error.stack
    });
  }
};