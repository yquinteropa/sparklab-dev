
-- user_scores: restrict SELECT to authenticated only
DROP POLICY IF EXISTS "Anyone can view scores" ON public.user_scores;
CREATE POLICY "Authenticated users can view scores"
ON public.user_scores
FOR SELECT
TO authenticated
USING (true);

REVOKE SELECT ON public.user_scores FROM anon;

-- profiles: restrict INSERT/UPDATE to authenticated role
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- user_progress: restrict INSERT/UPDATE to authenticated role
DROP POLICY IF EXISTS "Users can insert own progress" ON public.user_progress;
CREATE POLICY "Users can insert own progress"
ON public.user_progress
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own progress" ON public.user_progress;
CREATE POLICY "Users can update own progress"
ON public.user_progress
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
