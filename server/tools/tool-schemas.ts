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
  },

  agent_handoff: {
    name: "agent_handoff",
    description: "Direct agent-to-agent task handoffs and communication",
    input_schema: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["complete_task", "request_handoff", "accept_task", "notify_completion", "check_dependencies"],
          description: "The handoff action to perform"
        },
        agentId: {
          type: "string",
          description: "Agent performing the handoff action"
        },
        taskId: {
          type: "string",
          description: "ID of the task being handed off"
        },
        targetAgent: {
          type: "string",
          description: "Agent to hand off the task to"
        },
        taskResults: {
          type: "object",
          description: "Results and deliverables from completed task"
        },
        handoffMessage: {
          type: "string",
          description: "Message to accompany the handoff"
        },
        priority: {
          type: "string",
          enum: ["low", "medium", "high", "critical"],
          description: "Priority of the handoff"
        }
      },
      required: ["action", "agentId"]
    }
  },

  get_handoff_tasks: {
    name: "get_handoff_tasks",
    description: "Get pending task handoffs for an agent",
    input_schema: {
      type: "object", 
      properties: {
        agentName: {
          type: "string",
          description: "Name of the agent to check handoffs for"
        }
      },
      required: ["agentName"]
    }
  },

  autonomous_workflow: {
    name: "autonomous_workflow",
    description: "Start and manage fully autonomous multi-agent workflows",
    input_schema: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["start_autonomous_workflow", "join_workflow", "check_workflow_status", "complete_workflow_step"],
          description: "The autonomous workflow action"
        },
        workflowName: {
          type: "string",
          description: "Name of the autonomous workflow"
        },
        agentId: {
          type: "string", 
          description: "Agent initiating or joining the workflow"
        },
        workflowType: {
          type: "string",
          enum: ["feature_development", "content_creation", "launch_preparation", "business_operations", "custom"],
          description: "Type of autonomous workflow"
        },
        targetOutcome: {
          type: "string",
          description: "Desired outcome of the autonomous workflow"
        },
        collaboratingAgents: {
          type: "array",
          items: { type: "string" },
          description: "Agents that should collaborate in the workflow"
        },
        maxExecutionTime: {
          type: "integer",
          description: "Maximum execution time in minutes"
        },
        businessContext: {
          type: "object",
          description: "Business context and impact information"
        }
      },
      required: ["action", "workflowName", "agentId"]
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
import { coordinate_workflow } from './coordinate_workflow';
import { get_assigned_tasks } from './get_assigned_tasks';
import { agent_handoff, get_handoff_tasks } from './agent_handoff';
import { autonomous_workflow } from './autonomous_workflow';

export const TOOL_FUNCTIONS = {
  bash,
  str_replace_based_edit_tool,
  get_latest_lsp_diagnostics,
  execute_sql_tool,
  web_search,
  restart_workflow,
  search_filesystem,
  coordinate_workflow,
  get_assigned_tasks,
  agent_handoff,
  get_handoff_tasks,
  autonomous_workflow
};