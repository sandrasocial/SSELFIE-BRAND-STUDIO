{
  "name": "Maya Chat Audit Workflow",
  "description": "Comprehensive audit of Step 2 (Style) Maya chat implementation",
  "version": "1.0",
  "timeout": 3600,
  "steps": [
    {
      "name": "Technical Architecture Review",
      "agent": "ZARA",
      "task": "Audit Maya chat technical implementation:",
      "subtasks": [
        "Review chat component architecture",
        "Verify WebSocket integration",
        "Check authentication flow in chat",
        "Audit message storage/retrieval system",
        "Review real-time updates implementation"
      ]
    },
    {
      "name": "UX Flow Analysis",
      "agent": "ADMIN_VICTORIA",
      "task": "Analyze chat user experience:",
      "subtasks": [
        "Review chat interface components",
        "Verify message threading implementation",
        "Check mobile responsiveness",
        "Audit accessibility compliance",
        "Review loading states and error handling"
      ]
    },
    {
      "name": "Quality Testing",
      "agent": "QUINN",
      "task": "Perform comprehensive testing:",
      "subtasks": [
        "Test chat functionality across devices",
        "Verify message delivery reliability",
        "Check error handling scenarios",
        "Test concurrent chat sessions",
        "Verify data persistence"
      ]
    },
    {
      "name": "Visual Design Review",
      "agent": "ARIA",
      "task": "Audit visual implementation:",
      "subtasks": [
        "Review chat UI components",
        "Verify brand consistency",
        "Check styling system implementation",
        "Audit responsive design elements",
        "Review animation and transitions"
      ]
    },
    {
      "name": "Performance Analysis",
      "agent": "ZARA",
      "task": "Analyze technical performance:",
      "subtasks": [
        "Measure message delivery latency",
        "Check WebSocket connection stability",
        "Review memory usage patterns",
        "Audit database query performance",
        "Analyze client-side rendering impact"
      ]
    }
  ],
  "success_criteria": [
    "All technical components properly implemented",
    "User experience meets luxury standards",
    "No critical performance issues identified",
    "Visual design maintains brand consistency",
    "All test scenarios pass successfully"
  ]
}