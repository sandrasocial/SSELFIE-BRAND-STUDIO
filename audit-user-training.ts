import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './shared/schema.js';
import { eq, and, isNull, isNotNull, ne } from 'drizzle-orm';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function auditUserTrainingStatus() {
  try {
    console.log('🔍 AUDITING USER TRAINING STATUS\n');

    // Find all users with completed trained models
    const usersWithModels = await db
      .select({
        userId: schema.userModels.userId,
        trainingStatus: schema.userModels.trainingStatus,
        modelId: schema.userModels.id,
        replicateModelId: schema.userModels.replicateModelId,
        completedAt: schema.userModels.completedAt,
        userEmail: schema.users.email,
        userDisplayName: schema.users.displayName,
        trainingCoachingCompleted: schema.users.trainingCoachingCompleted,
        stackAuthId: schema.users.stackAuthId,
        plan: schema.users.plan,
        role: schema.users.role
      })
      .from(schema.userModels)
      .innerJoin(schema.users, eq(schema.userModels.userId, schema.users.id))
      .where(eq(schema.userModels.trainingStatus, 'completed'));

    console.log(`📊 Found ${usersWithModels.length} users with completed trained models\n`);

    // Count users with mismatched training status
    const mismatchedUsers = usersWithModels.filter(user => !user.trainingCoachingCompleted);
    
    console.log(`❌ Users with completed models but trainingCoachingCompleted = false: ${mismatchedUsers.length}\n`);

    if (mismatchedUsers.length > 0) {
      console.log('🚨 USERS NEEDING TRAINING STATUS FIX:\n');
      
      for (const user of mismatchedUsers) {
        console.log(`👤 User ID: ${user.userId}`);
        console.log(`   📧 Email: ${user.userEmail || 'No email'}`);
        console.log(`   👤 Display Name: ${user.userDisplayName || 'No display name'}`);
        console.log(`   🔑 Stack Auth ID: ${user.stackAuthId ? 'Yes' : 'No'}`);
        console.log(`   📋 Plan: ${user.plan || 'free'}`);
        console.log(`   🛡️ Role: ${user.role || 'user'}`);
        console.log(`   🤖 Model: ${user.replicateModelId}`);
        console.log(`   ✅ Training Status: ${user.trainingStatus}`);
        console.log(`   ❌ Coaching Complete: ${user.trainingCoachingCompleted}`);
        
        // Check if they have generated images
        const generatedCount = await db
          .select({ count: schema.generatedImages.id })
          .from(schema.generatedImages)
          .where(eq(schema.generatedImages.userId, user.userId));
          
        console.log(`   🎨 Generated Images: ${generatedCount.length}`);
        console.log('   ──────────────────────────────────────');
      }
    }

    // Show correctly configured users for comparison
    const correctUsers = usersWithModels.filter(user => user.trainingCoachingCompleted);
    console.log(`\n✅ Users with correctly matched training status: ${correctUsers.length}\n`);

    if (correctUsers.length > 0) {
      console.log('✅ CORRECTLY CONFIGURED USERS:\n');
      correctUsers.slice(0, 3).forEach(user => {
        console.log(`👤 ${user.userEmail || user.userDisplayName} - Model: ${user.replicateModelId?.substring(0, 30)}...`);
      });
    }

    // Summary statistics
    console.log('\n📊 SUMMARY:');
    console.log(`Total users with completed models: ${usersWithModels.length}`);
    console.log(`Users needing training status fix: ${mismatchedUsers.length}`);
    console.log(`Users correctly configured: ${correctUsers.length}`);
    
    if (mismatchedUsers.length > 0) {
      console.log(`\n⚠️ IMPACT: ${mismatchedUsers.length} users may be experiencing authentication loops!`);
    }

  } catch (error) {
    console.error('Error auditing user training status:', error);
  } finally {
    await client.end();
  }
}

auditUserTrainingStatus();