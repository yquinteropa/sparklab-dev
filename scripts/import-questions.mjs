// Script de importación masiva de preguntas al motor de quiz.
//
// Uso:
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
//     node scripts/import-questions.mjs ./questions.json
//
// El archivo JSON debe ser un array de objetos. Cada objeto admite el
// formato "abreviado" (question, options:[strings], correct_answer:string|bool,
// difficulty:1..5) y se normaliza al esquema que espera el QuizEngine
// (question_text, options, correct_answer como índice o booleano).

import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const [, , filePath] = process.argv;
if (!filePath) {
  console.error('Falta la ruta al archivo JSON.\nUso: node scripts/import-questions.mjs <archivo.json>');
  process.exit(1);
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Define SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en el entorno.');
  process.exit(1);
}

const DIFFICULTY_MAP = { 1: 'easy', 2: 'medium', 3: 'medium', 4: 'hard', 5: 'hard' };

function normalize(raw) {
  const c = raw.content ?? raw;
  const type = raw.type;
  const questionText = c.question_text ?? c.question;

  let content;
  if (type === 'multiple_choice' || type === 'image_identification') {
    const options = c.options ?? [];
    let correct = c.correct_answer;
    // Normalizamos a TEXTO exacto de la opción correcta
    if (typeof correct === 'number') correct = options[correct];
    if (typeof correct !== 'string' || !options.includes(correct)) {
      throw new Error(`correct_answer inválido para "${questionText}": debe ser el texto exacto de una opción.`);
    }
    content = {
      question_text: questionText,
      options,
      correct_answer: correct,
      ...(c.explanation && { explanation: c.explanation }),
      ...(type === 'image_identification' && c.media_url && { media_url: c.media_url }),
    };
  } else if (type === 'true_false') {
    let correct = c.correct_answer;
    if (typeof correct === 'string') correct = /^(verdadero|true|v)$/i.test(correct);
    content = { question_text: questionText, correct_answer: !!correct, ...(c.explanation && { explanation: c.explanation }) };
  } else if (type === 'matching') {
    content = { question_text: questionText, pairs: c.pairs ?? [], ...(c.explanation && { explanation: c.explanation }) };
  } else {
    throw new Error(`Tipo de pregunta no soportado: ${type}`);
  }

  const difficulty = typeof raw.difficulty === 'number'
    ? DIFFICULTY_MAP[raw.difficulty] ?? 'medium'
    : raw.difficulty ?? null;

  return { type, difficulty, is_active: raw.is_active ?? true, content };
}

const rows = JSON.parse(readFileSync(filePath, 'utf8')).map(normalize);
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

const { data, error } = await supabase.from('questions').insert(rows).select('id');
if (error) {
  console.error('Error al insertar:', error);
  process.exit(1);
}
console.log(`✅ Importadas ${data.length} preguntas.`);
