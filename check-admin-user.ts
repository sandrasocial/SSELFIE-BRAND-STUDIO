// Check admin user migration status and Stack Auth sync
import { db } from './server/drizzle.js';
import { users } from './shared/schema.js';
import { eq } from 'drizzle-orm';

async function checkAdminUser() {
  try {
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
    console.log('✅ Admin User Status:');
    console.log('Email:', user.email);
    console.log('Stack Auth ID:', user.stackAuthId || 'NOT SET');
    console.log('Role:', user.role || 'user');
    console.log('Plan:', user.plan || 'free');
    console.log('Display Name:', user.displayName || 'Not set');
    console.log('Training Coaching Completed:', !!user.trainingCoachingCompleted);
    console.log('Maya AI access:', !!user.mayaAiAccess);
    console.log('Created:', user.createdAt);

    if (user.stackAuthId) {
      console.log('\n✅ Admin user is properly synced with Stack Auth');
      console.log('Should be able to authenticate and access /app route');
    } else {
      console.log('\n❌ Admin user missing Stack Auth ID - migration needed');
    }

  } catch (error) {
    console.error('Error checking admin user:', error);
  }
  process.exit(0);
}

checkAdminUser();