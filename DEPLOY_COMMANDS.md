# Manual Deployment Commands for SSELFIE Studio

## The Issue
Your logout endpoint exists in the code but isn't working on the live site. This suggests Vercel hasn't deployed the latest changes.

## Solution: Force Manual Deployment

### Option 1: Vercel Dashboard (Recommended)
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Find your SSELFIE project
3. Go to "Deployments" tab
4. Click "Redeploy" on the latest deployment
5. Wait for deployment to complete

### Option 2: Vercel CLI (If you have it installed)
```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Force redeploy
vercel --prod --force
```

### Option 3: Trigger New Deploy
```bash
# Make a small change and push
echo "# Force deploy $(date)" >> DEPLOYMENT.md
git add .
git commit -m "Force deployment trigger"
git push origin main
```

## What Should Work After Deployment

1. **Health Check**: `https://www.sselfie.ai/api/health` ✅ (already working)
2. **Login**: `https://www.sselfie.ai/api/login` ✅ (already working)  
3. **Logout**: `https://www.sselfie.ai/api/logout` ❌ (should work after redeploy)

## Verify Fix
After redeployment, test logout:
```bash
curl -v https://www.sselfie.ai/api/logout
```

Should return HTTP 307 redirect to `/` instead of HTTP 404.

## Why This Happened
Vercel sometimes caches serverless functions. The logout endpoint exists in your `api/index.js` file but the old cached version without logout is still being served.

The manual redeploy will clear the cache and deploy the latest version with the logout endpoint.