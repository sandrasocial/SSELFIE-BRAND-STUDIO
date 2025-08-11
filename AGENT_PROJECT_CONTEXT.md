# AGENT PROJECT CONTEXT
*Everything agents need to know about SSELFIE Studio to work effectively*

## 🎯 WHAT YOU'RE WORKING ON

**SSELFIE Studio** is a premium AI-powered personal branding platform with:
- Real paying users (basic & full-access subscriptions)
- Professional AI image generation using FLUX models
- Specialized AI agents (Maya, Victoria, Elena, etc.)
- Complete business infrastructure (Stripe payments, user auth, S3 storage)

## 👥 CURRENT USER BASE

- **Active subscribers** paying for AI model training and image generation
- **Business users** building personal brands and professional content
- **Content creators** needing high-quality branded imagery
- **Entrepreneurs** using AI for marketing and social media

## 🏗️ TECHNICAL ARCHITECTURE

### Frontend (React/TypeScript)
- **UI Framework**: Radix UI components with shadcn/ui
- **Styling**: Tailwind CSS with luxury brand aesthetic
- **State**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **PWA**: Progressive web app features

### Backend (Node.js/Express)
- **Runtime**: Node.js with TypeScript ES modules
- **Database**: PostgreSQL with Drizzle ORM (Neon serverless)
- **Authentication**: Replit OAuth with express-session
- **Storage**: AWS S3 for training images and generated content
- **AI**: Anthropic Claude API + Replicate for image generation

### Key Integrations
- **Payments**: Stripe for subscriptions and billing
- **AI Models**: FLUX 1.1 Pro via Replicate API
- **Email**: SendGrid for transactional messages
- **Monitoring**: Built-in health checks and performance tracking

## 🤖 AGENT ECOSYSTEM

### Specialized Agents
- **Maya**: AI photographer and creative director
- **Elena**: Master coordinator for multi-agent workflows  
- **Victoria**: Business strategist and UX consultant
- **Zara**: Backend optimization and performance expert
- **Aria**: UI/UX specialist for interface design
- **Olga**: System organization and cleanup specialist

### Agent Capabilities
- **Autonomous work**: Can execute tasks without constant supervision
- **Tool access**: File editing, database queries, API calls
- **Coordination**: Multi-agent workflows with task delegation
- **Memory**: Persistent context and conversation history

## 📊 BUSINESS METRICS

### User Success Metrics
- **Subscription retention**: Users staying subscribed month-over-month
- **Generation success rate**: AI images meeting user expectations
- **Training completion**: Users successfully training personal models
- **Feature adoption**: Usage of Maya, Victoria, and other AI features

### Technical Performance
- **Uptime**: 99.9%+ availability for user-facing features
- **Response time**: <2s API responses, <1s UI interactions
- **Error rates**: <1% on critical user paths
- **Generation speed**: Fast AI image processing and delivery

## 💰 REVENUE MODEL

### Subscription Tiers
- **Basic Plan**: Limited generations, Maya AI access
- **Full Access**: Unlimited generations, all AI agents, priority support
- **Enterprise**: Custom solutions for businesses and agencies

### Key Features
- **Personal AI model training**: Users upload photos to train custom FLUX models
- **Professional image generation**: High-quality branded content
- **AI business consultation**: Victoria provides strategic guidance
- **Website building**: Victoria creates professional landing pages

## 🔧 DEVELOPMENT WORKFLOW

### Safe Development Practices
- **Local testing**: All changes tested in development environment
- **Incremental rollouts**: New features deployed gradually
- **User feedback**: Monitor user satisfaction and support requests
- **Performance monitoring**: Track impact of changes on system performance

### File Structure Understanding
```
server/
  ├── auth/           # Replit OAuth integration
  ├── routes/         # API endpoints
  ├── middleware/     # Safety and validation
  └── index.ts        # Main server entry

shared/
  └── schema.ts       # Database schema (Drizzle ORM)

client/src/
  ├── components/     # React UI components
  ├── pages/          # Application pages
  └── lib/            # Utilities and helpers

workflows/            # Agent coordination templates
docs/                # Documentation and guides
```

## 🎨 BRAND & USER EXPERIENCE

### Visual Identity
- **Luxury aesthetic**: Editorial blacks, signature golds, premium grays
- **Typography**: Times New Roman for editorial feel
- **Photography style**: High-end fashion and lifestyle imagery
- **User interface**: Clean, sophisticated, professional

### User Journey
1. **Onboarding**: Upload training photos, questionnaire
2. **Training**: AI model learns user's appearance and style
3. **Generation**: Create professional branded content
4. **Business tools**: Victoria helps with strategy and websites
5. **Ongoing use**: Monthly generations, brand building

## 📈 GROWTH OPPORTUNITIES

### Feature Development
- **Enhanced AI personalities**: More specialized agent capabilities
- **Advanced image editing**: Post-generation customization tools
- **Team collaboration**: Multi-user accounts and shared branding
- **API access**: Let users integrate with their own tools
- **Mobile app**: Native iOS/Android applications

### Business Expansion
- **Enterprise sales**: Target agencies and larger businesses
- **Partnership integrations**: Connect with social media platforms
- **White-label solutions**: License technology to other companies
- **International markets**: Expand beyond English-speaking users

## ⚡ CURRENT PRIORITIES

### Immediate Focus
- **User experience**: Smooth onboarding and generation workflows
- **Agent coordination**: Efficient multi-agent task execution
- **Performance**: Fast, reliable service for all users
- **Feature completion**: Polish existing capabilities before adding new ones

### Technical Debt
- **Code organization**: Continue improving agent architecture
- **Documentation**: Keep guides and protocols up-to-date
- **Monitoring**: Enhanced observability and error tracking
- **Testing**: Comprehensive test coverage for critical paths

## 💡 AGENT GUIDANCE

### When Working on Features
1. **Consider user impact**: How does this improve the user experience?
2. **Business value**: Does this help retain users or attract new ones?
3. **Technical sustainability**: Is this maintainable and scalable?
4. **Integration**: How does this work with existing agent workflows?

### When Unsure
- **Ask for context**: What business problem are we solving?
- **Review user feedback**: What do current users need most?
- **Check metrics**: What areas need improvement?
- **Coordinate**: Can other agents provide expertise or assistance?

Remember: You're building a premium product for paying customers who depend on SSELFIE Studio for their professional image and business success. Every change should enhance their experience and business outcomes.