-- tables and database structure
drop schema IF EXISTS private cascade;

drop type if exists user_role ;
drop type if exists user_fitness_goal;
drop type if exists user_fitness_level;

create schema private;

create type user_role as enum ('user', 'admin');
create type user_fitness_goal as enum ('lose_weight', 'build_muscle','improve_endurance','stay_fit');
create type user_fitness_level as enum ('beginner', 'intermediate','advanced');

CREATE TABLE private.users (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    email text unique not null,
    password_hash text,
    first_name text,
    last_name text,
    avatar_url text,
    role user_role default 'user',
    fitness_goal user_fitness_goal,
    fitness_level user_fitness_level,
    starting_weight decimal,
    current_weight decimal,
    is_active boolean,
    created_at timestamp,
    updated_at timestamp
);

\dt private.users;
