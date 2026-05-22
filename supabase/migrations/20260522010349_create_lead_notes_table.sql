/*
  # Create lead_notes table

  ## Summary
  Adds a persistent notes system for the CRM lead management workflow.
  Notes are attached to individual leads and written by admin users.

  ## New Tables

  ### lead_notes
  - `id` (uuid, primary key) — unique note identifier
  - `lead_id` (bigint, NOT NULL, FK → leads.id) — which lead this note belongs to;
    NOTE: leads.id is bigint, so lead_id must also be bigint to match
  - `body` (text, NOT NULL) — the note content
  - `created_by` (uuid, FK → auth.users.id, nullable) — admin who wrote the note
  - `created_at` (timestamptz) — when note was first created
  - `updated_at` (timestamptz) — last edit time (same as created_at if never edited)

  ## Security
  - RLS enabled; table locked by default
  - SELECT policy: authenticated users who exist in admins table
  - INSERT policy: authenticated users who exist in admins table
  - UPDATE policy: authenticated users who exist in admins table
  - No DELETE policy — notes are intentionally permanent (audit trail)
  - GRANT for INSERT/UPDATE/SELECT on lead_notes to authenticated role

  ## Notes
  - lead_id uses bigint (not uuid) to match the actual type of leads.id
  - ON DELETE CASCADE means notes are removed when a lead is deleted
*/

CREATE TABLE IF NOT EXISTS public.lead_notes (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id     bigint      NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  body        text        NOT NULL,
  created_by  uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lead_notes_lead_id_idx ON public.lead_notes(lead_id);
CREATE INDEX IF NOT EXISTS lead_notes_created_at_idx ON public.lead_notes(created_at DESC);

ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read lead notes"
  ON public.lead_notes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.id = auth.uid()
    )
  );

CREATE POLICY "Admins can create lead notes"
  ON public.lead_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.id = auth.uid()
    )
  );

CREATE POLICY "Admins can update lead notes"
  ON public.lead_notes
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.id = auth.uid()
    )
  );

GRANT SELECT, INSERT, UPDATE ON public.lead_notes TO authenticated;
