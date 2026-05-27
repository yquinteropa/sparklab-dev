CREATE OR REPLACE FUNCTION public.get_weekly_leaderboard()
 RETURNS TABLE(rank integer, score integer, display_name text, avatar_url text, is_me boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT w.rank, w.score, w.display_name, w.avatar_url,
         COALESCE(w.user_id = auth.uid(), false) AS is_me
  FROM public.weekly_leaderboard w
  ORDER BY w.rank ASC
  LIMIT 100;
$function$;

GRANT EXECUTE ON FUNCTION public.get_weekly_leaderboard() TO anon, authenticated;