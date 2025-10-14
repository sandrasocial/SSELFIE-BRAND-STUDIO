import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { users } from './shared/schema.js';
import { eq } from 'drizzle-orm';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function fixAdminUser() {
  try {
    console.log('🔧 Fixing admin user access...\n');

    // Update admin user
    const result = await db.update(users)
      .set({
        role: 'admin',
        monthlyGenerationLimit: -1,
        mayaAiAccess: true,
        victoriaAiAccess: true,
        updatedAt: new Date()
      })
      .where(eq(users.email, 'ssa@ssasocial.com'))
      .returning();

    if (result.length === 0) {
      console.log('❌ Admin user not found!');
      return;
    }

    const user = result[0];
    console.log('✅ Admin user updated:');
    console.log('  - Email:', user.email);
    console.log('  - Role:', user.role);
    console.log('  - Monthly Limit:', user.monthlyGenerationLimit);
    console.log('  - Maya Access:', user.mayaAiAccess);
    console.log('  - Victoria Access:', user.victoriaAiAccess);

    console.log('\n🎉 Admin user access fixed!');

  } catch (error) {
    console.error('❌ Error fixing admin user:', error);
  }
}

fixAdminUser();