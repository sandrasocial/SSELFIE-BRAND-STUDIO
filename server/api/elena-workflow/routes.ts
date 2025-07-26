import { Router } from 'express';
import { ElenaWorkflowService } from '../../services/elena-workflow-service';
import { validateRequest } from '../../middleware/validation';
import { errorHandler } from '../../middleware/error-handler';

const router = Router();
const workflowService = new ElenaWorkflowService();

// Create new workflow
router.post('/create', validateRequest, async (req, res) => {
  try {
    const { name, steps, priority, context } = req.body;
    const workflow = await workflowService.createWorkflow({
      name,
      steps,
      priority,
      context
    });
    res.status(201).json(workflow);
  } catch (error) {
    errorHandler(error, req, res);
  }
});

// Execute workflow
router.post('/execute', validateRequest, async (req, res) => {
  try {
    const { workflowId, parameters } = req.body;
    const execution = await workflowService.executeWorkflow(workflowId, parameters);
    res.status(200).json(execution);
  } catch (error) {
    errorHandler(error, req, res);
  }
});

// Get workflow status
router.get('/status/:executionId', async (req, res) => {
  try {
    const { executionId } = req.params;
    const status = await workflowService.getWorkflowStatus(executionId);
    res.status(200).json(status);
  } catch (error) {
    errorHandler(error, req, res);
  }
});

export default router;