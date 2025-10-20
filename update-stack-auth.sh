#!/bin/bash

# Script to update Stack Auth OAuth configuration
# Run this script to update the OAuth callback URLs

echo "🔧 Updating Stack Auth OAuth configuration..."

# Get current configuration
echo "📋 Current project config:"
curl -s -X GET "https://api.stack-auth.com/api/v1/projects/current" \
  -H "x-stack-project-id: 253d7343-a0d4-43a1-be5c-822f590d40be" \
  -H "x-stack-secret-server-key: $STACK_SECRET_SERVER_KEY" \
  -H "x-stack-access-type: server" \
  -H "Content-Type: application/json" | python3 -m json.tool

echo -e "\n🚀 Please verify that OAuth is working with these URLs:"
echo "  - Sign In: https://www.sselfie.ai/handler/sign-in"
echo "  - OAuth Callback: https://www.sselfie.ai/handler/oauth-callback"
echo "  - After Sign In: https://www.sselfie.ai/auth-success"

echo -e "\n✅ If OAuth redirects to the wrong domain, you may need to:"
echo "  1. Update the Vercel alias: vercel alias set <latest-deployment> www.sselfie.ai"
echo "  2. Check Stack Auth dashboard for OAuth provider redirect URIs"
echo "  3. Ensure www.sselfie.ai is whitelisted in Stack Auth project settings"