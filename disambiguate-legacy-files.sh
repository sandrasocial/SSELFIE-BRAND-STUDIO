#!/bin/bash

# SSELFIE Studio - Legacy Files Disambiguation Script
# Renames legacy files that share names with active core files to prevent confusion

echo "🔄 SSELFIE Studio - Legacy Files Disambiguation"
echo "=============================================="

# Create backup first
BACKUP_DIR="archive/legacy-rename-backup-$(date +%Y%m%d)"
mkdir -p "$BACKUP_DIR"

echo "📦 Creating backup in $BACKUP_DIR..."

# Files that share names with active core files
CONFLICTING_FILES=(
  "legacy/simple-training.tsx"
  "legacy/sselfie-gallery.tsx"
)

echo "🔍 Found files with naming conflicts:"

for file in "${CONFLICTING_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "  📄 $file"
    
    # Create backup
    cp "$file" "$BACKUP_DIR/" 2>/dev/null
    
    # Rename with .legacy suffix to make it clear it's not active
    new_name="${file%.tsx}.legacy.tsx"
    mv "$file" "$new_name"
    
    echo "    ✅ Renamed to: $new_name"
  fi
done

echo ""
echo "✅ Disambiguation Complete!"
echo ""
echo "📊 Summary:"
echo "  🔄 Renamed files with .legacy suffix"
echo "  📦 Originals backed up to: $BACKUP_DIR"
echo "  ✅ Core user journey files are now clearly distinguished"
echo ""
echo "🎯 Active Core Files (NO CHANGES):"
echo "  ✅ client/src/pages/onboarding/simple-training.tsx"
echo "  ✅ client/src/pages/sselfie-gallery.tsx"
echo ""
echo "🗂️  Legacy Files (RENAMED):"
echo "  📜 legacy/simple-training.legacy.tsx (formerly simple-training.tsx)"
echo "  📜 legacy/sselfie-gallery.legacy.tsx (formerly sselfie-gallery.tsx)"
echo ""
echo "💡 This prevents accidental confusion between active and legacy code."