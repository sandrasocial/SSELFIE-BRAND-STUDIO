{
  "name": "agent_coordination",
  "version": "1.0",
  "description": "Standard multi-agent coordination template",
  "input": {
    "agents": ["array"],
    "tasks": ["array"]
  },
  "output": {
    "coordination_status": "string",
    "task_results": ["array"]
  },
  "steps": [
    {
      "name": "agent_validation",
      "type": "verification",
      "action": "validate_agents"
    },
    {
      "name": "task_distribution",
      "type": "coordination",
      "action": "distribute_tasks"
    },
    {
      "name": "execution_monitoring",
      "type": "monitoring",
      "action": "monitor_task_execution"
    },
    {
      "name": "result_collection",
      "type": "aggregation",
      "action": "collect_task_results"
    },
    {
      "name": "status_reporting",
      "type": "report",
      "action": "generate_coordination_report"
    }
  ]
}