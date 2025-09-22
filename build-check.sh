#!/bin/bash

# SSELFIE Brand Studio - Vercel Ignored Build Step
# This script prevents unnecessary builds by checking if relevant files have changed

# Exit code constants for clarity
readonly BUILD_NEEDED=1
readonly SKIP_BUILD=0

# Parse command line options
QUICK_MODE=false
if [[ "$1" == "--quick" ]]; then
  QUICK_MODE=true
  echo "🏃 Quick mode enabled - will exit on first change detected"
fi

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
  exit $BUILD_NEEDED
fi

# Check if we're on a deployment branch
BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
echo "📝 Current branch: $BRANCH"

# Force build on main branch merges or specific commit messages
COMMIT_MSG=$(git log -1 --pretty=%B)
if [[ "$COMMIT_MSG" == *"[force-build]"* ]] || [[ "$COMMIT_MSG" == *"force build"* ]]; then
  echo "🔨 Force build requested in commit message - proceeding with build"
  exit $BUILD_NEEDED
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
      
      # Early exit optimization in quick mode or default behavior
      if [[ "$QUICK_MODE" == true ]]; then
        echo "🏃 Quick mode: Changes detected, skipping remaining checks"
        break
      fi
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
  exit $BUILD_NEEDED
else
  echo ""
  echo "✅ No changes detected in build-critical paths"
  echo "💰 Skipping build to optimize costs and deployment time"
  echo "ℹ️  Add '[force-build]' to commit message to override this check"
  echo "ℹ️  Use '--quick' flag for faster checking when you expect changes"
  exit $SKIP_BUILD
fi