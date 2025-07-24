import { search_filesystem as originalSearchTool } from '@replit/runtime-tools';

/**
 * Enhanced search_filesystem tool for agent integration
 * Wraps the original Replit tool with agent-friendly formatting
 */
export async function search_filesystem(params: any) {
  try {
    console.log('🔍 SEARCH_FILESYSTEM TOOL: Starting search with params:', params);
    
    // Call the original Replit search tool
    const result = await originalSearchTool(params);
    
    console.log('✅ SEARCH_FILESYSTEM TOOL: Search completed successfully');
    return result;
    
  } catch (error) {
    console.error('❌ SEARCH_FILESYSTEM TOOL ERROR:', error);
    throw new Error(`Search failed: ${error.message}`);
  }
}