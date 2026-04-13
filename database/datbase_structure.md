# Database Structure

---

## Tables Overview

| Table           | Description                             |
| --------------- | --------------------------------------- |
| `users`         | Accounts and basic profile              |
| `programs`      | Pre-made training programs              |
| `user_progress`                 | Enrolled programs and current progress (optional / legacy) |
| `user_program_progress_history` | Timeline of progress per user per program (one row per day logged) |
| `nutrition`     | Nutrition plans and daily user tracking |
| `products`      | Equipment and supplement shop items     |
| `orders`        | User purchases                          |

---

## users

| Column          | Type         | Details                                                        |
| --------------- | ------------ | -------------------------------------------------------------- |
| id              | INT          | Primary key                                                    |
| email           | VARCHAR(255) | Unique, required                                               |
| password_hash   | VARCHAR(255) | Required                                                       |
| first_name      | VARCHAR(100) |                                                                |
| last_name       | VARCHAR(100) |                                                                |
| avatar_url      | VARCHAR(500) |                                                                |
| role            | ENUM         | `user`, `admin` — default: user                                |
| fitness_goal    | ENUM         | `lose_weight`, `build_muscle`, `improve_endurance`, `stay_fit` |
| fitness_level   | ENUM         | `beginner`, `intermediate`, `advanced`                         |
| starting_weight | DECIMAL      | Used to compute kg lost                                        |
| current_weight  | DECIMAL      | Updated on each weigh-in                                       |
| is_active       | BOOLEAN      | Default: true                                                  |
| created_at      | TIMESTAMP    |                                                                |
| updated_at      | TIMESTAMP    |                                                                |

---

## programs

| Column         | Type         | Details                                                        |
| -------------- | ------------ | -------------------------------------------------------------- |
| id             | INT          | Primary key                                                    |
| title          | VARCHAR(255) | Required                                                       |
| description    | TEXT         |                                                                |
| cover_image    | VARCHAR(500) |                                                                |
| schedule_image | VARCHAR(500) | Image showing the weekly schedule                              |
| level          | ENUM         | `beginner`, `intermediate`, `advanced`                         |
| goal           | ENUM         | `lose_weight`, `build_muscle`, `improve_endurance`, `stay_fit` |
| duration_weeks | INT          | Total number of weeks                                          |
| days_per_week  | INT          | Workouts per week                                              |
| progress_mode  | text         | `sessions` (default) = day-by-day steps; `cumulative_reps` = rep total stored in `user_program_progress_history.completed_day_index` up to `duration_weeks × days_per_week` |
| is_published   | BOOLEAN      | Default: false                                                 |
| created_at     | TIMESTAMP    |                                                                |
| updated_at     | TIMESTAMP    |                                                                |

---

## user_progress

| Column       | Type      | Details              |
| ------------ | --------- | -------------------- |
| id           | INT       | Primary key          |
| user_id      | INT       | FK → users           |
| program_id   | INT       | FK → programs        |
| started_at   | DATE      |                      |
| completed_at | DATE      | Null if still active |
| is_active    | BOOLEAN   | Default: true        |
| current_week | INT       | Default: 1           |
| current_day  | INT       | Default: 1           |
| created_at   | TIMESTAMP |                      |
| updated_at   | TIMESTAMP |                      |

---

## user_program_progress_history

Stores a **history** of how far each user has progressed in each program. At most one row per `(user_id, program_id, enrollment_id, progress_date)` (unique constraint). A user can enroll in the same program multiple times — each attempt gets a new `enrollment_id`. The progress tracking UI reads this table to compute current week/day, percent complete, streaks, and weekly activity.

| Column                 | Type      | Details |
| ---------------------- | --------- | ------- |
| id                     | BIGINT    | Primary key (identity) |
| user_id                | UUID      | FK → `users.id`, RLS: user can only access own rows |
| program_id             | BIGINT    | FK → `programs.id` |
| enrollment_id          | INT       | Enrollment attempt number (default: 1). Allows the same user to do the same program multiple times. |
| progress_date          | DATE      | Calendar day the progress was recorded (used for streaks) |
| completed_week         | INT       | Week number reached (≥ 1) |
| completed_day          | INT       | Day-in-week reached (≥ 1) |
| completed_day_index    | INT       | Absolute position: `(completed_week - 1) * days_per_week + completed_day` |
| meta                   | JSONB     | Optional app metadata |
| created_at             | TIMESTAMPTZ | Default: now() |

**Formula:** `completed_day_index` should match the program's `days_per_week` from `programs`, e.g. for `days_per_week = 4`, week 2 day 1 → index `(2-1)*4 + 1 = 5`.

**Multiple enrollments:** When restarting a completed challenge, the JS creates a new row with `enrollment_id = max + 1` and `completed_day_index = 0`. The UI always reads the latest enrollment per program.

---

## nutrition

| Column          | Type         | Details                                                  |
| --------------- | ------------ | -------------------------------------------------------- |
| id              | INT          | Primary key                                              |
| user_id         | INT          | FK → users (null if admin plan)                          |
| type            | ENUM         | `plan` (admin-created), `log` (user daily entry)         |
| title           | VARCHAR(255) | For plans                                                |
| goal            | ENUM         | `lose_weight`, `build_muscle`, `maintain`, `performance` |
| calories_target | INT          | Daily calorie target                                     |
| protein_g       | INT          |                                                          |
| carbs_g         | INT          |                                                          |
| fats_g          | INT          |                                                          |
| meals_image     | VARCHAR(500) | Image showing the meal breakdown                         |
| log_date        | DATE         | For user logs only                                       |
| is_published    | BOOLEAN      | For plans only — default: false                          |
| created_at      | TIMESTAMP    |                                                          |

---

## products

| Column      | Type         | Details                   |
| ----------- | ------------ | ------------------------- |
| id          | INT          | Primary key               |
| name        | VARCHAR(255) | Required                  |
| category    | ENUM         | `equipment`, `supplement` |
| description | TEXT         |                           |
| price       | DECIMAL      | Required                  |
| stock_qty   | INT          | Default: 0                |
| image_url   | VARCHAR(500) |                           |
| is_active   | BOOLEAN      | Default: true             |
| created_at  | TIMESTAMP    |                           |
| updated_at  | TIMESTAMP    |                           |

---

## orders

| Column     | Type      | Details                                                |
| ---------- | --------- | ------------------------------------------------------ |
| id         | INT       | Primary key                                            |
| user_id    | INT       | FK → users                                             |
| product_id | INT       | FK → products                                          |
| quantity   | INT       | Default: 1                                             |
| unit_price | DECIMAL   | Price at time of purchase                              |
| status     | ENUM      | `pending`, `paid`, `shipped`, `delivered`, `cancelled` |
| created_at | TIMESTAMP |                                                        |
| updated_at | TIMESTAMP |                                                        |

---

## Stats — How They Are Computed

| Stat               | Source                                                           |
| ------------------ | ---------------------------------------------------------------- |
| Workouts Completed | Progress UI: count of `user_program_progress_history` rows in the current month (by `progress_date`). Legacy: inactive rows in `user_progress`. |
| Active Programs    | Progress UI: programs not yet completed from latest history (progress below 100%). Legacy: active rows in `user_progress`. |
| Days Streak        | Progress UI: consecutive distinct `progress_date` values in `user_program_progress_history` for the user. Legacy: `user_progress.updated_at`. |
| Kg Lost            | `users.starting_weight` minus `users.current_weight`             |

---

## Relationships

```
users
 ├── user_progress (1:N) ──→ programs
 ├── user_program_progress_history (1:N) ──→ programs
 ├── nutrition     (1:N)
 └── orders        (1:N) ──→ products
```
