// Script to fix ALL user models to use their trained versions instead of base FLUX
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function fixAllUserModels() {
  console.log('🔍 Finding all completed training models without version IDs...');
  
  try {
    // Get all completed models without version IDs
    const result = await pool.query(`
      SELECT user_id, model_name, trigger_word, replicate_model_id, replicate_version_id
      FROM user_models 
      WHERE training_status = 'completed' 
      AND (replicate_version_id IS NULL OR replicate_version_id = '')
    `);
    
    console.log(`Found ${result.rows.length} models to fix:`);
    
    for (const row of result.rows) {
      console.log(`\n🔧 Fixing model for user ${row.user_id}...`);
      console.log(`   Model: ${row.model_name}`);
      console.log(`   Training ID: ${row.replicate_model_id}`);
      
      if (!row.replicate_model_id) {
        console.log('   ❌ No training ID - skipping');
        continue;
      }
      
      try {
        // Fetch training data from Replicate API
        const response = await fetch(`https://api.replicate.com/v1/trainings/${row.replicate_model_id}`, {
          headers: { 'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}` }
        });
        
        if (!response.ok) {
          console.log(`   ❌ API error ${response.status} - skipping`);
          continue;
        }
        
        const trainingData = await response.json();
        console.log(`   Training status: ${trainingData.status}`);
        
        if (trainingData.status === 'succeeded') {
          const trainedVersion = trainingData.version;
          
          if (trainedVersion) {
            console.log(`   ✅ Found trained model version: ${trainedVersion}`);
            
            // Update the database with the correct version
            await pool.query(`
              UPDATE user_models 
              SET replicate_version_id = $1, trained_model_path = $2
              WHERE user_id = $3
            `, [trainedVersion, `sandrasocial/${row.model_name}`, row.user_id]);
            
            console.log(`   ✅ Updated database for user ${row.user_id}`);
          } else {
            console.log(`   ❌ No version in training data`);
          }
        } else {
          console.log(`   ❌ Training not succeeded: ${trainingData.status}`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error processing: ${error.message}`);
      }
    }
    
    console.log('\n✅ Model fix process completed!');
    
    // Verify the fixes
    const verifyResult = await pool.query(`
      SELECT user_id, model_name, training_status, replicate_version_id
      FROM user_models 
      WHERE training_status = 'completed'
    `);
    
    console.log('\n📊 Final status of all completed models:');
    for (const row of verifyResult.rows) {
      const status = row.replicate_version_id ? '✅ HAS TRAINED VERSION' : '❌ MISSING VERSION';
      console.log(`   ${row.user_id}: ${status} (${row.replicate_version_id?.substring(0, 20)}...)`);
    }
    
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await pool.end();
  }
}

fixAllUserModels().catch(console.error);