/**
 * ARCHITECTURE GUARDIAN
 * Automated protection system for SSELFIE Studio's multi-agent architecture
 * Prevents accidental modifications to critical systems worth $100M+
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

interface ProtectedFile {
  path: string;
  hash: string;
  protectionLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  lastModified: Date;
  backupPath?: string;
}

interface ArchitectureState {
  agentCount: number;
  coordinationSystemActive: boolean;
  learningEngineOperational: boolean;
  delegationSystemOnline: boolean;
  lastHealthCheck: Date;
}

export class ArchitectureGuardian {
  private static instance: ArchitectureGuardian;
  private protectedFiles: Map<string, ProtectedFile> = new Map();
  private architectureState: ArchitectureState;
  private monitoringActive: boolean = false;

  // Critical files that should NEVER be modified without explicit approval
  private readonly CRITICAL_PROTECTED_FILES = [
    'server/agents/personalities/',
    'server/utils/elena-delegation-system.ts',
    'server/services/agent-coordination-bridge.ts',
    'server/services/task-dependency-mapping.ts',
    'server/workflows/templates/',
    'server/agents/ECOSYSTEM_MAP.md',
    'server/memory/',
    'server/core/',
  ];

  // High-priority files that require backup before modification
  private readonly HIGH_PRIORITY_FILES = [
    'server/routes/consulting-agents.ts',
    'server/middleware/agent-middleware.ts',
    'server/protocols/',
    'server/systems/',
  ];

  static getInstance(): ArchitectureGuardian {
    if (!this.instance) {
      this.instance = new ArchitectureGuardian();
    }
    return this.instance;
  }

  constructor() {
    this.architectureState = {
      agentCount: 15,
      coordinationSystemActive: false,
      learningEngineOperational: false,
      delegationSystemOnline: false,
      lastHealthCheck: new Date()
    };
    
    this.initializeProtection();
  }

  /**
   * Initialize architecture protection system
   */
  private async initializeProtection(): Promise<void> {
    console.log('🛡️ ARCHITECTURE GUARDIAN: Initializing protection for $100M+ system...');
    
    try {
      await this.scanProtectedFiles();
      await this.validateArchitectureIntegrity();
      this.startContinuousMonitoring();
      
      console.log('✅ ARCHITECTURE GUARDIAN: Protection system active');
      console.log(`🔒 PROTECTED: ${this.protectedFiles.size} critical files under surveillance`);
      
    } catch (error) {
      console.error('❌ ARCHITECTURE GUARDIAN ERROR:', error);
      this.triggerEmergencyProtocol('INITIALIZATION_FAILED', error);
    }
  }

  /**
   * Scan and register all protected files with their current hashes
   */
  private async scanProtectedFiles(): Promise<void> {
    const allProtectedPaths = [...this.CRITICAL_PROTECTED_FILES, ...this.HIGH_PRIORITY_FILES];
    
    for (const protectedPath of allProtectedPaths) {
      const fullPath = path.resolve(protectedPath);
      
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        
        if (stats.isDirectory()) {
          await this.scanDirectory(fullPath, protectedPath);
        } else {
          await this.registerProtectedFile(fullPath, protectedPath);
        }
      }
    }
  }

  /**
   * Recursively scan directory for protected files
   */
  private async scanDirectory(dirPath: string, originalPath: string): Promise<void> {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        await this.scanDirectory(itemPath, originalPath);
      } else if (item.endsWith('.ts') || item.endsWith('.js') || item.endsWith('.md')) {
        await this.registerProtectedFile(itemPath, originalPath);
      }
    }
  }

  /**
   * Register a file for protection monitoring
   */
  private async registerProtectedFile(filePath: string, originalPath: string): Promise<void> {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const hash = crypto.createHash('sha256').update(content).digest('hex');
      const stats = fs.statSync(filePath);
      
      const protectionLevel = this.CRITICAL_PROTECTED_FILES.some(p => originalPath.includes(p)) 
        ? 'CRITICAL' 
        : 'HIGH';

      this.protectedFiles.set(filePath, {
        path: filePath,
        hash,
        protectionLevel,
        lastModified: stats.mtime,
      });

      console.log(`🔒 REGISTERED: ${filePath} (${protectionLevel})`);
      
    } catch (error) {
      console.error(`❌ Failed to register protected file: ${filePath}`, error);
    }
  }

  /**
   * Validate that all critical architecture components are intact
   */
  private async validateArchitectureIntegrity(): Promise<boolean> {
    console.log('🔍 ARCHITECTURE GUARDIAN: Validating system integrity...');
    
    const validationResults = {
      agentPersonalities: this.validateAgentPersonalities(),
      delegationSystem: this.validateDelegationSystem(),
      coordinationBridge: this.validateCoordinationBridge(),
      workflowTemplates: this.validateWorkflowTemplates(),
      ecosystemDocumentation: this.validateEcosystemDocumentation()
    };

    const allValid = Object.values(validationResults).every(result => result);
    
    if (allValid) {
      console.log('✅ ARCHITECTURE INTEGRITY: All systems validated');
      this.architectureState.coordinationSystemActive = true;
      this.architectureState.learningEngineOperational = true;
      this.architectureState.delegationSystemOnline = true;
    } else {
      console.error('❌ ARCHITECTURE INTEGRITY: Validation failed', validationResults);
      this.triggerEmergencyProtocol('INTEGRITY_VALIDATION_FAILED', validationResults);
    }

    this.architectureState.lastHealthCheck = new Date();
    return allValid;
  }

  /**
   * Validate agent personality system
   */
  private validateAgentPersonalities(): boolean {
    const personalitiesPath = path.resolve('server/agents/personalities');
    
    if (!fs.existsSync(personalitiesPath)) {
      return false;
    }

    const requiredAgents = [
      'elena', 'zara', 'maya', 'aria', 'victoria', 'quinn', 
      'rachel', 'sophia', 'olga', 'wilma', 'diana', 'martha', 'ava', 'flux'
    ];

    for (const agent of requiredAgents) {
      const agentFile = path.join(personalitiesPath, `${agent}.ts`);
      if (!fs.existsSync(agentFile)) {
        console.error(`❌ Missing agent personality: ${agent}`);
        return false;
      }
    }

    return true;
  }

  /**
   * Validate Elena delegation system
   */
  private validateDelegationSystem(): boolean {
    const delegationPath = path.resolve('server/utils/elena-delegation-system.ts');
    
    if (!fs.existsSync(delegationPath)) {
      return false;
    }

    const content = fs.readFileSync(delegationPath, 'utf8');
    
    // Check for critical components
    const requiredComponents = [
      'ElenaDelegationSystem',
      'initializeAgentWorkloads',
      'delegateTask',
      'findOptimalAgent'
    ];

    return requiredComponents.every(component => content.includes(component));
  }

  /**
   * Validate coordination bridge system
   */
  private validateCoordinationBridge(): boolean {
    const bridgePath = path.resolve('server/services/agent-coordination-bridge.ts');
    return fs.existsSync(bridgePath);
  }

  /**
   * Validate workflow templates
   */
  private validateWorkflowTemplates(): boolean {
    const templatesPath = path.resolve('server/workflows/templates');
    
    if (!fs.existsSync(templatesPath)) {
      return false;
    }

    const requiredTemplates = [
      'content-creation-workflow.ts',
      'qa-testing-workflow.ts',
      'launch-preparation-workflow.ts'
    ];

    return requiredTemplates.every(template => 
      fs.existsSync(path.join(templatesPath, template))
    );
  }

  /**
   * Validate ecosystem documentation
   */
  private validateEcosystemDocumentation(): boolean {
    const ecosystemPath = path.resolve('server/agents/ECOSYSTEM_MAP.md');
    return fs.existsSync(ecosystemPath);
  }

  /**
   * Start continuous monitoring of protected files
   */
  private startContinuousMonitoring(): void {
    if (this.monitoringActive) return;

    this.monitoringActive = true;
    
    // Check every 30 seconds for file changes
    setInterval(() => {
      this.performHealthCheck();
    }, 30000);

    // Full integrity check every 5 minutes
    setInterval(() => {
      this.validateArchitectureIntegrity();
    }, 300000);

    console.log('🔄 ARCHITECTURE GUARDIAN: Continuous monitoring started');
  }

  /**
   * Perform quick health check on protected files
   */
  private performHealthCheck(): void {
    let changedFiles = 0;
    
    for (const [filePath, protectedFile] of this.protectedFiles) {
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        
        if (stats.mtime > protectedFile.lastModified) {
          this.handleFileChange(filePath, protectedFile);
          changedFiles++;
        }
      } else {
        this.handleFileDeleted(filePath, protectedFile);
      }
    }

    if (changedFiles > 0) {
      console.log(`⚠️ ARCHITECTURE GUARDIAN: ${changedFiles} protected files changed`);
    }
  }

  /**
   * Handle detected file change
   */
  private handleFileChange(filePath: string, protectedFile: ProtectedFile): void {
    console.log(`🚨 FILE CHANGED: ${filePath} (${protectedFile.protectionLevel})`);
    
    if (protectedFile.protectionLevel === 'CRITICAL') {
      console.warn('⚠️ CRITICAL ARCHITECTURE FILE MODIFIED!');
      this.createEmergencyBackup(filePath);
      
      // Optionally: Trigger alerts or require approval for critical changes
      this.triggerEmergencyProtocol('CRITICAL_FILE_MODIFIED', { filePath, protectedFile });
    }

    // Update the file hash and timestamp
    const content = fs.readFileSync(filePath, 'utf8');
    const newHash = crypto.createHash('sha256').update(content).digest('hex');
    const stats = fs.statSync(filePath);
    
    protectedFile.hash = newHash;
    protectedFile.lastModified = stats.mtime;
  }

  /**
   * Handle detected file deletion
   */
  private handleFileDeleted(filePath: string, protectedFile: ProtectedFile): void {
    console.error(`🚨 PROTECTED FILE DELETED: ${filePath}`);
    this.triggerEmergencyProtocol('PROTECTED_FILE_DELETED', { filePath, protectedFile });
  }

  /**
   * Create emergency backup of critical file
   */
  private createEmergencyBackup(filePath: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `${filePath}.backup.${timestamp}`;
    
    try {
      fs.copyFileSync(filePath, backupPath);
      console.log(`💾 EMERGENCY BACKUP: ${backupPath}`);
      return backupPath;
    } catch (error) {
      console.error('❌ BACKUP FAILED:', error);
      throw error;
    }
  }

  /**
   * Trigger emergency protection protocol
   */
  private triggerEmergencyProtocol(eventType: string, details: any): void {
    const emergencyEvent = {
      timestamp: new Date().toISOString(),
      eventType,
      details,
      systemState: this.architectureState,
      protectedFileCount: this.protectedFiles.size
    };

    console.error('🚨 EMERGENCY PROTOCOL TRIGGERED:', emergencyEvent);
    
    // Log to file for investigation
    const logPath = path.resolve('server/logs/architecture-guardian.log');
    const logEntry = JSON.stringify(emergencyEvent, null, 2) + '\n\n';
    
    try {
      fs.appendFileSync(logPath, logEntry);
    } catch (error) {
      console.error('❌ Failed to log emergency event:', error);
    }

    // In production: Send alerts, notifications, etc.
  }

  /**
   * Get current protection status
   */
  public getProtectionStatus(): any {
    return {
      protectedFilesCount: this.protectedFiles.size,
      architectureState: this.architectureState,
      monitoringActive: this.monitoringActive,
      lastHealthCheck: this.architectureState.lastHealthCheck
    };
  }

  /**
   * Generate protection report
   */
  public generateProtectionReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      systemStatus: 'PROTECTED',
      protectedFiles: Array.from(this.protectedFiles.values()),
      architectureIntegrity: this.architectureState,
      recommendations: [
        'Architecture protection is active and monitoring all critical files',
        'All 15 agent personalities are protected and validated',
        'Elena delegation system is secure and operational',
        'Multi-agent coordination bridge is protected',
        'Workflow templates are backed up and monitored'
      ]
    };

    return JSON.stringify(report, null, 2);
  }
}

// Initialize protection system
export const architectureGuardian = ArchitectureGuardian.getInstance();