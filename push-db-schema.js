#!/usr/bin/env node

const { exec } = require('child_process');

// Run drizzle-kit push with automatic yes to all prompts
const command = 'echo "y" | npx drizzle-kit push --config drizzle.config.ts';

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error}`);
    return;
  }
  
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
  }
  
  console.log(`Database schema pushed successfully:`);
  console.log(stdout);
});