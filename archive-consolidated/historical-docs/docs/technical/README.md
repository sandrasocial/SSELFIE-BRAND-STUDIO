# SSELFIE Studio

The world's first AI-powered personal branding platform that transforms selfies into complete business launches.

## Features

- **AI Image Generation**: Custom FLUX-trained models for editorial selfie transformation
- **Brandbook Designer**: 4 luxury templates with Sandra AI Designer integration
- **STUDIO Workspace**: Pre-designed aesthetic themes with moodboard integration
- **Landing Page Builder**: Professional conversion-optimized page creation
- **Business Automation**: Payment processing, email automation, and customer management

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **Payments**: Stripe integration with webhook security
- **Email**: Resend service with custom templates
- **AI**: Claude 4.0 Sonnet + FLUX image generation

## Environment Variables

```bash
# Database
DATABASE_URL=your_postgresql_url

# Authentication
SESSION_SECRET=your_session_secret
REPL_ID=your_repl_id
REPLIT_DOMAINS=your_domain

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_PUBLIC_KEY=pk_test_...

# AI Services
ANTHROPIC_API_KEY=sk-ant-...
REPLICATE_API_TOKEN=r8_...

# Email
RESEND_API_KEY=re_...
```

## Deployment

This project is optimized for Vercel deployment with the following build configuration:

```json
{
  "builds": [
    {
      "src": "server/index.ts",
      "use": "@vercel/node"
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/$1"
    }
  ]
}
```

## Business Model

**SSELFIE Studio - Single Premium Subscription:**
- **€67/month SSELFIE Studio**: 100 monthly AI generations with individual model training
- **FREE Plan**: 6 AI images per month with Maya AI photographer chat
- **Premium Features**: FLUX Pro luxury models, Maya AI unlimited chat, commercial usage rights
- **Target Market**: Female entrepreneurs, coaches, and consultants building personal brands

**Revenue Model:**
- 87% profit margin (€67 revenue vs €8 costs)
- 100 monthly generation limit for cost protection
- Individual AI model training for each subscriber
- Positioned as "Rolls-Royce of AI personal branding"

**Business Metrics:**
- 1000+ users
- €15,132 monthly revenue
- Premium positioning with luxury editorial design

## License

Private - All Rights Reserved# Force deploy Thu Jul 10 10:18:44 AM UTC 2025
