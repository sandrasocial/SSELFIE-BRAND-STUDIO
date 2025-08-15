// MISSING FILE CREATION: This file was imported by routes.ts but didn't exist
// Creating bridge to existing admin consulting system

import { handleAdminConsultingChat } from '../api/admin/consulting-agents.js';

// Re-export the existing admin consulting handler
export { handleAdminConsultingChat };

// Log that this bridge file is being used
console.log('🔗 BRIDGE: consulting-agents-routes.ts routing to existing admin system');