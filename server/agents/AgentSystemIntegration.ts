import { ConversationManager, ConversationSummary } from './ConversationManager';
import { agentCoordinator } from '../../utils/agentCoordinator';

/**
 * Integrated Agent System that combines conversation management with task coordination
 */
export class AgentSystemIntegration {
    /**
     * Start a new agent task with conversation context
     */
    static async startAgentTask(
        agentId: string,
        userId: string,
        operation: string,
        conversationContext?: any[]
    ) {
        // First check if task is already done
        if (agentCoordinator.isTaskDuplicate(agentId, operation)) {
            console.log(`🔄 Task "${operation}" already completed by ${agentId}`);
            return { duplicate: true };
        }

        // Start task tracking
        const taskId = await agentCoordinator.startTask(agentId, operation);

        // If we have conversation context, manage it
        if (conversationContext) {
            const { shouldClear, summary, newHistory } = await ConversationManager.manageConversationLength(
                agentId,
                userId,
                conversationContext
            );

            return {
                taskId,
                duplicate: false,
                conversationCleared: shouldClear,
                conversationSummary: summary,
                updatedContext: newHistory
            };
        }

        return { taskId, duplicate: false };
    }

    /**
     * Complete a task with conversation memory
     */
    static async completeAgentTask(
        taskId: string,
        agentId: string,
        userId: string,
        result: any,
        finalContext?: any[]
    ) {
        // Complete task in coordinator
        await agentCoordinator.completeTask(taskId, result);

        // If we have final context, create a summary
        if (finalContext) {
            const summary = await ConversationManager.createConversationSummary(
                agentId,
                userId,
                finalContext
            );

            return { taskCompleted: true, memorySaved: true, summary };
        }

        return { taskCompleted: true };
    }

    /**
     * Get agent's task history with conversation summaries
     */
    static async getAgentHistory(agentId: string): Promise<{
        tasks: any[],
        conversations: ConversationSummary[]
    }> {
        const tasks = agentCoordinator.getAgentTasks(agentId);
        // Future: Add conversation history retrieval
        
        return {
            tasks,
            conversations: [] // To be implemented
        };
    }
}