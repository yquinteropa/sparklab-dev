
-- Profiles: restrict reads to own row
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- user_progress: restrict reads to own row
DROP POLICY IF EXISTS "Authenticated users can view progress" ON public.user_progress;
CREATE POLICY "Users can view own progress"
ON public.user_progress FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- user_scores: restrict reads to own row
DROP POLICY IF EXISTS "Authenticated users can view scores" ON public.user_scores;
CREATE POLICY "Users can view own score"
ON public.user_scores FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- weekly_leaderboard: remove public access (we'll expose via RPC without user_id)
DROP POLICY IF EXISTS "Anyone can view leaderboard" ON public.weekly_leaderboard;
REVOKE SELECT ON public.weekly_leaderboard FROM anon, authenticated;

-- Safe RPC that omits internal UUIDs
CREATE OR REPLACE FUNCTION public.get_weekly_leaderboard()
RETURNS TABLE(rank integer, score integer, display_name text, avatar_url text, is_me boolean)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT w.rank, w.score, w.display_name, w.avatar_url,
         (w.user_id = auth.uid()) AS is_me
  FROM public.weekly_leaderboard w
  ORDER BY w.rank ASC
  LIMIT 100;
$$;

GRANT EXECUTE ON FUNCTION public.get_weekly_leaderboard() TO anon, authenticated;
