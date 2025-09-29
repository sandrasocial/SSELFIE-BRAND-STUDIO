export class IntelligentTaskDistributor {
    deployments = new Map();
    static getInstance() {
        if (!this.instance) {
            this.instance = new IntelligentTaskDistributor();
        }
        return this.instance;
    }
    static instance;
    agentCapabilities = {
        elena: ['coordination', 'strategy', 'workflow_management'],
        aria: ['ui_design', 'luxury_design', 'frontend', 'components'],
        zara: ['backend', 'architecture', 'technical_implementation', 'debugging'],
        olga: ['cleanup', 'organization', 'deployment', 'optimization'],
        maya: ['ai_integration', 'image_generation', 'prompt_engineering'],
        victoria: ['ux_design', 'user_flows', 'interface_design'],
        rachel: ['content', 'copywriting', 'voice_consistency'],
        ava: ['automation', 'integration', 'workflow_automation'],
        quinn: ['quality_assurance', 'testing', 'validation']
    };
    async distributeTasks(request) {
        console.log(`🧠 TASK DISTRIBUTOR: Analyzing ${request.tasks.length} tasks for ${request.agents.length} agents`);
        const assignments = [];
        let totalDuration = 0;
        const agentWorkloads = this.calculateAgentWorkloads(request.agents);
        const sortedTasks = this.sortTasksByDependencies(request.tasks);
        for (const task of sortedTasks) {
            const bestAgent = this.findBestAgentForTask(task, request.agents, agentWorkloads);
            let assignment = assignments.find(a => a.agentName === bestAgent);
            if (!assignment) {
                assignment = {
                    agentName: bestAgent,
                    tasks: [],
                    estimatedDuration: 0,
                    priority: request.priority,
                    dependencies: []
                };
                assignments.push(assignment);
            }
            assignment.tasks.push(task);
            assignment.estimatedDuration += task.estimatedDuration;
            assignment.dependencies.push(...task.dependencies);
            agentWorkloads[bestAgent] += task.estimatedDuration;
            totalDuration += task.estimatedDuration;
            console.log(`📋 ASSIGNED: "${task.description}" → ${bestAgent} (${task.estimatedDuration}min)`);
        }
        const maxWorkload = Math.max(...Object.values(agentWorkloads));
        const minWorkload = Math.min(...Object.values(agentWorkloads));
        const loadBalance = maxWorkload > 0 ? (maxWorkload - minWorkload) / maxWorkload : 1;
        const result = {
            success: true,
            assignments,
            totalEstimatedDuration: totalDuration,
            distributionStrategy: 'capability_based_with_load_balancing',
            loadBalance
        };
        console.log(`✅ TASK DISTRIBUTOR: Created ${assignments.length} assignments, ${totalDuration}min total`);
        console.log(`⚖️ LOAD BALANCE: ${(loadBalance * 100).toFixed(1)}% (lower is better)`);
        return result;
    }
    findBestAgentForTask(task, availableAgents, workloads) {
        let bestAgent = availableAgents[0];
        let bestScore = -1;
        for (const agent of availableAgents) {
            const capabilities = this.agentCapabilities[agent] || [];
            const workload = workloads[agent] || 0;
            const capabilityScore = this.calculateCapabilityMatch(task.description, capabilities);
            const workloadFactor = Math.max(0, 1 - (workload / 120));
            const priorityBoost = task.priority === 'critical' ? 0.3 :
                task.priority === 'high' ? 0.2 :
                    task.priority === 'medium' ? 0.1 : 0;
            const totalScore = capabilityScore * 0.6 + workloadFactor * 0.3 + priorityBoost;
            if (totalScore > bestScore) {
                bestScore = totalScore;
                bestAgent = agent;
            }
        }
        return bestAgent;
    }
    calculateCapabilityMatch(taskDescription, capabilities) {
        const taskWords = taskDescription.toLowerCase().split(/\s+/);
        let matches = 0;
        for (const capability of capabilities) {
            const capabilityWords = capability.split('_');
            for (const capWord of capabilityWords) {
                if (taskWords.some(word => word.includes(capWord) || capWord.includes(word))) {
                    matches++;
                }
            }
        }
        return Math.min(1.0, matches / Math.max(1, capabilities.length));
    }
    calculateAgentWorkloads(agents) {
        const workloads = {};
        for (const agent of agents) {
            workloads[agent] = 0;
        }
        return workloads;
    }
    sortTasksByDependencies(tasks) {
        const sorted = [];
        const visited = new Set();
        const visiting = new Set();
        const visit = (task) => {
            if (visiting.has(task.id)) {
                console.warn(`⚠️ CIRCULAR DEPENDENCY detected for task: ${task.id}`);
                return;
            }
            if (visited.has(task.id))
                return;
            visiting.add(task.id);
            const dependencies = task.dependencies || [];
            for (const depId of dependencies) {
                const depTask = tasks.find(t => t.id === depId);
                if (depTask) {
                    visit(depTask);
                }
            }
            visiting.delete(task.id);
            visited.add(task.id);
            sorted.push(task);
        };
        for (const task of tasks) {
            visit(task);
        }
        return sorted;
    }
    async getDeploymentStatus(deploymentId) {
        const status = this.deployments.get(deploymentId);
        if (!status) {
            return {
                deploymentId,
                status: 'failed',
                progress: 0,
                completedTasks: 0,
                totalTasks: 0,
                activeAgents: [],
                estimatedTimeRemaining: 0
            };
        }
        return status;
    }
    async updateDeploymentProgress(deploymentId, completedTasks, totalTasks) {
        const status = this.deployments.get(deploymentId);
        if (status) {
            status.completedTasks = completedTasks;
            status.totalTasks = totalTasks;
            status.progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
            status.status = completedTasks >= totalTasks ? 'completed' : 'in_progress';
            status.estimatedTimeRemaining = Math.max(0, (totalTasks - completedTasks) * 10);
        }
    }
}
export const intelligentTaskDistributor = new IntelligentTaskDistributor();
//# sourceMappingURL=intelligent-task-distributor.js.map