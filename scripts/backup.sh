#!/bin/bash

# Database backup script
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/backups"
DB_NAME="your_database_name"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create the backup
pg_dump $DB_NAME > "$BACKUP_DIR/backup_$TIMESTAMP.sql"

# Compress the backup
gzip "$BACKUP_DIR/backup_$TIMESTAMP.sql"

# Keep only last 7 days of backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

# Log the backup
echo "Backup completed: backup_$TIMESTAMP.sql.gz" >> "$BACKUP_DIR/backup.log"