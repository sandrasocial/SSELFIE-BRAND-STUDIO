# SSELFIE AI Photoshoot - Minimal Setup Plan

## Immediate Implementation Strategy
Since we need to launch quickly within current Replit constraints, I'll:

1. **Clean Current Architecture** - Remove conflicts, simplify database
2. **Focus Core Features** - Landing, Checkout, Training, Generation, Gallery
3. **Extract Working AI** - Your proven model training and generation services
4. **Implement Payment First** - Stripe checkout before authentication

## New File Structure (Minimal)
```
CORE PHOTOSHOOT FILES:
├── client/src/pages/
│   ├── PhotoshootLanding.tsx    # New clean landing (€97 offer)
│   ├── PhotoshootCheckout.tsx   # Stripe payment only
│   ├── PhotoshootStudio.tsx     # Dashboard post-purchase
│   ├── TrainingSetup.tsx        # 15-min AI training
│   ├── SandraChat.tsx           # AI prompt generation
│   ├── ImageGeneration.tsx      # 4 images per session
│   └── PhotoshootGallery.tsx    # Download interface
├── server/
│   ├── photoshoot-routes.ts     # Clean API endpoints
│   ├── payment-service.ts       # Stripe integration
│   ├── training-service.ts      # Extracted from current
│   └── generation-service.ts    # Extracted from current
```

## User Journey (Simplified)
1. **Landing** → €97 offer, images first, minimal text
2. **Checkout** → Stripe payment (no auth required)
3. **Thank You** → Creates account + session automatically
4. **Studio** → Training status, generation access
5. **Training** → Upload selfies, 15-min wait
6. **Sandra Chat** → Discuss vision, generate prompts
7. **Generation** → 4 professional images
8. **Gallery** → Save favorites, download

## Revenue Focus
- Single €97/month subscription
- Clear value proposition: AI Brand Photoshoot
- Immediate access after payment
- Gallery download functionality
- Professional AI-generated images using your proven templates

This approach minimizes risk while maximizing speed to revenue.