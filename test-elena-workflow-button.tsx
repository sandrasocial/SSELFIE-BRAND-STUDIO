import React, { useState } from 'react';

export default function TestElenaWorkflowButton() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState('');

  const testElenaWorkflow = async () => {
    setTesting(true);
    setResult('Testing Elena workflow execution...');
    
    try {
      const response = await fetch('/api/consulting-agents/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sandra-admin-2025',
        },
        body: JSON.stringify({
          agentId: 'elena',
          message: 'Execute restart_workflow with name: workflow_1753660762258. Coordinate Aria, Zara, Rachel, and Quinn to complete their assigned tasks with actual file modifications.',
          conversationId: 'elena-workflow-test-button'
        })
      });

      if (response.ok) {
        const reader = response.body?.getReader();
        let streamResult = '';
        
        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = new TextDecoder().decode(value);
            streamResult += chunk;
            setResult(streamResult);
          }
        }
      } else {
        setResult(`Error: ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      setResult(`Error: ${error.message}`);
    }
    
    setTesting(false);
  };

  return (
    <div className="p-4 border border-gray-300 bg-white">
      <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'Times New Roman' }}>
        Elena Workflow Execution Test
      </h3>
      
      <button
        onClick={testElenaWorkflow}
        disabled={testing}
        className="px-4 py-2 bg-black text-white border-0 hover:bg-gray-800 disabled:opacity-50"
        style={{ fontFamily: 'Times New Roman' }}
      >
        {testing ? 'Testing Elena...' : 'Test Elena Workflow Execution'}
      </button>
      
      {result && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200">
          <h4 className="font-bold mb-2">Elena Response:</h4>
          <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-96">
            {result}
          </pre>
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Expected Behavior:</strong></p>
        <ul className="list-disc list-inside ml-4">
          <li>Elena executes restart_workflow tool</li>
          <li>MultiAgentCoordinator loads workflow_1753660762258</li>
          <li>Coordinates 4 agents: Aria, Zara, Rachel, Quinn</li>
          <li>Each agent completes assigned tasks with file modifications</li>
          <li>Results tracked in database and returned</li>
        </ul>
      </div>
    </div>
  );
}