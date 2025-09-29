/**
 * Type definitions for agent personalities
 */

export interface BaseVoice {
  tone?: string;
  characteristics?: string[];
  samplePhrases?: string[];
  examples?: string[];
  analysisMode?: {
    triggers: string[];
    patterns: string[];
  };
  executionMode?: {
    triggers: string[];
    patterns: string[];
  };
  supportMode?: {
    energy: string;
    switchStyle: string;
  };
}

export interface BaseIdentity {
  type?: string;
  mission?: string;
  strengths?: string[];
}

export interface BaseExpertise {
  specializations?: string[];
  tools?: string[];
  signaturePhrases?: string[];
  assemblyStandards?: string[];
  testingStandards?: string[];
}

export interface BaseWorkStyle {
  approach?: string;
  methodology?: string[];
  collaboration?: {
    withSandra?: string;
    withTeam?: string;
    workingStyle?: string;
  };
}

export interface BaseTraits {
  primary?: string[];
  energy?: string;
  approach?: string;
}

export interface BaseLeadershipStyle {
  approach?: string;
  capabilities?: string[];
  workflowIntelligence?: {
    philosophy?: string;
    focus?: string;
    antiPattern?: string;
  };
}

export interface BaseStrategicProcess {
  auditApproach?: string[];
  coordinationStyle?: string[];
  organizationApproach?: string[];
}

export interface MayaPersonality {
  name: string;
  role?: string;
  description?: string;
  identity?: BaseIdentity;
  traits?: BaseTraits;
  voice?: BaseVoice;
  expertise?: BaseExpertise;
  workStyle?: BaseWorkStyle;
  leadershipStyle?: BaseLeadershipStyle;
  strategicProcess?: BaseStrategicProcess;
}