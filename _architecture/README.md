# 🏗️ SSELFIE Studio Architecture Map

## 🎯 ARCHITECTURAL SEPARATION (Logical Organization)

This directory provides architectural clarity WITHOUT breaking existing imports.
Files remain in their current locations for system compatibility.

### 📁 ADMIN AGENTS (Development & Coordination)
**Location**: `server/agents/` and `server/routes/consulting-agents-routes.ts`
**Purpose**: Elena, Zara, and 13 other AI agents for development coordination
**Protection Level**: Safe to modify - these are development tools

### 📁 MEMBER REVENUE (Maya's Income Systems) 
**Location**: `server/` core services
**Purpose**: Training, generation, and storage systems that generate income
**Protection Level**: 🔒 CRITICAL - NEVER modify during development

**Core Files**:
- `server/unified-generation-service.ts` - Image generation
- `server/model-training-service.ts` - AI training pipeline  
- `server/image-storage-service.ts` - S3 storage & migration
- `server/routes/maya-ai-routes.ts` - Maya chat endpoints

### 📁 SHARED SYSTEMS
**Location**: `shared/schema.ts` and utility files
**Purpose**: Database schema and shared TypeScript types
**Protection Level**: Coordinate changes across teams

### 📁 INFRASTRUCTURE  
**Location**: `infrastructure/config/`, `infrastructure/deployment/`
**Purpose**: Configuration, deployment docs, and build scripts
**Protection Level**: Safe to modify for DevOps improvements

## 🚀 DEVELOPMENT GUIDELINES

1. **For Admin Agent Development**: Modify files in `server/agents/` safely
2. **For Maya Revenue Protection**: NEVER touch the core revenue files listed above
3. **For New Features**: Build in `server/services/` and test before integration
4. **For Configuration**: Use `infrastructure/config/` for all config files

## 🎯 LAUNCH READINESS

Maya Personal Branding can launch TODAY because:
- ✅ All revenue systems operational in current locations
- ✅ No breaking import changes made
- ✅ Agent coordination system functional
- ✅ Clear architectural boundaries established

**Result**: Clean logical separation with zero system disruption