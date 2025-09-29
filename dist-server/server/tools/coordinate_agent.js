export async function coordinate_agent(input) {
    try {
        const validAgents = [
            'elena', 'zara', 'maya', 'aria', 'quinn', 'rachel', 'victoria',
            'sophia', 'olga', 'flux', 'wilma', 'diana', 'martha', 'ava'
        ];
        if (!validAgents.includes(input.target_agent)) {
            throw new Error(`Invalid target agent: ${input.target_agent}. Must be one of: ${validAgents.join(', ')}`);
        }
        const coordination_id = `coord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const coordination_data = {
            coordination_id,
            target_agent: input.target_agent,
            task_description: input.task_description,
            workflow_context: input.workflow_context || 'Direct coordination',
            priority: input.priority,
            expected_deliverables: input.expected_deliverables,
            deadline: input.deadline,
            dependencies: input.dependencies || [],
            status: 'queued',
            created_at: new Date().toISOString(),
            coordinating_agent: 'elena'
        };
        console.log(`🤝 AGENT COORDINATION: ${coordination_data.coordinating_agent} → ${input.target_agent}`, {
            task: input.task_description.substring(0, 100) + '...',
            priority: input.priority,
            deliverables: input.expected_deliverables.length
        });
        if (!globalThis.agentCoordinations) {
            globalThis.agentCoordinations = new Map();
        }
        globalThis.agentCoordinations.set(coordination_id, coordination_data);
        const estimatedHours = input.priority === 'critical' ? 1 :
            input.priority === 'high' ? 2 :
                input.priority === 'medium' ? 4 : 8;
        const estimated_completion = new Date(Date.now() + estimatedHours * 60 * 60 * 1000).toISOString();
        return {
            success: true,
            coordination_id,
            target_agent: input.target_agent,
            status: 'queued',
            message: `✅ COORDINATION SUCCESS: Task delegated to ${input.target_agent} with priority ${input.priority}. Expected deliverables: ${input.expected_deliverables.join(', ')}`,
            estimated_completion
        };
    }
    catch (error) {
        console.error('❌ COORDINATION ERROR:', error);
        return {
            success: false,
            coordination_id: '',
            target_agent: input.target_agent,
            status: 'failed',
            message: `❌ COORDINATION FAILED: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}
export function getCoordinationStatus(coordination_id) {
    if (!globalThis.agentCoordinations)
        return null;
    return globalThis.agentCoordinations.get(coordination_id);
}
export function updateCoordinationStatus(coordination_id, status, message) {
    if (!globalThis.agentCoordinations)
        return false;
    const coordination = globalThis.agentCoordinations.get(coordination_id);
    if (!coordination)
        return false;
    coordination.status = status;
    coordination.updated_at = new Date().toISOString();
    if (message)
        coordination.latest_message = message;
    globalThis.agentCoordinations.set(coordination_id, coordination);
    return true;
}
//# sourceMappingURL=coordinate_agent.js.map