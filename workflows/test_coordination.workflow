{
  "name": "test_coordination",
  "version": "1.0",
  "description": "Basic test workflow to verify coordination system",
  "input": {},
  "output": {
    "status": "string"
  },
  "steps": [
    {
      "name": "system_check",
      "type": "verification",
      "action": "verify_system_status"
    },
    {
      "name": "coordination_test",
      "type": "test",
      "action": "test_coordination_capabilities"
    },
    {
      "name": "result_compilation",
      "type": "report",
      "action": "compile_test_results"
    }
  ]
}