import { db } from './server/drizzle.js';
import { users, userModels } from './shared/schema.js';
import { eq } from 'drizzle-orm';

async function syncTrainingStatus() {
  try {
    console.log('🔄 Starting training status synchronization...');
    
    // Get all users with completed models
    const usersWithCompletedModels = await db
      .select({
        userId: users.id,
        email: users.email,
      })
      .from(users)
      .innerJoin(userModels, eq(users.id, userModels.userId))
      .where(eq(userModels.trainingStatus, 'completed'));

    console.log(`📊 Found ${usersWithCompletedModels.length} users with completed models`);
    
    // Now show current status for the specific user
    console.log('\n📋 Current status for admin user:');
    const adminUser = await db
      .select({
        id: users.id,
        email: users.email,
      })
      .from(users)
      .where(eq(users.email, 'ssa@ssasocial.com'))
      .limit(1);

    if (adminUser.length > 0) {
      console.log('Admin user:', adminUser[0]);
      
      // Check their model status
      const adminModel = await db
        .select()
        .from(userModels)
        .where(eq(userModels.userId, adminUser[0].id))
        .limit(1);
      
      if (adminModel.length > 0) {
        console.log('Admin model:', {
          trainingStatus: adminModel[0].trainingStatus,
          trainingProgress: adminModel[0].trainingProgress,
          createdAt: adminModel[0].createdAt
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