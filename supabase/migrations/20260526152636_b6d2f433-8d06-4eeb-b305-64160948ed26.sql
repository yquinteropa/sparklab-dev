UPDATE public.questions
SET content = jsonb_set(
  content,
  '{correct_answer}',
  (content->'options')->((content->>'correct_answer')::int)
)
WHERE type IN ('multiple_choice','image_identification')
  AND jsonb_typeof(content->'correct_answer') = 'number';