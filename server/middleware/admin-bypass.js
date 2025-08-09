const ADMIN_BYPASS_TOKEN = 'sandra-admin-2025';

function adminBypass(req, res, next) {
  const adminToken = req.headers['x-admin-token'] || req.query.admin_token;
  
  if (adminToken === ADMIN_BYPASS_TOKEN) {
    req.isAdminBypass = true;
    req.bypassTokenUsage = false; // NO CLAUDE API COSTS
    return next();
  }
  
  next();
}

export { adminBypass, ADMIN_BYPASS_TOKEN };