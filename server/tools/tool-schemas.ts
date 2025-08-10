/**
 * CLAUDE TOOL SCHEMAS
 * JSON schema definitions for Claude API (separate from tool functions)
 */

export const TOOL_SCHEMAS = {
  bash: {
    name: "bash",
    description: "Run bash commands in the terminal",
    input_schema: {
      type: "object",
      properties: {
        command: {
          type: "string",
          description: "The bash command to execute"
        },
        restart: {
          type: "boolean",
          description: "Whether to restart the tool instead of running a command",
          default: false
        }
      },
      required: ["command"]
    }
  },

  str_replace_based_edit_tool: {
    name: "str_replace_based_edit_tool",
    description: "Create, view, and edit files",
    input_schema: {
      type: "object",
      properties: {
        command: {
          type: "string",
          enum: ["view", "create", "str_replace", "insert"],
          description: "The file operation to perform"
        },
        path: {
          type: "string", 
          description: "File or directory path"
        },
        file_text: {
          type: "string",
          description: "Complete file content for create command"
        },
        old_str: {
          type: "string",
          description: "Exact string to replace for str_replace command"
        },
        new_str: {
          type: "string", 
          description: "Replacement string for str_replace command"
        },
        view_range: {
          type: "array",
          items: { type: "integer" },
          description: "Line range for view command [start, end]"
        },
        insert_line: {
          type: "integer",
          description: "Line number for insert command"
        },
        insert_text: {
          type: "string",
          description: "Text to insert for insert command"
        }
      },
      required: ["command", "path"]
    }
  },

  get_latest_lsp_diagnostics: {
    name: "get_latest_lsp_diagnostics",
    description: "Get LSP diagnostics and code errors",
    input_schema: {
      type: "object", 
      properties: {
        file_path: {
          type: "string",
          description: "Optional file path to check (if not provided, checks all files)"
        }
      }
    }
  },

  execute_sql_tool: {
    name: "execute_sql_tool",
    description: "Execute SQL queries on the database",
    input_schema: {
      type: "object",
      properties: {
        sql_query: {
          type: "string",
          description: "The SQL query to execute"
        },
        environment: {
          type: "string",
          enum: ["development"],
          default: "development",
          description: "Database environment (only development allowed)"
        }
      },
      required: ["sql_query"]
    }
  },

  web_search: {
    name: "web_search",
    description: "Search the internet for information",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query"
        }
      },
      required: ["query"]
    }
  },

  restart_workflow: {
    name: "restart_workflow", 
    description: "Restart or start a workflow",
    input_schema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The name of the workflow to restart"
        },
        workflow_timeout: {
          type: "integer",
          default: 30,
          description: "Timeout in seconds for workflow restart"
        }
      },
      required: ["name"]
    }
  }
};

// Tool function mapping for execution
import { bash } from './bash';
import { str_replace_based_edit_tool } from './str_replace_based_edit_tool';
import { get_latest_lsp_diagnostics } from './get_latest_lsp_diagnostics';
import { execute_sql_tool } from './execute_sql_tool';
import { web_search } from './web_search';
import { restart_workflow } from './restart-workflow';

export const TOOL_FUNCTIONS = {
  bash,
  str_replace_based_edit_tool,
  get_latest_lsp_diagnostics,
  execute_sql_tool,
  web_search,
  restart_workflow
};