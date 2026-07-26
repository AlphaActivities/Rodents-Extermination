/*
  # Security Cutover Migration — Phase 2 Prerequisite
  Project: nlqsvzbtbspflyozrvds

  *** DO NOT RUN THIS MIGRATION DURING PHASE 1 ***
  Run ONLY after the hardened submit-lead Edge Function has been tested
  and the protected intake is live in production.

  This migration:
    1. Removes anonymous direct INSERT access to public.leads
    2. Removes unnecessary anon grants
    3. Restricts lead SELECT/UPDATE to authenticated admins
    4. Restricts lead_notes access to administrators
    5. Restricts lead_events access to administrators
    6. Preserves Edge Function service-role access (service_role bypasses RLS)
    7. Does not lock out Steven, Josh, or Heber
    8. Does not change existing rows
    9. Does not run until Phase 2 verification is complete
*/

-- ─────────────────────────────────────────────────────────────
-- 1. Remove anonymous INSERT policy on leads
-- ─────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Anyone can insert a lead" ON public.leads;

-- ─────────────────────────────────────────────────────────────
-- 2. Replace broad authenticated policies with admin-scoped policies
-- ─────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Authenticated users can read leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated users can update leads" ON public.leads;

CREATE POLICY "Admins can read leads"
  ON public.leads FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.admins WHERE admins.id = auth.uid())
  );

CREATE POLICY "Admins can update leads"
  ON public.leads FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.admins WHERE admins.id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.admins WHERE admins.id = auth.uid())
  );

-- Admin-only INSERT (for manual lead creation in dashboard)
CREATE POLICY "Admins can insert leads"
  ON public.leads FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.admins WHERE admins.id = auth.uid())
  );

-- ─────────────────────────────────────────────────────────────
-- 3. Revoke anon grants on leads
-- ─────────────────────────────────────────────────────────────

REVOKE INSERT ON public.leads FROM anon;
REVOKE SELECT, UPDATE, INSERT ON public.leads FROM anon;

-- ─────────────────────────────────────────────────────────────
-- 4. Ensure lead_notes is admin-only (policies already exist from
--    original migration; revoke anon if present)
-- ─────────────────────────────────────────────────────────────

REVOKE SELECT, INSERT, UPDATE ON public.lead_notes FROM anon;

-- ─────────────────────────────────────────────────────────────
-- 5. Ensure lead_events is admin-only (no anon grants)
-- ─────────────────────────────────────────────────────────────

REVOKE SELECT, INSERT, UPDATE ON public.lead_events FROM anon;

-- ─────────────────────────────────────────────────────────────
-- 6. Revoke anon access to lead_submission_attempts
-- ─────────────────────────────────────────────────────────────

REVOKE ALL ON public.lead_submission_attempts FROM anon;

-- ═══════════════════════════════════════════════════════════════
-- VERIFICATION SQL (run after applying this migration)
-- ═══════════════════════════════════════════════════════════════
--
-- -- A. Anonymous denial (run with anon key / unauthenticated)
-- --    Should return: permission denied or 0 rows
-- SELECT * FROM public.leads LIMIT 1;
-- INSERT INTO public.leads (name, phone) VALUES ('Test', '555');
--
-- -- B. Authenticated non-admin denial
-- --    Create a throwaway auth user, sign in, then:
-- SELECT * FROM public.leads LIMIT 1;
-- --    Should return: 0 rows (RLS blocks non-admins)
--
-- -- C. Approved admin access (sign in as Steven/Heber/Josh)
-- SELECT * FROM public.leads LIMIT 5;
-- --    Should return: rows
--
-- -- D. Service-role insertion (Edge Function path)
-- --    The service_role key bypasses RLS entirely
-- INSERT INTO public.leads (name, phone, status, quality)
--   VALUES ('Service Test', '5551234567', 'new', 'test');
-- --    Should succeed
