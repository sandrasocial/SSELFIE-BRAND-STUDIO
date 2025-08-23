const fs = require('fs');
const path = require('path');

function validateReactVersions() {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json')));
  
  const reactVersion = packageJson.dependencies['react'];
  const reactDomVersion = packageJson.dependencies['react-dom'];
  const reactIsVersion = packageJson.dependencies['react-is'];
  
  // Ensure all React packages are on v18
  const isValid = [reactVersion, reactDomVersion, reactIsVersion].every(version => 
    version.startsWith('^18')
  );
  
  if (!isValid) {
    throw new Error('React version mismatch detected. All React packages must be on version 18.x');
  }
  
  console.log('✨ React version validation passed - All packages aligned to v18');
}

validateReactVersions();