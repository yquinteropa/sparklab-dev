
-- Extensions for cron
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- user_scores: best historical score per user
CREATE TABLE public.user_scores (
  user_id UUID PRIMARY KEY,
  score INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.user_scores TO anon, authenticated;
GRANT ALL ON public.user_scores TO service_role;

ALTER TABLE public.user_scores ENABLE ROW LEVEL SECURITY;

-- Read-only for everyone; writes only via SECURITY DEFINER function
CREATE POLICY "Anyone can view scores"
  ON public.user_scores FOR SELECT
  USING (true);

-- weekly_leaderboard: cached top 100
CREATE TABLE public.weekly_leaderboard (
  rank INTEGER PRIMARY KEY,
  user_id UUID NOT NULL,
  score INTEGER NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  refreshed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.weekly_leaderboard TO anon, authenticated;
GRANT ALL ON public.weekly_leaderboard TO service_role;

ALTER TABLE public.weekly_leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view leaderboard"
  ON public.weekly_leaderboard FOR SELECT
  USING (true);

-- refresh_weekly_leaderboard: recompute top 100
CREATE OR REPLACE FUNCTION public.refresh_weekly_leaderboard()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.weekly_leaderboard;
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
$$;

-- update_user_score: keeps the highest, refreshes leaderboard if it could enter top 100
CREATE OR REPLACE FUNCTION public.update_user_score(p_score INTEGER)
RETURNS TABLE(new_best INTEGER, in_top BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_current INTEGER;
  v_min_top INTEGER;
  v_count INTEGER;
  v_in_top BOOLEAN := false;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF p_score IS NULL OR p_score < 0 THEN
    RAISE EXCEPTION 'Invalid score';
  END IF;

  INSERT INTO public.user_scores (user_id, score, updated_at)
  VALUES (v_user, p_score, now())
  ON CONFLICT (user_id) DO UPDATE
    SET score = GREATEST(public.user_scores.score, EXCLUDED.score),
        updated_at = CASE
          WHEN EXCLUDED.score > public.user_scores.score THEN now()
          ELSE public.user_scores.updated_at
        END;

  SELECT score INTO v_current FROM public.user_scores WHERE user_id = v_user;

  -- Refresh leaderboard if this could place in top 100
  SELECT COUNT(*), COALESCE(MIN(score), 0) INTO v_count, v_min_top FROM public.weekly_leaderboard;
  IF v_count < 100 OR v_current >= v_min_top THEN
    PERFORM public.refresh_weekly_leaderboard();
    SELECT EXISTS(SELECT 1 FROM public.weekly_leaderboard WHERE user_id = v_user) INTO v_in_top;
  ELSE
    SELECT EXISTS(SELECT 1 FROM public.weekly_leaderboard WHERE user_id = v_user) INTO v_in_top;
  END IF;

  RETURN QUERY SELECT v_current, v_in_top;
END;
$$;

REVOKE ALL ON FUNCTION public.update_user_score(INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_user_score(INTEGER) TO authenticated;

REVOKE ALL ON FUNCTION public.refresh_weekly_leaderboard() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.refresh_weekly_leaderboard() TO service_role;
