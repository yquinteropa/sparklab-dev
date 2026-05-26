import type { Question, UserAnswer } from '../types';

export const SCORING = {
  basePoints: 100,
  timeBonusOnCorrect: 3, // segundos sumados al timer al acertar
  timePenaltyOnWrong: 5, // segundos restados al fallar
};

export function isAnswerCorrect(question: Question, answer: UserAnswer): boolean {
  if (question.type === 'multiple_choice' || question.type === 'image_identification') {
    const q = question as Question<'multiple_choice'>;
    return typeof answer === 'number' && answer === q.content.correct_answer;
  }
  if (question.type === 'true_false') {
    const q = question as Question<'true_false'>;
    return typeof answer === 'boolean' && answer === q.content.correct_answer;
  }
  if (question.type === 'matching') {
    const q = question as Question<'matching'>;
    if (typeof answer !== 'object' || answer === null) return false;
    return q.content.pairs.every(
      (_, i) => (answer as Record<number, number>)[i] === i,
    );
  }
  return false;
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
