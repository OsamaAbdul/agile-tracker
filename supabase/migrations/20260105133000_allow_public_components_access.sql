-- Allow public (including anonymous) read access to components
-- This is required for the signup form to display the list of components

-- Drop the existing policy that was restricted to authenticated users
DROP POLICY IF EXISTS "Anyone can view components" ON public.components;

-- Create the new policy allowing access to everyone (public role includes anon)
CREATE POLICY "Anyone can view components"
  ON public.components FOR SELECT
  TO public
  USING (true);
