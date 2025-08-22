#!/bin/bash

# Task Cleanup Script
# Created by Olga for SSELFIE Studio
# Runs hourly to archive stale tasks

# Set up logging
LOG_FILE="/var/log/task_cleanup.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$TIMESTAMP] Starting task cleanup..." >> $LOG_FILE

# Execute cleanup SQL function
psql -U postgres -d sselfie_db -c "SELECT cleanup_stale_tasks();" >> $LOG_FILE 2>&1

echo "[$TIMESTAMP] Task cleanup completed" >> $LOG_FILE