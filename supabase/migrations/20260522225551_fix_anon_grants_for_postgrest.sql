/*
  # Fix anon role grants for PostgREST access on public.leads

  ## Problem
  Live PostgREST API returns HTTP 401 / "permission denied for table leads" for anon
  INSERT requests, despite RLS policies existing. PostgREST requires explicit USAGE
  on the schema and table-level grants to be visible in its schema cache.

  ## Changes
  - Grant USAGE on schema public to anon and authenticated roles
  - Re-issue INSERT and SELECT grants on public.leads to anon
  - Re-issue SELECT and UPDATE grants on public.leads to authenticated

  These are idempotent — safe to re-run.
*/

GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

GRANT INSERT ON public.leads TO anon;
GRANT SELECT ON public.leads TO anon;

GRANT SELECT ON public.leads TO authenticated;
GRANT UPDATE ON public.leads TO authenticated;
