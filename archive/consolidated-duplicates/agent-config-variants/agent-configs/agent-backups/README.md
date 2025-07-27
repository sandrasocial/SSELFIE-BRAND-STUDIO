# Agent Backup System

This directory contains automatic backups created by Sandra's AI agents before making file modifications.

## Structure
- Each agent has its own subdirectory (e.g., `zara/`, `victoria/`, `elena/`)
- Backup files are named: `[original-filename].backup.[timestamp]`
- Metadata files: `[original-filename].backup.[timestamp].meta`

## Features
- Automatic backup before every file modification
- Rollback capabilities through admin API
- Backup verification with checksums
- Automatic cleanup (keeps 5 most recent backups per file)
- Complete audit trail of agent file changes

## Admin API Endpoints
- `GET /api/admin/backups/stats` - View backup statistics
- `POST /api/admin/backups/list` - List backups for specific file
- `POST /api/admin/backups/restore` - Restore file from backup
- `POST /api/admin/backups/cleanup` - Clean up old backups
- `POST /api/admin/backups/create` - Create manual backup

## Safety Features
- Zero-risk operations - agents never break existing functionality
- Complete file history tracking
- Instant rollback if agents make mistakes
- Backup integrity verification

This system gives Sandra complete control and peace of mind when agents modify files.