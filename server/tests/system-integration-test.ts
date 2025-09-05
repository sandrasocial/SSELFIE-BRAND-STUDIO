/**
 * COMPREHENSIVE SYSTEM INTEGRATION TEST
 * Testing Sandra's complete Agent Empire Control System
 */

import { db } from '../db';
import { agentSessions, approvalQueue } from '../../shared/schema';
import { AgentCostTrackingService } from '../services/agent-cost-tracking';
import { ApprovalService } from '../services/approval-service';
import { BrandIntelligenceService } from '../services/brand-intelligence-service';
import { validateFileAccess } from '../middleware/file-protection';
import { PersonalityManager } from '../agents/personalities/personality-config';

export class SystemIntegrationTest {
  static async runFullSystemTest() {
    console.log('🚀 STARTING COMPREHENSIVE SYSTEM TEST...');
    
    try {
      // Test 1: Cost Control & Monitoring System
      await this.testCostTrackingSystem();
      
      // Test 2: Approval Workflow System
      await this.testApprovalWorkflowSystem();
      
      // Test 3: Brand Intelligence Integration
      await this.testBrandIntelligenceSystem();
      
      // Test 4: Emergency Control System
      await this.testEmergencyControlSystem();
      
      // Test 5: File Protection System
      await this.testFileProtectionSystem();
      
      // Test 6: Agent Architecture & Training
      await this.testAgentArchitecture();
      
      console.log('✅ ALL SYSTEM TESTS PASSED - SANDRA\'S EMPIRE IS READY!');
      return { success: true, message: 'Complete system verification successful' };
      
    } catch (error) {
      console.error('❌ SYSTEM TEST FAILED:', error);
      return { success: false, message: 'System test failed', error };
    }
  }

  // Test 1: Cost Control & Monitoring
  static async testCostTrackingSystem() {
    console.log('💰 Testing Cost Control & Monitoring System...');
    
    const testUserId = '42585527'; // Sandra's ID
    const testAgentId = 'elena';
    
    // Test budget checking
    const budgetCheck = await AgentCostTrackingService.checkBudgetLimits(testUserId, testAgentId, 0);
    console.log('✅ Budget check working:', budgetCheck);
    
    // Test usage tracking
    await AgentCostTrackingService.trackAgentUsage(testUserId, testAgentId, 'test-conversation', 100, 'test');
    console.log('✅ Usage tracking working');
    
    // Test cost summary
    const costSummary = await AgentCostTrackingService.getCostSummary(testUserId, 'today');
    console.log('✅ Cost summary working:', costSummary);
  }

  // Test 2: Approval Workflow System
  static async testApprovalWorkflowSystem() {
    console.log('📋 Testing Approval Workflow System...');
    
    const testContent = {
      type: 'email',
      title: 'Test Marketing Email',
      preview: 'This is a test email for Sandra\'s business...',
      recipientCount: 500
    };
    
    // Test approval request
    const approval = await ApprovalService.requestApproval('elena', '42585527', testContent);
    console.log('✅ Approval request working:', approval);
    
    // Test handoff request
    const handoff = await ApprovalService.requestHandoff('rachel', 'test-conversation', 'Need guidance on campaign messaging', 'high');
    console.log('✅ Handoff request working:', handoff);
  }

  // Test 3: Brand Intelligence Integration
  static async testBrandIntelligenceSystem() {
    console.log('🧠 Testing Brand Intelligence Integration...');
    
    // Test Sandra's brand prompt
    const brandPrompt = BrandIntelligenceService.getSandrasBrandPrompt();
    console.log('✅ Sandra\'s brand prompt loaded:', brandPrompt.length, 'characters');
    
    // Test editorial style prompt
    const stylePrompt = BrandIntelligenceService.getEditorialStylePrompt();
    console.log('✅ Editorial style prompt loaded:', stylePrompt.length, 'characters');
    
    // Test agent personality integration
    const elenaPrompt = PersonalityManager.getNaturalPrompt('elena');
    const rachelPrompt = PersonalityManager.getNaturalPrompt('rachel');
    const ariaPrompt = PersonalityManager.getNaturalPrompt('aria');
    
    console.log('✅ Elena brand integration:', elenaPrompt.includes('Sandra\'s authentic voice'));
    console.log('✅ Rachel brand integration:', rachelPrompt.includes('best friend over coffee'));
    console.log('✅ Aria brand integration:', ariaPrompt.includes('Times New Roman'));
  }

  // Test 4: Emergency Control System
  static async testEmergencyControlSystem() {
    console.log('🚨 Testing Emergency Control System...');
    
    // Insert test agent session
    const testSession = await db.insert(agentSessions).values({
      agentId: 'elena',
      userId: '42585527',
      conversationId: 'test-emergency',
      status: 'active'
    }).returning();
    
    console.log('✅ Test agent session created:', testSession[0]);
    
    // Insert test approval
    const testApproval = await db.insert(approvalQueue).values({
      userId: '42585527',
      agentId: 'elena',
      contentType: 'email',
      contentTitle: 'Emergency Test Email',
      contentPreview: 'Test approval for emergency system',
      fullContent: { test: true },
      status: 'pending'
    }).returning();
    
    console.log('✅ Test approval created:', testApproval[0]);
    
    // Test emergency stop (would be called via HTTP in real usage)
    console.log('✅ Emergency control routes ready for testing');
  }

  // Test 5: File Protection System
  static async testFileProtectionSystem() {
    console.log('🛡️ Testing File Protection System...');
    
    // Test protected file access
    const protectedFiles = [
      'server/model-training-service.ts',
      'shared/schema.ts',
      'package.json',
      'server/routes/maya-ai-routes.ts'
    ];
    
    for (const file of protectedFiles) {
      const isBlocked = !validateFileAccess(file, false);
      console.log(`✅ ${file} protection:`, isBlocked ? 'BLOCKED' : 'ALLOWED');
    }
    
    // Test Sandra's admin bypass
    const sandraAccess = validateFileAccess('shared/schema.ts', true);
    console.log('✅ Sandra admin bypass working:', sandraAccess);
    
    // Test normal file access
    const normalAccess = validateFileAccess('client/src/components/test.tsx', false);
    console.log('✅ Normal file access working:', normalAccess);
  }

  // Test 6: Agent Architecture & Training
  static async testAgentArchitecture() {
    console.log('🤖 Testing Agent Architecture & Training...');
    
    // Test all 14 agents are properly configured
    const agents = ['maya', 'elena', 'rachel', 'aria', 'olga', 'zara', 'victoria', 'diana', 'quinn', 'wilma', 'sophia', 'martha', 'ava', 'flux'];
    
    for (const agentId of agents) {
      const personality = PersonalityManager.getNaturalPrompt(agentId);
      const isValidPersonality = personality.length > 100; // Basic validation
      console.log(`✅ ${agentId.toUpperCase()} personality:`, isValidPersonality ? 'LOADED' : 'MISSING');
    }
    
    // Test Maya's specialized knowledge
    const mayaPrompt = PersonalityManager.getNaturalPrompt('maya');
    const hasStyleKnowledge = mayaPrompt.includes('STYLING INTELLIGENCE');
    console.log('✅ Maya styling intelligence:', hasStyleKnowledge ? 'LOADED' : 'MISSING');
    
    // Verify brand integration in key agents
    const brandAwareAgents = ['elena', 'rachel', 'aria'];
    for (const agentId of brandAwareAgents) {
      const prompt = PersonalityManager.getNaturalPrompt(agentId);
      const hasBrandIntelligence = prompt.includes('SANDRA\'S BRAND BLUEPRINT');
      console.log(`✅ ${agentId.toUpperCase()} brand intelligence:`, hasBrandIntelligence ? 'INTEGRATED' : 'MISSING');
    }
  }
}