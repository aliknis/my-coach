
-- =====================================================
-- SEED: 5 Training Programs (KISS - single file, copy/paste)
-- =====================================================

-- 1. Body Part Specialization (build_muscle / advanced)
INSERT INTO public.programs (
  title, description, goal, level, days_per_week, duration_weeks, is_published, details_html
) VALUES (
  'Body Part Specialization',
  'A specialization plan that allocates extra weekly volume to lagging muscle groups while maintaining overall balance.',
  'build_muscle',
  'advanced',
  6,
  8,
  true,
  $html$
<div class="program-section">
  <h3>Program Overview</h3>
  <div class="overview-grid">
    <div class="overview-item"><strong>Best for:</strong> Advanced trainees targeting weak points</div>
    <div class="overview-item"><strong>Frequency:</strong> 5-6 days/week</div>
    <div class="overview-item"><strong>Session duration:</strong> 45-60 minutes</div>
    <div class="overview-item"><strong>Main focus:</strong> Targeted muscle improvement and symmetry</div>
  </div>
</div>

<br>
<div class="program-section">
  <h3>Suggested Weekly Structure</h3>
  <ul class="weekly-structure">
    <li><strong>Day 1:</strong> Chest focus</li>
    <li><strong>Day 2:</strong> Back focus</li>
    <li><strong>Day 3:</strong> Legs focus</li>
    <li><strong>Day 4:</strong> Shoulders focus</li>
    <li><strong>Day 5:</strong> Arms focus</li>
  </ul>
</div>

<br>
<div class="program-section">
  <h3>Recommended Core Exercises</h3>
  <div class="exercise-tags">
    <span class="exercise-tag">Isolation Supersets</span>
    <span class="exercise-tag">Drop Sets</span>
    <span class="exercise-tag">Machine Press Variations</span>
    <span class="exercise-tag">Cable Rows</span>
    <span class="exercise-tag">Single-leg work</span>
    <span class="exercise-tag">Lateral Raises</span>
  </div>
</div>

<br>
<div class="program-section">
  <h3>Coaching Tips</h3>
  <ul class="coaching-tips">
    <li>Cap weekly hard sets to avoid overtraining</li>
    <li>Use periodized intensity blocks</li>
    <li>Rotate exercises every 4-6 weeks</li>
  </ul>
</div>
$html$
);

-- 2. Bro Split (Upper/Lower) (build_muscle / intermediate)
INSERT INTO public.programs (
  title, description, goal, level, days_per_week, duration_weeks, is_published, details_html
) VALUES (
  'Bro Split (Upper/Lower)',
  'A high-volume split with dedicated sessions for upper and lower body, emphasizing muscle isolation and recovery.',
  'build_muscle',
  'intermediate',
  4,
  8,
  true,
  $html$
<div class="program-section">
  <h3>Program Overview</h3>
  <div class="overview-grid">
    <div class="overview-item"><strong>Best for:</strong> Experienced lifters focused on hypertrophy</div>
    <div class="overview-item"><strong>Frequency:</strong> 4-5 days/week</div>
    <div class="overview-item"><strong>Session duration:</strong> 60-75 minutes</div>
    <div class="overview-item"><strong>Main focus:</strong> Hypertrophy and muscle detail</div>
  </div>
</div>

<br>
<div class="program-section">
  <h3>Suggested Weekly Structure</h3>
  <ul class="weekly-structure">
    <li><strong>Day 1:</strong> Upper Body</li>
    <li><strong>Day 2:</strong> Lower Body</li>
    <li><strong>Day 3:</strong> Rest</li>
    <li><strong>Day 4:</strong> Upper Body</li>
    <li><strong>Day 5:</strong> Lower Body</li>
  </ul>
</div>

<div class="program-section">
  <h3>Recommended Core Exercises</h3>
  <div class="exercise-tags">
    <span class="exercise-tag">Incline Press</span>
    <span class="exercise-tag">Cable Fly</span>
    <span class="exercise-tag">Leg Press</span>
    <span class="exercise-tag">Hack Squat</span>
    <span class="exercise-tag">Weighted Dip</span>
    <span class="exercise-tag">Seated Row</span>
  </div>
</div>

<br>
<div class="program-section">
  <h3>Coaching Tips</h3>
  <ul class="coaching-tips">
    <li>Use controlled tempo on isolations</li>
    <li>Keep rest periods 60-90 seconds</li>
    <li>Prioritize weak muscle groups first</li>
  </ul>
</div>
$html$
);

-- 3. Arnold Split (build_muscle / advanced)
INSERT INTO public.programs (
  title, description, goal, level, days_per_week, duration_weeks, is_published, details_html
) VALUES (
  'Arnold Split',
  'Classic six-day split pairing chest/back, shoulders/arms, and legs to train each area twice weekly.',
  'build_muscle',
  'advanced',
  6,
  8,
  true,
  $html$
<div class="program-section">
  <h3>Program Overview</h3>
  <div class="overview-grid">
    <div class="overview-item"><strong>Best for:</strong> Intermediate and advanced bodybuilders</div>
    <div class="overview-item"><strong>Frequency:</strong> 6 days/week</div>
    <div class="overview-item"><strong>Session duration:</strong> 60-75 minutes</div>
    <div class="overview-item"><strong>Main focus:</strong> Balanced hypertrophy and training density</div>
  </div>
</div>

<br>
<div class="program-section">
  <h3>Suggested Weekly Structure</h3>
  <ul class="weekly-structure">
    <li><strong>Day 1:</strong> Chest + Back</li>
    <li><strong>Day 2:</strong> Shoulders + Arms</li>
    <li><strong>Day 3:</strong> Legs</li>
    <li><strong>Day 4-6:</strong> Repeat sequence</li>
    <li><strong>Day 7:</strong> Rest</li>
  </ul>
</div>

<br>
<div class="program-section">
  <h3>Recommended Core Exercises</h3>
  <div class="exercise-tags">
    <span class="exercise-tag">Bench Press</span>
    <span class="exercise-tag">Barbell Row</span>
    <span class="exercise-tag">Military Press</span>
    <span class="exercise-tag">Barbell Curl</span>
    <span class="exercise-tag">Hack Squat</span>
    <span class="exercise-tag">Dumbbell Fly</span>
  </div>
</div>

<br>
<div class="program-section">
  <h3>Coaching Tips</h3>
  <ul class="coaching-tips">
    <li>Pair antagonistic movements efficiently</li>
    <li>Control total weekly volume</li>
    <li>Prioritize sleep and nutrition</li>
  </ul>
</div>
$html$
);

-- 4. Cardio & Running (improve_endurance / beginner)
INSERT INTO public.programs (
  title, description, goal, level, days_per_week, duration_weeks, is_published, details_html
) VALUES (
  'Cardio & Running',
  'Structured cardio sessions centered on running, intervals, and low-impact conditioning for endurance gains.',
  'improve_endurance',
  'beginner',
  3,
  6,
  true,
  $html$
<div class="program-section">
  <h3>Program Overview</h3>
  <div class="overview-grid">
    <div class="overview-item"><strong>Best for:</strong> Improving cardiovascular health and endurance</div>
    <div class="overview-item"><strong>Frequency:</strong> 3-4 days/week</div>
    <div class="overview-item"><strong>Session duration:</strong> 30-60 minutes</div>
    <div class="overview-item"><strong>Main focus:</strong> Endurance, heart health, and stamina</div>
  </div>
</div>

<br>
<div class="program-section">
  <h3>Suggested Weekly Structure</h3>
  <ul class="weekly-structure">
    <li><strong>Day 1:</strong> Easy steady cardio</li>
    <li><strong>Day 2:</strong> Rest or light mobility</li>
    <li><strong>Day 3:</strong> Interval session</li>
    <li><strong>Day 4:</strong> Rest</li>
    <li><strong>Day 5:</strong> Tempo or long easy run</li>
  </ul>
</div>

<br>
<div class="program-section">
  <h3>Recommended Core Exercises</h3>
  <div class="exercise-tags">
    <span class="exercise-tag">Steady Running</span>
    <span class="exercise-tag">Sprint Intervals</span>
    <span class="exercise-tag">Jump Rope</span>
    <span class="exercise-tag">Stair Climbing</span>
    <span class="exercise-tag">Shadow Boxing</span>
    <span class="exercise-tag">Agility Drills</span>
  </div>
</div>

<br>
<div class="program-section">
  <h3>Coaching Tips</h3>
  <ul class="coaching-tips">
    <li>Increase total volume gradually</li>
    <li>Keep easy runs truly easy</li>
    <li>Use proper footwear and recover well</li>
  </ul>
</div>
$html$
);

-- 5. Bodyweight Basics (stay_fit / beginner)
INSERT INTO public.programs (
  title, description, goal, level, days_per_week, duration_weeks, is_published, details_html
) VALUES (
  'Bodyweight Basics',
  'No-equipment plan using bodyweight fundamentals to build strength, endurance, and mobility at home.',
  'stay_fit',
  'beginner',
  3,
  4,
  true,
  $html$
<div class="program-section">
  <h3>Program Overview</h3>
  <div class="overview-grid">
    <div class="overview-item"><strong>Best for:</strong> Beginners or anyone training with no equipment</div>
    <div class="overview-item"><strong>Frequency:</strong> 3-4 days/week</div>
    <div class="overview-item"><strong>Session duration:</strong> 30-45 minutes</div>
    <div class="overview-item"><strong>Main focus:</strong> Movement quality and general conditioning</div>
  </div>
</div>

<br>
<div class="program-section">
  <h3>Suggested Weekly Structure</h3>
  <ul class="weekly-structure">
    <li><strong>Day 1:</strong> Push + Core</li>
    <li><strong>Day 2:</strong> Legs + Mobility</li>
    <li><strong>Day 3:</strong> Rest</li>
    <li><strong>Day 4:</strong> Pull alternatives + Conditioning</li>
  </ul>
</div>

<br>
<div class="program-section">
  <h3>Recommended Core Exercises</h3>
  <div class="exercise-tags">
    <span class="exercise-tag">Push-up</span>
    <span class="exercise-tag">Bodyweight Squat</span>
    <span class="exercise-tag">Lunge</span>
    <span class="exercise-tag">Plank</span>
    <span class="exercise-tag">Mountain Climber</span>
    <span class="exercise-tag">Glute Bridge</span>
  </div>
</div>

<br>
<div class="program-section">
  <h3>Coaching Tips</h3>
  <ul class="coaching-tips">
    <li>Master form before harder progressions</li>
    <li>Use tempo to increase intensity</li>
    <li>Keep sessions consistent each week</li>
  </ul>
</div>
$html$
);

-- 1. High-Protein Muscle Gain (build_muscle / advanced / standard)
INSERT INTO public.nutrition (
  title, description, details_html, goal, dietary_pref, calories_target, protein_g, carbs_g, fats_g, is_published
) VALUES (
  'High-Protein Muscle Gain',
  'A high-protein, calorie-surplus plan designed to support muscle growth and recovery for advanced trainees.',
  $html$
<div class="program-section">
  <h3>Nutrition Overview</h3>
  <div class="overview-grid">
    <div class="overview-item"><strong>Best for:</strong> Advanced lifters in a bulking phase</div>
    <div class="overview-item"><strong>Calories:</strong> 3,000-3,500 kcal/day</div>
    <div class="overview-item"><strong>Protein:</strong> 1.2-1.5g per lb of body weight</div>
    <div class="overview-item"><strong>Main focus:</strong> Muscle hypertrophy and recovery</div>
  </div>
</div>

<br>
<div class="program-section">
  <h3>Suggested Meal Structure</h3>
  <ul class="weekly-structure">
    <li><strong>Meal 1:</strong> Oats, whey protein, banana, almond butter</li>
    <li><strong>Meal 2:</strong> Grilled chicken, quinoa, steamed broccoli, olive oil</li>
    <li><strong>Meal 3:</strong> Lean beef, sweet potato, spinach salad</li>
    <li><strong>Meal 4:</strong> Greek yogurt, mixed nuts, berries</li>
    <li><strong>Meal 5:</strong> Salmon, brown rice, asparagus</li>
  </ul>
</div>

<br>
<div class="program-section">
  <h3>Recommended Foods</h3>
  <div class="exercise-tags">
    <span class="exercise-tag">Chicken Breast</span>
    <span class="exercise-tag">Eggs</span>
    <span class="exercise-tag">Salmon</span>
    <span class="exercise-tag">Quinoa</span>
    <span class="exercise-tag">Almonds</span>
    <span class="exercise-tag">Greek Yogurt</span>
  </div>
</div>

<br>
<div class="program-section">
  <h3>Coaching Tips</h3>
  <ul class="coaching-tips">
    <li>Prioritize protein at every meal</li>
    <li>Hydrate with at least 1 gallon of water daily</li>
    <li>Adjust calories weekly based on progress</li>
  </ul>
</div>
$html$,
  'build_muscle',
  'standard',
  3250,
  200,
  300,
  80,
  true
);

---
-- 2. Balanced Cutting Diet (lose_weight / intermediate / standard)
INSERT INTO public.nutrition (
  title, description, details_html, goal, dietary_pref, calories_target, protein_g, carbs_g, fats_g, is_published
) VALUES (
  'Balanced Cutting Diet',
  'A moderate-calorie deficit plan with balanced macros to preserve muscle while losing weight.',
  $html$
<div class="program-section">
  <h3>Nutrition Overview</h3>
  <div class="overview-grid">
    <div class="overview-item"><strong>Best for:</strong> Intermediate trainees in a cutting phase</div>
    <div class="overview-item"><strong>Calories:</strong> 1,800-2,200 kcal/day</div>
    <div class="overview-item"><strong>Protein:</strong> 1g per lb of body weight</div>
    <div class="overview-item"><strong>Main focus:</strong> Fat loss with muscle retention</div>
  </div>
</div>

<br>
<div class="program-section">
  <h3>Suggested Meal Structure</h3>
  <ul class="weekly-structure">
    <li><strong>Meal 1:</strong> Scrambled eggs, avocado, whole-grain toast</li>
    <li><strong>Meal 2:</strong> Grilled turkey, brown rice, green beans</li>
    <li><strong>Meal 3:</strong> Tuna salad, mixed greens, olive oil dressing</li>
    <li><strong>Meal 4:</strong> Cottage cheese, walnuts, apple</li>
  </ul>
</div>

<br>
<div class="program-section">
  <h3>Recommended Foods</h3>
  <div class="exercise-tags">
    <span class="exercise-tag">Turkey Breast</span>
    <span class="exercise-tag">Egg Whites</span>
    <span class="exercise-tag">Tuna</span>
    <span class="exercise-tag">Brown Rice</span>
    <span class="exercise-tag">Avocado</span>
    <span class="exercise-tag">Cottage Cheese</span>
  </div>
</div>

<br>
<div class="program-section">
  <h3>Coaching Tips</h3>
  <ul class="coaching-tips">
    <li>Monitor body weight weekly</li>
    <li>Keep protein high to avoid muscle loss</li>
    <li>Use refeed days to reset metabolism</li>
  </ul>
</div>
$html$,
  'lose_weight',
  'standard',
  2000,
  180,
  150,
  60,
  true
);

---
-- 3. Vegetarian Muscle Builder (build_muscle / intermediate / vegetarian)
INSERT INTO public.nutrition (
  title, description, details_html, goal, dietary_pref, calories_target, protein_g, carbs_g, fats_g, is_published
) VALUES (
  'Vegetarian Muscle Builder',
  'A plant-based, high-protein plan to support muscle growth without meat.',
  $html$
<div class="program-section">
  <h3>Nutrition Overview</h3>
  <div class="overview-grid">
    <div class="overview-item"><strong>Best for:</strong> Vegetarian athletes building muscle</div>
    <div class="overview-item"><strong>Calories:</strong> 2,800-3,200 kcal/day</div>
    <div class="overview-item"><strong>Protein:</strong> 0.8-1g per lb of body weight</div>
    <div class="overview-item"><strong>Main focus:</strong> Plant-based hypertrophy</div>
  </div>
</div>

<br>
<div class="program-section">
  <h3>Suggested Meal Structure</h3>
  <ul class="weekly-structure">
    <li><strong>Meal 1:</strong> Greek yogurt, granola, honey, flaxseeds</li>
    <li><strong>Meal 2:</strong> Lentil curry, quinoa, spinach</li>
    <li><strong>Meal 3:</strong> Chickpea salad, avocado, whole-grain pita</li>
    <li><strong>Meal 4:</strong> Protein smoothie (whey or casein, banana, peanut butter)</li>
    <li><strong>Meal 5:</strong> Cottage cheese, mixed nuts, berries</li>
  </ul>
</div>

<br>
<div class="program-section">
  <h3>Recommended Foods</h3>
  <div class="exercise-tags">
    <span class="exercise-tag">Greek Yogurt</span>
    <span class="exercise-tag">Lentils</span>
    <span class="exercise-tag">Chickpeas</span>
    <span class="exercise-tag">Quinoa</span>
    <span class="exercise-tag">Cottage Cheese</span>
    <span class="exercise-tag">Eggs</span>
  </div>
</div>

<br>
<div class="program-section">
  <h3>Coaching Tips</h3>
  <ul class="coaching-tips">
    <li>Combine dairy and plant protein for complete amino acids</li>
    <li>Track macros to ensure adequate protein intake</li>
    <li>Include healthy fats like nuts and seeds</li>
  </ul>
</div>
$html$,
  'build_muscle',
  'vegetarian',
  3000,
  160,
  350,
  90,
  true
);

---
-- 4. Endurance Athlete Fuel (improve_endurance / advanced / standard)
INSERT INTO public.nutrition (
  title, description, details_html, goal, dietary_pref, calories_target, protein_g, carbs_g, fats_g, is_published
) VALUES (
  'Endurance Athlete Fuel',
  'A carb-focused, nutrient-dense plan to fuel long-duration cardio and recovery.',
  $html$
<div class="program-section">
  <h3>Nutrition Overview</h3>
  <div class="overview-grid">
    <div class="overview-item"><strong>Best for:</strong> Endurance athletes (runners, cyclists)</div>
    <div class="overview-item"><strong>Calories:</strong> 3,000-4,000 kcal/day</div>
    <div class="overview-item"><strong>Carbs:</strong> 4-6g per lb of body weight</div>
    <div class="overview-item"><strong>Main focus:</strong> Sustained energy and recovery</div>
  </div>
</div>

<br>
<div class="program-section">
  <h3>Suggested Meal Structure</h3>
  <ul class="weekly-structure">
    <li><strong>Meal 1:</strong> Oatmeal, banana, almond butter, chia seeds</li>
    <li><strong>Meal 2:</strong> Grilled chicken, sweet potato, steamed veggies</li>
    <li><strong>Meal 3:</strong> Pasta, lean ground turkey, marinara sauce</li>
    <li><strong>Meal 4:</strong> Greek yogurt, granola, honey</li>
    <li><strong>Meal 5:</strong> Salmon, quinoa, roasted Brussels sprouts</li>
    <li><strong>Meal 6:</strong> Protein shake, dates, walnuts</li>
  </ul>
</div>

<br>
<div class="program-section">
  <h3>Recommended Foods</h3>
  <div class="exercise-tags">
    <span class="exercise-tag">Oats</span>
    <span class="exercise-tag">Sweet Potato</span>
    <span class="exercise-tag">Pasta</span>
    <span class="exercise-tag">Salmon</span>
    <span class="exercise-tag">Dates</span>
    <span class="exercise-tag">Quinoa</span>
  </div>
</div>

<br>
<div class="program-section">
  <h3>Coaching Tips</h3>
  <ul class="coaching-tips">
    <li>Carb-load before long sessions</li>
    <li>Hydrate with electrolytes during workouts</li>
    <li>Refuel with carbs + protein within 30 mins post-workout</li>
  </ul>
</div>
$html$,
  'improve_endurance',
  'standard',
  3500,
  150,
  500,
  70,
  true
);

---
-- 5. General Health & Maintenance (stay_fit / beginner / standard)
INSERT INTO public.nutrition (
  title, description, details_html, goal, dietary_pref, calories_target, protein_g, carbs_g, fats_g, is_published
) VALUES (
  'General Health & Maintenance',
  'A simple, balanced plan for beginners or anyone looking to maintain a healthy weight and lifestyle.',
  $html$
<div class="program-section">
  <h3>Nutrition Overview</h3>
  <div class="overview-grid">
    <div class="overview-item"><strong>Best for:</strong> Beginners or maintenance</div>
    <div class="overview-item"><strong>Calories:</strong> 2,000-2,500 kcal/day</div>
    <div class="overview-item"><strong>Macros:</strong> Balanced (40% carbs, 30% protein, 30% fats)</div>
    <div class="overview-item"><strong>Main focus:</strong> Overall health and energy</div>
  </div>
</div>

<br>
<div class="program-section">
  <h3>Suggested Meal Structure</h3>
  <ul class="weekly-structure">
    <li><strong>Meal 1:</strong> Scrambled eggs, whole-grain toast, fruit</li>
    <li><strong>Meal 2:</strong> Grilled chicken, quinoa, roasted veggies</li>
    <li><strong>Meal 3:</strong> Baked salmon, sweet potato, steamed broccoli</li>
  </ul>
</div>

<br>
<div class="program-section">
  <h3>Recommended Foods</h3>
  <div class="exercise-tags">
    <span class="exercise-tag">Eggs</span>
    <span class="exercise-tag">Chicken</span>
    <span class="exercise-tag">Salmon</span>
    <span class="exercise-tag">Quinoa</span>
    <span class="exercise-tag">Sweet Potato</span>
    <span class="exercise-tag">Broccoli</span>
  </div>
</div>

<br>
<div class="program-section">
  <h3>Coaching Tips</h3>
  <ul class="coaching-tips">
    <li>Eat a variety of colors for micronutrients</li>
    <li>Stay hydrated throughout the day</li>
    <li>Listen to your hunger and fullness cues</li>
  </ul>
</div>
$html$,
  'stay_fit',
  'standard',
  2250,
  120,
  225,
  75,
  true
);
