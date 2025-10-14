import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { users } from './shared/schema.js';
import { eq } from 'drizzle-orm';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function checkAndUpdateUsers() {
  try {
    console.log('🔍 Checking all users and their access levels...');

    // Get all users
    const allUsers = await db.select().from(users).orderBy(users.createdAt);
    console.log('📊 Total users:', allUsers.length);

    // Check admin user specifically
    const adminUser = allUsers.find(u => u.email === 'ssa@ssasocial.com');
    if (adminUser) {
      console.log('\n👑 Admin user (ssa@ssasocial.com):');
      console.log('  - ID:', adminUser.id);
      console.log('  - Email:', adminUser.email);
      console.log('  - Role:', adminUser.role);
      console.log('  - Plan:', adminUser.plan);
      console.log('  - Monthly Limit:', adminUser.monthlyGenerationLimit);
      console.log('  - Maya Access:', adminUser.mayaAiAccess);
      console.log('  - Victoria Access:', adminUser.victoriaAiAccess);

      // Update admin user if needed
      const needsUpdate = adminUser.role !== 'admin' ||
                         adminUser.monthlyGenerationLimit !== -1 ||
                         adminUser.plan !== 'sselfie-studio' ||
                         !adminUser.mayaAiAccess ||
                         !adminUser.victoriaAiAccess;

      if (needsUpdate) {
        console.log('⚠️  Admin user needs updates - fixing...');
        await db.update(users)
          .set({
            role: 'admin',
            monthlyGenerationLimit: -1,
            plan: 'sselfie-studio',
            mayaAiAccess: true,
            victoriaAiAccess: true,
            updatedAt: new Date()
          })
          .where(eq(users.email, 'ssa@ssasocial.com'));
        console.log('✅ Admin user updated');
      } else {
        console.log('✅ Admin user is properly configured');
      }
    } else {
      console.log('\n❌ Admin user ssa@ssasocial.com not found');
    }

    // Check access distribution
    console.log('\n📈 Access level distribution:');
    const accessStats: Record<string, number> = {};
    allUsers.forEach(user => {
      const plan = user.plan || 'no-plan';
      const role = user.role || 'no-role';
      const key = `${plan}-${role}`;
      accessStats[key] = (accessStats[key] || 0) + 1;
    });

    Object.entries(accessStats).forEach(([key, count]) => {
      console.log(`  ${key}: ${count} users`);
    });

    // Check users that might need updates
    console.log('\n⚠️  Users that might need access updates:');
    const needsUpdate = allUsers.filter(user => {
      // Users with sselfie-studio plan should have proper access
      if (user.plan === 'sselfie-studio') {
        return user.monthlyGenerationLimit !== 100 ||
               !user.mayaAiAccess ||
               user.role !== 'user';
      }
      return false;
    });

    if (needsUpdate.length > 0) {
      console.log('Found', needsUpdate.length, 'users with sselfie-studio plan needing updates:');
      for (const user of needsUpdate) {
        console.log('-', user.email || user.id, {
          currentPlan: user.plan,
          currentRole: user.role,
          monthlyLimit: user.monthlyGenerationLimit,
          mayaAccess: user.mayaAiAccess
        });

        // Update user
        await db.update(users)
          .set({
            monthlyGenerationLimit: 100,
            mayaAiAccess: true,
            role: 'user',
            updatedAt: new Date()
          })
          .where(eq(users.id, user.id));
      }
      console.log('✅ Updated', needsUpdate.length, 'users');
    } else {
      console.log('✅ All sselfie-studio users have proper access levels');
    }

    console.log('\n🎉 User access check and updates completed!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkAndUpdateUsers();