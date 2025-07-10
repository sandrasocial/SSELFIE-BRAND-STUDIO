# Vercel Deployment Instructions for SSELFIE Studio

## Quick Deploy Steps

1. **Connect to Vercel:**
   ```bash
   # If you haven't already, install Vercel CLI
   npm i -g vercel
   
   # Deploy to Vercel
   vercel --prod
   ```

2. **Or Deploy via GitHub:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository: `sandrasocial/SSELFIE`
   - Vercel will automatically detect the configuration

## Environment Variables Needed on Vercel

Set these in your Vercel dashboard under Project Settings > Environment Variables:

```
SESSION_SECRET=your-session-secret-key
NODE_ENV=production
```

## Verification Steps

After deployment, test these endpoints:

1. **Health Check:**
   ```
   https://your-app.vercel.app/api/health
   ```

2. **Login Test:**
   ```
   https://your-app.vercel.app/api/login
   ```

3. **Logout Test:**
   ```
   https://your-app.vercel.app/api/logout
   ```

## Fixed Issues

✅ **Logout 404 Error:** Fixed with proper Vercel serverless function configuration
✅ **Session Management:** Configured for Vercel's stateless environment  
✅ **API Routing:** Properly isolated /api/* routes to serverless functions
✅ **Frontend Routing:** SPA routes handled correctly with fallback to index.html

## Deployment Configuration

- **Frontend:** Built with `vite build` to `dist/public`
- **Backend:** Serverless functions in `/api/index.js`
- **Routing:** `/api/*` → serverless functions, `/*` → frontend SPA
- **Session:** In-memory sessions (will reset on function cold starts)

The logout functionality will work correctly once deployed to Vercel!