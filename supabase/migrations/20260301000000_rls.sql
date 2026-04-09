-- Enable Row-Level Security to prevent unauthorized writes from the public API
ALTER TABLE counters ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read counter values (needed for public display)
-- The Edge Function uses the service role key, which bypasses RLS by default,
-- so no explicit INSERT/UPDATE policy is required for the function itself.
CREATE POLICY "allow_public_read" ON counters
  FOR SELECT USING (true);
