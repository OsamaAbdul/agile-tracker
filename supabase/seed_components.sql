-- SQL Seed Data for AGILE Tracker Components
-- You can run this in your Supabase SQL Editor

INSERT INTO public.components (name, email, phone, registration_token)
VALUES 
  ('Safe Spaces & Life Skills', 'safespaces@agile.ns.gov.ng', '+2348001112223', 'agile-safe-2026'),
  ('School Improvement Grants', 'sig@agile.ns.gov.ng', '+2348002223334', 'agile-sig-2026'),
  ('Digital Literacy', 'digital@agile.ns.gov.ng', '+2348003334445', 'agile-dig-2026'),
  ('Monitoring & Evaluation', 'me@agile.ns.gov.ng', '+2348004445556', 'agile-me-2026'),
  ('Project Management Unit', 'pmu@agile.ns.gov.ng', '+2348005556667', 'agile-pmu-2026'),
  ('Communications & Advocacy', 'comms@agile.ns.gov.ng', '+2348006667778', 'agile-comms-2026'),
  ('Social Safeguards', 'safeguards@agile.ns.gov.ng', '+2348007778889', 'agile-safe-sg-2026'),
  ('Financial Management', 'finance@agile.ns.gov.ng', '+2348008889990', 'agile-fin-2026');

-- Note: registration_tokens are used by members during signup to join a specific component.
-- You can share these tokens with the respective component leads.
