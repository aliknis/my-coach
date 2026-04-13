-- Create the "1000 push-ups" cumulative program (if missing) and enroll one user.
-- Requires: add_program_progress_mode.sql already applied.
-- Replace the UUID if needed.

-- A) Program: total reps target = duration_weeks * days_per_week (here 1 × 1000 = 1000)
INSERT INTO public.programs (
  title,
  description,
  duration_weeks,
  days_per_week,
  goal,
  level,
  is_published,
  progress_mode
)
SELECT
  '1000 Push-ups',
  'Choose this in Programs; log reps over time until you reach 1000 total.',
  1,
  1000,
  'stay_fit'::public.fitness_goal,
        'intermediate'::public.fitness_level,
  true,
  'cumulative_reps'
WHERE NOT EXISTS (
  SELECT 1 FROM public.programs p WHERE p.title = '1000 Push-ups' AND p.progress_mode = 'cumulative_reps'
);

-- B) Enroll user: first history row only if they have none for this program yet
INSERT INTO public.user_program_progress_history (
  user_id,
  program_id,
  progress_date,
  completed_week,
  completed_day,
  completed_day_index,
  meta
)
SELECT
  '55044ac0-b51b-466e-9668-496fb4a1a6f7'::uuid,
  p.id,
  CURRENT_DATE,
  1,
  1,
  0,
  '{"enrolled":true}'::jsonb
FROM public.programs p
WHERE p.title = '1000 Push-ups'
  AND p.progress_mode = 'cumulative_reps'
  AND NOT EXISTS (
    SELECT 1
    FROM public.user_program_progress_history h
    WHERE h.user_id = '55044ac0-b51b-466e-9668-496fb4a1a6f7'::uuid
      AND h.program_id = p.id
  );
