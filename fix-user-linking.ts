/**
 * User Linking Diagnostic and Repair Script
 * Fixes authentication issues by ensuring all users are properly linked to Stack Auth
 */

import { storage } from './server/storage.js';

async function diagnoseUserLinking() {
  console.log('🔍 DIAGNOSING USER LINKING ISSUES...\n');

  try {
    // Get all users
    const allUsers = await storage.getAllUsers();
    console.log(`📊 Found ${allUsers.length} total users in database`);

    let linkedUsers = 0;
    let unlinkedUsers = 0;
    let issues: string[] = [];

    for (const user of allUsers) {
      const hasStackAuthId = !!user.stackAuthId;
      const hasEmail = !!user.email;

      if (hasStackAuthId) {
        linkedUsers++;
        console.log(`✅ User ${user.id}: Linked to Stack Auth ID ${user.stackAuthId}`);
      } else {
        unlinkedUsers++;
        console.log(`❌ User ${user.id}: NOT linked to Stack Auth (email: ${user.email || 'none'})`);

        if (hasEmail) {
          // Try to find if there's another user with the same email that IS linked
          const linkedUserWithSameEmail = allUsers.find(u =>
            u.email === user.email && u.stackAuthId && u.id !== user.id
          );

          if (linkedUserWithSameEmail) {
            issues.push(`User ${user.id} has same email as linked user ${linkedUserWithSameEmail.id}`);
          }
        }
      }
    }

    console.log(`\n📈 SUMMARY:`);
    console.log(`   ✅ Linked users: ${linkedUsers}`);
    console.log(`   ❌ Unlinked users: ${unlinkedUsers}`);

    if (issues.length > 0) {
      console.log(`\n🚨 ISSUES FOUND:`);
      issues.forEach(issue => console.log(`   - ${issue}`));
    }

    return { linkedUsers, unlinkedUsers, issues };

  } catch (error) {
    console.error('❌ Diagnostic failed:', error);
    throw error;
  }
}

async function repairUserLinking() {
  console.log('\n🔧 REPAIRING USER LINKING...\n');

  try {
    const allUsers = await storage.getAllUsers();
    let repairs = 0;

    for (const user of allUsers) {
      if (!user.stackAuthId && user.email) {
        // Look for a linked user with the same email
        const linkedUser = allUsers.find(u =>
          u.email === user.email && u.stackAuthId && u.id !== user.id
        );

        if (linkedUser && linkedUser.stackAuthId) {
          console.log(`🔗 Linking user ${user.id} to Stack Auth ID ${linkedUser.stackAuthId} (same email as ${linkedUser.id})`);

          // Update the unlinked user with the Stack Auth ID
          await storage.linkStackAuthId(user.id, linkedUser.stackAuthId);
          repairs++;
        }
      }
    }

    console.log(`\n✅ REPAIRS COMPLETED: ${repairs} users linked`);
    return repairs;

  } catch (error) {
    console.error('❌ Repair failed:', error);
    throw error;
  }
}

// Run diagnostic and repair
async function main() {
  try {
    const diagnostic = await diagnoseUserLinking();

    if (diagnostic.unlinkedUsers > 0) {
      console.log('\n🔧 Running automatic repair...');
      const repairs = await repairUserLinking();

      if (repairs > 0) {
        console.log('\n🔄 Re-running diagnostic to verify repairs...');
        await diagnoseUserLinking();
      }
    } else {
      console.log('\n✅ All users are properly linked!');
    }

    console.log('\n🎉 User linking diagnostic and repair complete!');

  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

main();