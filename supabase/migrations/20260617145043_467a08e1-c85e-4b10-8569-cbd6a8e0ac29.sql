
-- Meta table to track last weekly reset
CREATE TABLE IF NOT EXISTS public.leaderboard_meta (
  id INT PRIMARY KEY DEFAULT 1,
  last_reset_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

GRANT SELECT ON public.leaderboard_meta TO authenticated, anon;
GRANT ALL ON public.leaderboard_meta TO service_role;
ALTER TABLE public.leaderboard_meta ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read leaderboard meta" ON public.leaderboard_meta FOR SELECT USING (true);

-- Seed with the start of the current ISO week (Monday 00:00 UTC)
INSERT INTO public.leaderboard_meta (id, last_reset_at)
VALUES (1, date_trunc('week', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC')
ON CONFLICT (id) DO NOTHING;

-- Function: if current week start is later than last_reset_at, wipe scores + leaderboard
CREATE OR REPLACE FUNCTION public.ensure_weekly_reset()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last TIMESTAMPTZ;
  v_current_week_start TIMESTAMPTZ;
  v_did_reset BOOLEAN := false;
BEGIN
  v_current_week_start := date_trunc('week', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC';

  SELECT last_reset_at INTO v_last FROM public.leaderboard_meta WHERE id = 1 FOR UPDATE;
  IF v_last IS NULL THEN
    INSERT INTO public.leaderboard_meta (id, last_reset_at)
    VALUES (1, v_current_week_start)
    ON CONFLICT (id) DO UPDATE SET last_reset_at = EXCLUDED.last_reset_at;
    RETURN false;
  END IF;

  IF v_current_week_start > v_last THEN
    TRUNCATE TABLE public.user_scores;
    TRUNCATE TABLE public.weekly_leaderboard;
    UPDATE public.leaderboard_meta SET last_reset_at = v_current_week_start WHERE id = 1;
    v_did_reset := true;
  END IF;

  RETURN v_did_reset;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_weekly_reset() TO authenticated, anon;

-- Update get_weekly_leaderboard to ensure reset first. Must be VOLATILE now.
CREATE OR REPLACE FUNCTION public.get_weekly_leaderboard()
RETURNS TABLE(rank integer, score integer, display_name text, avatar_url text, is_me boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.ensure_weekly_reset();
  RETURN QUERY
    SELECT w.rank, w.score, w.display_name, w.avatar_url,
           COALESCE(w.user_id = auth.uid(), false) AS is_me
    FROM public.weekly_leaderboard w
    ORDER BY w.rank ASC
    LIMIT 100;
END;
$$;

-- Update update_user_score to ensure reset BEFORE recording the new score
CREATE OR REPLACE FUNCTION public.update_user_score(p_score integer)
RETURNS TABLE(new_best integer, in_top boolean, improved boolean, entered_top boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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

  PERFORM public.ensure_weekly_reset();

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
$$;

-- Force one-time reset now since the existing data is stale (last_reset_at seeded to current week,
-- but the existing stale rows are from before this migration; clear them explicitly).
TRUNCATE TABLE public.user_scores;
TRUNCATE TABLE public.weekly_leaderboard;
UPDATE public.leaderboard_meta
SET last_reset_at = date_trunc('week', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'
WHERE id = 1;
