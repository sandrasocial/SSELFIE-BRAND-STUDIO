#!/bin/bash

# SSELFIE Studio Production Build Script
# This script handles the production build for deployment

echo "🚀 Starting SSELFIE Studio production build..."

# Ensure we're in the correct directory
cd "$(dirname "$0")"

# Set production environment
export NODE_ENV=production

# Install dependencies if needed
echo "📦 Checking dependencies..."
npm install --only=production

# Build the application using vite directly
echo "🔨 Building application with Vite..."
npx vite build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Build output: client/dist/"
    ls -la client/dist/
    exit 0
else
    echo "❌ Build failed!"
    exit 1
fi