# API Organization Structure

This directory contains all API endpoints organized by purpose and functionality.

## Directory Structure
```
server/api/
├── agents/                    # AI Agent Services
│   ├── victoria/             # Victoria AI (Website & Business)
│   │   ├── business-analysis.ts      # Goal analysis, structure planning
│   │   ├── website-generation.ts     # Full website generation
│   │   ├── website-customization.ts  # Website customization
│   │   └── chat-interface.ts         # Chat interface
│   └── maya/                 # Maya AI (Photo Generation)
│       └── photo-ai.ts               # AI photo generation
├── business/                 # Business Features
│   ├── payments.ts           # Stripe checkout & payments
│   ├── automation.ts         # Business process automation
│   └── email-marketing.ts    # Email automation triggers
├── admin/                    # Admin Operations
│   ├── consulting-agents.ts  # Admin agent system (14 agents)
│   └── member-protection.ts  # System safeguards
└── README.md                 # This file
```

## API Endpoints by Category

### AI Agent Services (Member Revenue Features)
- **Victoria AI**: `/api/victoria/*` - Website generation, business analysis
- **Maya AI**: `/api/maya-ai-photo` - AI photo generation

### Business Operations
- **Payments**: `/api/checkout/*` - Stripe payment processing
- **Automation**: Business process automation
- **Email Marketing**: Welcome, training, upgrade sequences

### Admin Operations  
- **Consulting Agents**: `/api/consulting-agents/*` - 14 admin AI agents
- **Member Protection**: System validation and safeguards

## Import Updates Required
Routes using old import paths need to be updated:
- Change `./routes/victoria-*` to `./api/agents/victoria/*`
- Change `./routes/maya-ai-routes` to `./api/agents/maya/photo-ai`
- Change `./routes/checkout` to `./api/business/payments`
- Change `./routes/consulting-agents-routes` to `./api/admin/consulting-agents`