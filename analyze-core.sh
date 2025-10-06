#!/bin/bash
# SSELFIE Studio Core Dependency Analysis
# This script identifies and isolates core files needed for Training + Maya + Gallery + Auth + Database

echo "🔍 ANALYZING CORE DEPENDENCIES..."

# Core API files
CORE_API_FILES=(
    "api/index.ts"
    "api/_utils/timing.js"
    "api/_shared/stack-auth-types.js"
)

# Core server files
CORE_SERVER_FILES=(
    "server/storage.ts"
    "server/drizzle.ts"
    "server/stack-auth.ts"
    "server/training-completion-monitor.ts"
    "server/services/maya-service.ts"
    "server/services/ai-generation-service.ts"
    "server/model-training-service.ts"
    "server/env.ts"
)

# Core shared files
CORE_SHARED_FILES=(
    "shared/schema.ts"
    "shared/schema-maya.ts"
    "shared/types/concept-card.ts"
    "shared/types.ts"
)

# Core client files
CORE_CLIENT_FILES=(
    "client/src/App.tsx"
    "client/src/main.tsx"
    "client/src/lib/api.ts"
    "client/src/stack/stack-context.ts"
)

echo "📋 CORE FILES IDENTIFIED:"
echo "API: ${#CORE_API_FILES[@]} files"
echo "Server: ${#CORE_SERVER_FILES[@]} files"
echo "Shared: ${#CORE_SHARED_FILES[@]} files"
echo "Client: ${#CORE_CLIENT_FILES[@]} files"

echo ""
echo "🔧 PHASE 1: Copy core files to core/ directory"
for file in "${CORE_API_FILES[@]}"; do
    if [ -f "$file" ]; then
        mkdir -p "core/$(dirname "$file")"
        cp "$file" "core/$file"
        echo "✅ $file"
    else
        echo "❌ MISSING: $file"
    fi
done

for file in "${CORE_SERVER_FILES[@]}"; do
    if [ -f "$file" ]; then
        mkdir -p "core/$(dirname "$file")"
        cp "$file" "core/$file"
        echo "✅ $file"
    else
        echo "❌ MISSING: $file"
    fi
done

for file in "${CORE_SHARED_FILES[@]}"; do
    if [ -f "$file" ]; then
        mkdir -p "core/$(dirname "$file")"
        cp "$file" "core/$file"
        echo "✅ $file"
    else
        echo "❌ MISSING: $file"
    fi
done

for file in "${CORE_CLIENT_FILES[@]}"; do
    if [ -f "$file" ]; then
        mkdir -p "core/$(dirname "$file")"
        cp "$file" "core/$file"
        echo "✅ $file"
    else
        echo "❌ MISSING: $file"
    fi
done

echo ""
echo "📊 SUMMARY:"
echo "Total core files: $((${#CORE_API_FILES[@]} + ${#CORE_SERVER_FILES[@]} + ${#CORE_SHARED_FILES[@]} + ${#CORE_CLIENT_FILES[@]}))"
echo ""
echo "🎯 NEXT: Test core/ directory builds successfully"
echo "🧪 Run: cd core && npm run build"