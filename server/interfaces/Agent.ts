export interface Agent {
    id: string;
    name: string;
    role: string;
    capabilities: string[];
    status: 'active' | 'inactive' | 'busy';
    metadata: {
        expertise: string[];
        personality: string;
        communication_style: string;
    };
}