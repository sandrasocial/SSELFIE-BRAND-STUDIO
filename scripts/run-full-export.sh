#!/bin/bash

# SSELFIE Studio Complete Data Export Script
# This script executes the full data export from Replit database

set -e  # Exit on any error

echo "🎯 SSELFIE Studio Data Export - Phase 1"
echo "========================================"
echo ""

# Configuration
EXPORT_DIR="/tmp/sselfie_export_$(date +%Y%m%d_%H%M%S)"
SCRIPT_DIR="$(dirname "$0")/data-export"

echo "📁 Export directory: $EXPORT_DIR"
echo "📋 Script directory: $SCRIPT_DIR"
echo ""

# Create export directory
echo "🔧 Creating export directory..."
mkdir -p "$EXPORT_DIR"

# Step 1: Test database connection
echo "🔍 Step 1: Testing database connection..."
if psql $DATABASE_URL -f "$SCRIPT_DIR/connection_test.sql" > "$EXPORT_DIR/connection_test_results.txt"; then
    echo "✅ Database connection successful"
    echo "📊 Connection test results saved to: $EXPORT_DIR/connection_test_results.txt"
else
    echo "❌ Database connection failed"
    echo "🔍 Check your DATABASE_URL environment variable"
    exit 1
fi

echo ""

# Step 2: Export critical data tables
echo "🚀 Step 2: Exporting critical data tables..."

# Priority 1: Core user and subscription data
echo "📤 Exporting Priority 1 tables (Users & Subscriptions)..."

psql $DATABASE_URL -c "\\COPY (SELECT * FROM users ORDER BY created_at ASC) TO '$EXPORT_DIR/users.csv' WITH CSV HEADER;"
echo "  ✅ users.csv ($(wc -l < "$EXPORT_DIR/users.csv") records)"

psql $DATABASE_URL -c "\\COPY (SELECT * FROM subscriptions ORDER BY created_at ASC) TO '$EXPORT_DIR/subscriptions.csv' WITH CSV HEADER;"
echo "  ✅ subscriptions.csv ($(wc -l < "$EXPORT_DIR/subscriptions.csv") records)"

# Priority 2: Maya chat data
echo "📤 Exporting Priority 2 tables (Maya Conversations)..."

psql $DATABASE_URL -c "\\COPY (SELECT * FROM maya_chats ORDER BY created_at ASC) TO '$EXPORT_DIR/maya_chats.csv' WITH CSV HEADER;"
echo "  ✅ maya_chats.csv ($(wc -l < "$EXPORT_DIR/maya_chats.csv") records)"

psql $DATABASE_URL -c "\\COPY (SELECT * FROM maya_chat_messages ORDER BY created_at ASC) TO '$EXPORT_DIR/maya_chat_messages.csv' WITH CSV HEADER;"
echo "  ✅ maya_chat_messages.csv ($(wc -l < "$EXPORT_DIR/maya_chat_messages.csv") records)"

# Check if maya_concept_cards table exists and export if it does
if psql $DATABASE_URL -c "SELECT 1 FROM maya_concept_cards LIMIT 1;" >/dev/null 2>&1; then
    psql $DATABASE_URL -c "\\COPY (SELECT * FROM maya_concept_cards ORDER BY created_at ASC) TO '$EXPORT_DIR/maya_concept_cards.csv' WITH CSV HEADER;"
    echo "  ✅ maya_concept_cards.csv ($(wc -l < "$EXPORT_DIR/maya_concept_cards.csv") records)"
else
    echo "  ⚠️  maya_concept_cards table not found (normal for older installs)"
fi

# Priority 3: AI models and generated content
echo "📤 Exporting Priority 3 tables (AI Models & Generated Content)..."

psql $DATABASE_URL -c "\\COPY (SELECT * FROM user_models ORDER BY created_at ASC) TO '$EXPORT_DIR/user_models.csv' WITH CSV HEADER;"
echo "  ✅ user_models.csv ($(wc -l < "$EXPORT_DIR/user_models.csv") records)"

psql $DATABASE_URL -c "\\COPY (SELECT * FROM ai_images ORDER BY created_at ASC) TO '$EXPORT_DIR/ai_images.csv' WITH CSV HEADER;"
echo "  ✅ ai_images.csv ($(wc -l < "$EXPORT_DIR/ai_images.csv") records)"

# Check for additional tables and export if they exist
OPTIONAL_TABLES=("user_usage" "onboarding_data" "selfie_uploads" "generation_trackers" "training_jobs")

echo "📤 Exporting optional tables (if they exist)..."
for table in "${OPTIONAL_TABLES[@]}"; do
    if psql $DATABASE_URL -c "SELECT 1 FROM $table LIMIT 1;" >/dev/null 2>&1; then
        psql $DATABASE_URL -c "\\COPY (SELECT * FROM $table ORDER BY created_at ASC) TO '$EXPORT_DIR/${table}.csv' WITH CSV HEADER;"
        echo "  ✅ ${table}.csv ($(wc -l < "$EXPORT_DIR/${table}.csv") records)"
    else
        echo "  ⚠️  $table table not found (skipping)"
    fi
done

echo ""

# Step 3: Generate JSON exports for complex data
echo "🔄 Step 3: Generating JSON exports for complex data types..."

psql $DATABASE_URL -c "\\COPY (SELECT row_to_json(users) FROM users ORDER BY created_at ASC) TO '$EXPORT_DIR/users.json';"
echo "  ✅ users.json"

psql $DATABASE_URL -c "\\COPY (SELECT row_to_json(maya_chats) FROM maya_chats ORDER BY created_at ASC) TO '$EXPORT_DIR/maya_chats.json';"
echo "  ✅ maya_chats.json"

psql $DATABASE_URL -c "\\COPY (SELECT row_to_json(maya_chat_messages) FROM maya_chat_messages ORDER BY created_at ASC) TO '$EXPORT_DIR/maya_chat_messages.json';"
echo "  ✅ maya_chat_messages.json"

echo ""

# Step 4: Generate summary report
echo "📊 Step 4: Generating export summary report..."

psql $DATABASE_URL -c "\\COPY (
  SELECT 
    'users' as table_name,
    COUNT(*) as record_count,
    MIN(created_at) as earliest_record,
    MAX(created_at) as latest_record
  FROM users
  
  UNION ALL
  
  SELECT 
    'maya_chats',
    COUNT(*),
    MIN(created_at),
    MAX(created_at)
  FROM maya_chats
  
  UNION ALL
  
  SELECT 
    'maya_chat_messages',
    COUNT(*),
    MIN(created_at),
    MAX(created_at)
  FROM maya_chat_messages
  
  UNION ALL
  
  SELECT 
    'user_models',
    COUNT(*),
    MIN(created_at),
    MAX(created_at)
  FROM user_models
  
  UNION ALL
  
  SELECT 
    'subscriptions',
    COUNT(*),
    MIN(created_at),
    MAX(created_at)
  FROM subscriptions
  
  UNION ALL
  
  SELECT 
    'ai_images',
    COUNT(*),
    MIN(created_at),
    MAX(created_at)
  FROM ai_images

) TO '$EXPORT_DIR/export_summary.csv' WITH CSV HEADER;"

echo "  ✅ export_summary.csv"

# Step 5: Create export metadata
echo "📋 Step 5: Creating export metadata..."

cat > "$EXPORT_DIR/export_metadata.txt" << EOF
SSELFIE Studio Data Export
==========================

Export Date: $(date)
Export Directory: $EXPORT_DIR
Database: $(psql $DATABASE_URL -t -c "SELECT current_database();")
PostgreSQL Version: $(psql $DATABASE_URL -t -c "SELECT version();" | head -1)

Files Generated:
$(ls -la "$EXPORT_DIR/" | grep -v "^total" | grep -v "^d")

Export Summary:
$(cat "$EXPORT_DIR/export_summary.csv")

Next Steps:
1. Verify all files were created successfully
2. Check file sizes and record counts
3. Secure transfer to target environment
4. Import into production database
5. Verify data integrity after import

Security Notes:
- This export contains sensitive user data
- Use secure transfer methods (SFTP, encrypted storage)
- Delete temporary files after successful migration
- Verify data integrity before destroying source
EOF

echo "  ✅ export_metadata.txt"

echo ""

# Final summary
echo "🎉 EXPORT COMPLETED SUCCESSFULLY!"
echo "=================================="
echo ""
echo "📁 Export Location: $EXPORT_DIR"
echo "📊 Files Created:"
ls -la "$EXPORT_DIR/" | grep -v "^total" | grep -v "^d" | awk '{print "   " $9 " (" $5 " bytes)"}'
echo ""
echo "📋 Export Summary:"
cat "$EXPORT_DIR/export_summary.csv" | column -t -s,
echo ""
echo "🔐 Security Reminder:"
echo "   - Export contains sensitive user data"
echo "   - Use secure transfer methods"
echo "   - Delete temporary files after migration"
echo ""
echo "🚀 Next Phase: Import data to production environment"
echo ""