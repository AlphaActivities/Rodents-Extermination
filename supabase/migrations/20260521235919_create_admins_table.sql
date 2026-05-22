/*
  # Create admins table

  1. New Tables
    - `admins`
      - `id` (uuid, primary key, references auth.users)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Authenticated users can only read their own row
    - No public access

  3. Notes
    - The admin auth flow checks if the logged-in user's ID exists in this table
    - A row must be manually inserted for each admin user after they are created in auth.users
*/

CREATE TABLE IF NOT EXISTS admins (
  id         uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read own row"
  ON admins FOR SELECT
  TO authenticated
  USING (auth.uid() = id);
