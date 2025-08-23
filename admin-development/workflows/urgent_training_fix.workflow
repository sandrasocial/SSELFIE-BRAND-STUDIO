{
  "name": "urgent_training_fix",
  "description": "Fix training system hardcoded paths and validate payment tiers",
  "steps": [
    {
      "agent": "ZARA",
      "task": "Fix hardcoded sandrasocial/ paths in model-training-service.ts and bulletproof-upload-service.ts",
      "validation": "Verify dynamic path resolution"
    },
    {
      "agent": "ZARA", 
      "task": "Optimize generation endpoints to return JSON instead of HTML",
      "validation": "Test endpoint response formats"
    },
    {
      "agent": "QUINN",
      "task": "Validate Creator (€27) and Entrepreneur (€67) payment tier implementations",
      "validation": "Full payment flow testing"
    }
  ]
}