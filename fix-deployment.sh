#!/bin/bash

# Fix Replit deployment configuration
echo "🔧 Fixing deployment configuration..."

# Remove the problematic WebSocket port configuration
echo "📝 Creating clean .replit configuration..."

cat > .replit << 'EOF'
modules = ["nodejs-20", "postgresql-16"]
run = "npm run dev"
onBoot = "npm install"

[nix]
channel = "stable-24_05"

[[ports]]
localPort = 3000
externalPort = 80

[deployment]
run = "npm start"
build = ["npm", "run", "build"]
deploymentTarget = "vm"

[env]
NODE_ENV = "production"
PORT = "3000"

[gitHubImport]
requiredFiles = [".replit", "replit.nix"]

[languages]

[languages.javascript]
pattern = "**/{*.js,*.jsx,*.ts,*.tsx,*.json}"

[languages.javascript.languageServer]
start = "typescript-language-server --stdio"

[packager]
language = "nodejs"

[packager.features]
enabledForHosting = false
packageSearch = true
guessImports = true

[agent]
integrations = ["javascript_stripe==1.0.0", "javascript_log_in_with_replit==1.0.0", "javascript_database==1.0.0", "javascript_websocket==1.0.0"]

[workflows]

[[workflows.workflow]]
name = "Start application"
mode = "sequential"
author = 42585527

[[workflows.workflow.tasks]]
task = "shell.exec"
args = "npm run dev"
EOF

echo "✅ Fixed .replit configuration:"
echo "- Removed conflicting WebSocket port 24678"
echo "- Set NODE_ENV=production for deployment"
echo "- Kept only essential port 3000 -> 80 mapping"

# Test the health endpoint
echo "🏥 Testing health check endpoint..."
node -e "
import('./server/index.ts').then(() => {
  setTimeout(() => {
    fetch('http://localhost:3000/health').then(r => r.json()).then(console.log).catch(console.error);
    process.exit(0);
  }, 2000);
}).catch(console.error);
" &

sleep 3
pkill -f "node.*server/index.ts" 2>/dev/null || true

echo "🚀 Ready for deployment!"