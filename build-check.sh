#!/bin/bash

# SSELFIE Brand Studio - Vercel Ignored Build Step
# This script prevents unnecessary builds by checking if relevant files have changed
# Exit code 1 = Build needed, Exit code 0 = Skip build

echo "🔍 SSELFIE Build Optimization - Checking for changes..."

# Define the folders and files that should trigger a build
TRIGGER_PATHS=(
  "client/"
  "server/" 
  "shared/"
  "api/"
  "package.json"
  "package-lock.json"
  "vercel.json"
  "vite.config.ts"
  "vite.optimized.config.ts"
  "tsconfig.json"
  "tsconfig.server.json"
  "tailwind.config.js"
  "drizzle.config.ts"
  "Dockerfile"
)

# Check if this is the initial commit or if there's no previous commit
if ! git rev-parse HEAD^ >/dev/null 2>&1; then
  echo "✅ Initial commit or no previous commit found - proceeding with build"
  exit 1
fi

# Check if we're on a deployment branch
BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
echo "📝 Current branch: $BRANCH"

# Force build on main branch merges or specific commit messages
COMMIT_MSG=$(git log -1 --pretty=%B)
if [[ "$COMMIT_MSG" == *"[force-build]"* ]] || [[ "$COMMIT_MSG" == *"force build"* ]]; then
  echo "🔨 Force build requested in commit message - proceeding with build"
  exit 1
fi

# Check for changes in each trigger path
HAS_CHANGES=false
CHANGED_PATHS=()

echo "📊 Analyzing changes in key directories..."

for path in "${TRIGGER_PATHS[@]}"; do
  if [ -e "$path" ]; then
    if git diff --quiet HEAD^ HEAD -- "$path"; then
      echo "📁 No changes: $path"
    else
      echo "🚨 Changes found: $path"
      HAS_CHANGES=true
      CHANGED_PATHS+=("$path")
    fi
  else
    echo "⚠️  Path not found: $path"
  fi
done

# Show summary of changes
if [ "$HAS_CHANGES" = true ]; then
  echo ""
  echo "📋 Summary of changes requiring build:"
  for changed_path in "${CHANGED_PATHS[@]}"; do
    echo "   • $changed_path"
  done
  echo ""
  echo "🏗️  Proceeding with build due to relevant changes"
  exit 1
else
  echo ""
  echo "✅ No changes detected in build-critical paths"
  echo "💰 Skipping build to optimize costs and deployment time"
  echo "ℹ️  Add '[force-build]' to commit message to override this check"
  exit 0
fi