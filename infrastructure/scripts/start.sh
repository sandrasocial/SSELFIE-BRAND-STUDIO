#!/bin/bash

# Stop any existing server
echo "🛑 Stopping existing server..."
pkill -f tsx || true
pkill -f node || true

# Wait a moment for cleanup
sleep 2

# Start your complete SSELFIE Studio server
echo "🚀 Starting SSELFIE Studio..."
cd server && PORT=5000 npx tsx index.ts