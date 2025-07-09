# SSELFIE Studio Deployment Guide

## GitHub + Vercel Deployment Steps

### 1. Prepare Repository
```bash
# Initialize git repository
git init
git add .
git commit -m "Initial commit: SSELFIE Studio production ready"

# Add your GitHub remote
git remote add origin https://github.com/yourusername/sselfie-studio.git
git branch -M main
git push -u origin main
```

### 2. Vercel Configuration

The project includes `vercel.json` with optimized settings:
- Backend: Node.js serverless functions
- Frontend: Static build with Vite
- API routes properly configured
- Production environment variables

### 3. Environment Variables in Vercel

Set these in your Vercel dashboard:

**Database:**
```
DATABASE_URL=your_postgresql_url
```

**Authentication:**
```
SESSION_SECRET=your_session_secret
REPL_ID=your_repl_id
REPLIT_DOMAINS=yourdomain.com,www.yourdomain.com
```

**Stripe (Test Mode):**
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

**AI Services:**
```
ANTHROPIC_API_KEY=sk-ant-...
REPLICATE_API_TOKEN=r8_...
```

**Email:**
```
RESEND_API_KEY=re_...
```

### 4. Database Setup

Your Neon PostgreSQL database is already configured. After deployment:

```bash
# Run migrations if needed
npx drizzle-kit push
```

### 5. Stripe Webhook Configuration

Update your Stripe webhook endpoint to:
```
https://yourdomain.com/api/webhook/stripe
```

### 6. Custom Domain Configuration

In Vercel:
1. Go to Project Settings > Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Update REPLIT_DOMAINS environment variable

### 7. Production Checklist

✅ All environment variables set  
✅ Database migrations applied  
✅ Stripe webhooks configured  
✅ DNS records pointing to Vercel  
✅ SSL certificates auto-configured  
✅ Email service verified  

## Build Commands

Vercel will automatically run:
```bash
npm run build  # Builds frontend + backend
```

## Important Notes

- The build process creates optimized bundles
- API routes are handled as serverless functions
- Static assets are CDN-cached
- Environment variables are securely managed
- The platform is production-ready with all security measures

## Support

For deployment issues, check:
1. Vercel build logs
2. Function logs in Vercel dashboard
3. Database connectivity
4. Environment variable configuration

Your SSELFIE Studio is ready for production deployment! 🚀