CREATE OR REPLACE FUNCTION public.check_quiz_answer(p_question_id uuid, p_answer jsonb)
 RETURNS TABLE(correct boolean, explanation text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    v_correct := jsonb_typeof(p_answer) = 'string'
      AND (v_content ->> 'correct_answer') = (p_answer #>> '{}');
  ELSIF v_type = 'true_false' THEN
    v_correct := jsonb_typeof(p_answer) = 'boolean'
      AND (v_content -> 'correct_answer')::text = p_answer::text;
  ELSIF v_type = 'matching' THEN
    v_correct := (
      SELECT bool_and((p_answer ->> idx::text)::int = idx)
      FROM generate_series(0, jsonb_array_length(v_content -> 'pairs') - 1) AS idx
    );
    v_correct := COALESCE(v_correct, false);
  END IF;

  RETURN QUERY SELECT v_correct, (v_content ->> 'explanation');
END;
$function$;