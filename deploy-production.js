#!/usr/bin/env node

// Enhanced production deployment script for SSELFIE Studio
const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 SSELFIE Studio - Production Deployment Starting...');

// CRITICAL: Set production environment variables for deployment
process.env.NODE_ENV = 'production';
// Use PORT from environment or default to 8080 (Cloud Run standard)
const deploymentPort = process.env.PORT || '8080';
process.env.PORT = deploymentPort;

console.log(`🔧 Environment: ${process.env.NODE_ENV}`);
console.log(`🌐 Port: ${deploymentPort}`);

// Kill any existing processes
console.log('🛑 Cleaning up existing processes...');
exec('pkill -f tsx', (error, stdout, stderr) => {
  if (error) {
    console.log('No existing processes to clean up');
  } else {
    console.log('✅ Cleaned up existing processes');
  }
});

// Wait for cleanup then start deployment
setTimeout(() => {
  startDeployment();
}, 3000);

function startDeployment() {
  console.log('📦 Building production assets...');

  // Build with production environment
  const buildProcess = spawn('npm', ['run', 'build'], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      NODE_ENV: 'production'
    }
  });

  buildProcess.on('close', (buildCode) => {
    if (buildCode !== 0) {
      console.error('❌ Production build failed with code:', buildCode);
      process.exit(1);
    }
    
    console.log('✅ Production build completed successfully');
    
    // Verify and setup production assets
    setupProductionAssets();
    
    // Start production server
    startProductionServer();
  });

  buildProcess.on('error', (error) => {
    console.error('❌ Build process error:', error);
    process.exit(1);
  });
}

function setupProductionAssets() {
  console.log('📁 Setting up production asset structure...');
  
  const clientDistPath = path.join(__dirname, 'client', 'dist');
  const productionDistPath = path.join(__dirname, 'dist', 'public');
  
  // Ensure production directory exists
  if (!fs.existsSync(path.join(__dirname, 'dist'))) {
    fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
  }
  
  if (!fs.existsSync(productionDistPath)) {
    fs.mkdirSync(productionDistPath, { recursive: true });
  }
  
  // Copy client dist to production location
  if (fs.existsSync(clientDistPath)) {
    const copyRecursive = (src, dest) => {
      if (fs.statSync(src).isDirectory()) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
        fs.readdirSync(src).forEach(item => {
          copyRecursive(path.join(src, item), path.join(dest, item));
        });
      } else {
        fs.copyFileSync(src, dest);
      }
    };
    
    copyRecursive(clientDistPath, productionDistPath);
    console.log('✅ Production assets configured');
  } else {
    console.error('❌ Client build assets not found');
    process.exit(1);
  }
}

function startProductionServer() {
  console.log('🚀 Starting production server...');
  
  const serverProcess = spawn('npx', ['tsx', 'server/index.ts'], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PORT: deploymentPort,
      // Optimize for deployment
      TS_NODE_TRANSPILE_ONLY: 'true',
      TS_NODE_TYPE_CHECK: 'false',
      NODE_OPTIONS: '--max-old-space-size=512'
    }
  });

  // Production server startup timeout
  const startupTimeout = setTimeout(() => {
    console.error('❌ Production server startup timeout');
    serverProcess.kill('SIGKILL');
    process.exit(1);
  }, 60000); // 60 second timeout for production

  // Monitor for successful startup
  let serverStarted = false;
  serverProcess.stdout?.on('data', (data) => {
    const output = data.toString();
    if (output.includes('SSELFIE Studio LIVE') && !serverStarted) {
      serverStarted = true;
      clearTimeout(startupTimeout);
      console.log('✅ Production server started successfully');
      
      // Test health endpoints
      setTimeout(() => {
        testHealthEndpoints();
      }, 2000);
    }
  });

  serverProcess.on('close', (code) => {
    clearTimeout(startupTimeout);
    console.log('Production server exited with code:', code);
    if (code !== 0) {
      process.exit(code);
    }
  });

  serverProcess.on('error', (error) => {
    clearTimeout(startupTimeout);
    console.error('❌ Production server error:', error);
    process.exit(1);
  });

  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down production server...');
    clearTimeout(startupTimeout);
    serverProcess.kill('SIGTERM');
  });

  process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down production server...');
    clearTimeout(startupTimeout);
    serverProcess.kill('SIGINT');
  });
}

function testHealthEndpoints() {
  console.log('🔍 Testing health endpoints...');
  
  const http = require('http');
  
  const testEndpoint = (path, description) => {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: deploymentPort,
        path: path,
        method: 'GET',
        timeout: 5000
      };

      const req = http.request(options, (res) => {
        if (res.statusCode === 200) {
          console.log(`✅ ${description} endpoint working`);
          resolve(true);
        } else {
          console.error(`❌ ${description} endpoint failed: ${res.statusCode}`);
          reject(false);
        }
      });

      req.on('error', (err) => {
        console.error(`❌ ${description} endpoint error:`, err.message);
        reject(false);
      });

      req.on('timeout', () => {
        console.error(`❌ ${description} endpoint timeout`);
        req.destroy();
        reject(false);
      });

      req.end();
    });
  };

  // Test critical health endpoints
  Promise.allSettled([
    testEndpoint('/', 'Root'),
    testEndpoint('/health', 'Health'),
    testEndpoint('/api/health', 'API Health'),
    testEndpoint('/ready', 'Ready'),
    testEndpoint('/alive', 'Alive')
  ]).then((results) => {
    const successful = results.filter(r => r.status === 'fulfilled').length;
    console.log(`🔍 Health check results: ${successful}/5 endpoints working`);
    
    if (successful >= 3) {
      console.log('✅ Production deployment successful - minimum health endpoints working');
    } else {
      console.error('❌ Production deployment failed - insufficient health endpoints');
    }
  });
}