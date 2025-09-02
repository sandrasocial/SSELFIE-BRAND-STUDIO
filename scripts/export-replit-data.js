/**
 * SSELFIE Studio Data Export Script for Replit
 * Generates SQL export queries for all critical data tables
 * 
 * This script creates individual SQL files for each table to facilitate
 * data migration from Replit to production environment.
 */

import { writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const EXPORT_DIR = './data-export';

// Ensure export directory exists
mkdirSync(EXPORT_DIR, { recursive: true });

/**
 * Table export configurations
 * Each entry defines the table name, export filename, and any special handling
 */
const tableExports = [
  {
    tableName: 'users',
    filename: 'users.sql',
    description: 'User accounts and subscription data',
    priority: 1,
    includes: ['authentication', 'subscription_status', 'generation_limits']
  },
  {
    tableName: 'maya_chats',
    filename: 'maya_chats.sql',
    description: 'Maya AI chat sessions',
    priority: 2,
    includes: ['chat_metadata', 'conversation_context']
  },
  {
    tableName: 'maya_chat_messages',
    filename: 'maya_chat_messages.sql',
    description: 'Individual Maya chat messages',
    priority: 2,
    includes: ['message_content', 'timestamps', 'context_data']
  },
  {
    tableName: 'maya_concept_cards',
    filename: 'maya_concept_cards.sql',
    description: 'Maya-generated concept cards and prompts',
    priority: 2,
    includes: ['concept_data', 'prompts', 'styling_intelligence']
  },
  {
    tableName: 'user_models',
    filename: 'user_models.sql',
    description: 'Trained AI models per user',
    priority: 3,
    includes: ['model_paths', 'trigger_words', 'training_status', 'lora_weights']
  },
  {
    tableName: 'training_jobs',
    filename: 'training_jobs.sql',
    description: 'AI model training job history',
    priority: 3,
    includes: ['training_parameters', 'completion_status', 'model_outputs']
  },
  {
    tableName: 'subscriptions',
    filename: 'subscriptions.sql',
    description: 'Payment and subscription data',
    priority: 1,
    includes: ['stripe_data', 'billing_periods', 'plan_details']
  },
  {
    tableName: 'ai_images',
    filename: 'ai_images.sql',
    description: 'Generated images gallery',
    priority: 3,
    includes: ['image_urls', 'prompts', 'generation_metadata']
  },
  {
    tableName: 'user_usage',
    filename: 'user_usage.sql',
    description: 'Usage tracking and limits',
    priority: 2,
    includes: ['generation_counts', 'monthly_limits', 'usage_history']
  },
  {
    tableName: 'onboarding_data',
    filename: 'onboarding_data.sql',
    description: 'User onboarding responses',
    priority: 2,
    includes: ['brand_story', 'business_goals', 'style_preferences']
  },
  {
    tableName: 'selfie_uploads',
    filename: 'selfie_uploads.sql',
    description: 'Training image uploads',
    priority: 3,
    includes: ['upload_urls', 'processing_status', 'file_metadata']
  },
  {
    tableName: 'agent_session_contexts',
    filename: 'agent_sessions.sql',
    description: 'Agent conversation contexts',
    priority: 4,
    includes: ['conversation_memory', 'workflow_states']
  },
  {
    tableName: 'claude_conversations',
    filename: 'claude_conversations.sql',
    description: 'Claude API conversation tracking',
    priority: 4,
    includes: ['conversation_metadata', 'agent_contexts']
  },
  {
    tableName: 'claude_messages',
    filename: 'claude_messages.sql',
    description: 'Claude API message history',
    priority: 4,
    includes: ['message_content', 'tool_calls', 'results']
  },
  {
    tableName: 'generation_trackers',
    filename: 'generation_trackers.sql',
    description: 'Image generation tracking',
    priority: 3,
    includes: ['prediction_ids', 'generation_status', 'temp_urls']
  }
];

/**
 * Generate SQL export query for a table
 */
function generateExportSQL(tableConfig) {
  const { tableName, description, includes } = tableConfig;
  
  const sql = `-- ============================================================
-- ${description.toUpperCase()}
-- Table: ${tableName}
-- Includes: ${includes.join(', ')}
-- Generated: ${new Date().toISOString()}
-- ============================================================

-- Export all data from ${tableName}
\\COPY (
  SELECT * FROM ${tableName}
  ORDER BY created_at ASC
) TO '${tableName}_export.csv' WITH CSV HEADER;

-- Alternative: JSON export for complex data types
\\COPY (
  SELECT row_to_json(${tableName}) 
  FROM ${tableName}
  ORDER BY created_at ASC
) TO '${tableName}_export.json';

-- Count verification
SELECT 
  '${tableName}' as table_name,
  COUNT(*) as total_records,
  MIN(created_at) as earliest_record,
  MAX(created_at) as latest_record
FROM ${tableName};

-- Schema export
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = '${tableName}'
ORDER BY ordinal_position;

-- ============================================================
-- END ${tableName.toUpperCase()} EXPORT
-- ============================================================

`;

  return sql;
}

/**
 * Generate master export script
 */
function generateMasterExportScript() {
  const masterScript = `-- ============================================================
-- SSELFIE STUDIO MASTER DATA EXPORT SCRIPT
-- Generated: ${new Date().toISOString()}
-- 
-- This script exports all critical data from the Replit database
-- Run this in your PostgreSQL environment to export all data
-- ============================================================

-- Set export directory (adjust as needed)
\\set export_dir '/tmp/sselfie_export/'

-- Create export directory
\\! mkdir -p :export_dir

-- Start transaction for consistency
BEGIN;

-- Export execution log
\\echo 'Starting SSELFIE Studio data export...'
\\timing on

${tableExports
  .sort((a, b) => a.priority - b.priority)
  .map(table => `
-- ============================================================
-- EXPORTING: ${table.tableName.toUpperCase()}
-- Priority: ${table.priority}
-- ============================================================
\\echo 'Exporting ${table.tableName}...'

\\COPY (
  SELECT * FROM ${table.tableName}
  ORDER BY created_at ASC
) TO ':export_dir${table.tableName}_export.csv' WITH CSV HEADER;

\\COPY (
  SELECT row_to_json(${table.tableName}) 
  FROM ${table.tableName}
  ORDER BY created_at ASC
) TO ':export_dir${table.tableName}_export.json';

\\echo 'Completed ${table.tableName} export'
`).join('\n')}

-- Generate summary report
\\COPY (
  SELECT 
    'users' as table_name,
    COUNT(*) as record_count,
    MIN(created_at) as earliest,
    MAX(created_at) as latest
  FROM users
  
  UNION ALL
  
  SELECT 
    'maya_chats',
    COUNT(*),
    MIN(created_at),
    MAX(created_at)
  FROM maya_chats
  
  UNION ALL
  
  SELECT 
    'maya_chat_messages',
    COUNT(*),
    MIN(created_at),
    MAX(created_at)
  FROM maya_chat_messages
  
  UNION ALL
  
  SELECT 
    'user_models',
    COUNT(*),
    MIN(created_at),
    MAX(created_at)
  FROM user_models
  
  UNION ALL
  
  SELECT 
    'subscriptions',
    COUNT(*),
    MIN(created_at),
    MAX(created_at)
  FROM subscriptions
  
  UNION ALL
  
  SELECT 
    'ai_images',
    COUNT(*),
    MIN(created_at),
    MAX(created_at)
  FROM ai_images

) TO ':export_dir export_summary.csv' WITH CSV HEADER;

COMMIT;

\\echo 'SSELFIE Studio data export completed!'
\\echo 'Export files created in: ' :export_dir
\\timing off

-- ============================================================
-- EXPORT COMPLETE
-- ============================================================
`;

  return masterScript;
}

/**
 * Generate individual table export scripts
 */
function generateIndividualExports() {
  console.log('🚀 Generating individual table export scripts...');
  
  tableExports.forEach(tableConfig => {
    const sql = generateExportSQL(tableConfig);
    const filePath = resolve(EXPORT_DIR, tableConfig.filename);
    
    writeFileSync(filePath, sql, 'utf8');
    console.log(`✅ Created: ${tableConfig.filename}`);
  });
}

/**
 * Generate connection verification script
 */
function generateConnectionTest() {
  const connectionTest = `-- ============================================================
-- DATABASE CONNECTION AND VERIFICATION TEST
-- Run this first to verify database access
-- ============================================================

-- Test database connection
SELECT 
  current_database() as database_name,
  current_user as user_name,
  version() as postgres_version,
  now() as connection_time;

-- Verify critical tables exist
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'users',
    'maya_chats', 
    'maya_chat_messages',
    'user_models',
    'subscriptions',
    'ai_images'
  )
ORDER BY table_name;

-- Check record counts
SELECT 
  'users' as table_name,
  COUNT(*) as records
FROM users

UNION ALL

SELECT 
  'maya_chats',
  COUNT(*)
FROM maya_chats

UNION ALL

SELECT 
  'maya_chat_messages', 
  COUNT(*)
FROM maya_chat_messages

UNION ALL

SELECT 
  'user_models',
  COUNT(*)
FROM user_models

UNION ALL

SELECT 
  'subscriptions',
  COUNT(*)
FROM subscriptions

UNION ALL

SELECT 
  'ai_images',
  COUNT(*)
FROM ai_images;

-- ============================================================
-- If all queries above run successfully, database is ready for export
-- ============================================================
`;

  return connectionTest;
}

/**
 * Main execution
 */
function main() {
  console.log('🎯 SSELFIE Studio Data Export Script Generator');
  console.log('================================================');
  
  // Generate individual table exports
  generateIndividualExports();
  
  // Generate master export script
  console.log('\n📋 Generating master export script...');
  const masterScript = generateMasterExportScript();
  writeFileSync(resolve(EXPORT_DIR, 'master_export.sql'), masterScript, 'utf8');
  console.log('✅ Created: master_export.sql');
  
  // Generate connection test
  console.log('\n🔍 Generating connection test script...');
  const connectionTest = generateConnectionTest();
  writeFileSync(resolve(EXPORT_DIR, 'connection_test.sql'), connectionTest, 'utf8');
  console.log('✅ Created: connection_test.sql');
  
  // Generate README
  console.log('\n📖 Generating export README...');
  const readme = `# SSELFIE Studio Data Export

## Overview
This directory contains SQL scripts to export all critical data from the Replit database.

## Usage Instructions

### Step 1: Test Database Connection
\`\`\`bash
psql $DATABASE_URL -f connection_test.sql
\`\`\`

### Step 2: Run Master Export
\`\`\`bash
psql $DATABASE_URL -f master_export.sql
\`\`\`

### Step 3: Verify Exports
Check the generated CSV and JSON files in your export directory.

## Generated Files

${tableExports.map(table => 
  `- **${table.filename}**: ${table.description}`
).join('\n')}

## Priority Levels
- **Priority 1**: Critical user and subscription data
- **Priority 2**: Core application data (Maya chats, usage)
- **Priority 3**: Generated content (images, models, training)
- **Priority 4**: System data (sessions, logs)

## File Formats
- **CSV**: Human-readable, Excel-compatible
- **JSON**: Preserves complex data types and structure

## Data Verification
Each export includes record counts and schema information for verification.

## Security Notes
- Exports contain sensitive user data
- Use secure transfer methods
- Delete temporary export files after migration
- Verify data integrity before destroying source data

Generated: ${new Date().toISOString()}
`;
  
  writeFileSync(resolve(EXPORT_DIR, 'README.md'), readme, 'utf8');
  console.log('✅ Created: README.md');
  
  // Summary
  console.log('\n🎉 Export scripts generated successfully!');
  console.log(`📁 Location: ${EXPORT_DIR}/`);
  console.log(`📊 Tables covered: ${tableExports.length}`);
  console.log('\n🚀 Next steps:');
  console.log('1. Test database connection: node scripts/export-replit-data.js');
  console.log('2. Run connection test: psql $DATABASE_URL -f data-export/connection_test.sql');
  console.log('3. Execute export: psql $DATABASE_URL -f data-export/master_export.sql');
  
  return true;
}

// Run the script
main();