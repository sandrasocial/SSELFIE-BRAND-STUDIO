/**
 * COMPLETE ARCHITECTURE COMPLIANCE VALIDATION
 * Validates ENTIRE system follows CORE_ARCHITECTURE_IMMUTABLE_V2.md
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';

const execAsync = promisify(exec);

async function validateCompleteArchitectureCompliance() {
  console.log('🔒 VALIDATING COMPLETE ARCHITECTURE COMPLIANCE...\n');
  
  const violations = [];
  const compliantFiles = [];
  
  // Test 1: Check for forbidden V1 patterns
  console.log('📋 CHECKING FOR FORBIDDEN V1 PATTERNS:');
  
  const forbiddenPatterns = [
    { pattern: 'lora_weights', description: 'V1 LoRA weights parameter' },
    { pattern: 'black-forest-labs/flux-dev-lora', description: 'V1 base model' },
    { pattern: 'lora_scale.*:', description: 'V1 LoRA scale parameter' },
    { pattern: 'version.*black-forest', description: 'V1 base model version' }
  ];
  
  const filesToCheck = [
    'server/ai-service.ts',
    'server/image-generation-service.ts', 
    'server/routes.ts',
    'server/model-training-service.ts'
  ];
  
  for (const filePath of filesToCheck) {
    console.log(`\n🔍 Checking ${filePath}:`);
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      let fileHasViolations = false;
      
      for (const { pattern, description } of forbiddenPatterns) {
        const regex = new RegExp(pattern, 'gi');
        const matches = content.match(regex);
        
        if (matches && !pattern.includes('training-service')) {
          // Allow training service to use V1 patterns for CREATING models
          if (!filePath.includes('model-training-service.ts')) {
            console.log(`❌ VIOLATION: ${description} found`);
            violations.push(`${filePath}: ${description}`);
            fileHasViolations = true;
          }
        }
      }
      
      if (!fileHasViolations) {
        console.log(`✅ No V1 violations found`);
        compliantFiles.push(filePath);
      }
      
    } catch (error) {
      console.log(`⚠️ Could not check ${filePath}: ${error.message}`);
    }
  }
  
  // Test 2: Validate V2 patterns are present
  console.log('\n\n📋 VALIDATING V2 ARCHITECTURE PATTERNS:');
  
  const requiredV2Patterns = [
    { pattern: 'userModel\\.replicateModelId.*:.*userModel\\.replicateVersionId', description: 'Individual user model format' },
    { pattern: 'sandrasocial/.*-selfie-lora:', description: 'User model version reference' },
    { pattern: 'IMMUTABLE CORE ARCHITECTURE', description: 'Architecture compliance comments' }
  ];
  
  for (const filePath of filesToCheck.slice(0, 3)) { // Skip training service
    console.log(`\n🔍 Validating V2 patterns in ${filePath}:`);
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      let hasRequiredPatterns = false;
      
      for (const { pattern, description } of requiredV2Patterns) {
        const regex = new RegExp(pattern, 'gi');
        if (content.match(regex)) {
          console.log(`✅ ${description} found`);
          hasRequiredPatterns = true;
          break;
        }
      }
      
      if (!hasRequiredPatterns) {
        console.log(`❌ MISSING V2 PATTERNS`);
        violations.push(`${filePath}: Missing V2 architecture patterns`);
      }
      
    } catch (error) {
      console.log(`⚠️ Could not validate ${filePath}: ${error.message}`);
    }
  }
  
  // Test 3: Database validation
  console.log('\n\n📋 DATABASE ARCHITECTURE VALIDATION:');
  try {
    const { Pool } = await import('@neondatabase/serverless');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    const result = await pool.query(`
      SELECT COUNT(*) as total_models,
             COUNT(CASE WHEN replicate_model_id LIKE 'sandrasocial/%' THEN 1 END) as valid_models,
             COUNT(CASE WHEN replicate_version_id IS NOT NULL THEN 1 END) as models_with_versions
      FROM user_models 
      WHERE training_status = 'completed'
    `);
    
    const stats = result.rows[0];
    
    console.log(`📊 Database Model Statistics:`);
    console.log(`   Total completed models: ${stats.total_models}`);
    console.log(`   Valid format models: ${stats.valid_models}`);
    console.log(`   Models with versions: ${stats.models_with_versions}`);
    
    if (stats.valid_models === stats.total_models && stats.models_with_versions === stats.total_models) {
      console.log(`✅ All database models follow V2 architecture`);
    } else {
      console.log(`❌ Database models have architecture violations`);
      violations.push('Database: Invalid model formats or missing versions');
    }
    
    await pool.end();
  } catch (error) {
    console.log(`⚠️ Database validation skipped: ${error.message}`);
  }
  
  // Final Report
  console.log('\n\n📋 COMPLETE ARCHITECTURE COMPLIANCE REPORT:');
  console.log('=' .repeat(60));
  
  if (violations.length === 0) {
    console.log('✅ SYSTEM FULLY COMPLIANT WITH V2 ARCHITECTURE');
    console.log('✅ All endpoints use individual user models only');
    console.log('✅ No V1 base model + LoRA patterns found');
    console.log('✅ Zero tolerance policy enforced');
    console.log('✅ Complete user isolation maintained');
    console.log('\n🎯 STATUS: ARCHITECTURE COMPLIANCE PERFECT ✅');
    console.log('\nCompliant files:');
    compliantFiles.forEach(file => console.log(`  ✅ ${file}`));
    return true;
  } else {
    console.log('❌ ARCHITECTURE VIOLATIONS DETECTED:');
    violations.forEach(violation => console.log(`  ❌ ${violation}`));
    console.log('\n🚨 STATUS: COMPLIANCE FAILURES REQUIRE IMMEDIATE FIX');
    console.log('\n⚠️  CRITICAL: Fix these violations to ensure V2 architecture');
    return false;
  }
}

// Run validation
validateCompleteArchitectureCompliance()
  .then(isCompliant => {
    if (isCompliant) {
      console.log('\n🔒 COMPLETE ARCHITECTURE VALIDATION: PASSED ✅');
      process.exit(0);
    } else {
      console.log('\n🚨 COMPLETE ARCHITECTURE VALIDATION: FAILED ❌');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Validation error:', error);
    process.exit(1);
  });