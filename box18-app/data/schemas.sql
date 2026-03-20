create table public.clubs (
  id uuid not null default extensions.uuid_generate_v4 (),
  name text not null,
  short_name text null,
  logo_url text null,
  metadata jsonb null,
  created_at timestamp with time zone null default now(),
  constraint clubs_pkey primary key (id)
) TABLESPACE pg_default;

create table public.leagues (
  id uuid not null default extensions.uuid_generate_v4 (),
  name text not null,
  gender text null,
  age_group text null,
  created_at timestamp with time zone null default now(),
  constraint leagues_pkey primary key (id)
) TABLESPACE pg_default;

create table public.match_events (
  id uuid not null default extensions.uuid_generate_v4 (),
  match_id uuid null,
  team_id uuid null,
  player_id uuid null,
  event_type text null,
  minute text null,
  description text null,
  created_at timestamp with time zone null default now(),
  constraint match_events_pkey primary key (id),
  constraint match_events_match_id_fkey foreign KEY (match_id) references matches (id),
  constraint match_events_player_id_fkey foreign KEY (player_id) references players (id),
  constraint match_events_team_id_fkey foreign KEY (team_id) references teams (id)
) TABLESPACE pg_default;

create table public.match_rosters (
  id uuid not null default extensions.uuid_generate_v4 (),
  match_id uuid null,
  team_id uuid null,
  player_id uuid null,
  jersey_number text null,
  is_starter boolean null default false,
  minutes_played integer null,
  position text null,
  created_at timestamp with time zone null default now(),
  constraint match_rosters_pkey primary key (id),
  constraint match_rosters_match_id_fkey foreign KEY (match_id) references matches (id),
  constraint match_rosters_player_id_fkey foreign KEY (player_id) references players (id),
  constraint match_rosters_team_id_fkey foreign KEY (team_id) references teams (id)
) TABLESPACE pg_default;

create table public.matches (
  id uuid not null default extensions.uuid_generate_v4 (),
  league_id uuid null,
  season_id uuid null,
  date timestamp with time zone null,
  home_team_id uuid null,
  away_team_id uuid null,
  home_score integer null,
  away_score integer null,
  status text null default 'finished'::text,
  video_url text null,
  metadata jsonb null,
  created_at timestamp with time zone null default now(),
  constraint matches_pkey primary key (id),
  constraint matches_home_team_id_away_team_id_date_key unique (home_team_id, away_team_id, date),
  constraint matches_away_team_id_fkey foreign KEY (away_team_id) references teams (id),
  constraint matches_home_team_id_fkey foreign KEY (home_team_id) references teams (id),
  constraint matches_league_id_fkey foreign KEY (league_id) references leagues (id),
  constraint matches_season_id_fkey foreign KEY (season_id) references seasons (id)
) TABLESPACE pg_default;

create table public.players (
  id uuid not null default extensions.uuid_generate_v4 (),
  first_name text null,
  last_name text null,
  full_name text not null,
  dob date null,
  nationality text null,
  preferred_foot text null,
  metadata jsonb null,
  created_at timestamp with time zone null default now(),
  position text null,
  constraint players_pkey primary key (id)
) TABLESPACE pg_default;

create table public.seasons (
  id uuid not null default extensions.uuid_generate_v4 (),
  name text not null,
  start_date date null,
  end_date date null,
  created_at timestamp with time zone null default now(),
  constraint seasons_pkey primary key (id)
) TABLESPACE pg_default;

create table public.teams (
  id uuid not null default extensions.uuid_generate_v4 (),
  club_id uuid null,
  name text not null,
  gender text null,
  level text null,
  metadata jsonb null,
  created_at timestamp with time zone null default now(),
  constraint teams_pkey primary key (id),
  constraint teams_club_id_fkey foreign KEY (club_id) references clubs (id)
) TABLESPACE pg_default;