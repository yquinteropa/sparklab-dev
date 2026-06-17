/**
 * Definiciones de tipos del Motor de Quiz Dinámico.
 * Modela las 4 categorías de preguntas soportadas, la respuesta del usuario,
 * el contrato de los renderers y el estado de la sesión del cronometrado.
 */

// Tipos de pregunta soportados por el motor.
export type QuestionType =
  | 'multiple_choice'
  | 'true_false'
  | 'matching'
  | 'image_identification';

// Contenido de una pregunta de opción múltiple.
export interface MultipleChoiceContent {
  question_text: string;
  options: string[];
  /** Texto exacto de la opción correcta (debe coincidir con un valor de `options`). */
  correct_answer: string;
  explanation?: string;
}

// Contenido de una pregunta de verdadero/falso.
export interface TrueFalseContent {
  question_text: string;
  correct_answer: boolean;
  explanation?: string;
}

// Par "izquierda <-> derecha" usado en emparejamientos.
export interface MatchingPair {
  left: string;
  right: string;
}

// Contenido de una pregunta de emparejamiento (drag & drop / select).
export interface MatchingContent {
  question_text: string;
  pairs: MatchingPair[];
  explanation?: string;
}

// Contenido de una pregunta de identificación visual (a partir de una imagen).
export interface ImageIdentificationContent {
  question_text: string;
  media_url: string;
  options: string[];
  /** Texto exacto de la opción correcta. */
  correct_answer: string;
  explanation?: string;
}

// Mapa que asocia cada tipo de pregunta con su shape de contenido.
export type QuestionContentMap = {
  multiple_choice: MultipleChoiceContent;
  true_false: TrueFalseContent;
  matching: MatchingContent;
  image_identification: ImageIdentificationContent;
};

// Representación genérica de una pregunta tal como llega desde la base de datos.
export type Question<T extends QuestionType = QuestionType> = {
  id: string;
  type: T;
  difficulty?: 'easy' | 'medium' | 'hard' | null;
  content: QuestionContentMap[T];
};

/**
 * Respuesta del usuario (genérica). Cada renderer la define según su tipo:
 * - multiple_choice / image_identification: string (texto de la opción)
 * - true_false: boolean
 * - matching: Record<leftIndex, rightIndex>
 */
export type UserAnswer = string | boolean | Record<number, number>;

// Props comunes que recibe cualquier renderer de pregunta.
export interface RendererProps<T extends QuestionType = QuestionType> {
  question: Question<T>;
  disabled: boolean;
  onAnswer: (answer: UserAnswer) => void;
}

// Estados posibles de la sesión del quiz cronometrado.
export type QuizStatus =
  | 'loading'   // Cargando preguntas desde el backend
  | 'ready'    // Pantalla inicial: el usuario aún no ha comenzado
  | 'playing'  // Sesión activa, el cronómetro corre
  | 'feedback' // Mostrando si la última respuesta fue correcta
  | 'finished' // Tiempo agotado o preguntas terminadas
  | 'error';

// Resultado devuelto tras evaluar una respuesta concreta.
export interface FeedbackResult {
  correct: boolean;
  explanation?: string;
  pointsAwarded: number;
}
