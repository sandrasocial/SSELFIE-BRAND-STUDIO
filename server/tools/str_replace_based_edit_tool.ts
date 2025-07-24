import { str_replace_based_edit_tool as originalEditTool } from '@replit/runtime-tools';
import { promises as fs } from 'fs';

/**
 * Enhanced str_replace_based_edit_tool for agent integration
 * Wraps the original Replit tool with agent-friendly formatting and file tree refresh
 */
export async function str_replace_based_edit_tool(params: any) {
  try {
    console.log('✏️ STR_REPLACE_BASED_EDIT_TOOL: Starting operation with params:', {
      command: params.command,
      path: params.path,
      hasContent: !!params.file_text || !!params.old_str
    });
    
    // Call the original Replit edit tool
    const result = await originalEditTool(params);
    
    // Trigger file tree refresh for Visual Editor
    if (params.command === 'create' || params.command === 'str_replace') {
      try {
        // Touch a refresh file to signal file tree changes
        const refreshFile = '.file-tree-refresh';
        await fs.writeFile(refreshFile, Date.now().toString());
        console.log('🔄 FILE TREE: Refresh signal sent to Visual Editor');
      } catch (refreshError) {
        console.log('⚠️ FILE TREE: Could not send refresh signal:', refreshError.message);
      }
    }
    
    console.log('✅ STR_REPLACE_BASED_EDIT_TOOL: File operation completed successfully');
    return result;
    
  } catch (error) {
    console.error('❌ STR_REPLACE_BASED_EDIT_TOOL ERROR:', error);
    throw new Error(`File operation failed: ${error.message}`);
  }
}