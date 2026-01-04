-- SQL Script to Setup Admin Users
-- Run these in your Supabase SQL Editor

-- OPTION 1: Promote an existing user to Admin
-- Replace 'user@example.com' with the email of the registered user
DO $$
DECLARE
    target_user_id UUID;
BEGIN
    SELECT id INTO target_user_id FROM auth.users WHERE email = 'admin@agile.ns.gov.ng';
    
    IF target_user_id IS NOT NULL THEN
        -- Delete existing role if any
        DELETE FROM public.user_roles WHERE user_id = target_user_id;
        -- Assign admin role
        INSERT INTO public.user_roles (user_id, role) VALUES (target_user_id, 'admin');
        RAISE NOTICE 'User promoted to Admin successfully';
    ELSE
        RAISE NOTICE 'User not found. Please ensure the user has registered first.';
    END IF;
END $$;


-- OPTION 2: Create a special Admin Invitation
-- This allows you to register as an admin using the /admin-setup page
-- Token: internal-admin-seed-2026
INSERT INTO public.admin_invitations (email, invited_by, token, expires_at)
VALUES (
    'admin@agile.ns.gov.ng', 
    '00000000-0000-0000-0000-000000000000', -- Dummy ID for system-generated
    'internal-admin-seed-2026', 
    now() + interval '1 year'
)
ON CONFLICT (email, used) DO NOTHING;

-- Verification:
-- After running Option 2, you can visit:
-- YOUR_APP_URL/admin-setup?token=internal-admin-seed-2026
