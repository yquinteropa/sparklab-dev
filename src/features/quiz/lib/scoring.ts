import type { Question, UserAnswer } from '../types';

export const SCORING = {
  basePoints: 100,
  timeBonusOnCorrect: 3, // segundos sumados al timer al acertar
  timePenaltyOnWrong: 5, // segundos restados al fallar
};

export function isAnswerCorrect(question: Question, answer: UserAnswer): boolean {
  switch (question.type) {
    case 'multiple_choice':
    case 'image_identification':
      return typeof answer === 'number' && answer === question.content.correct_answer;
    case 'true_false':
      return typeof answer === 'boolean' && answer === question.content.correct_answer;
    case 'matching': {
      if (typeof answer !== 'object' || answer === null) return false;
      const pairs = question.content.pairs;
      // El usuario asocia índice izq → índice der. Correcto si cada izq apunta a su mismo índice (par original).
      return pairs.every((_, i) => (answer as Record<number, number>)[i] === i);
    }
    default:
      return false;
  }
}

export function calculatePoints(
  correct: boolean,
  timeLeft: number,
  questionsLeft: number,
): number {
  if (!correct) return 0;
  const bonus = questionsLeft > 0 ? Math.floor(timeLeft / questionsLeft / 2) : 0;
  return SCORING.basePoints + bonus;
}
