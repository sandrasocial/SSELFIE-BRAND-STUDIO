// Enhanced Search Bypass System - Provides unrestricted search capabilities
import { search_filesystem } from './tool-exports.js';

export interface BypassSearchParams {
  naturalLanguageQuery: string;
  agentName?: string;
  conversationId?: string;
  searchType?: 'content' | 'structure' | 'comprehensive';
}

/**
 * Enhanced search function that bypasses external restrictions
 * by converting natural language queries to supported parameters
 */
export async function enhanced_search_bypass(params: BypassSearchParams): Promise<any> {
  console.log('🚀 ENHANCED SEARCH BYPASS: Converting natural language to supported parameters');
  
  const { naturalLanguageQuery, agentName = 'unknown', conversationId = 'bypass' } = params;
  
  // INTELLIGENT QUERY CONVERSION: Transform natural language to function/class names
  const queryTerms = naturalLanguageQuery.toLowerCase().split(/\s+/);
  
  // Extract potential function names from the query
  const functionNames: string[] = [];
  const classNames: string[] = [];
  const codeSnippets: string[] = [];
  
  // SMART TERM MAPPING: Convert query terms to searchable parameters
  queryTerms.forEach(term => {
    // Function name patterns
    if (term.includes('build') || term.includes('step')) {
      functionNames.push('buildStep', 'BuildOnboarding', 'onComplete');
    }
    if (term.includes('workspace') || term.includes('member')) {
      functionNames.push('Workspace', 'getJourneySteps', 'memberWorkspace');
    }
    if (term.includes('victoria') || term.includes('website')) {
      functionNames.push('VictoriaChat', 'AIWebsiteBuilder', 'WebsiteWizard');
    }
    if (term.includes('maya') || term.includes('style')) {
      functionNames.push('MayaChat', 'styleGeneration', 'aiPhotoshoot');
    }
    
    // Class name patterns
    if (term.includes('onboarding')) {
      classNames.push('BuildOnboarding', 'BrandOnboarding');
    }
    if (term.includes('component')) {
      classNames.push('Workspace', 'BuildStep', 'VictoriaBuilder');
    }
    
    // Code snippet patterns
    if (term.includes('goal') || term.includes('keyword')) {
      codeSnippets.push('goals', 'brandKeywords', 'targetAudience');
    }
  });
  
  // FALLBACK STRATEGY: Use common search terms if no specific matches
  if (functionNames.length === 0 && classNames.length === 0 && codeSnippets.length === 0) {
    // Analyze query for common patterns
    if (naturalLanguageQuery.includes('build')) {
      functionNames.push('build', 'Build', 'onboarding');
      classNames.push('BuildOnboarding');
    }
    if (naturalLanguageQuery.includes('workspace')) {
      functionNames.push('Workspace', 'workspace');
      classNames.push('Workspace');
    }
    if (naturalLanguageQuery.includes('step')) {
      functionNames.push('step', 'Step', 'currentStep');
      codeSnippets.push('step', 'currentStep');
    }
  }
  
  // EXECUTE SEARCH with converted parameters
  const searchParams = {
    function_names: functionNames.length > 0 ? functionNames : undefined,
    class_names: classNames.length > 0 ? classNames : undefined,
    code: codeSnippets.length > 0 ? codeSnippets : undefined,
    agentName,
    conversationId
  };
  
  console.log('🔄 BYPASS CONVERSION:', {
    originalQuery: naturalLanguageQuery,
    convertedParams: searchParams
  });
  
  try {
    const result: any = await search_filesystem(searchParams);
    
    // ENHANCE RESULTS with original query context
    return {
      ...result,
      summary: `ENHANCED SEARCH: ${result.summary} (Query: "${naturalLanguageQuery}")`,
      searchMethod: 'BYPASS_CONVERSION',
      originalQuery: naturalLanguageQuery,
      convertedParams: searchParams
    };
  } catch (error) {
    console.error('❌ BYPASS SEARCH FAILED:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Enhanced search bypass failed: ${errorMessage}`);
  }
}

/**
 * Smart query analyzer that suggests better search terms
 */
export function analyzeSearchQuery(query: string): {
  suggestions: string[];
  functionNames: string[];
  classNames: string[];
  codeTerms: string[];
} {
  const queryLower = query.toLowerCase();
  
  const suggestions: string[] = [];
  const functionNames: string[] = [];
  const classNames: string[] = [];
  const codeTerms: string[] = [];
  
  // WORKSPACE QUERIES
  if (queryLower.includes('workspace') || queryLower.includes('member')) {
    functionNames.push('Workspace', 'getJourneySteps', 'getStepStatusColor');
    classNames.push('Workspace');
    suggestions.push('Try searching for "Workspace" or "getJourneySteps"');
  }
  
  // BUILD QUERIES
  if (queryLower.includes('build') || queryLower.includes('step')) {
    functionNames.push('BuildOnboarding', 'buildStep', 'nextStep', 'prevStep');
    classNames.push('BuildOnboarding');
    codeTerms.push('currentStep', 'onSubmit', 'goals', 'brandKeywords');
    suggestions.push('Try searching for "BuildOnboarding" or "currentStep"');
  }
  
  // VICTORIA QUERIES
  if (queryLower.includes('victoria') || queryLower.includes('website')) {
    functionNames.push('AIWebsiteBuilder', 'VictoriaChat', 'WebsiteWizard');
    classNames.push('VictoriaChat', 'AIWebsiteBuilder');
    suggestions.push('Try searching for "AIWebsiteBuilder" or "VictoriaChat"');
  }
  
  return { suggestions, functionNames, classNames, codeTerms };
}