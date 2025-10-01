import { db } from './server/drizzle.js';
import { users } from './shared/schema.js';
import { eq } from 'drizzle-orm';

async function updateAdminUserTrainingStatus() {
  try {
    // Get current user data
    const adminUser = await db
      .select()
      .from(users)
      .where(eq(users.email, 'ssa@ssasocial.com'))
      .limit(1);

    if (adminUser.length === 0) {
      console.log('❌ Admin user not found');
      return;
    }

    const user = adminUser[0];
    console.log('📋 Current Admin User Status:');
    console.log(JSON.stringify(user, null, 2));

    // Update the training completed status
    console.log('\n🔄 Updating training completion status...');
    
    const updatedUser = await db
      .update(users)
      .set({
        trainingCoachingCompleted: true,
        updatedAt: new Date()
      })
      .where(eq(users.email, 'ssa@ssasocial.com'))
      .returning();

    console.log('\n✅ Updated Admin User:');
    console.log('Training Coaching Completed:', updatedUser[0].trainingCoachingCompleted);
    console.log('Updated At:', updatedUser[0].updatedAt);

  } catch (error) {
    console.error('Error updating admin user training status:', error);
  }
  process.exit(0);
}

updateAdminUserTrainingStatus();