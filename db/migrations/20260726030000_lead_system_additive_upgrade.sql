/*
  # Lead System Additive Upgrade — Phase 1
  Project: nlqsvzbtbspflyozrvds
  DO NOT EXECUTE VIA MCP. Run manually in Supabase SQL Editor after review.

  This migration is purely additive — no existing columns, rows, or policies are removed.
  Existing production state:
    - public.admins: id (uuid), created_at, name — 3 rows
    - public.leads: id (uuid), created_at, name, phone, email, service_name,
                    message, landing_page, page_path, referrer, status — 11 rows
    - public.lead_notes: id, lead_id (uuid), body, created_by (uuid),
                        created_at, updated_at — 4 rows
*/

-- ─────────────────────────────────────────────────────────────
-- A. public.admins — add role column
-- ─────────────────────────────────────────────────────────────

ALTER TABLE public.admins
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'admin';

ALTER TABLE public.admins
  DROP CONSTRAINT IF EXISTS admins_role_check;

ALTER TABLE public.admins
  ADD CONSTRAINT admins_role_check CHECK (role IN ('owner', 'admin'));

-- Idempotently set known administrators
INSERT INTO public.admins (id, name, role) VALUES
  ('477e1aff-225e-40c9-8836-6272b011169f', 'Steven', 'owner'),
  ('b3231644-e350-4087-a0a8-9ec011494182', 'Josh',   'admin'),
  ('aac76f39-6876-4a76-8e0f-3c973bfe48e0', 'Heber',  'admin')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role;

-- ─────────────────────────────────────────────────────────────
-- B. public.leads — add columns (all additive, existing rows stay valid)
-- ─────────────────────────────────────────────────────────────

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS property_zip text,
  ADD COLUMN IF NOT EXISTS normalized_phone text,
  ADD COLUMN IF NOT EXISTS quality text NOT NULL DEFAULT 'unreviewed',
  ADD COLUMN IF NOT EXISTS spam_score integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS spam_reasons text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS duplicate_of uuid NULL REFERENCES public.leads(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS last_contacted_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS follow_up_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS reviewed_by uuid NULL REFERENCES public.admins(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS service_area_status text NOT NULL DEFAULT 'unknown';

-- Quality constraint
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_quality_check;
ALTER TABLE public.leads
  ADD CONSTRAINT leads_quality_check CHECK (quality IN (
    'unreviewed', 'likely_customer', 'qualified', 'needs_review',
    'solicitation', 'spam', 'duplicate', 'test', 'out_of_area'
  ));

-- Service-area constraint
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_service_area_status_check;
ALTER TABLE public.leads
  ADD CONSTRAINT leads_service_area_status_check CHECK (service_area_status IN (
    'inside', 'bordering', 'outside', 'unknown'
  ));

-- ─────────────────────────────────────────────────────────────
-- C. Lead pipeline statuses — expand CHECK, keep legacy 'closed'
-- ─────────────────────────────────────────────────────────────

ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_status_check;
ALTER TABLE public.leads
  ADD CONSTRAINT leads_status_check CHECK (status IN (
    'new', 'contacted', 'inspection_scheduled', 'quoted',
    'won', 'lost', 'closed', 'archived'
  ));

-- ─────────────────────────────────────────────────────────────
-- D. public.lead_events — additive event-history table
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.lead_events (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id     uuid        NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  event_type  text        NOT NULL,
  old_value   text        NULL,
  new_value   text        NULL,
  created_by  uuid        NULL REFERENCES public.admins(id) ON DELETE SET NULL,
  metadata    jsonb       NOT NULL DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lead_events_lead_id_idx    ON public.lead_events (lead_id);
CREATE INDEX IF NOT EXISTS lead_events_created_at_idx ON public.lead_events (created_at DESC);
CREATE INDEX IF NOT EXISTS lead_events_event_type_idx ON public.lead_events (event_type);

ALTER TABLE public.lead_events ENABLE ROW LEVEL SECURITY;

-- Admin-only SELECT
CREATE POLICY "Admins can read lead events"
  ON public.lead_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.admins WHERE admins.id = auth.uid())
  );

-- Admin-only INSERT
CREATE POLICY "Admins can insert lead events"
  ON public.lead_events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.admins WHERE admins.id = auth.uid())
  );

-- Admin-only UPDATE
CREATE POLICY "Admins can update lead events"
  ON public.lead_events FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.admins WHERE admins.id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.admins WHERE admins.id = auth.uid())
  );

GRANT SELECT, INSERT, UPDATE ON public.lead_events TO authenticated;

-- ─────────────────────────────────────────────────────────────
-- E. public.lead_submission_attempts — server-only rate-limit table
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.lead_submission_attempts (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash         text        NOT NULL,
  attempted_at    timestamptz NOT NULL DEFAULT now(),
  accepted        boolean     NOT NULL DEFAULT false,
  rejection_reason text       NULL
);

CREATE INDEX IF NOT EXISTS lead_submission_attempts_ip_hash_idx
  ON public.lead_submission_attempts (ip_hash);
CREATE INDEX IF NOT EXISTS lead_submission_attempts_attempted_at_idx
  ON public.lead_submission_attempts (attempted_at DESC);

ALTER TABLE public.lead_submission_attempts ENABLE ROW LEVEL SECURITY;

-- No client policies — service-role only

-- ─────────────────────────────────────────────────────────────
-- F. Useful indexes on leads
-- ─────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS leads_normalized_phone_idx ON public.leads (normalized_phone);
CREATE INDEX IF NOT EXISTS leads_quality_idx          ON public.leads (quality);
CREATE INDEX IF NOT EXISTS leads_follow_up_at_idx     ON public.leads (follow_up_at);
CREATE INDEX IF NOT EXISTS leads_property_zip_idx     ON public.leads (property_zip);
CREATE INDEX IF NOT EXISTS leads_created_at_idx       ON public.leads (created_at DESC);
CREATE INDEX IF NOT EXISTS leads_status_idx           ON public.leads (status);
