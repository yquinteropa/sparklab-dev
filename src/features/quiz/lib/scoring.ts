/**
 * Lógica de puntuación del modo cronometrado.
 * Centraliza las constantes y el cálculo de puntos para mantener consistencia
 * entre el cliente (predicción visual) y el servidor (fuente de verdad).
 */
import type { Question, UserAnswer } from '../types';

// Configuración del sistema de puntos. Modificar aquí afecta a todo el motor.
export const SCORING = {
  basePoints: 100,         // Puntos base otorgados por respuesta correcta
  timeBonusOnCorrect: 3,   // Segundos añadidos al cronómetro al acertar
  timePenaltyOnWrong: 5,   // Segundos restados al cronómetro al fallar
};

/**
 * Verifica localmente si una respuesta es correcta.
 * El servidor sigue siendo la fuente de verdad; esta función se usa para
 * feedback inmediato o validaciones de UI.
 */
export function isAnswerCorrect(question: Question, answer: UserAnswer): boolean {
  // Opción múltiple e identificación por imagen: comparación directa de strings
  if (question.type === 'multiple_choice' || question.type === 'image_identification') {
    const q = question as Question<'multiple_choice'>;
    return typeof answer === 'string' && answer === q.content.correct_answer;
  }
  // Verdadero/Falso: comparación booleana
  if (question.type === 'true_false') {
    const q = question as Question<'true_false'>;
    return typeof answer === 'boolean' && answer === q.content.correct_answer;
  }
  // Emparejamiento: cada índice izquierdo debe mapear con su mismo índice derecho
  if (question.type === 'matching') {
    const q = question as Question<'matching'>;
    if (typeof answer !== 'object' || answer === null) return false;
    return q.content.pairs.every(
      (_, i) => (answer as Record<number, number>)[i] === i,
    );
  }
  return false;
}

/**
 * Calcula los puntos a otorgar por una respuesta.
 * Fórmula: base + bonificación por tiempo restante distribuido entre las preguntas
 * que quedan. Premia la velocidad sin penalizar excesivamente al final del intento.
 */
export function calculatePoints(
  correct: boolean,
  timeLeft: number,
  questionsLeft: number,
): number {
  if (!correct) return 0; // Sin puntos si la respuesta es incorrecta
  // Bonus proporcional al tiempo restante por pregunta pendiente (dividido entre 2 para suavizar)
  const bonus = questionsLeft > 0 ? Math.floor(timeLeft / questionsLeft / 2) : 0;
  return SCORING.basePoints + bonus;
}
