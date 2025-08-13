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
  },

  search_filesystem: {
    name: "search_filesystem",
    description: "Search through project files and code",
    input_schema: {
      type: "object",
      properties: {
        query_description: {
          type: "string",
          description: "Natural language description of what to search for"
        },
        class_names: {
          type: "array",
          items: { type: "string" },
          description: "Specific class names to search for",
          default: []
        },
        function_names: {
          type: "array", 
          items: { type: "string" },
          description: "Specific function names to search for",
          default: []
        },
        code: {
          type: "array",
          items: { type: "string" },
          description: "Exact code snippets to search for",
          default: []
        },
        search_paths: {
          type: "array",
          items: { type: "string" },
          description: "Paths to search in (directories or files)",
          default: ["."]
        }
      }
    }
  },

  coordinate_agent: {
    name: "coordinate_agent",
    description: "Coordinate with other specialized agents by creating workflow templates and initiating tasks with structured coordination",
    input_schema: {
      type: "object",
      properties: {
        target_agent: {
          type: "string",
          enum: ["elena", "victoria", "zara", "aria", "maya", "olga", "rachel", "diana", "quinn", "wilma", "sophia", "martha", "ava", "flux"],
          description: "The agent to coordinate with"
        },
        task_description: {
          type: "string",
          description: "Detailed description of the task to assign to the agent"
        },
        workflow_context: {
          type: "string",
          description: "Context about the overall workflow and how this task fits"
        },
        priority: {
          type: "string",
          enum: ["high", "medium", "low"],
          description: "Priority level of the task",
          default: "medium"
        },
        expected_deliverables: {
          type: "array",
          items: { type: "string" },
          description: "List of expected outputs or deliverables from the agent"
        },
        workflow_type: {
          type: "string",
          enum: ["auth_audit", "database_optimization", "system_health", "custom"],
          description: "Type of predefined workflow template to create for structured coordination"
        },
        create_workflow_template: {
          type: "boolean",
          description: "Whether to create a workflow template for this coordination",
          default: false
        }
      },
      required: ["target_agent", "task_description", "workflow_context"]
    }
  },

  get_assigned_tasks: {
    name: "get_assigned_tasks",
    description: "Retrieve active workflow tasks assigned to the current agent",
    input_schema: {
      type: "object",
      properties: {
        agent_name: {
          type: "string",
          description: "Name of the agent to get tasks for (usually the current agent)"
        }
      },
      required: ["agent_name"]
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
import { search_filesystem } from './search_filesystem';
import { coordinate_agent } from './coordinate_agent';

export const TOOL_FUNCTIONS = {
  bash,
  str_replace_based_edit_tool,
  get_latest_lsp_diagnostics,
  execute_sql_tool,
  web_search,
  restart_workflow,
  search_filesystem,
  coordinate_agent
};