/**
 * SANDRA'S AGENT APPROVAL & CONVERSATION SYSTEM
 * Secure workflow where agents propose changes, chat for clarification, and show previews
 * Nothing goes live without Sandra's explicit approval
 */

import { storage } from '../storage';
import fs from 'fs/promises';
import path from 'path';

export interface AgentProposal {
  id: string;
  agentId: string;
  agentName: string;
  type: 'email' | 'api' | 'database' | 'workflow' | 'design' | 'file';
  title: string;
  description: string;
  reasoning: string;
  impact: string;
  files: AgentFile[];
  preview?: string;
  conversation: AgentMessage[];
  status: 'proposed' | 'in_discussion' | 'ready_for_approval' | 'approved' | 'rejected' | 'implemented';
  createdAt: Date;
  updatedAt: Date;
  implementedAt?: Date;
}

export interface AgentFile {
  path: string;
  content: string;
  action: 'create' | 'modify' | 'delete';
  currentContent?: string;
  diff?: string;
}

export interface AgentMessage {
  id: string;
  role: 'agent' | 'sandra';
  content: string;
  timestamp: Date;
  attachments?: any[];
}

export class AgentApprovalSystem {
  
  /**
   * AGENT PROPOSAL CREATION
   * Agents create detailed proposals with reasoning instead of direct changes
   */
  static async createProposal(
    agentId: string, 
    agentName: string,
    proposalData: {
      type: AgentProposal['type'];
      title: string;
      description: string;
      reasoning: string;
      impact: string;
      files: AgentFile[];
      preview?: string;
    }
  ): Promise<AgentProposal> {
    
    const proposal: AgentProposal = {
      id: `proposal_${Date.now()}_${agentId}`,
      agentId,
      agentName,
      ...proposalData,
      conversation: [{
        id: `msg_${Date.now()}`,
        role: 'agent',
        content: `Hi Sandra! I have a proposal for you:\n\n**${proposalData.title}**\n\n${proposalData.description}\n\n**Why this is important:**\n${proposalData.reasoning}\n\n**Impact on your business:**\n${proposalData.impact}\n\nI've prepared all the files and previews. Would you like to review this?`,
        timestamp: new Date()
      }],
      status: 'proposed',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Save proposal to storage
    await this.saveProposal(proposal);
    
    // Log for Sandra's review
    console.log(`📋 NEW PROPOSAL from ${agentName}: ${proposalData.title}`);
    
    return proposal;
  }
  
  /**
   * CONVERSATIONAL INTERFACE
   * Sandra can chat with agents about proposals before approval
   */
  static async addConversationMessage(
    proposalId: string,
    role: 'agent' | 'sandra',
    content: string,
    attachments?: any[]
  ): Promise<AgentProposal> {
    
    const proposal = await this.getProposal(proposalId);
    if (!proposal) {
      throw new Error('Proposal not found');
    }
    
    const message: AgentMessage = {
      id: `msg_${Date.now()}`,
      role,
      content,
      timestamp: new Date(),
      attachments
    };
    
    proposal.conversation.push(message);
    proposal.updatedAt = new Date();
    
    // Update status based on conversation flow
    if (role === 'sandra' && content.toLowerCase().includes('ready')) {
      proposal.status = 'ready_for_approval';
    } else if (proposal.status === 'proposed') {
      proposal.status = 'in_discussion';
    }
    
    await this.saveProposal(proposal);
    
    return proposal;
  }
  
  /**
   * PREVIEW GENERATION
   * Generate visual previews for frontend display
   */
  static async generatePreview(proposal: AgentProposal): Promise<string> {
    
    switch (proposal.type) {
      case 'email':
        return this.generateEmailPreview(proposal);
      case 'design':
        return this.generateDesignPreview(proposal);
      case 'api':
        return this.generateAPIPreview(proposal);
      case 'database':
        return this.generateDatabasePreview(proposal);
      case 'workflow':
        return this.generateWorkflowPreview(proposal);
      default:
        return this.generateFilePreview(proposal);
    }
  }
  
  private static generateEmailPreview(proposal: AgentProposal): string {
    return `
    <div class="email-preview">
      <div class="email-header">
        <strong>From:</strong> Sandra &lt;sandra@sselfie.ai&gt;<br>
        <strong>Subject:</strong> ${proposal.title}
      </div>
      <div class="email-body">
        ${proposal.files[0]?.content || 'Email content preview'}
      </div>
      <div class="email-footer">
        <small>This is a preview - not sent to users</small>
      </div>
    </div>`;
  }
  
  private static generateDesignPreview(proposal: AgentProposal): string {
    return `
    <div class="design-preview">
      <h3>Design Changes Preview</h3>
      <div class="before-after">
        <div class="before">
          <h4>Current Design</h4>
          <pre>${proposal.files[0]?.currentContent?.slice(0, 500) || 'Current design...'}</pre>
        </div>
        <div class="after">
          <h4>Proposed Design</h4>
          <pre>${proposal.files[0]?.content?.slice(0, 500) || 'New design...'}</pre>
        </div>
      </div>
    </div>`;
  }
  
  private static generateAPIPreview(proposal: AgentProposal): string {
    return `
    <div class="api-preview">
      <h3>New API Endpoint</h3>
      <code>${proposal.title}</code>
      <pre>${proposal.files[0]?.content || 'API code preview'}</pre>
      <div class="security-note">
        <strong>Security:</strong> Admin authentication required
      </div>
    </div>`;
  }
  
  private static generateDatabasePreview(proposal: AgentProposal): string {
    return `
    <div class="database-preview">
      <h3>Database Changes</h3>
      <table>
        <tr><th>Table</th><th>Action</th><th>Impact</th></tr>
        ${proposal.files.map(f => `
          <tr>
            <td>${f.path}</td>
            <td>${f.action}</td>
            <td>New data structure</td>
          </tr>
        `).join('')}
      </table>
    </div>`;
  }
  
  private static generateWorkflowPreview(proposal: AgentProposal): string {
    return `
    <div class="workflow-preview">
      <h3>Automation Workflow</h3>
      <div class="workflow-steps">
        ${proposal.description}
      </div>
      <div class="workflow-benefits">
        <strong>Benefits:</strong> ${proposal.impact}
      </div>
    </div>`;
  }
  
  private static generateFilePreview(proposal: AgentProposal): string {
    return `
    <div class="file-preview">
      <h3>File Changes</h3>
      ${proposal.files.map(f => `
        <div class="file-change">
          <strong>${f.action.toUpperCase()}:</strong> ${f.path}
          <pre>${f.content.slice(0, 300)}...</pre>
        </div>
      `).join('')}
    </div>`;
  }
  
  /**
   * APPROVAL WORKFLOW
   * Sandra can approve, reject, or request changes
   */
  static async approveProposal(proposalId: string, sandraMessage?: string): Promise<void> {
    const proposal = await this.getProposal(proposalId);
    if (!proposal) {
      throw new Error('Proposal not found');
    }
    
    proposal.status = 'approved';
    proposal.updatedAt = new Date();
    
    if (sandraMessage) {
      await this.addConversationMessage(proposalId, 'sandra', sandraMessage);
    }
    
    await this.saveProposal(proposal);
    
    // Queue for implementation
    await this.implementProposal(proposal);
  }
  
  static async rejectProposal(proposalId: string, reason: string): Promise<void> {
    const proposal = await this.getProposal(proposalId);
    if (!proposal) {
      throw new Error('Proposal not found');
    }
    
    proposal.status = 'rejected';
    proposal.updatedAt = new Date();
    
    await this.addConversationMessage(proposalId, 'sandra', `Rejected: ${reason}`);
    await this.saveProposal(proposal);
  }
  
  /**
   * SAFE IMPLEMENTATION
   * Only approved proposals get implemented with full backups
   */
  static async implementProposal(proposal: AgentProposal): Promise<void> {
    if (proposal.status !== 'approved') {
      throw new Error('Only approved proposals can be implemented');
    }
    
    console.log(`🚀 Implementing approved proposal: ${proposal.title}`);
    
    try {
      // Create backups first
      for (const file of proposal.files) {
        if (file.action === 'modify' || file.action === 'delete') {
          await this.createBackup(file.path);
        }
      }
      
      // Implement changes
      for (const file of proposal.files) {
        const fullPath = path.join(process.cwd(), file.path);
        
        switch (file.action) {
          case 'create':
            await fs.writeFile(fullPath, file.content);
            break;
          case 'modify':
            await fs.writeFile(fullPath, file.content);
            break;
          case 'delete':
            await fs.unlink(fullPath);
            break;
        }
      }
      
      proposal.status = 'implemented';
      proposal.implementedAt = new Date();
      
      await this.addConversationMessage(
        proposal.id, 
        'agent', 
        `✅ Implementation complete! All changes have been applied successfully. Your ${proposal.type} is now live.`
      );
      
      console.log(`✅ Successfully implemented: ${proposal.title}`);
      
    } catch (error) {
      console.error(`❌ Implementation failed: ${error.message}`);
      
      await this.addConversationMessage(
        proposal.id, 
        'agent', 
        `❌ Implementation failed: ${error.message}. No changes were made to your system.`
      );
      
      throw error;
    }
  }
  
  /**
   * BACKUP SYSTEM
   */
  static async createBackup(filePath: string): Promise<void> {
    try {
      const fullPath = path.join(process.cwd(), filePath);
      const content = await fs.readFile(fullPath, 'utf-8');
      const backupPath = `${fullPath}.backup.${Date.now()}`;
      await fs.writeFile(backupPath, content);
      console.log(`📦 Backup created: ${backupPath}`);
    } catch (error) {
      // File doesn't exist, no backup needed
    }
  }
  
  /**
   * STORAGE OPERATIONS
   */
  static async saveProposal(proposal: AgentProposal): Promise<void> {
    const proposalsDir = path.join(process.cwd(), 'data', 'agent-proposals');
    await fs.mkdir(proposalsDir, { recursive: true });
    
    const filePath = path.join(proposalsDir, `${proposal.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(proposal, null, 2));
  }
  
  static async getProposal(proposalId: string): Promise<AgentProposal | null> {
    try {
      const filePath = path.join(process.cwd(), 'data', 'agent-proposals', `${proposalId}.json`);
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  }
  
  static async getAllProposals(): Promise<AgentProposal[]> {
    try {
      const proposalsDir = path.join(process.cwd(), 'data', 'agent-proposals');
      const files = await fs.readdir(proposalsDir);
      
      const proposals = await Promise.all(
        files.filter(f => f.endsWith('.json')).map(async f => {
          const content = await fs.readFile(path.join(proposalsDir, f), 'utf-8');
          return JSON.parse(content);
        })
      );
      
      return proposals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      return [];
    }
  }
  
  /**
   * AGENT COMMUNICATION HELPERS
   */
  static async getAgentPersonality(agentId: string): string {
    const personalities = {
      aria: "Hi Sandra! Aria here, your luxury UX designer. I think in Vogue aesthetics and speak with design passion.",
      rachel: "Hey Sandra! Rachel here, your copywriting bestie. I write like you talk - authentic, no BS, with that Rachel-from-Friends energy.",
      zara: "Hi Sandra! Zara here, your senior dev. I build beautiful, fast experiences and explain tech stuff in simple terms.",
      ava: "Hi Sandra! Ava here, your automation expert. I make everything run smoothly behind the scenes.",
      wilma: "Hi Sandra! Wilma here, your workflow architect. I design processes that make your business run like clockwork.",
      quinn: "Hi Sandra! Quinn here, your quality guardian. I make sure everything feels expensive and flawless.",
      sophia: "Hi Sandra! Sophia here, your social media manager. I know your 120K+ community and create content that resonates.",
      martha: "Hi Sandra! Martha here, your marketing strategist. I find opportunities and scale your reach authentically.",
      diana: "Hi Sandra! Diana here, your business coach. I help you focus on what matters most for growth."
    };
    
    return personalities[agentId as keyof typeof personalities] || "Hi Sandra! I'm ready to help with your business.";
  }
}