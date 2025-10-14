/**
 * User Linking Repair Script
 * Fixes the user linking issue by fetching Stack Auth users and matching by email
 */

import { storage } from './server/storage.js';

async function repairUserLinking() {
  console.log('🔧 Starting user linking repair...');

  try {
    // Get all users from database
    const allUsers = await storage.getAllUsers();
    console.log(`📊 Found ${allUsers.length} users in database`);

    // Get Stack Auth users via API
    const STACK_PROJECT_ID = process.env['VITE_STACK_PROJECT_ID'];
    const STACK_KEY = process.env['STACK_ADMIN_KEY'] || process.env['STACK_SECRET_SERVER_KEY'];

    if (!STACK_PROJECT_ID || !STACK_KEY) {
      throw new Error('Missing Stack Auth configuration');
    }

    console.log('🔍 Fetching users from Stack Auth API...');

    const response = await fetch(`https://api.stack-auth.com/users`, {
      headers: {
        'Authorization': `Bearer ${STACK_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Stack Auth API error: ${response.status} ${response.statusText}`);
    }

    const stackUsers = await response.json();
    console.log(`📊 Found ${stackUsers.items?.length || 0} users in Stack Auth`);

    const stackUsersByEmail = new Map();
    const stackUsersById = new Map();

    // Index Stack Auth users
    for (const user of stackUsers.items || []) {
      if (user.primary_email) {
        stackUsersByEmail.set(user.primary_email.toLowerCase(), user);
      }
      stackUsersById.set(user.id, user);
    }

    let linked = 0;
    let alreadyLinked = 0;
    let noMatch = 0;
    const results = [];

    // Process each database user
    for (const dbUser of allUsers) {
      const email = dbUser.email?.toLowerCase();
      const stackAuthId = (dbUser as { stackAuthId?: string }).stackAuthId;

      if (stackAuthId) {
        // Already linked
        alreadyLinked++;
        results.push({
          dbUserId: dbUser.id,
          email: dbUser.email,
          status: 'already_linked',
          stackAuthId
        });
        continue;
      }

      if (!email) {
        // No email to match
        noMatch++;
        results.push({
          dbUserId: dbUser.id,
          email: null,
          status: 'no_email'
        });
        continue;
      }

      // Try to find matching Stack Auth user by email
      const stackUser = stackUsersByEmail.get(email);

      if (stackUser) {
        // Found match - link them
        console.log(`🔗 Linking user ${dbUser.id} (${email}) to Stack Auth ID ${stackUser.id}`);
        await storage.linkStackAuthId(dbUser.id, stackUser.id);
        linked++;
        results.push({
          dbUserId: dbUser.id,
          email: dbUser.email,
          status: 'linked',
          stackAuthId: stackUser.id
        });
      } else {
        // No match found
        noMatch++;
        results.push({
          dbUserId: dbUser.id,
          email: dbUser.email,
          status: 'no_stack_user'
        });
      }
    }

    console.log('✅ User linking repair complete!');
    console.log(`📊 Results: ${linked} linked, ${alreadyLinked} already linked, ${noMatch} no match`);

    return {
      total: allUsers.length,
      linked,
      alreadyLinked,
      noMatch,
      results
    };

  } catch (error) {
    console.error('❌ User linking repair failed:', error);
    throw error;
  }
}

// Run the repair if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  repairUserLinking()
    .then(result => {
      console.log('🎉 Repair completed successfully!');
      console.log(JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Repair failed:', error);
      process.exit(1);
    });
}

export { repairUserLinking };