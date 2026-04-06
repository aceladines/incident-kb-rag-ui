-- set-default-role.sql
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- This trigger assigns role = 'agent' to every new signup via app_metadata.

CREATE OR REPLACE FUNCTION public.set_default_role()
RETURNS TRIGGER AS $$
BEGIN
  NEW.raw_app_meta_data := jsonb_set(
    COALESCE(NEW.raw_app_meta_data, '{}'::jsonb),
    '{role}',
    '"agent"'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.set_default_role();

-- To promote a user to admin, run:
-- UPDATE auth.users
-- SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'
-- WHERE email = 'admin@company.com';
