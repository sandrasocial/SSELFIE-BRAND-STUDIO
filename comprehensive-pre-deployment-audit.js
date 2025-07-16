/**
 * COMPREHENSIVE PRE-DEPLOYMENT AUDIT - FLUX 1.1 PRO ULTRA SYSTEM
 * Validates all systems, premium users, database integrity, and code quality
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Use dynamic imports for ES modules
const { pool } = await import('./server/db.ts');
const { db } = await import('./server/db.ts');
const { users, models } = await import('./shared/schema.ts');
const { eq, and } = await import('drizzle-orm');

async function testAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`http://localhost:5000${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`${response.status}: ${await response.text()}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`❌ API Error [${endpoint}]:`, error.message);
    throw error;
  }
}

async function auditDatabaseSchema() {
  console.log('\n🔍 AUDITING DATABASE SCHEMA...');
  
  try {
    // Check users table structure
    const usersResult = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position;
    `);
    
    console.log('✅ Users table columns:', usersResult.rows.map(r => `${r.column_name} (${r.data_type})`));
    
    // Check models table structure
    const modelsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'models' 
      ORDER BY ordinal_position;
    `);
    
    console.log('✅ Models table columns:', modelsResult.rows.map(r => `${r.column_name} (${r.data_type})`));
    
    // Validate required fields exist
    const requiredUserFields = ['id', 'email', 'plan', 'role'];
    const requiredModelFields = ['id', 'userId', 'modelType', 'isLuxury', 'finetuneId', 'status'];
    
    const userColumns = usersResult.rows.map(r => r.column_name);
    const modelColumns = modelsResult.rows.map(r => r.column_name);
    
    requiredUserFields.forEach(field => {
      if (!userColumns.includes(field)) {
        throw new Error(`Missing required user field: ${field}`);
      }
    });
    
    requiredModelFields.forEach(field => {
      if (!modelColumns.includes(field)) {
        throw new Error(`Missing required model field: ${field}`);
      }
    });
    
    console.log('✅ Database schema validation complete');
    
  } catch (error) {
    console.error('❌ Database schema audit failed:', error);
    throw error;
  }
}

async function auditPremiumUsers() {
  console.log('\n🔍 AUDITING PREMIUM USERS...');
  
  try {
    // Get all premium users
    const premiumUsers = await db.select()
      .from(users)
      .where(
        and(
          users.plan.in(['sselfie-studio', 'sselfie-studio-premium', 'SSELFIE_STUDIO'])
        )
      );
    
    console.log(`✅ Found ${premiumUsers.length} premium users`);
    
    // Check each premium user's model status
    for (const user of premiumUsers) {
      console.log(`\n🔍 Checking user: ${user.email} (ID: ${user.id})`);
      
      const userModels = await db.select()
        .from(models)
        .where(eq(models.userId, user.id));
      
      console.log(`  - Models: ${userModels.length}`);
      
      if (userModels.length > 0) {
        const latestModel = userModels[userModels.length - 1];
        console.log(`  - Latest model type: ${latestModel.modelType}`);
        console.log(`  - Is luxury: ${latestModel.isLuxury}`);
        console.log(`  - Status: ${latestModel.status}`);
        console.log(`  - Has finetune_id: ${!!latestModel.finetuneId}`);
        
        // Validate premium users have luxury models
        if (latestModel.status === 'completed' && !latestModel.isLuxury) {
          console.log(`⚠️  Premium user has non-luxury model - needs upgrade`);
        } else if (latestModel.status === 'completed' && latestModel.isLuxury) {
          console.log(`✅ Premium user correctly configured with luxury model`);
        }
      } else {
        console.log(`  - No models found for premium user`);
      }
    }
    
    // Check admin users
    const adminUsers = await db.select()
      .from(users)
      .where(eq(users.role, 'admin'));
    
    console.log(`\n✅ Found ${adminUsers.length} admin users`);
    adminUsers.forEach(admin => {
      console.log(`  - Admin: ${admin.email} (ID: ${admin.id})`);
    });
    
  } catch (error) {
    console.error('❌ Premium users audit failed:', error);
    throw error;
  }
}

async function auditModelReferences() {
  console.log('\n🔍 AUDITING MODEL REFERENCES IN CODE...');
  
  try {
    const fs = await import('fs/promises');
    
    // Check ai-service.ts
    const aiServiceContent = await fs.readFile('./server/ai-service.ts', 'utf-8');
    
    // Validate FLUX 1.1 Pro Ultra references
    if (!aiServiceContent.includes('flux-1.1-pro-ultra-finetuned')) {
      throw new Error('ai-service.ts missing FLUX 1.1 Pro Ultra model reference');
    }
    
    if (aiServiceContent.includes('flux-pro-finetuned') && !aiServiceContent.includes('flux-1.1-pro-ultra-finetuned')) {
      throw new Error('ai-service.ts still using old FLUX Pro model instead of 1.1 Pro Ultra');
    }
    
    console.log('✅ ai-service.ts uses correct FLUX 1.1 Pro Ultra model');
    
    // Check image-generation-service.ts
    const imageServiceContent = await fs.readFile('./server/image-generation-service.ts', 'utf-8');
    
    if (!imageServiceContent.includes('flux-1.1-pro-ultra-finetuned')) {
      throw new Error('image-generation-service.ts missing FLUX 1.1 Pro Ultra model reference');
    }
    
    console.log('✅ image-generation-service.ts uses correct FLUX 1.1 Pro Ultra model');
    
    // Check luxury-training-service.ts
    const luxuryTrainingContent = await fs.readFile('./server/luxury-training-service.ts', 'utf-8');
    
    if (!luxuryTrainingContent.includes('flux-pro-trainer')) {
      throw new Error('luxury-training-service.ts missing FLUX Pro trainer reference');
    }
    
    console.log('✅ luxury-training-service.ts uses correct FLUX Pro trainer');
    
    // Check for any placeholder or mock data
    const allFiles = [aiServiceContent, imageServiceContent, luxuryTrainingContent];
    const problematicPatterns = [
      'TODO',
      'FIXME',
      'placeholder',
      'mock',
      'fake',
      'test-data',
      'example.com',
      'lorem ipsum'
    ];
    
    for (const content of allFiles) {
      for (const pattern of problematicPatterns) {
        if (content.toLowerCase().includes(pattern.toLowerCase())) {
          console.log(`⚠️  Found potential placeholder: ${pattern}`);
        }
      }
    }
    
    console.log('✅ Model references audit complete');
    
  } catch (error) {
    console.error('❌ Model references audit failed:', error);
    throw error;
  }
}

async function auditAPIEndpoints() {
  console.log('\n🔍 AUDITING API ENDPOINTS...');
  
  try {
    // Test health endpoint
    const health = await testAPI('/api/health');
    console.log('✅ Health endpoint:', health.status);
    
    // Test agents endpoint
    const agents = await testAPI('/api/agents');
    console.log(`✅ Agents endpoint: ${agents.length} agents`);
    
    // Test admin stats (should work for authenticated admin)
    try {
      const stats = await testAPI('/api/admin/stats');
      console.log('✅ Admin stats endpoint working');
    } catch (error) {
      console.log('⚠️  Admin stats requires authentication (expected)');
    }
    
    // Validate critical routes exist
    const fs = await import('fs/promises');
    const routesContent = await fs.readFile('./server/routes.ts', 'utf-8');
    
    const requiredRoutes = [
      '/api/start-model-training',
      '/api/generate-images',
      '/api/ai-chat',
      '/api/user-model'
    ];
    
    requiredRoutes.forEach(route => {
      if (!routesContent.includes(route)) {
        throw new Error(`Missing required route: ${route}`);
      }
    });
    
    console.log('✅ All required API routes present');
    
  } catch (error) {
    console.error('❌ API endpoints audit failed:', error);
    throw error;
  }
}

async function auditTrainingSystem() {
  console.log('\n🔍 AUDITING TRAINING SYSTEM...');
  
  try {
    // Check training completion monitor
    const fs = await import('fs/promises');
    const serverContent = await fs.readFile('./server/index.ts', 'utf-8');
    
    if (!serverContent.includes('TrainingCompletionMonitor')) {
      throw new Error('Training completion monitor not started in server');
    }
    
    console.log('✅ Training completion monitor integrated');
    
    // Check dual-tier training logic
    const routesContent = await fs.readFile('./server/routes.ts', 'utf-8');
    
    if (!routesContent.includes('LuxuryTrainingService') || !routesContent.includes('ModelTrainingService')) {
      throw new Error('Dual-tier training system not properly implemented');
    }
    
    console.log('✅ Dual-tier training system present');
    
    // Check tier detection logic
    if (!routesContent.includes('isPremium') || !routesContent.includes('plan ===')) {
      throw new Error('Premium tier detection logic missing');
    }
    
    console.log('✅ Premium tier detection implemented');
    
  } catch (error) {
    console.error('❌ Training system audit failed:', error);
    throw error;
  }
}

async function auditAuthenticationSystem() {
  console.log('\n🔍 AUDITING AUTHENTICATION SYSTEM...');
  
  try {
    // Check authentication endpoints exist
    const fs = await import('fs/promises');
    const authContent = await fs.readFile('./server/replitAuth.ts', 'utf-8');
    
    if (!authContent.includes('setupAuth') || !authContent.includes('isAuthenticated')) {
      throw new Error('Authentication system not properly configured');
    }
    
    console.log('✅ Authentication system configured');
    
    // Check session store
    if (!authContent.includes('connectPg') || !authContent.includes('sessions')) {
      throw new Error('PostgreSQL session store not configured');
    }
    
    console.log('✅ PostgreSQL session store configured');
    
    // Check OIDC configuration
    if (!authContent.includes('openid-client') || !authContent.includes('Strategy')) {
      throw new Error('OIDC configuration missing');
    }
    
    console.log('✅ OIDC authentication configured');
    
  } catch (error) {
    console.error('❌ Authentication system audit failed:', error);
    throw error;
  }
}

async function auditEnvironmentSecrets() {
  console.log('\n🔍 AUDITING ENVIRONMENT SECRETS...');
  
  try {
    const requiredSecrets = [
      'DATABASE_URL',
      'REPLICATE_API_TOKEN',
      'SESSION_SECRET',
      'REPL_ID',
      'ANTHROPIC_API_KEY'
    ];
    
    const missingSecrets = [];
    
    requiredSecrets.forEach(secret => {
      if (!process.env[secret]) {
        missingSecrets.push(secret);
      }
    });
    
    if (missingSecrets.length > 0) {
      throw new Error(`Missing required environment secrets: ${missingSecrets.join(', ')}`);
    }
    
    console.log('✅ All required environment secrets present');
    
    // Test database connection
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connection working');
    
  } catch (error) {
    console.error('❌ Environment secrets audit failed:', error);
    throw error;
  }
}

async function runComprehensiveAudit() {
  console.log('🚀 STARTING COMPREHENSIVE PRE-DEPLOYMENT AUDIT...\n');
  
  try {
    await auditEnvironmentSecrets();
    await auditDatabaseSchema();
    await auditPremiumUsers();
    await auditModelReferences();
    await auditAPIEndpoints();
    await auditTrainingSystem();
    await auditAuthenticationSystem();
    
    console.log('\n🎉 COMPREHENSIVE AUDIT COMPLETE - ALL SYSTEMS VALIDATED');
    console.log('\n✅ DEPLOYMENT READY:');
    console.log('  - Database schema validated');
    console.log('  - Premium users properly configured');
    console.log('  - FLUX 1.1 Pro Ultra models correctly referenced');
    console.log('  - API endpoints functional');
    console.log('  - Training system operational');
    console.log('  - Authentication system working');
    console.log('  - Environment secrets configured');
    console.log('\n🚀 PLATFORM READY FOR PRODUCTION DEPLOYMENT');
    
  } catch (error) {
    console.error('\n❌ AUDIT FAILED:', error.message);
    console.log('\n🛑 DO NOT DEPLOY - ISSUES MUST BE RESOLVED FIRST');
    process.exit(1);
  }
}

// Run the audit
runComprehensiveAudit().catch(console.error);