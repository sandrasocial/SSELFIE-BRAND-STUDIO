/**
 * TEST RETROACTIVE MAYA IMAGE UPDATES
 * Manually trigger the new function to pair completed generations with Maya messages
 */

import { exec } from 'child_process';

// Create a simple curl test to the Maya chat endpoint that should trigger the pending update check
console.log('🔍 Testing retroactive Maya image updates...');

const curlCommand = `
curl -X POST "http://localhost:5000/api/maya-generate-images" \
  -H "Content-Type: application/json" \
  -H "Cookie: session=test-session" \
  -d '{"message": "test retroactive update", "customPrompt": "test prompt"}' \
  -w "%{http_code}" -s -o /dev/null
`;

exec(curlCommand, (error, stdout, stderr) => {
  console.log('Response code:', stdout);
  if (error) {
    console.log('Expected error (no auth):', error.message);
  }
  console.log('✅ Test completed - check server logs for retroactive update logs');
});
