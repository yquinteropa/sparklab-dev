
DROP FUNCTION IF EXISTS public.update_user_score(integer);

CREATE OR REPLACE FUNCTION public.update_user_score(p_score integer)
 RETURNS TABLE(new_best integer, in_top boolean, improved boolean, entered_top boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user UUID := auth.uid();
  v_prev INTEGER;
  v_current INTEGER;
  v_min_top INTEGER;
  v_count INTEGER;
  v_in_top BOOLEAN := false;
  v_was_in_top BOOLEAN := false;
  v_improved BOOLEAN := false;
  v_entered BOOLEAN := false;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF p_score IS NULL OR p_score < 0 THEN
    RAISE EXCEPTION 'Invalid score';
  END IF;

  SELECT score INTO v_prev FROM public.user_scores WHERE user_id = v_user;
  SELECT EXISTS(SELECT 1 FROM public.weekly_leaderboard WHERE user_id = v_user) INTO v_was_in_top;

  INSERT INTO public.user_scores (user_id, score, updated_at)
  VALUES (v_user, p_score, now())
  ON CONFLICT (user_id) DO UPDATE
    SET score = GREATEST(public.user_scores.score, EXCLUDED.score),
        updated_at = CASE
          WHEN EXCLUDED.score > public.user_scores.score THEN now()
          ELSE public.user_scores.updated_at
        END;

  SELECT score INTO v_current FROM public.user_scores WHERE user_id = v_user;
  v_improved := (v_prev IS NULL AND p_score > 0) OR (v_prev IS NOT NULL AND p_score > v_prev);

  SELECT COUNT(*), COALESCE(MIN(score), 0) INTO v_count, v_min_top FROM public.weekly_leaderboard;
  IF v_count < 100 OR v_current >= v_min_top THEN
    PERFORM public.refresh_weekly_leaderboard();
  END IF;
  SELECT EXISTS(SELECT 1 FROM public.weekly_leaderboard WHERE user_id = v_user) INTO v_in_top;
  v_entered := v_in_top AND NOT v_was_in_top;

  RETURN QUERY SELECT v_current, v_in_top, v_improved, v_entered;
END;
$function$;
