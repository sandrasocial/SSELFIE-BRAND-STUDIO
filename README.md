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

- **€47 SSELFIE AI Pack**: 250 total generations
- **€97 Studio Founding**: 100 monthly generations
- **€147 Studio Standard**: 250 monthly generations

Cost protection with 85-95% profit margins through intelligent usage tracking.

## License

Private - All Rights Reserved