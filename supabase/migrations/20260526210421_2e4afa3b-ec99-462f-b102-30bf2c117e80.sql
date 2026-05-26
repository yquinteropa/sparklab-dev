
-- 1) Questions: remove public SELECT, expose via SECURITY DEFINER functions ------
DROP POLICY IF EXISTS "Anyone can view active questions" ON public.questions;
REVOKE SELECT ON public.questions FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_quiz_questions(p_limit integer DEFAULT 20)
RETURNS TABLE(id uuid, type text, difficulty text, content jsonb)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    q.id,
    q.type,
    q.difficulty,
    -- Strip any answer keys from content before returning to the client
    (q.content - 'correct_answer') AS content
  FROM public.questions q
  WHERE q.is_active = true
  ORDER BY random()
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 20), 100));
$$;

REVOKE EXECUTE ON FUNCTION public.get_quiz_questions(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_quiz_questions(integer) TO authenticated;

CREATE OR REPLACE FUNCTION public.check_quiz_answer(p_question_id uuid, p_answer jsonb)
RETURNS TABLE(correct boolean, explanation text)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_type text;
  v_content jsonb;
  v_correct boolean := false;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT q.type, q.content INTO v_type, v_content
  FROM public.questions q
  WHERE q.id = p_question_id AND q.is_active = true;

  IF v_type IS NULL THEN
    RAISE EXCEPTION 'Question not found';
  END IF;

  IF v_type IN ('multiple_choice', 'image_identification') THEN
    v_correct := (p_answer ->> 0) IS NULL
      AND jsonb_typeof(p_answer) = 'string'
      AND (v_content ->> 'correct_answer') = (p_answer #>> '{}');
  ELSIF v_type = 'true_false' THEN
    v_correct := jsonb_typeof(p_answer) = 'boolean'
      AND (v_content -> 'correct_answer')::text = p_answer::text;
  ELSIF v_type = 'matching' THEN
    -- Expect answer as object { "0": 0, "1": 1, ... } matching identity
    v_correct := (
      SELECT bool_and((p_answer ->> idx::text)::int = idx)
      FROM generate_series(0, jsonb_array_length(v_content -> 'pairs') - 1) AS idx
    );
    v_correct := COALESCE(v_correct, false);
  END IF;

  RETURN QUERY SELECT v_correct, (v_content ->> 'explanation');
END;
$$;

REVOKE EXECUTE ON FUNCTION public.check_quiz_answer(uuid, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_quiz_answer(uuid, jsonb) TO authenticated;

-- 2) Profiles: restrict reads to authenticated users -------------------------
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Authenticated users can view profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);
REVOKE SELECT ON public.profiles FROM anon;

-- 3) User progress: restrict reads to authenticated users --------------------
DROP POLICY IF EXISTS "Users can view all progress" ON public.user_progress;
CREATE POLICY "Authenticated users can view progress"
  ON public.user_progress FOR SELECT
  TO authenticated
  USING (true);
REVOKE SELECT ON public.user_progress FROM anon;

-- 4) User achievements: block client INSERT (must go through server logic) ---
DROP POLICY IF EXISTS "Users can insert own achievements" ON public.user_achievements;
REVOKE INSERT ON public.user_achievements FROM anon, authenticated;

-- 5) User scores: ensure no direct client writes -----------------------------
REVOKE INSERT, UPDATE, DELETE ON public.user_scores FROM anon, authenticated;

-- 6) Weekly leaderboard: read-only for clients -------------------------------
REVOKE INSERT, UPDATE, DELETE ON public.weekly_leaderboard FROM anon, authenticated;

-- 7) Lock down SECURITY DEFINER functions ------------------------------------
REVOKE EXECUTE ON FUNCTION public.refresh_weekly_leaderboard() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_user_score(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_user_score(integer) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
