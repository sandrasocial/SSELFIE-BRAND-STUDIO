# Native Tool Guide for Agents

## Unified Native Architecture

All agents now use **native Node.js tools only** - no custom bypass systems. This eliminates all conflicts and provides maximum reliability.

## Available Native Tools

### 1. `bash` - Command Execution
- **Purpose**: File searching, system operations, complex workflows
- **Examples**:
  ```bash
  find . -name "*.tsx" -type f | head -20
  grep -r "useState" client/src --include="*.tsx" 
  ls -la client/src/components/
  ```

### 2. `str_replace_based_edit_tool` - File Operations  
- **Purpose**: View, create, edit, and manage files
- **Commands**:
  - `view`: Read files or list directories
  - `create`: Create new files with content
  - `str_replace`: Edit existing file content
  - `insert`: Insert text at specific line numbers

### 3. Additional Tools
- `get_latest_lsp_diagnostics`: Check for code errors
- `execute_sql_tool`: Database operations  
- `restart_workflow`: Restart development server

## Search Patterns for Agents

### Finding Files
```bash
# Find components
find client/src/components -name "*.tsx" -type f

# Find by content
grep -r "specific_function" . --include="*.ts" --include="*.tsx"

# List directory structure  
find . -type d -name "components" | head -10
```

### Exploring Code
```bash
# View component with str_replace_based_edit_tool
# { "command": "view", "path": "client/src/components/SomeComponent.tsx" }

# Search in specific files
grep -n "useState" client/src/components/*.tsx
```

## Benefits

- **Zero Conflicts**: No competing systems
- **Maximum Reliability**: Uses Replit's native capabilities
- **Creative Combinations**: Agents can chain tools naturally
- **Future Proof**: Always compatible with platform updates

## Agent Intelligence Unchanged

- Claude API still powers all reasoning and code generation
- Agents retain full personalities and capabilities  
- Only tool execution is simplified and made more reliable