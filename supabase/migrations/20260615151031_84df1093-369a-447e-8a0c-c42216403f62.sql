
-- Backfill user_roles from profiles
INSERT INTO public.user_roles (user_id, role)
SELECT p.id, p.role::public.app_role
FROM public.profiles p
WHERE p.role IS NOT NULL
  AND p.role IN ('admin', 'user', 'editor')
ON CONFLICT (user_id, role) DO NOTHING;

-- Sync trigger function
CREATE OR REPLACE FUNCTION public.sync_profile_role_to_user_roles()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- On UPDATE: remove the old role if it changed
  IF TG_OP = 'UPDATE' AND OLD.role IS DISTINCT FROM NEW.role AND OLD.role IS NOT NULL THEN
    IF OLD.role IN ('admin', 'user', 'editor') THEN
      DELETE FROM public.user_roles
      WHERE user_id = NEW.id AND role = OLD.role::public.app_role;
    END IF;
  END IF;

  -- Insert the new role
  IF NEW.role IS NOT NULL AND NEW.role IN ('admin', 'user', 'editor') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, NEW.role::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_profile_role ON public.profiles;
CREATE TRIGGER trg_sync_profile_role
AFTER INSERT OR UPDATE OF role ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_profile_role_to_user_roles();
