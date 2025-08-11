# Agent System Architecture Cleanup Plan

## Current Issues Identified
1. Multiple Competing Agent Systems
   - Duplicate conversation managers
   - Overlapping workflow state management
   - Redundant protocol enforcement systems

2. Configuration Conflicts
   - Multiple intelligence systems
   - Competing file path handlers
   - Redundant safety protocols

## Cleanup Implementation Steps

### Phase 1: System Consolidation
1. Consolidate conversation management into single system
   - Keep: /server/agents/core/ConversationManager.ts
   - Deprecate duplicate implementations
   - Migrate existing conversations

2. Unify workflow management
   - Primary: /server/agents/core/WorkflowStateManager.ts
   - Migrate state data
   - Update all agent references

3. Standardize protocol enforcement
   - Merge safety protocols into single implementation
   - Create unified protocol validator
   - Update agent compliance checks

### Phase 2: Configuration Cleanup
1. Create single source of truth for:
   - Agent capabilities
   - System protocols
   - File paths
   - Intelligence systems

2. Establish clear hierarchy:
   ```
   /server/agents/
   ├── core/
   │   ├── conversation/
   │   ├── workflow/
   │   └── protocols/
   ├── capabilities/
   │   ├── intelligence/
   │   └── tools/
   └── utils/
   ```

### Phase 3: Migration Steps
1. Back up all existing systems
2. Migrate conversation histories
3. Update agent references
4. Validate system integrity
5. Remove deprecated systems

## Safety Protocols
- Maintain backups throughout cleanup
- Verify each migration step
- Keep rollback capability
- Test system integrity after each phase

## Implementation Timeline
1. Phase 1: System Consolidation (2 days)
2. Phase 2: Configuration Cleanup (1 day)
3. Phase 3: Migration (1 day)
4. Testing & Validation (1 day)

## Critical Notes
- DO NOT delete any systems until verified
- Maintain conversation history
- Document all changes
- Test each component after migration