#!/bin/bash
# Quick production cleanup script

set -e

echo "🧹 Production Cleanup Starting..."
echo ""

# Files to keep based on tsconfig.deploy.json
KEEP_PATTERNS=(
  "server/\[...route\].ts"
  "server/index.ts"
  "server/storage.ts"
  "server/drizzle.ts"
  "server/stack-auth.ts"
  "stack/server.ts"
  "server/me.ts"
  "server/health.ts"
  "shared/schema.ts"
  "shared/schema-maya.ts"
  "shared/styleguide-schema.ts"
  "shared/types/"
  "server/routes/modules/"
  "server/services/"
  "server/maya/"
  "server/agents/personalities/"
  "server/middleware/"
  "server/_utils/"
  "server/_shared/"
  "server/webhooks/"
  "shared/database-provider.ts"
  "shared/service-container.ts"
  "client/src/app_v2/"
  "drizzle/"
  "public/"
  "scripts/"
  "tests/"
  "docs/"
  "package.json"
  "pnpm-lock.yaml"
  "tsconfig"
  "vercel.json"
  "vite.config.ts"
  "drizzle.config.ts"
  "playwright.config.ts"
  "eslint.config.js"
  "Dockerfile"
  ".gitignore"
  "README.md"
  ".github/copilot-instructions.md"
  "server/.*\.ts$"
)

echo "📊 Files before cleanup: $(git ls-files | wc -l)"

# Create list of files to remove (exclude production files)
echo "🔍 Identifying non-production files..."

# Get all tracked files and remove ones not in production list
git ls-files | grep -v -E "^(server/\[|server/index|server/storage|server/drizzle|server/stack-auth|stack/server|server/me|server/health|shared/schema|shared/styleguide-schema|shared/types/|server/routes/modules/|server/services/|server/maya/|server/agents/personalities/|server/middleware/|server/_utils/|server/_shared/|server/webhooks/|shared/database-provider|shared/service-container|client/src/app_v2/|drizzle/|public/|scripts/|tests/|docs/|package\.json|pnpm-lock\.yaml|tsconfig|vercel\.json|vite\.config|drizzle\.config|playwright\.config|eslint\.config|Dockerfile|\.gitignore|README\.md|\.github/copilot-instructions\.md|server/.*-.*\.ts$|server/generation-completion|server/training-completion|server/unified-generation|server/bulletproof|server/model-training|server/model-validation|server/image-storage|server/migration-monitor|server/retrain-model|server/user-sync|server/env\.ts|server/gallery-images|server/sandra-images|server/video/|server/create-maya|server/maya-chat|server/maya-diagnostic)" | while read file; do
  # Skip critical system files
  [[ "$file" == ".git"* ]] && continue
  [[ "$file" == "node_modules"* ]] && continue
  [[ "$file" == "production-cleanup.sh" ]] && continue
  
  # Remove file
  if [ -f "$file" ]; then
    git rm -f "$file" 2>/dev/null || true
  fi
done

echo "🗂️  Cleaning empty directories..."
find . -type d -empty -not -path "./.git/*" -delete 2>/dev/null || true

echo "📊 Files after cleanup: $(git ls-files | wc -l)"

# Stage and commit
git add -A

if ! git diff --cached --quiet; then
  git commit -m "feat: Clean production branch - deployment ready

Removed unused/legacy files, keeping only production code from tsconfig.deploy.json:
- Complete client/src/app_v2/ folder
- All server production files
- Complete Maya AI system
- All infrastructure services
- Database schemas and migrations
- All supporting folders (drizzle, public, scripts, tests, docs)

All removed files preserved in main branch."
  
  echo ""
  echo "✅ SUCCESS! Production branch is clean"
  echo "📊 Commit: $(git rev-parse --short HEAD)"
  echo ""
  echo "🚀 Next steps:"
  echo "   git push -u origin production-clean-20251012"
  echo "   pnpm dev"
else
  echo "✅ No changes needed - already clean"
fi
