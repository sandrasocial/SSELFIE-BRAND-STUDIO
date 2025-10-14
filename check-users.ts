import { DatabaseStorage } from './server/storage.js';

interface UserWithModel {
  user: any;
  model: any;
}

async function checkUsers() {
  try {
    console.log('🔍 Checking all users and their access levels...');

    const storage = new DatabaseStorage();

    // Get all users
    const users = await storage.getAllUsers();
    console.log('📊 Total users:', users.length);

    // Check admin user specifically
    const adminUser = users.find(u => u.email === 'ssa@ssasocial.com');
    if (adminUser) {
      console.log('\n👑 Admin user (ssa@ssasocial.com):');
      console.log('  - ID:', adminUser.id);
      console.log('  - Email:', adminUser.email);
      console.log('  - Role:', adminUser.role);
      console.log('  - Plan:', adminUser.plan);
      console.log('  - Monthly Limit:', adminUser.monthlyGenerationLimit);
      console.log('  - Maya Access:', adminUser.mayaAiAccess);
      console.log('  - Victoria Access:', adminUser.victoriaAiAccess);
    } else {
      console.log('\n❌ Admin user ssa@ssasocial.com not found');
    }

    // Check users with trained models
    console.log('\n🤖 Users with trained models:');
    const usersWithModels: UserWithModel[] = [];
    for (const user of users) {
      try {
        const model = await storage.getUserModel(user.id);
        if (model) {
          usersWithModels.push({ user, model });
        }
      } catch (error) {
        // Skip users without models
      }
    }

    console.log('Found', usersWithModels.length, 'users with trained models:');
    for (const { user, model } of usersWithModels) {
      console.log('-', user.email || user.id.substring(0, 8) + '...', {
        modelStatus: model.trainingStatus,
        plan: user.plan,
        role: user.role,
        monthlyLimit: user.monthlyGenerationLimit,
        mayaAccess: user.mayaAiAccess
      });
    }

    // Check access distribution
    console.log('\n📈 Access level distribution:');
    const accessStats: Record<string, number> = users.reduce((acc, user) => {
      const plan = user.plan || 'no-plan';
      const role = user.role || 'no-role';
      const key = `${plan}-${role}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(accessStats).forEach(([key, count]) => {
      console.log(`  ${key}: ${count} users`);
    });

    // Check for users that might need updates
    console.log('\n⚠️  Users that might need access updates:');
    const needsUpdate = users.filter(user => {
      // Users with models but no proper access
      const hasModel = usersWithModels.some(({ user: u }) => u.id === user.id);
      const hasProperAccess = user.plan === 'sselfie-studio' || user.role === 'admin';
      return hasModel && !hasProperAccess;
    });

    if (needsUpdate.length > 0) {
      console.log('Found', needsUpdate.length, 'users with models but insufficient access:');
      needsUpdate.forEach(user => {
        console.log('-', user.email || user.id, {
          currentPlan: user.plan,
          currentRole: user.role,
          monthlyLimit: user.monthlyGenerationLimit
        });
      });
    } else {
      console.log('✅ All users with models have proper access levels');
    }

  } catch (error) {
    console.error('❌ Error checking users:', error);
  }
}

checkUsers();