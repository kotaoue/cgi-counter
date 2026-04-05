-- Phase 1: initial schema
-- counters table
CREATE TABLE IF NOT EXISTS counters (
  id    TEXT PRIMARY KEY DEFAULT 'global',
  count BIGINT NOT NULL DEFAULT 0
);

-- Seed the initial row (ON CONFLICT DO NOTHING prevents count reset on re-run)
INSERT INTO counters (id, count) VALUES ('global', 0)
  ON CONFLICT (id) DO NOTHING;

-- Atomic increment function
CREATE OR REPLACE FUNCTION increment_counter()
RETURNS BIGINT AS $$
  UPDATE counters SET count = count + 1
  WHERE id = 'global'
  RETURNING count;
$$ LANGUAGE SQL;
