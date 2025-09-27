CREATE TABLE IF NOT EXISTS schema_migration_log (
  id SERIAL PRIMARY KEY,
  phase TEXT NOT NULL,
  operation TEXT NOT NULL,
  status TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS query_performance_log (
  id SERIAL PRIMARY KEY,
  query_hash TEXT NOT NULL,
  execution_time INTEGER NOT NULL,
  query_context TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS migration_verification (
  id SERIAL PRIMARY KEY,
  source_table TEXT NOT NULL,
  target_table TEXT NOT NULL,
  verification_type TEXT NOT NULL,
  source_count INTEGER,
  target_count INTEGER,
  matching_rows INTEGER,
  status TEXT NOT NULL,
  discrepancies JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS schema_snapshot (
  id SERIAL PRIMARY KEY,
  table_name TEXT NOT NULL,
  column_count INTEGER NOT NULL,
  row_count INTEGER NOT NULL,
  index_count INTEGER NOT NULL,
  foreign_keys JSONB NOT NULL DEFAULT '[]',
  schema JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);