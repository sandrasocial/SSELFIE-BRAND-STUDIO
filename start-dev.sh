#!/bin/bash
# SSELFIE Studio Development Server Startup

echo "🚀 Starting SSELFIE Studio Development Server..."

# Kill any existing server processes
pkill -f "tsx index.ts" 2>/dev/null || true
pkill -f "node.*index.ts" 2>/dev/null || true

# Wait a moment for cleanup
sleep 2

# Set environment variables
export NODE_ENV=development
export PORT=5000

# Start the server
cd server
echo "📦 Starting server on port 5000..."
exec node -r esbuild-register index.ts