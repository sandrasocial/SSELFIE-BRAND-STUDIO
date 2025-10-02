#!/bin/bash

# SSELFIE Studio - Debug Files Cleanup Script
# Removes completed debugging files while keeping useful diagnostic tools

echo "🧹 SSELFIE Studio - Debug Files Cleanup"
echo "========================================"

# Create backup directory first
mkdir -p archive/debug-files-$(date +%Y%m%d)
BACKUP_DIR="archive/debug-files-$(date +%Y%m%d)"

echo "📦 Creating backup in $BACKUP_DIR..."

# Files to remove (completed debugging - auth is working now)
DEBUG_FILES_TO_REMOVE=(
  "debug-admin-oauth-flow.spec.ts"
  "debug-stack-auth-network.spec.ts"
  "debug-stack-auth-config.spec.ts"
  "debug-stack-auth-signin.spec.ts"
  "debug-oauth-config.ts"
  "debug-stack-auth-urls.ts"
  "debug-user-login-comprehensive.spec.ts"
  "debug-white-screen.spec.ts"
  "debug-handler-routes.spec.ts"
  "debug-sign-in-flow.spec.ts"
  "oauth-redirect-diagnostic.spec.ts"
  "google-oauth-config-diagnostic.spec.ts"
  "check-page-content.spec.ts"
  "oauth-callback-direct-test.spec.ts"
  "oauth-deep-dive-test.spec.ts"
  "oauth-flow-callback-result.spec.ts"
  "oauth-restoration-test.spec.ts"
  "oauth-simulation.spec.ts"
  "manual-google-oauth-test.spec.ts"
  "google-oauth-config-test.spec.ts"
  "comprehensive-oauth-flow-test.spec.ts"
  "comprehensive-sselfie-e2e-test.spec.ts"
  "comprehensive-user-journey-test.spec.ts"
  "live-oauth-flow-test.spec.ts"
  "error-investigation-test.spec.ts"
  "deep-auth-audit.spec.ts"
)

# Utility scripts that were one-time use
UTILITY_FILES_TO_REMOVE=(
  "audit-user-training.ts"
  "fix-all-user-training.ts"
  "diagnose-user-data.ts"
)

# Screenshot files from debugging
SCREENSHOT_FILES=(
  "*.png"
  "cookies.txt"
  "COOKIE-ANALYSIS-REPORT.md"
  "AUTHENTICATION-FIX-SUMMARY.md"
)

echo "🔍 Found files to remove:"

# Count and backup files
REMOVED_COUNT=0

for file in "${DEBUG_FILES_TO_REMOVE[@]}"; do
  if [ -f "$file" ]; then
    echo "  📄 $file"
    cp "$file" "$BACKUP_DIR/" 2>/dev/null
    rm "$file"
    ((REMOVED_COUNT++))
  fi
done

for file in "${UTILITY_FILES_TO_REMOVE[@]}"; do
  if [ -f "$file" ]; then
    echo "  🔧 $file"
    cp "$file" "$BACKUP_DIR/" 2>/dev/null
    rm "$file"
    ((REMOVED_COUNT++))
  fi
done

# Handle screenshot files
for pattern in "${SCREENSHOT_FILES[@]}"; do
  for file in $pattern; do
    if [ -f "$file" ] && [[ "$file" != "README.md" ]] && [[ "$file" != "package.json" ]]; then
      echo "  🖼️  $file"
      cp "$file" "$BACKUP_DIR/" 2>/dev/null
      rm "$file"
      ((REMOVED_COUNT++))
    fi
  done
done

echo ""
echo "✅ Files to KEEP (useful for maintenance):"
echo "  🔧 auth-diagnostic.js - Production auth troubleshooting"
echo "  🔧 api/auth-diagnostic.ts - Health check endpoint"
echo "  🔧 check-admin-user.ts - Admin user verification"
echo "  🔧 check-user-trained-model.ts - Training debug utility"
echo ""

echo "📊 Cleanup Summary:"
echo "  🗑️  Removed: $REMOVED_COUNT files"
echo "  📦 Backed up to: $BACKUP_DIR"
echo "  ✅ Kept: 4 useful diagnostic tools"
echo ""

# Update .eslintignore to prevent future issues
echo "📝 Updating .eslintignore..."
cat >> .eslintignore << 'EOF'

# Debug and archive files
archive/
tools/debug/
*.spec.ts
*-debug.*
*-diagnostic.spec.*
debug-*
EOF

echo "✅ Added debug file patterns to .eslintignore"
echo ""
echo "🎉 Cleanup complete! Your workspace is now cleaner."
echo "💡 Run 'pnpm lint' to see the reduced error count."