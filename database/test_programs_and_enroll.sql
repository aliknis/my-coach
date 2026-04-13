-- ============================================================
-- TEST PROGRAMS + ENROLLMENT for user 55044ac0-b51b-466e-9668-496fb4a1a6f7
-- Run in Supabase SQL Editor
-- ============================================================


-- ============================================================
--  STEP 1: ALLOW MULTIPLE ENROLLMENTS IN THE SAME PROGRAM
-- ============================================================
-- Add an enrollment_id column so the same user can do the same
-- program more than once (each attempt gets a new enrollment_id).
-- The old unique key was (user_id, program_id, progress_date).
-- The new unique key is  (user_id, program_id, enrollment_id, progress_date).

-- 1a) Add enrollment_id (default 1 for all existing rows)
ALTER TABLE public.user_program_progress_history
  ADD COLUMN IF NOT EXISTS enrollment_id integer NOT NULL DEFAULT 1;

-- 1b) Drop the OLD unique constraint
--     (the name may differ — check with \d user_program_progress_history)
ALTER TABLE public.user_program_progress_history
  DROP CONSTRAINT IF EXISTS user_program_progress_history_user_id_program_id_progress_d_key;

-- 1c) Create the NEW unique constraint including enrollment_id
ALTER TABLE public.user_program_progress_history
  ADD CONSTRAINT upph_user_program_enrollment_date_uq
  UNIQUE (user_id, program_id, enrollment_id, progress_date);


-- ============================================================
--  STEP 2: INSERT TEST PROGRAMS (only if they don't exist yet)
-- ============================================================

-- Program 1: Lose Weight – "Fat Burner 4-Week" (sessions, 4 weeks × 3 days/week = 12 total)
INSERT INTO public.programs (title, description, level, goal, duration_weeks, days_per_week, is_published, progress_mode)
SELECT '4-Week Fat Burner', 'Cardio + HIIT to shed fat in 4 weeks.', 'beginner'::fitness_level, 'lose_weight'::fitness_goal, 4, 3, true, 'sessions'
WHERE NOT EXISTS (SELECT 1 FROM public.programs WHERE title = '4-Week Fat Burner');

-- Program 2: Build Muscle – "Strength Builder 6-Week" (sessions, 6 weeks × 4 days/week = 24 total)
INSERT INTO public.programs (title, description, level, goal, duration_weeks, days_per_week, is_published, progress_mode)
SELECT '6-Week Strength Builder', 'Progressive overload for muscle growth.', 'intermediate'::fitness_level, 'build_muscle'::fitness_goal, 6, 4, true, 'sessions'
WHERE NOT EXISTS (SELECT 1 FROM public.programs WHERE title = '6-Week Strength Builder');

-- Program 3: Endurance – "5K Runner Prep" (sessions, 8 weeks × 3 days/week = 24 total)
INSERT INTO public.programs (title, description, level, goal, duration_weeks, days_per_week, is_published, progress_mode)
SELECT '5K Runner Prep', 'Couch-to-5K style running plan.', 'beginner'::fitness_level, 'improve_endurance'::fitness_goal, 8, 3, true, 'sessions'
WHERE NOT EXISTS (SELECT 1 FROM public.programs WHERE title = '5K Runner Prep');

-- Program 4: Stay Fit – "500 Squats Challenge" (cumulative_reps, 1 × 500 = 500 total)
INSERT INTO public.programs (title, description, level, goal, duration_weeks, days_per_week, is_published, progress_mode)
SELECT '500 Squats Challenge', 'Reach 500 total squats at your own pace.', 'beginner'::fitness_level, 'stay_fit'::fitness_goal, 1, 500, true, 'cumulative_reps'
WHERE NOT EXISTS (SELECT 1 FROM public.programs WHERE title = '500 Squats Challenge');

-- Program 5: Build Muscle – "200 Pull-ups" (cumulative_reps, 1 × 200 = 200 total)
INSERT INTO public.programs (title, description, level, goal, duration_weeks, days_per_week, is_published, progress_mode)
SELECT '200 Pull-ups', 'Build back & arms: 200 pull-ups total.', 'advanced'::fitness_level, 'build_muscle'::fitness_goal, 1, 200, true, 'cumulative_reps'
WHERE NOT EXISTS (SELECT 1 FROM public.programs WHERE title = '200 Pull-ups');


-- ============================================================
--  STEP 3: ENROLL THE USER IN EACH NEW PROGRAM
-- ============================================================
-- This inserts a "day 0" enrollment row for each program (only if not already enrolled).

DO $$
DECLARE
  v_user_id uuid := '55044ac0-b51b-466e-9668-496fb4a1a6f7';
  v_program record;
BEGIN
  FOR v_program IN
    SELECT id, title, progress_mode
    FROM public.programs
    WHERE title IN (
      '4-Week Fat Burner',
      '6-Week Strength Builder',
      '5K Runner Prep',
      '500 Squats Challenge',
      '200 Pull-ups'
    )
  LOOP
    -- Only enroll if no rows exist for this user+program yet
    IF NOT EXISTS (
      SELECT 1 FROM public.user_program_progress_history
      WHERE user_id = v_user_id AND program_id = v_program.id
    ) THEN
      INSERT INTO public.user_program_progress_history
        (user_id, program_id, enrollment_id, progress_date, completed_week, completed_day, completed_day_index, meta)
      VALUES
        (v_user_id, v_program.id, 1, CURRENT_DATE, 1, 0, 0, jsonb_build_object('enrolled', true, 'source', 'test_seed'));
    END IF;
  END LOOP;
END $$;


-- ============================================================
--  STEP 4: PRE-FILL SOME PROGRESS FOR TESTING
-- ============================================================
-- Give "4-Week Fat Burner" 11 out of 12 sessions (so one more click completes it and triggers popup)
DO $$
DECLARE
  v_user_id uuid := '55044ac0-b51b-466e-9668-496fb4a1a6f7';
  v_pid bigint;
BEGIN
  SELECT id INTO v_pid FROM public.programs WHERE title = '4-Week Fat Burner' LIMIT 1;
  IF v_pid IS NOT NULL THEN
    -- Update today's row to day_index = 11 (out of 12)
    UPDATE public.user_program_progress_history
    SET completed_day_index = 11,
        completed_week = 4,
        completed_day = 2,
        meta = '{"source":"test_seed","note":"11/12 done"}'
    WHERE user_id = v_user_id AND program_id = v_pid AND enrollment_id = 1;
  END IF;
END $$;

-- Give "500 Squats Challenge" 480 reps (so adding 20+ will trigger popup)
DO $$
DECLARE
  v_user_id uuid := '55044ac0-b51b-466e-9668-496fb4a1a6f7';
  v_pid bigint;
BEGIN
  SELECT id INTO v_pid FROM public.programs WHERE title = '500 Squats Challenge' LIMIT 1;
  IF v_pid IS NOT NULL THEN
    UPDATE public.user_program_progress_history
    SET completed_day_index = 480,
        meta = '{"source":"test_seed","note":"480/500 reps"}'
    WHERE user_id = v_user_id AND program_id = v_pid AND enrollment_id = 1;
  END IF;
END $$;

-- Give "6-Week Strength Builder" 24/24 (COMPLETED — will show in "Completed" filter)
DO $$
DECLARE
  v_user_id uuid := '55044ac0-b51b-466e-9668-496fb4a1a6f7';
  v_pid bigint;
BEGIN
  SELECT id INTO v_pid FROM public.programs WHERE title = '6-Week Strength Builder' LIMIT 1;
  IF v_pid IS NOT NULL THEN
    UPDATE public.user_program_progress_history
    SET completed_day_index = 24,
        completed_week = 6,
        completed_day = 4,
        meta = '{"source":"test_seed","note":"COMPLETED 24/24"}'
    WHERE user_id = v_user_id AND program_id = v_pid AND enrollment_id = 1;
  END IF;
END $$;


-- ============================================================
--  HOW TO RE-ENROLL IN THE SAME PROGRAM (do it again)
-- ============================================================
-- To start the same challenge again, just insert a new row with
-- a higher enrollment_id. Example for "6-Week Strength Builder":
--
--   INSERT INTO public.user_program_progress_history
--     (user_id, program_id, enrollment_id, progress_date,
--      completed_week, completed_day, completed_day_index, meta)
--   VALUES (
--     '55044ac0-b51b-466e-9668-496fb4a1a6f7'::uuid,
--     (SELECT id FROM public.programs WHERE title = '6-Week Strength Builder'),
--     2,            -- <== enrollment_id = 2 (second time)
--     CURRENT_DATE,
--     1, 0, 0,
--     '{"enrolled":true,"attempt":2}'
--   );
--
-- The JS restart button does this automatically via upsert.
