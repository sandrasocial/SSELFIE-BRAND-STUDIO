# PROJECT UNDERSTANDING GUIDE FOR AGENTS
*Comprehensive guide to help agents understand SSELFIE Studio architecture and work effectively*

## 🏗️ SYSTEM ARCHITECTURE OVERVIEW

### **CRITICAL FILES TO UNDERSTAND** (Production Critical)
- `package.json` - Contains exact dependency versions and scripts
- `shared/schema.ts` - Database schema with real user data
- `server/index.ts` - Main server entry point
- `drizzle.config.ts` - Database connection configuration
- `.env` files - Environment secrets and configurations
- `vite.config.ts` - Build configuration for production
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Global styling configuration

### **DATABASE ARCHITECTURE** (Production Understanding)
- **Live user data**: Database contains real users, subscriptions, and payments
- **Schema structure**: See `shared/schema.ts` for complete data model
- **Safe operations**: SELECT queries are safe for analysis and features  
- **Migrations**: Use `npm run db:push` for schema changes
- **User safety**: Be mindful that changes affect real paying customers

### **USER-FACING PROTECTION** (Experience Safety)
- **Authentication flows**: Do not modify login/logout processes
- **Payment systems**: Never touch Stripe integration or billing logic
- **User interfaces**: Test all UI changes thoroughly before deployment
- **API endpoints**: Preserve existing endpoint functionality
- **File uploads**: Do not modify AWS S3 or image handling systems

## 🎯 AGENT WORK AREAS

### ✅ **RECOMMENDED FOCUS AREAS**
- **New features**: Build additional components and functionality
- **UI improvements**: Enhance user experience and interfaces
- **Performance**: Optimize queries, components, and workflows
- **Documentation**: Create guides, analysis, and reports
- **Analytics**: Build monitoring and insights dashboards
- **Agent coordination**: Improve workflow orchestration
- **Content management**: Enhance image generation and training

### 🤔 **UNDERSTAND BEFORE MODIFYING**
- **Authentication system**: Uses Replit OAuth - see server/auth/ files
- **Payment processing**: Stripe integration - see server/routes/payments.ts
- **Database schema**: User tables contain real data - see shared/schema.ts
- **Build system**: Vite + TypeScript setup - see package.json scripts
- **API structure**: RESTful design with agent-specific routing

### 💡 **BEST PRACTICES**
- **Test thoroughly**: Your changes affect real users and their data
- **Document changes**: Update relevant files and comments
- **Consider impact**: Think about how changes affect existing workflows
- **Ask questions**: If unsure about architecture, ask for clarification
- **Gradual changes**: Implement features incrementally when possible

## 🔐 USER PROTECTION MEASURES

### **Data Privacy & Security**
- **No user data exposure**: Never log or display sensitive user information
- **Session security**: Maintain existing session encryption and timeout settings
- **API rate limiting**: Preserve existing rate limits and security measures
- **File access**: Respect user file permissions and privacy settings

### **Service Reliability**
- **Uptime protection**: Never deploy changes that could cause downtime
- **Performance**: Monitor and maintain existing performance standards
- **Error handling**: Ensure all new features have proper error boundaries
- **Fallback systems**: Maintain existing fallback mechanisms

### **Feature Integrity**
- **Core functionality**: Preserve all existing user workflows
- **AI services**: Do not modify Maya or Victoria core functionality
- **Image generation**: Maintain FLUX model integration and generation pipeline
- **Training systems**: Preserve user training data and model access

## 🚀 REPLIT-SPECIFIC PROTOCOLS

### **Deployment Safety**
- **Staging testing**: All changes tested in development environment first
- **Gradual rollout**: No breaking changes to production directly
- **Rollback capability**: Maintain ability to quickly revert changes
- **Health checks**: Verify all systems operational after changes

### **Resource Management**
- **Memory usage**: Monitor memory consumption of new features
- **CPU optimization**: Ensure new code doesn't impact performance
- **Database connections**: Respect connection pool limits
- **File storage**: Monitor S3 usage and costs

### **Integration Compatibility**
- **Existing workflows**: Maintain compatibility with current user workflows
- **Third-party services**: Do not break Anthropic, Replicate, or AWS integrations
- **Browser compatibility**: Ensure UI works across supported browsers
- **Mobile responsiveness**: Maintain mobile-first design principles

## 🤖 AGENT-SPECIFIC GUIDELINES

### **Elena (Coordinator)**
- ✅ **Safe**: Workflow orchestration, task delegation, documentation
- ⚠️ **Caution**: Agent coordination changes, communication protocols
- ❌ **Forbidden**: Core system architecture, production routing

### **Zara (Backend)**
- ✅ **Safe**: Database optimization queries, performance monitoring
- ⚠️ **Caution**: New API endpoints, middleware additions
- ❌ **Forbidden**: Schema changes, authentication systems, dependencies

### **Maya (AI Photographer)**
- ✅ **Safe**: Image generation improvements, creative workflows
- ⚠️ **Caution**: AI model parameter changes, generation logic
- ❌ **Forbidden**: Training data modification, user model access

### **Victoria (Business)**
- ✅ **Safe**: UI components, user experience improvements
- ⚠️ **Caution**: Business logic changes, workflow modifications
- ❌ **Forbidden**: Payment processing, user account management

### **Aria (UI/UX)**
- ✅ **Safe**: Interface improvements, component styling
- ⚠️ **Caution**: Core component modifications, state management
- ❌ **Forbidden**: Authentication UI, payment interfaces

## 🔍 VALIDATION PROTOCOLS

### **Pre-Implementation Checks**
1. **Dependency validation**: Ensure all imports exist and are installed
2. **Type safety**: Verify TypeScript compilation without errors
3. **Syntax validation**: Check for JSON, CSS, and JavaScript syntax errors
4. **Breaking change analysis**: Assess impact on existing functionality

### **Testing Requirements**
1. **Local testing**: All changes tested in development environment
2. **Error boundary testing**: Verify graceful error handling
3. **User flow testing**: Ensure existing workflows remain functional
4. **Performance testing**: Monitor resource usage and response times

### **Deployment Validation**
1. **Health check**: Verify all services operational after deployment
2. **User access**: Confirm authentication and core features working
3. **Database integrity**: Verify no data corruption or loss
4. **Rollback readiness**: Confirm ability to quickly revert if needed

## 📊 MONITORING & ALERTS

### **System Health Indicators**
- **Application uptime**: 99.9%+ availability target
- **Response times**: API endpoints under 2s, UI interactions under 1s
- **Error rates**: Less than 1% error rate on critical paths
- **User satisfaction**: No increase in support requests after changes

### **User Impact Metrics**
- **Active user sessions**: Monitor for unusual drops
- **Payment processing**: Zero impact on subscription workflows
- **Content generation**: Maintain current success rates
- **Feature adoption**: Track usage of new features

## 🚑 EMERGENCY PROCEDURES

### **If Something Breaks**
1. **Immediate assessment**: Identify scope of impact
2. **User communication**: Notify affected users if necessary
3. **Quick fix or rollback**: Restore functionality ASAP
4. **Post-incident analysis**: Document root cause and prevention

### **Rollback Triggers**
- **Authentication failures**: Any login/session issues
- **Payment processing errors**: Subscription or billing problems
- **Database errors**: Data integrity or access issues
- **Performance degradation**: Response times > 5s or high error rates

## ✅ CURRENT SAFETY STATUS

- **Agent Safety Guards**: ✅ Implemented and active
- **Error Prevention**: ✅ Safe middleware deployed
- **Dependency Validation**: ✅ Import checking active
- **File Modification Tracking**: ✅ Monitoring agent changes
- **Database Protection**: ✅ Destructive operations blocked
- **User Data Security**: ✅ Privacy measures in place
- **Production Monitoring**: ✅ Health checks operational

## 📝 SUMMARY FOR AGENTS

**Your agents are now SAFE to work on your project** with these protections:

1. **Critical files protected** - Cannot break core functionality
2. **User data secured** - No risk to existing users
3. **Production stability** - Changes isolated to safe areas
4. **Rollback capabilities** - Quick recovery from any issues
5. **Comprehensive monitoring** - Early detection of problems

Your agents can focus on improvements and new features while the safety protocols ensure your production environment and user experience remain stable and secure.