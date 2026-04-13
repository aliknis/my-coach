-- 1) How progress is tracked in the Progress page
--    sessions           = one step per day (existing "Mark today's session")
--    cumulative_reps    = user enters how many reps they did; completed_day_index = running total toward goal
--
-- Run once in Supabase SQL Editor.

ALTER TABLE public.programs
  ADD COLUMN IF NOT EXISTS progress_mode text NOT NULL DEFAULT 'sessions'
  CHECK (progress_mode IN ('sessions', 'cumulative_reps'));

COMMENT ON COLUMN public.programs.progress_mode IS
  'sessions: day-by-day program; cumulative_reps: reps summed in user_program_progress_history.completed_day_index';

-- Allow "enrolled, 0 reps" rows (optional but recommended).
ALTER TABLE public.user_program_progress_history
  DROP CONSTRAINT IF EXISTS user_program_progress_history_completed_day_index_check;

ALTER TABLE public.user_program_progress_history
  ADD CONSTRAINT user_program_progress_history_completed_day_index_check
  CHECK (completed_day_index >= 0);
