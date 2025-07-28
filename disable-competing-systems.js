import fs from 'fs';

// Disable all competing agent systems in routes.ts
function disableCompetingSystems() {
  const routesPath = 'server/routes.ts';
  let content = fs.readFileSync(routesPath, 'utf8');
  
  // Replace all ElenaWorkflowSystem imports with comments
  content = content.replace(
    /const { ElenaWorkflowSystem } = await import\('\.\/elena-workflow-system'\);/g,
    '// DEACTIVATED: const { ElenaWorkflowSystem } = await import(\'./elena-workflow-system\'); // using unified-agent-system.ts only'
  );
  
  // Replace all ElenaWorkflowSystem method calls with comments
  content = content.replace(
    /ElenaWorkflowSystem\./g,
    '// DEACTIVATED: ElenaWorkflowSystem.'
  );
  
  // Replace large blocks containing ElenaWorkflowSystem
  content = content.replace(
    /if \(isElena && isNewWorkflowCreation\) {[\s\S]*?} catch \(error\) {[\s\S]*?}/g,
    '// DEACTIVATED: Elena workflow creation block - using unified-agent-system.ts only'
  );
  
  content = content.replace(
    /} else if \(isElena && isExecutionRequest\) {[\s\S]*?} catch \(error\) {[\s\S]*?}/g,
    '// DEACTIVATED: Elena workflow execution block - using unified-agent-system.ts only'
  );
  
  // Write back the modified content
  fs.writeFileSync(routesPath, content);
  console.log('✅ All competing systems deactivated in routes.ts');
}

disableCompetingSystems();