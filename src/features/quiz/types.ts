// Tipos del Motor de Quiz Dinámico
export type QuestionType =
  | 'multiple_choice'
  | 'true_false'
  | 'matching'
  | 'image_identification';

export interface MultipleChoiceContent {
  question_text: string;
  options: string[];
  correct_answer: number; // índice
  explanation?: string;
}

export interface TrueFalseContent {
  question_text: string;
  correct_answer: boolean;
  explanation?: string;
}

export interface MatchingPair {
  left: string;
  right: string;
}

export interface MatchingContent {
  question_text: string;
  pairs: MatchingPair[];
  explanation?: string;
}

export interface ImageIdentificationContent {
  question_text: string;
  media_url: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
}

export type QuestionContentMap = {
  multiple_choice: MultipleChoiceContent;
  true_false: TrueFalseContent;
  matching: MatchingContent;
  image_identification: ImageIdentificationContent;
};

export type Question<T extends QuestionType = QuestionType> = {
  id: string;
  type: T;
  difficulty?: 'easy' | 'medium' | 'hard' | null;
  content: QuestionContentMap[T];
};

// Respuesta del usuario (genérica): cada renderer la define según su tipo
// - multiple_choice / image_identification: number (índice)
// - true_false: boolean
// - matching: Record<leftIndex, rightIndex>
export type UserAnswer = number | boolean | Record<number, number>;

export interface RendererProps<T extends QuestionType = QuestionType> {
  question: Question<T>;
  disabled: boolean;
  onAnswer: (answer: UserAnswer) => void;
}

export type QuizStatus =
  | 'loading'
  | 'ready'
  | 'playing'
  | 'feedback'
  | 'finished'
  | 'error';

export interface FeedbackResult {
  correct: boolean;
  explanation?: string;
  pointsAwarded: number;
}
