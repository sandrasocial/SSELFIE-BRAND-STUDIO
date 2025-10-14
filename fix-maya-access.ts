import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { users, userModels } from './shared/schema.js';
import { eq } from 'drizzle-orm';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function fixMayaAccess() {
  try {
    console.log('🔧 Fixing Maya AI access for users with trained models...\n');

    // Find users with trained models but no Maya access
    const usersWithModels = await db.select()
      .from(userModels)
      .where(eq(userModels.trainingStatus, 'completed'));

    console.log(`Found ${usersWithModels.length} users with trained models`);

    let fixedCount = 0;

    for (const model of usersWithModels) {
      // Get the user
      const userResult = await db.select()
        .from(users)
        .where(eq(users.id, model.userId))
        .limit(1);

      if (userResult.length === 0) {
        console.log(`⚠️  User ${model.userId} not found in users table`);
        continue;
      }

      const user = userResult[0];

      if (!user.mayaAiAccess) {
        console.log(`🔧 Enabling Maya access for user: ${user.email || user.id}`);
        console.log(`   - Current plan: ${user.plan}`);
        console.log(`   - Current Maya access: ${user.mayaAiAccess}`);

        // Update user to enable Maya access
        await db.update(users)
          .set({
            mayaAiAccess: true,
            updatedAt: new Date()
          })
          .where(eq(users.id, user.id));

        fixedCount++;
        console.log(`✅ Maya access enabled\n`);
      } else {
        console.log(`✅ User ${user.email || user.id} already has Maya access`);
      }
    }

    console.log(`🎉 Fixed Maya access for ${fixedCount} users with trained models`);

    // Verify the fixes
    console.log('\n🔍 Verifying fixes...');
    const stillBroken = await db
      .select({
        userId: users.id,
        email: users.email,
        plan: users.plan,
        mayaAccess: users.mayaAiAccess,
        modelStatus: userModels.trainingStatus
      })
      .from(users)
      .innerJoin(userModels, eq(users.id, userModels.userId))
      .where(eq(userModels.trainingStatus, 'completed'));

    const brokenCount = stillBroken.filter(row => !row.mayaAccess).length;

    if (brokenCount === 0) {
      console.log('✅ All users with trained models now have Maya access!');
    } else {
      console.log(`❌ Still ${brokenCount} users with trained models missing Maya access`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixMayaAccess();