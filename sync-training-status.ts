import { db } from './server/drizzle.js';
import { users } from './shared/schema.js';
import { mayaModels } from './shared/schema-maya.js';
import { eq } from 'drizzle-orm';

async function syncTrainingStatus() {
  try {
    console.log('🔄 Starting training status synchronization...');
    
    // Get all users with completed models but trainingCoachingCompleted = false
    const usersWithCompletedModels = await db
      .select({
        userId: users.id,
        email: users.email,
        trainingCoachingCompleted: users.trainingCoachingCompleted,
      })
      .from(users)
      .innerJoin(mayaModels, eq(users.id, mayaModels.userId))
      .where(eq(mayaModels.trainingStatus, 'completed'));

    console.log(`📊 Found ${usersWithCompletedModels.length} users with completed models`);
    
    let updatedCount = 0;
    
    for (const user of usersWithCompletedModels) {
      if (!user.trainingCoachingCompleted) {
        console.log(`🔧 Updating training status for user: ${user.email}`);
        
        await db
          .update(users)
          .set({
            trainingCoachingCompleted: true,
            updatedAt: new Date()
          })
          .where(eq(users.id, user.userId));
        
        updatedCount++;
      } else {
        console.log(`✅ User ${user.email} already has correct status`);
      }
    }
    
    console.log(`✅ Successfully updated ${updatedCount} users`);
    
    // Now show current status for the specific user
    console.log('\n📋 Current status for admin user:');
    const adminUser = await db
      .select({
        id: users.id,
        email: users.email,
        trainingCoachingCompleted: users.trainingCoachingCompleted,
      })
      .from(users)
      .where(eq(users.email, 'ssa@ssasocial.com'))
      .limit(1);

    if (adminUser.length > 0) {
      console.log('Admin user:', adminUser[0]);
      
      // Check their model status
      const adminModel = await db
        .select()
        .from(mayaModels)
        .where(eq(mayaModels.userId, adminUser[0].id))
        .limit(1);
      
      if (adminModel.length > 0) {
        console.log('Admin model:', {
          trainingStatus: adminModel[0].trainingStatus,
          trainingProgress: adminModel[0].trainingProgress,
          completedAt: adminModel[0].completedAt
        });
      } else {
        console.log('❌ No model found for admin user');
      }
    } else {
      console.log('❌ Admin user not found');
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error syncing training status:', error);
    process.exit(1);
  }
}

syncTrainingStatus();