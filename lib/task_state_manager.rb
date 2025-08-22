require 'pg'

class TaskStateManager
  VALID_STATES = %w[pending in_progress completed failed abandoned blocked validation_required].freeze

  class InvalidTransitionError < StandardError; end
  class ConcurrencyError < StandardError; end

  def initialize(db_connection)
    @conn = db_connection
  end

  def transition_task(task_id, new_state, reason = nil)
    raise ArgumentError, "Invalid state: #{new_state}" unless VALID_STATES.include?(new_state)

    @conn.transaction do
      # Lock the task row
      task = @conn.exec_params(
        "SELECT * FROM agent_tasks WHERE task_id = $1 FOR UPDATE",
        [task_id]
      ).first

      raise ArgumentError, "Task not found: #{task_id}" unless task

      # Attempt transition with optimistic locking
      result = @conn.exec_params(
        "UPDATE agent_tasks 
         SET status = $1, 
             state_transition_lock_version = state_transition_lock_version + 1,
             execution_data = jsonb_set(
               COALESCE(execution_data, '{}'::jsonb),
               '{state_transition_reason}',
               $2::jsonb
             )
         WHERE task_id = $3 
         AND state_transition_lock_version = $4
         RETURNING *",
        [new_state, reason.to_json, task_id, task['state_transition_lock_version']]
      )

      if result.ntuples.zero?
        raise ConcurrencyError, "Task state was modified by another process"
      end

      # Return updated task
      result.first
    end
  rescue PG::RaiseException => e
    # Handle validation errors from trigger
    raise InvalidTransitionError, e.message
  end

  def get_task_state_history(task_id)
    @conn.exec_params(
      "SELECT * FROM task_state_history 
       WHERE task_id = $1 
       ORDER BY transition_timestamp DESC",
      [task_id]
    )
  end
end