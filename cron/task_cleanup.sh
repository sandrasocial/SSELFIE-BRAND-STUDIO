#!/bin/bash

# Log file setup
LOG_FILE="/var/log/task_cleanup.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$TIMESTAMP] Starting task cleanup process" >> "$LOG_FILE"

# Run the cleanup function
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -t -c "SELECT cleanup_stale_tasks();" >> "$LOG_FILE" 2>&1

echo "[$TIMESTAMP] Cleanup process completed" >> "$LOG_FILE"