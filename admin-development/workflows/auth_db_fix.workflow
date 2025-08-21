{
  "name": "auth_db_fix",
  "description": "Workflow for fixing auth database issues with safety measures",
  "version": "1.0",
  "requiredRole": ["admin", "db_manager"],
  "steps": [
    {
      "id": "backup",
      "name": "Create Database Backup",
      "type": "database_backup",
      "config": {
        "tables": ["users", "sessions", "permissions"],
        "backupPath": "./backups/auth_db_{{timestamp}}"
      }
    },
    {
      "id": "verify_schema",
      "name": "Verify Database Schema",
      "type": "schema_verification",
      "config": {
        "schemaPath": "./shared/schema.ts",
        "tables": ["users", "sessions", "permissions"]
      }
    },
    {
      "id": "fix_execution",
      "name": "Execute Database Fixes",
      "type": "database_fix",
      "config": {
        "operations": [
          "VACUUM ANALYZE users",
          "REINDEX TABLE users",
          "UPDATE users SET last_login = NULL WHERE last_login = '1970-01-01'",
          "DELETE FROM sessions WHERE expired = true"
        ],
        "requireConfirmation": true
      }
    },
    {
      "id": "verify_fixes",
      "name": "Verify Database Fixes",
      "type": "verification",
      "config": {
        "checks": [
          "SELECT count(*) FROM users WHERE last_login = '1970-01-01'",
          "SELECT count(*) FROM sessions WHERE expired = true"
        ]
      }
    }
  ],
  "errorHandling": {
    "onFailure": "rollback",
    "notifyUsers": ["elena@example.com"],
    "retryCount": 1
  }
}