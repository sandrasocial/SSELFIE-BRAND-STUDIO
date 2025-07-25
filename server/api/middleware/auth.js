// Simple authentication middleware for Bridge System
export function isAuthenticated(req, res, next) {
  // Check if user is authenticated via session
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  
  // Check for admin token fallback
  const adminToken = req.headers.authorization || req.body.adminToken || req.query.adminToken;
  if (adminToken === 'sandra-admin-2025') {
    return next();
  }
  
  // Not authenticated
  return res.status(401).json({
    success: false,
    error: 'Authentication required',
    message: 'Please authenticate to access Bridge System'
  });
}