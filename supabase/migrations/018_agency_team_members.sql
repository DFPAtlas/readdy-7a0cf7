-- 018: let agency staff see who else is in their agency.
--
-- profiles RLS only allows a user to read their own row, so the Team settings
-- page could not show colleagues' names. This function returns name, email and
-- role for members of the caller's own agencies only.

CREATE OR REPLACE FUNCTION public.agency_team_members()
RETURNS TABLE (profile_id uuid, agency_id uuid, full_name text, email text, member_role text, joined_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT am.profile_id, am.agency_id, p.full_name, p.email, am.role, p.created_at
  FROM public.agency_members am
  JOIN public.profiles p ON p.id = am.profile_id
  WHERE am.agency_id IN (SELECT public.my_agency_ids())
  ORDER BY p.full_name NULLS LAST;
$$;

REVOKE ALL ON FUNCTION public.agency_team_members() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.agency_team_members() TO authenticated;
