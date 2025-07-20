#!/usr/bin/env node

console.log('🧪 TESTING ELENA WORKFLOW SYSTEM - COMPLETE INTEGRATION...\n');

async function testElenaWorkflowSystem() {
  try {
    console.log('📋 Step 1: Creating workflow with Elena...');
    
    // Create a workflow that will actually modify files
    const createResponse = await fetch('http://localhost:5000/api/admin/elena/create-workflow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        adminToken: 'sandra-admin-2025',
        request: 'Create a simple admin dashboard improvement that adds a welcome message component'
      })
    });
    
    if (!createResponse.ok) {
      console.log('❌ Workflow creation failed:', createResponse.status);
      return;
    }
    
    const createResult = await createResponse.json();
    console.log('✅ Workflow created:', createResult.workflowId);
    console.log('📊 Steps:', createResult.steps?.length || 0);
    
    // Wait a moment for creation to complete
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('\n🚀 Step 2: Executing workflow...');
    
    // Execute the workflow
    const executeResponse = await fetch('http://localhost:5000/api/admin/elena/execute-workflow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        adminToken: 'sandra-admin-2025',
        workflowId: createResult.workflowId
      })
    });
    
    if (!executeResponse.ok) {
      console.log('❌ Workflow execution failed:', executeResponse.status);
      return;
    }
    
    const executeResult = await executeResponse.json();
    console.log('✅ Workflow execution started:', executeResult.executionId);
    
    // Monitor progress for 30 seconds
    console.log('\n📊 Step 3: Monitoring workflow progress...');
    
    for (let i = 0; i < 6; i++) { // Check 6 times over 30 seconds
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      try {
        const progressResponse = await fetch('http://localhost:5000/api/admin/elena/workflow-progress', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            adminToken: 'sandra-admin-2025',
            workflowId: createResult.workflowId
          })
        });
        
        if (progressResponse.ok) {
          const progress = await progressResponse.json();
          console.log(`📈 Progress: Step ${progress.currentStep}/${progress.totalSteps} - Status: ${progress.status}`);
          console.log(`🤖 Current Agent: ${progress.currentAgent || 'None'}`);
          console.log(`✅ Completed: ${progress.completedTasks?.length || 0} tasks`);
          
          if (progress.status === 'completed') {
            console.log('\n🎉 WORKFLOW COMPLETED SUCCESSFULLY!');
            console.log('📋 Completed Tasks:');
            progress.completedTasks?.forEach((task, index) => {
              console.log(`   ${index + 1}. ${task}`);
            });
            break;
          }
        }
      } catch (error) {
        console.log(`⚠️ Progress check ${i + 1} failed:`, error.message);
      }
    }
    
    console.log('\n🔍 Step 4: Checking if files were actually modified...');
    
    // Check if admin-dashboard.tsx was modified recently
    const fs = await import('fs');
    const path = await import('path');
    
    const adminDashboardPath = path.join(process.cwd(), 'client/src/pages/admin-dashboard.tsx');
    
    if (fs.existsSync(adminDashboardPath)) {
      const stats = fs.statSync(adminDashboardPath);
      const modifiedTime = stats.mtime;
      const now = new Date();
      const timeDiff = (now.getTime() - modifiedTime.getTime()) / 1000; // seconds
      
      if (timeDiff < 60) { // Modified within last minute
        console.log('✅ ADMIN DASHBOARD MODIFIED:', modifiedTime.toLocaleTimeString());
        console.log('🎯 FILE MODIFICATION SUCCESSFUL - Elena workflow system is working!');
      } else {
        console.log('⚠️ Admin dashboard not recently modified');
        console.log('🕒 Last modified:', modifiedTime.toLocaleTimeString());
      }
    } else {
      console.log('❌ Admin dashboard file not found');
    }
    
    console.log('\n🎯 ELENA WORKFLOW TEST COMPLETE');
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

testElenaWorkflowSystem();