// COMPLEX SYSTEM BUILDING EXAMPLES FOR AGENTS
// These examples show agents how to build multi-file systems correctly

export const COMPLEX_SYSTEM_EXAMPLES = {
  
  // Example 1: Building API Endpoint System
  API_SYSTEM_EXAMPLE: {
    description: "How to build a complete API endpoint with routes, middleware, and types",
    files: [
      {
        path: "server/api/workflow/routes.ts",
        content: `import { Router } from 'express';
import { validateSession } from '../middleware/auth';
import { workflowService } from '../services/workflow-service';

const router = Router();

router.post('/create', validateSession, async (req, res) => {
  try {
    const result = await workflowService.create(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;`
      },
      {
        path: "server/services/workflow-service.ts", 
        content: `import { db } from '../db';
import { workflows } from '../../shared/schema';

export class WorkflowService {
  async create(data: any) {
    return await db.insert(workflows).values(data).returning();
  }
}

export const workflowService = new WorkflowService();`
      },
      {
        path: "shared/types/workflow.ts",
        content: `export interface Workflow {
  id: string;
  name: string;
  status: 'active' | 'completed' | 'failed';
  createdAt: Date;
}`
      }
    ],
    integration: [
      "Import router in server/routes.ts",
      "Add route: app.use('/api/workflow', workflowRoutes)",
      "Export types from shared/schema.ts"
    ]
  },

  // Example 2: Building React Component System
  COMPONENT_SYSTEM_EXAMPLE: {
    description: "How to build a complete React component system with hooks and types",
    files: [
      {
        path: "client/src/components/workflow/WorkflowDashboard.tsx",
        content: `import React from 'react';
import { useWorkflows } from '../../hooks/useWorkflows';
import { Card } from '../ui/card';

export const WorkflowDashboard = () => {
  const { workflows, isLoading } = useWorkflows();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Workflow Dashboard</h1>
      <div className="grid gap-4">
        {workflows.map(workflow => (
          <Card key={workflow.id} className="p-4">
            <h3>{workflow.name}</h3>
            <p>Status: {workflow.status}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};`
      },
      {
        path: "client/src/hooks/useWorkflows.ts",
        content: `import { useQuery } from '@tanstack/react-query';

export const useWorkflows = () => {
  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ['/api/workflow'],
  });
  
  return { workflows, isLoading };
};`
      }
    ],
    integration: [
      "Import component in App.tsx",
      "Add route: <Route path='/workflow' component={WorkflowDashboard} />",
      "Add navigation link"
    ]
  },

  // PATH EXAMPLES - Show correct path patterns
  PATH_PATTERNS: {
    correct: [
      "server/api/workflow/routes.ts",
      "client/src/components/admin/Dashboard.tsx", 
      "shared/types/workflow.ts",
      "server/services/workflow-service.ts"
    ],
    incorrect: [
      "/server/api/workflow/routes.ts", // ❌ Leading slash
      "/client/src/components/Dashboard.tsx", // ❌ Leading slash
      "server\\api\\workflow\\routes.ts", // ❌ Windows paths
      "src/components/Dashboard.tsx" // ❌ Missing client/
    ]
  }
};

// AGENT GUIDANCE FOR COMPLEX SYSTEMS
export const COMPLEX_SYSTEM_GUIDANCE = {
  MULTI_FILE_CREATION: {
    process: [
      "1. Plan the complete file structure first",
      "2. Create files in dependency order (types → services → components)",
      "3. Use correct relative paths (no leading slashes)",
      "4. Include proper imports and exports",
      "5. Test integration after creation"
    ],
    pathRules: [
      "Always use forward slashes (/)",
      "No leading slashes for file paths", 
      "Start with server/ or client/ or shared/",
      "Use kebab-case for directories",
      "Use PascalCase for component files"
    ]
  },

  ERROR_PREVENTION: {
    commonErrors: [
      "Using absolute paths like /server/ instead of server/",
      "Creating files without directory structure",
      "Missing imports between related files",
      "Incorrect TypeScript types",
      "Missing error handling in services"
    ],
    solutions: [
      "Always use relative paths from project root",
      "Create directories with { recursive: true }",
      "Plan import/export relationships first",
      "Use shared types from schema.ts",
      "Wrap operations in try/catch blocks"
    ]
  }
};