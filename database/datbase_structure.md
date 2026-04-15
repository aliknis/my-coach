# Database Structure

---

## Tables Overview

| Table           | Description                             |
| --------------- | --------------------------------------- |
| `users`         | Accounts and basic profile              |
| `programs`      | Pre-made training programs              |
| `user_progress` | Enrolled programs and current progress  |
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
| Workouts Completed | Count rows in `user_progress` where `is_active = false` per user |
| Active Programs    | Count rows in `user_progress` where `is_active = true` per user  |
| Days Streak        | Consecutive distinct `updated_at` dates in `user_progress`       |
| Kg Lost            | `users.starting_weight` minus `users.current_weight`             |

---

## Relationships

```
users
 ├── user_progress (1:N) ──→ programs
 ├── nutrition     (1:N)
 └── orders        (1:N) ──→ products
```