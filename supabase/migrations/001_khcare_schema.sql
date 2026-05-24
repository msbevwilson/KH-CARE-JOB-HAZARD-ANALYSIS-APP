-- KH CARE schema migration
-- Run this in: Supabase Dashboard → SQL Editor → New query → paste → Run

-- ─── Users ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS khcare_users (
  id            TEXT        PRIMARY KEY,
  name          TEXT        NOT NULL,
  initials      TEXT        NOT NULL,
  email         TEXT        NOT NULL UNIQUE,
  role          TEXT        NOT NULL CHECK (role IN ('Admin', 'Supervisor', 'Worker')),
  password_hash TEXT        NOT NULL,
  must_change_password BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Kingdom Halls ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS khcare_halls (
  id              TEXT        PRIMARY KEY,
  name            TEXT        NOT NULL UNIQUE,
  address         TEXT,
  phone           TEXT,
  gps_coordinates TEXT,
  congregation    JSONB       NOT NULL DEFAULT '[]',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Job Hazard Analyses ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS khcare_jhas (
  ref          TEXT        PRIMARY KEY,
  job          TEXT        NOT NULL,
  submitted_by TEXT        NOT NULL,
  supervisor   TEXT,
  site         TEXT        NOT NULL,  -- stores the Kingdom Hall name
  date         TEXT        NOT NULL,
  iso_date     TEXT,
  status       TEXT        NOT NULL CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  risk         TEXT        NOT NULL CHECK (risk IN ('Low', 'Medium', 'High')),
  steps        JSONB       NOT NULL DEFAULT '[]',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS khcare_users_email_idx  ON khcare_users (email);
CREATE INDEX IF NOT EXISTS khcare_jhas_site_idx    ON khcare_jhas  (site);
CREATE INDEX IF NOT EXISTS khcare_jhas_status_idx  ON khcare_jhas  (status);
CREATE INDEX IF NOT EXISTS khcare_jhas_created_idx ON khcare_jhas  (created_at DESC);
