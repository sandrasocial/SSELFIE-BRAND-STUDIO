import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './shared/schema.js';
import { eq, inArray } from 'drizzle-orm';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function fixAllUserTrainingStatus() {
  try {
    console.log('🔧 FIXING ALL USER TRAINING STATUS\n');

    // Get all users with completed models but incorrect training status
    const usersWithModels = await db
      .select({
        userId: schema.userModels.userId,
        userEmail: schema.users.email,
        userDisplayName: schema.users.displayName,
        trainingCoachingCompleted: schema.users.trainingCoachingCompleted,
        plan: schema.users.plan
      })
      .from(schema.userModels)
      .innerJoin(schema.users, eq(schema.userModels.userId, schema.users.id))
      .where(eq(schema.userModels.trainingStatus, 'completed'));

    const usersToFix = usersWithModels.filter(user => !user.trainingCoachingCompleted);
    
    if (usersToFix.length === 0) {
      console.log('✅ All users already have correct training status!');
      return;
    }

    console.log(`🔧 Found ${usersToFix.length} users to fix:\n`);
    
    usersToFix.forEach(user => {
      console.log(`👤 ${user.userEmail || user.userDisplayName || user.userId} (${user.plan})`);
    });

    console.log(`\n🚀 Updating training status for ${usersToFix.length} users...`);

    // Extract user IDs to update
    const userIdsToUpdate = usersToFix.map(user => user.userId);

    // Mass update all users with completed models
    const result = await db
      .update(schema.users)
      .set({
        trainingCoachingCompleted: true,
        updatedAt: new Date()
      })
      .where(inArray(schema.users.id, userIdsToUpdate))
      .returning({ 
        id: schema.users.id, 
        email: schema.users.email,
        displayName: schema.users.displayName,
        trainingCoachingCompleted: schema.users.trainingCoachingCompleted 
      });

    console.log(`\n✅ Successfully updated ${result.length} users:\n`);

    result.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email || user.displayName || user.id} - Training Complete: ${user.trainingCoachingCompleted}`);
    });

    // Verify the fix worked
    console.log('\n🔍 Verification: Checking for remaining issues...');
    
    const remainingIssues = await db
      .select({
        userId: schema.userModels.userId,
        userEmail: schema.users.email,
        trainingCoachingCompleted: schema.users.trainingCoachingCompleted
      })
      .from(schema.userModels)
      .innerJoin(schema.users, eq(schema.userModels.userId, schema.users.id))
      .where(eq(schema.userModels.trainingStatus, 'completed'));

    const stillBroken = remainingIssues.filter(user => !user.trainingCoachingCompleted);

    if (stillBroken.length === 0) {
      console.log('✅ All users now have correct training status!');
    } else {
      console.log(`⚠️ ${stillBroken.length} users still need fixing`);
    }

    console.log('\n📊 IMPACT:');
    console.log(`- Fixed authentication loops for ${result.length} users`);
    console.log(`- Users can now access /app route after sign-in`);
    console.log(`- No more 404 redirects for trained users`);

  } catch (error) {
    console.error('Error fixing user training status:', error);
  } finally {
    await client.end();
  }
}

fixAllUserTrainingStatus();