// 🚨 CRITICAL TEST: Agent Tool Enforcement Validation
// This script tests if agents are forced to use str_replace_based_edit_tool through Elena's workflow system

import fetch from 'node-fetch';

async function testAgentToolEnforcement() {
    console.log('🧪 TESTING: Agent Tool Enforcement through Elena Workflow System');
    
    try {
        // Test 1: Direct agent call with Elena workflow message
        console.log('📋 TEST 1: Calling Aria with Elena workflow enforcement...');
        
        const testMessage = `🚨 ELENA WORKFLOW EXECUTION - MANDATORY TOOL USAGE REQUIRED 🚨

🎯 WORKFLOW TASK: Create a simple test component with Times New Roman styling
Target File: client/src/components/test/TestComponent.tsx

🚨 MANDATORY TOOL REQUIREMENT:
- You MUST use str_replace_based_edit_tool to modify files
- DO NOT respond with text explanations only
- MODIFY existing integrated files directly
- Use str_replace_based_edit_tool for ALL file changes

WORKFLOW REQUIREMENT: If you do not use str_replace_based_edit_tool, this task will be marked as FAILED.

MANDATORY: End response with: TOOL_USED: str_replace_based_edit_tool | MODIFIED: [exact file paths that were changed]`;

        const response = await fetch('http://localhost:5000/api/admin/agent-chat-bypass', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Admin-Token': 'sandra-admin-2025'
            },
            body: JSON.stringify({
                agentId: 'aria',
                adminToken: 'sandra-admin-2025',
                userId: '42585527',
                message: testMessage
            })
        });

        if (response.ok) {
            const result = await response.json();
            
            console.log('📊 RESULTS:');
            console.log(`   Tool Calls: ${result.toolCalls?.length || 0}`);
            console.log(`   File Operations: ${result.fileOperations?.length || 0}`);
            console.log(`   Files Created: ${result.filesCreated?.length || 0}`);
            console.log(`   Has Tool Usage: ${result.toolUsageValidation?.hasToolCalls || false}`);
            
            if (result.toolCalls?.length > 0) {
                console.log('✅ SUCCESS: Agent was forced to use tools!');
                console.log(`   Tools used: ${result.toolUsageValidation?.toolsUsed?.join(', ') || 'none'}`);
                console.log(`   Files modified: ${result.toolUsageValidation?.filesModified?.join(', ') || 'none'}`);
            } else {
                console.log('❌ FAILURE: Agent did not use tools despite enforcement');
                console.log(`   Response preview: ${result.response?.substring(0, 200)}...`);
            }
        } else {
            console.log(`❌ API ERROR: ${response.status} - ${response.statusText}`);
        }
        
    } catch (error) {
        console.error('❌ TEST ERROR:', error.message);
    }
}

// Run the test
testAgentToolEnforcement();