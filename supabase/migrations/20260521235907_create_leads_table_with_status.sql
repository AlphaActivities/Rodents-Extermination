/*
  # Create leads table with status system

  1. New Tables
    - `leads`
      - `id` (bigserial, primary key)
      - `created_at` (timestamptz, default now())
      - `name` (text, not null)
      - `phone` (text, not null)
      - `email` (text, nullable)
      - `service_name` (text, nullable) — which service the lead inquired about
      - `message` (text, nullable) — free-form message from contact form
      - `landing_page` (text, nullable) — full URL of the page the lead came from
      - `page_path` (text, nullable) — path portion of the landing page URL
      - `referrer` (text, nullable) — HTTP referrer
      - `status` (text, not null, default 'new') — workflow status

  2. Constraints
    - `leads_status_check` — enforces only known status values

  3. Security
    - Enable RLS on `leads` table
    - Authenticated users (admins) can SELECT, UPDATE leads
    - Public (anon) can INSERT leads — this is needed for the contact form
    - No public SELECT or UPDATE

  4. Notes
    - The contact form on the public site inserts rows via the anon key
    - Admin dashboard reads and updates rows via authenticated session
    - RLS ensures anon users cannot read or update existing leads
*/

CREATE TABLE IF NOT EXISTS leads (
  id          bigserial PRIMARY KEY,
  created_at  timestamptz NOT NULL DEFAULT now(),
  name        text        NOT NULL,
  phone       text        NOT NULL,
  email       text,
  service_name text,
  message     text,
  landing_page text,
  page_path   text,
  referrer    text,
  status      text        NOT NULL DEFAULT 'new'
);

ALTER TABLE leads
  ADD CONSTRAINT leads_status_check
  CHECK (status IN ('new', 'contacted', 'quoted', 'closed', 'archived'));

-- Performance index on created_at for newest-first queries
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads (created_at DESC);

-- Index on status for filter queries
CREATE INDEX IF NOT EXISTS leads_status_idx ON leads (status);

-- ── Row Level Security ────────────────────────────────────────

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Authenticated users (admins) can read all leads
CREATE POLICY "Authenticated users can read leads"
  ON leads FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users (admins) can update leads (e.g. change status)
CREATE POLICY "Authenticated users can update leads"
  ON leads FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Anonymous users (public contact form) can insert new leads
CREATE POLICY "Anyone can insert a lead"
  ON leads FOR INSERT
  TO anon
  WITH CHECK (true);
