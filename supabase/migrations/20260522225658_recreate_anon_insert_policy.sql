/*
  # Recreate anon INSERT policy on public.leads

  ## Problem
  PostgREST returns "new row violates row-level security policy" for anon INSERT
  despite the policy existing. Dropping and recreating forces PostgREST to reload
  the policy into its schema cache.

  ## Changes
  - Drop and recreate the "Anyone can insert a lead" INSERT policy for anon
*/

DROP POLICY IF EXISTS "Anyone can insert a lead" ON public.leads;

CREATE POLICY "Anyone can insert a lead"
  ON public.leads
  FOR INSERT
  TO anon
  WITH CHECK (true);
