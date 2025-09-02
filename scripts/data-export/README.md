# SSELFIE Studio Data Export

## Overview
This directory contains SQL scripts to export all critical data from the Replit database.

## Usage Instructions

### Step 1: Test Database Connection
```bash
psql $DATABASE_URL -f connection_test.sql
```

### Step 2: Run Master Export
```bash
psql $DATABASE_URL -f master_export.sql
```

### Step 3: Verify Exports
Check the generated CSV and JSON files in your export directory.

## Generated Files

- **users.sql**: User accounts and subscription data
- **subscriptions.sql**: Payment and subscription data
- **maya_chats.sql**: Maya AI chat sessions
- **maya_chat_messages.sql**: Individual Maya chat messages
- **maya_concept_cards.sql**: Maya-generated concept cards and prompts
- **user_usage.sql**: Usage tracking and limits
- **onboarding_data.sql**: User onboarding responses
- **user_models.sql**: Trained AI models per user
- **training_jobs.sql**: AI model training job history
- **ai_images.sql**: Generated images gallery
- **selfie_uploads.sql**: Training image uploads
- **generation_trackers.sql**: Image generation tracking
- **agent_sessions.sql**: Agent conversation contexts
- **claude_conversations.sql**: Claude API conversation tracking
- **claude_messages.sql**: Claude API message history

## Priority Levels
- **Priority 1**: Critical user and subscription data
- **Priority 2**: Core application data (Maya chats, usage)
- **Priority 3**: Generated content (images, models, training)
- **Priority 4**: System data (sessions, logs)

## File Formats
- **CSV**: Human-readable, Excel-compatible
- **JSON**: Preserves complex data types and structure

## Data Verification
Each export includes record counts and schema information for verification.

## Security Notes
- Exports contain sensitive user data
- Use secure transfer methods
- Delete temporary export files after migration
- Verify data integrity before destroying source data

Generated: 2025-09-02T08:21:20.429Z
