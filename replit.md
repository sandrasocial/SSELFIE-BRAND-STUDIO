# Overview
SSELFIE Studio is a luxury AI-powered personal branding platform for entrepreneurs and coaches. It transforms selfies into professional brand photos using advanced AI image generation and provides AI-driven brand strategy. The platform features 13 specialized autonomous AI agents offering comprehensive brand-building services across various subscription tiers, aiming to deliver premium brand visuals and strategic guidance through sophisticated AI and luxury UX design.

# User Preferences
Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side application is built with React and TypeScript, featuring a luxury design system. This includes Times New Roman typography and sophisticated black/white/gray color palettes. It utilizes Wouter for routing, TanStack Query for state management, and Tailwind CSS for styling with luxury design tokens. Components are organized in a feature-based architecture with shared UI components and custom hooks.

## Backend Architecture
The server is built on Express.js with TypeScript, implementing a RESTful API architecture. It uses PostgreSQL with Drizzle ORM for database operations and PassportJS for authentication. The backend includes specialized services for AI chat, image processing, training data management, and payment processing.

## Agent System Architecture
The platform incorporates an intelligent agent system with AI-powered navigation and search capabilities. Agents use natural language queries for file discovery and context management. The system prioritizes functional application code over documentation, ensuring agents focus on core functionalities. It supports multi-agent coordination through collaborative, competitive, consensus, and hierarchical patterns.

## Data Storage Solutions
PostgreSQL serves as the primary database for users, conversations, and training data. AWS S3 is used for storing training images and generated content. Local file storage is used for flatlay collections and brand assets.

## Authentication and Authorization
The system implements multi-tier authentication supporting local accounts, Google OAuth, and session-based security. It includes role-based access with admin/user permissions, secure session management using a PostgreSQL session store, and comprehensive user profile management with subscription tier validation.

# External Dependencies

## Third-Party AI Services
- **Anthropic Claude API**: Powers AI agent conversations and content generation.
- **Replicate API**: Handles AI image generation using FLUX models.
- **OpenAI**: Used for specific AI tasks and integrations.

## Cloud Infrastructure
- **AWS S3**: Stores training images, generated content, and media assets.
- **PostgreSQL/Neon**: Primary database hosting.
- **Vercel/Replit**: Deployment and hosting infrastructure.

## Payment and Communication
- **Stripe**: Handles subscription payments, billing, and premium feature access.
- **SendGrid**: Email delivery for transactional and marketing campaigns.
- **Flodesk**: Email marketing automation.
- **ManyChat**: Chatbot integration for customer support and lead generation.