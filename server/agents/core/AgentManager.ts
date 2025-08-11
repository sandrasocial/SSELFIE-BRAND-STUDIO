import { Agent } from '../interfaces/Agent';

export class AgentManager {
    private static instance: AgentManager;
    private agents: Map<string, Agent>;
    private activeAgents: Set<string>;

    private constructor() {
        this.agents = new Map();
        this.activeAgents = new Set();
    }

    public static getInstance(): AgentManager {
        if (!AgentManager.instance) {
            AgentManager.instance = new AgentManager();
        }
        return AgentManager.instance;
    }

    public registerAgent(agent: Agent): void {
        if (this.agents.has(agent.id)) {
            throw new Error(`Agent with ID ${agent.id} already exists`);
        }
        this.agents.set(agent.id, agent);
    }

    public activateAgent(agentId: string): void {
        if (!this.agents.has(agentId)) {
            throw new Error(`Agent with ID ${agentId} not found`);
        }
        this.activeAgents.add(agentId);
    }

    public deactivateAgent(agentId: string): void {
        this.activeAgents.delete(agentId);
    }

    public getAgent(agentId: string): Agent {
        const agent = this.agents.get(agentId);
        if (!agent) {
            throw new Error(`Agent with ID ${agentId} not found`);
        }
        return agent;
    }

    public isAgentActive(agentId: string): boolean {
        return this.activeAgents.has(agentId);
    }

    public getAllAgents(): Agent[] {
        return Array.from(this.agents.values());
    }

    public getActiveAgents(): Agent[] {
        return Array.from(this.activeAgents).map(id => this.getAgent(id));
    }
}