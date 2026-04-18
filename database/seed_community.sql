-- Seed: community challenge templates + sample history (run after community.sql and public.users has rows).
-- Idempotent template inserts use ON CONFLICT — adjust if you prefer a clean re-seed.

-- ---------------------------------------------------------------------------
-- Challenge templates (pool). Points: easy 30, medium 50, hard 100.
-- ---------------------------------------------------------------------------
INSERT INTO public.community_challenge_templates (difficulty, points, title, description)
VALUES
  ('easy', 30, 'Do 30 push-ups', 'Complete 30 push-ups in one session today.'),
  ('easy', 30, '10-minute walk', 'Take a brisk 10-minute walk outside or on a treadmill.'),
  ('easy', 30, 'Stretch for 5 minutes', 'Full-body stretch: focus on hips, shoulders, and hamstrings.'),
  ('easy', 30, 'Drink 2L of water', 'Hit at least 2 liters of water before midnight UTC.'),
  ('easy', 30, '20 bodyweight squats', 'Controlled tempo, full depth if your mobility allows.'),
  ('easy', 30, 'Plank 45 seconds', 'Hold a forearm plank with a neutral spine.'),
  ('medium', 50, 'Run or bike 20 minutes', 'Steady cardio at a conversational pace.'),
  ('medium', 50, '45-minute strength session', 'Any structured lifting or resistance workout.'),
  ('medium', 50, '100 jumping jacks + 50 lunges', 'Split sets as needed; finish all reps today.'),
  ('medium', 50, 'Yoga flow 30 minutes', 'Follow a guided flow or your own sequence.'),
  ('medium', 50, 'Meal prep one healthy meal', 'Cook and store one balanced meal for the next day.'),
  ('medium', 50, '10-minute core circuit', 'Mix planks, dead bugs, and bicycle crunches.'),
  ('hard', 100, '5K run or equivalent', 'Complete a 5 km run or 25–30 min hard cardio.'),
  ('hard', 100, '100 push-ups in a day', 'Partition into sets; all reps count for today.'),
  ('hard', 100, 'Leg day: 60-minute session', 'Squats, hinges, and accessories — full session.'),
  ('hard', 100, 'Intervals: 8 x 1 minute hard', 'Warm up, then 8 hard intervals with easy recovery.'),
  ('hard', 100, 'Walk 12,000 steps', 'Reach 12k steps before midnight UTC.'),
  ('hard', 100, 'Swim 1,000 meters', 'Any stroke; breaks allowed.'),
  ('hard', 100, 'Mobility + strength combo 75 min', '45 min strength + 30 min mobility work.');

-- ---------------------------------------------------------------------------
-- Materialize daily rows for a rolling window (UTC). Safe to run repeatedly.
-- ---------------------------------------------------------------------------
SELECT public.ensure_community_daily_challenges (d::date)
FROM generate_series(
  (timezone('utc', now()))::date - 21,
  (timezone('utc', now()))::date + 7,
  '1 day'::interval
) AS g (d);

-- ---------------------------------------------------------------------------
-- Sample completions (historical dates). Trigger normally restricts inserts to
-- today's challenges only; disable briefly so seed can backfill leaderboard data.
-- ---------------------------------------------------------------------------
ALTER TABLE public.user_challenge_completions DISABLE TRIGGER trg_enforce_challenge_completion;

WITH
  u AS (
    SELECT id
    FROM public.users
    WHERE is_active = true
    ORDER BY created_at
    LIMIT 8
  ),
  dc AS (
    SELECT
      d.id,
      d.challenge_date,
      d.points
    FROM public.community_daily_challenges d
    WHERE d.challenge_date BETWEEN (timezone('utc', now()))::date - 14
      AND (timezone('utc', now()))::date
  ),
  pairs AS (
    SELECT
      u.id AS user_id,
      dc.id AS challenge_id,
      dc.points AS points_earned,
      (
        dc.challenge_date::timestamp AT TIME ZONE 'UTC'
      ) + (
        (abs(hashtext(u.id::text || dc.id::text)) % 720) * interval '1 minute'
      ) AS completed_at
    FROM u
    CROSS JOIN dc
    WHERE (abs(hashtext(u.id::text || dc.id::text)) % 4) = 0
  )
INSERT INTO public.user_challenge_completions (
  user_id,
  challenge_id,
  points_earned,
  completed_at
)
SELECT
  p.user_id,
  p.challenge_id,
  p.points_earned,
  p.completed_at
FROM pairs p
ON CONFLICT (user_id, challenge_id) DO NOTHING;

ALTER TABLE public.user_challenge_completions ENABLE TRIGGER trg_enforce_challenge_completion;

-- ---------------------------------------------------------------------------
-- Sample bios for first few users
-- ---------------------------------------------------------------------------
UPDATE public.users
SET bio = CASE 
  WHEN username = 'admin' THEN 'Official My Coach administrator. Here to help you reach your goals!'
  ELSE 'Fitness enthusiast and community member since ' || created_at::date::text
END
WHERE id IN (SELECT id FROM public.users LIMIT 10);

-- ---------------------------------------------------------------------------
-- Sample comments and reactions
-- ---------------------------------------------------------------------------
WITH 
  recent_completions AS (
    SELECT user_id, challenge_id 
    FROM public.user_challenge_completions 
    ORDER BY completed_at DESC 
    LIMIT 20
  ),
  random_commenters AS (
    SELECT id FROM public.users WHERE is_active = true ORDER BY random() LIMIT 5
  )
INSERT INTO public.community_comments (user_id, challenge_id, content)
SELECT 
  (SELECT id FROM random_commenters OFFSET (floor(random()*5)) LIMIT 1),
  challenge_id,
  CASE (floor(random()*4))::int
    WHEN 0 THEN 'Great work! Keep it up!'
    WHEN 1 THEN 'That was a tough one today.'
    WHEN 2 THEN 'Feeling the burn after this!'
    ELSE 'Let''s goooo! 🔥'
  END
FROM recent_completions
LIMIT 10;

INSERT INTO public.community_reactions (user_id, challenge_id, reaction_type)
SELECT 
  (SELECT id FROM public.users WHERE is_active = true ORDER BY random() LIMIT 1),
  challenge_id,
  'like'
FROM recent_completions
ON CONFLICT DO NOTHING;

