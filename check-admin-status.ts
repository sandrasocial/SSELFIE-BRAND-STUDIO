import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { users } from './shared/schema.js';
import { eq } from 'drizzle-orm';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function checkAdmin() {
  try {
    console.log('🔍 Checking admin user status...\n');

    const adminUser = await db.select().from(users).where(eq(users.email, 'ssa@ssasocial.com')).limit(1);

    if (adminUser.length === 0) {
      console.log('❌ Admin user not found!');
      return;
    }

    const user = adminUser[0];
    console.log('👑 Admin User Details:');
    console.log('  - ID:', user.id);
    console.log('  - Email:', user.email);
    console.log('  - Role:', user.role);
    console.log('  - Plan:', user.plan);
    console.log('  - Monthly Limit:', user.monthlyGenerationLimit);
    console.log('  - Maya Access:', user.mayaAiAccess);
    console.log('  - Victoria Access:', user.victoriaAiAccess);
    console.log('  - Has Retraining Access:', user.hasRetrainingAccess);
    console.log('  - Created:', user.createdAt);
    console.log('  - Last Login:', user.lastLoginAt);

    // Check if admin settings are correct
    const isProperAdmin = user.role === 'admin' &&
                         user.monthlyGenerationLimit === -1 &&
                         user.mayaAiAccess === true &&
                         user.victoriaAiAccess === true;

    console.log('\n✅ Admin Status Check:', isProperAdmin ? 'CORRECT' : 'INCORRECT');

    if (!isProperAdmin) {
      console.log('❌ Issues found:');
      if (user.role !== 'admin') console.log('  - Role should be "admin"');
      if (user.monthlyGenerationLimit !== -1) console.log('  - Monthly limit should be -1');
      if (user.mayaAiAccess !== true) console.log('  - Maya access should be true');
      if (user.victoriaAiAccess !== true) console.log('  - Victoria access should be true');
    }

  } catch (error) {
    console.error('❌ Error checking admin:', error);
  }
}

checkAdmin();