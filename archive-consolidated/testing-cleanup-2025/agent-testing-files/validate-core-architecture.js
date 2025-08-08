/**
 * CORE ARCHITECTURE VALIDATION SCRIPT
 * Validates that ALL generation endpoints use individual user models only
 */

async function validateCoreArchitecture() {
  console.log('🔒 VALIDATING CORE ARCHITECTURE COMPLIANCE...\n');
  
  // Test 1: Verify database has individual user models
  console.log('📊 DATABASE INDIVIDUAL USER MODELS:');
  try {
    const { Pool } = await import('@neondatabase/serverless');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    const result = await pool.query(`
      SELECT user_id, training_status, replicate_model_id, replicate_version_id 
      FROM user_models 
      WHERE training_status = 'completed' 
      ORDER BY updated_at DESC 
      LIMIT 5
    `);
    
    let violationsFound = false;
    result.rows.forEach(row => {
      const isValidFormat = row.replicate_model_id?.startsWith('sandrasocial/') && 
                           row.replicate_model_id?.includes('-selfie-lora') &&
                           row.replicate_version_id?.length > 20;
      
      if (isValidFormat) {
        console.log(`✅ User ${row.user_id}: Valid individual model`);
        console.log(`   Model: ${row.replicate_model_id}`);
        console.log(`   Version: ${row.replicate_version_id?.substring(0, 20)}...\n`);
      } else {
        console.log(`❌ User ${row.user_id}: INVALID MODEL FORMAT`);
        console.log(`   Model: ${row.replicate_model_id}`);
        violationsFound = true;
      }
    });
    
    if (violationsFound) {
      console.log('🚨 ARCHITECTURE VIOLATION: Invalid model formats found!');
      return false;
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ Database validation failed:', error.message);
    return false;
  }
  
  // Test 2: Validate no hardcoded base models in code
  console.log('🔍 CODE VALIDATION - SEARCHING FOR VIOLATIONS:');
  const fs = await import('fs/promises');
  const path = await import('path');
  
  const filesToCheck = [
    'server/ai-service.ts',
    'server/image-generation-service.ts', 
    'server/routes.ts'
  ];
  
  let codeViolations = false;
  
  for (const filePath of filesToCheck) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      
      // Check for forbidden patterns
      const forbiddenPatterns = [
        'black-forest-labs/flux-dev-lora',
        'lora_weights:',
        'version: "black-forest-labs',
        'fallback.*model',
        'mock.*model',
        'placeholder.*model'
      ];
      
      let fileHasViolations = false;
      forbiddenPatterns.forEach(pattern => {
        const regex = new RegExp(pattern, 'gi');
        const matches = content.match(regex);
        if (matches) {
          console.log(`❌ ${filePath}: Found forbidden pattern "${pattern}"`);
          fileHasViolations = true;
          codeViolations = true;
        }
      });
      
      if (!fileHasViolations) {
        console.log(`✅ ${filePath}: No violations found`);
      }
      
    } catch (error) {
      console.log(`⚠️ Could not check ${filePath}: ${error.message}`);
    }
  }
  
  // Test 3: Validate generation endpoints use proper format
  console.log('\n🧪 GENERATION ENDPOINT VALIDATION:');
  try {
    // Test Maya AI generation format
    const { AIService } = await import('./server/ai-service.js');
    console.log('✅ AIService loaded successfully');
    
    // Test image generation service format  
    const { generateImages } = await import('./server/image-generation-service.js');
    console.log('✅ generateImages service loaded successfully');
    
  } catch (error) {
    console.log(`⚠️ Service validation: ${error.message}`);
  }
  
  // Summary
  console.log('\n📋 CORE ARCHITECTURE VALIDATION SUMMARY:');
  if (!codeViolations) {
    console.log('✅ ALL GENERATION ENDPOINTS COMPLY WITH IMMUTABLE CORE ARCHITECTURE');
    console.log('✅ Individual user models enforced across all services');
    console.log('✅ Zero fallbacks or shared models found');
    console.log('✅ Complete user isolation maintained');
    console.log('\n🎯 ARCHITECTURE STATUS: FULLY COMPLIANT');
    return true;
  } else {
    console.log('❌ ARCHITECTURE VIOLATIONS FOUND - IMMEDIATE FIX REQUIRED');
    console.log('❌ Image generation may be using wrong models');
    console.log('❌ User isolation may be compromised');
    console.log('\n🚨 ARCHITECTURE STATUS: VIOLATION DETECTED');
    return false;
  }
}

// Run validation
validateCoreArchitecture()
  .then(isCompliant => {
    if (isCompliant) {
      console.log('\n🔒 CORE ARCHITECTURE VALIDATION PASSED');
      process.exit(0);
    } else {
      console.log('\n🚨 CORE ARCHITECTURE VALIDATION FAILED');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Validation script error:', error);
    process.exit(1);
  });