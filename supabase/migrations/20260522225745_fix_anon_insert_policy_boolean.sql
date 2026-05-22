/*
  # Fix anon INSERT policy boolean expression on public.leads

  ## Problem
  SET ROLE anon + INSERT returns "new row violates row-level security policy"
  even though WITH CHECK (true) policy exists. The expression is being stored
  as a string literal rather than a boolean true. Recreating with explicit
  boolean cast forces correct evaluation.

  ## Changes
  - Drop and recreate "Anyone can insert a lead" using explicit boolean cast
*/

DROP POLICY IF EXISTS "Anyone can insert a lead" ON public.leads;

CREATE POLICY "Anyone can insert a lead"
  ON public.leads
  FOR INSERT
  TO anon
  WITH CHECK ((true)::boolean);
