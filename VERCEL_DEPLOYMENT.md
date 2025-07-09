# Vercel Deployment Guide for SSELFIE Studio

## Project ID: prj_g8YQ1TXxdxNO4uIj1xECoeOZHid5

## Step 1: Connect GitHub Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project" or use existing project
3. Import from GitHub: `sandrasocial/SSELFIE`
4. Configure build settings (should auto-detect)

## Step 2: Environment Variables
Set these in Vercel Dashboard → Project → Settings → Environment Variables:

### Database & Auth
```
DATABASE_URL=your_neon_database_url
PGHOST=your_pg_host
PGPORT=5432
PGDATABASE=your_database_name
PGUSER=your_username
PGPASSWORD=your_password
SESSION_SECRET=your_session_secret
REPLIT_DOMAINS=your-custom-domain.com
```

### Stripe Integration
```
STRIPE_SECRET_KEY=sk_test_your_stripe_secret
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public
```

### AI Services
```
ANTHROPIC_API_KEY=your_anthropic_key
OPENAI_API_KEY=your_openai_key
REPLICATE_API_TOKEN=your_replicate_token
```

### Email Service
```
RESEND_API_KEY=your_resend_api_key
```

## Step 3: Build Configuration
Vercel should auto-detect, but verify:
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

## Step 4: Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Test your deployment URL

## Step 5: Custom Domain
1. Go to Project → Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

## Step 6: Webhook Setup
Update your Stripe webhook URL to point to:
`https://your-domain.com/api/stripe/webhook`

## Troubleshooting
- Check build logs for errors
- Verify all environment variables are set
- Ensure Stripe test mode is enabled initially
- Test authentication flow after deployment

Your SSELFIE Studio is production-ready! 🚀