{
  "name": "test_coordination",
  "version": "1.0.0",
  "description": "Test workflow for coordination system validation",
  "triggers": ["test", "validate", "coordination_test"],
  "steps": [
    {
      "id": "init",
      "type": "system_check",
      "action": "validate_environment",
      "next": "agent_check"
    },
    {
      "id": "agent_check",
      "type": "coordinator_check",
      "action": "verify_agent_availability",
      "next": "test_coordination"
    },
    {
      "id": "test_coordination",
      "type": "coordination_test",
      "action": "run_test_sequence",
      "next": "complete"
    },
    {
      "id": "complete",
      "type": "system_status",
      "action": "report_results"
    }
  ],
  "error_handling": {
    "retry_count": 3,
    "fallback_step": "init"
  },
  "metadata": {
    "created_at": "2025-08-09T00:00:00Z",
    "updated_at": "2025-08-09T00:00:00Z",
    "critical": true
  }
}