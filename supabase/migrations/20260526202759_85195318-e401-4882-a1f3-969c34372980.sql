CREATE OR REPLACE FUNCTION public.refresh_weekly_leaderboard()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  TRUNCATE TABLE public.weekly_leaderboard;
  INSERT INTO public.weekly_leaderboard (rank, user_id, score, display_name, avatar_url, refreshed_at)
  SELECT
    ROW_NUMBER() OVER (ORDER BY s.score DESC, s.updated_at ASC)::int AS rank,
    s.user_id,
    s.score,
    p.display_name,
    p.avatar_url,
    now()
  FROM public.user_scores s
  LEFT JOIN public.profiles p ON p.user_id = s.user_id
  ORDER BY s.score DESC, s.updated_at ASC
  LIMIT 100;
END;
$function$;