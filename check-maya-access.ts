import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { users, userModels } from './shared/schema.js';
import { eq } from 'drizzle-orm';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function checkMayaAccess() {
  try {
    console.log('🤖 Checking Maya AI access across all users...\n');

    // Get all users with their model status
    const allUsers = await db.select().from(users).orderBy(users.createdAt);
    console.log('📊 Total users:', allUsers.length);

    let usersWithMayaAccess = 0;
    let usersWithTrainedModels = 0;
    let usersWithModelsButNoMayaAccess = 0;
    let usersWithoutModelsButHaveMayaAccess = 0;

    console.log('🔍 Detailed Maya Access Analysis:\n');

    for (const user of allUsers) {
      // Check if user has a trained model
      const userModel = await db.select()
        .from(userModels)
        .where(eq(userModels.userId, user.id))
        .limit(1);

      const hasTrainedModel = userModel.length > 0 && userModel[0].trainingStatus === 'completed';
      const hasMayaAccess = user.mayaAiAccess === true;

      if (hasTrainedModel) {
        usersWithTrainedModels++;
      }

      if (hasMayaAccess) {
        usersWithMayaAccess++;
      }

      // Check for inconsistencies
      if (hasTrainedModel && !hasMayaAccess) {
        usersWithModelsButNoMayaAccess++;
        console.log('❌ User with trained model but NO Maya access:');
        console.log(`   - Email: ${user.email || 'No email'}`);
        console.log(`   - ID: ${user.id}`);
        console.log(`   - Plan: ${user.plan}`);
        console.log(`   - Role: ${user.role}`);
        console.log(`   - Model Status: ${userModel[0].trainingStatus}`);
        console.log('');
      }

      if (!hasTrainedModel && hasMayaAccess && user.plan === 'sselfie-studio') {
        usersWithoutModelsButHaveMayaAccess++;
        console.log('⚠️  User with Maya access but NO trained model:');
        console.log(`   - Email: ${user.email || 'No email'}`);
        console.log(`   - ID: ${user.id}`);
        console.log(`   - Plan: ${user.plan}`);
        console.log(`   - Role: ${user.role}`);
        console.log('');
      }
    }

    console.log('📈 Maya Access Summary:');
    console.log(`   - Total users: ${allUsers.length}`);
    console.log(`   - Users with Maya access: ${usersWithMayaAccess}`);
    console.log(`   - Users with trained models: ${usersWithTrainedModels}`);
    console.log(`   - Users with models but no Maya access: ${usersWithModelsButNoMayaAccess}`);
    console.log(`   - Users with Maya access but no trained model: ${usersWithoutModelsButHaveMayaAccess}`);

    // Check plan-based access expectations
    console.log('\n🎯 Plan-Based Access Analysis:');
    const planStats = await Promise.all(allUsers.map(async (user) => {
      const plan = user.plan || 'no-plan';
      const hasMayaAccess = user.mayaAiAccess;

      // Check if they have a trained model
      const userModel = await db.select()
        .from(userModels)
        .where(eq(userModels.userId, user.id))
        .limit(1);
      const hasModel = userModel.length > 0 && userModel[0].trainingStatus === 'completed';

      return { plan, hasMayaAccess, hasModel };
    }));

    const groupedStats = planStats.reduce((acc, { plan, hasMayaAccess, hasModel }) => {
      if (!acc[plan]) {
        acc[plan] = { total: 0, withMayaAccess: 0, withModels: 0 };
      }
      acc[plan].total++;
      if (hasMayaAccess) {
        acc[plan].withMayaAccess++;
      }
      if (hasModel) {
        acc[plan].withModels++;
      }
      return acc;
    }, {} as Record<string, { total: number; withMayaAccess: number; withModels: number }>);

    Object.entries(groupedStats).forEach(([plan, stats]) => {
      console.log(`   ${plan}: ${stats.total} users`);
      console.log(`     - Maya access: ${stats.withMayaAccess}/${stats.total}`);
      console.log(`     - Trained models: ${stats.withModels}/${stats.total}`);
    });

    // Recommendations
    console.log('\n💡 Recommendations:');
    if (usersWithModelsButNoMayaAccess > 0) {
      console.log('   - Fix users with trained models but no Maya access');
    }
    if (usersWithoutModelsButHaveMayaAccess > 0) {
      console.log('   - Review users with Maya access but no trained models (may be correct for sselfie-studio plan)');
    }

    console.log('\n✅ Maya access analysis completed!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkMayaAccess();