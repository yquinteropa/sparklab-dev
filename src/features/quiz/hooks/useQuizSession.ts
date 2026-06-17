/**
 * Hook principal del modo cronometrado.
 * Orquesta: carga de preguntas (RPC), barajado, cronómetro global,
 * validación contra el backend, cálculo de puntos y transiciones de estado.
 *
 * Diseño: reducer puro + efectos aislados (timer) para mantener la lógica testeable.
 */
import { useCallback, useEffect, useReducer, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type {
  FeedbackResult,
  Question,
  QuizStatus,
  UserAnswer,
} from '../types';
import { shuffle } from '../lib/shuffle';
import { SCORING, calculatePoints } from '../lib/scoring';

// Opciones de configuración aceptadas por el hook.
interface UseQuizSessionOptions {
  totalQuestions?: number; // Nº de preguntas que se solicitarán al backend
  totalSeconds?: number;   // Duración inicial del cronómetro en segundos
}

// Estado interno del reducer.
interface State {
  status: QuizStatus;
  questions: Question[];
  currentIndex: number;
  score: number;
  correctCount: number;
  wrongCount: number;
  timeLeft: number;
  lastResult: FeedbackResult | null;
  error: string | null;
}

// Acciones soportadas por el reducer (cada una representa una transición).
type Action =
  | { type: 'START' }
  | { type: 'LOAD' }
  | { type: 'LOADED'; questions: Question[]; totalSeconds: number }
  | { type: 'ERROR'; error: string }
  | { type: 'TICK' }
  | { type: 'ANSWER'; result: FeedbackResult; timeDelta: number }
  | { type: 'NEXT' }
  | { type: 'FINISH' }
  | { type: 'RESET' };

// Estado inicial: configurable según los segundos totales pasados como opción.
const buildInitial = (totalSeconds: number): State => ({
  status: 'ready',
  questions: [],
  currentIndex: 0,
  score: 0,
  correctCount: 0,
  wrongCount: 0,
  timeLeft: totalSeconds,
  lastResult: null,
  error: null,
});

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'START':
      return { ...state, status: 'loading', error: null };
    case 'LOAD':
      return { ...state, status: 'loading', error: null };
    case 'LOADED':
      return {
        ...state,
        status: 'playing',
        questions: action.questions,
        currentIndex: 0,
        score: 0,
        correctCount: 0,
        wrongCount: 0,
        timeLeft: action.totalSeconds,
        lastResult: null,
        error: null,
      };
    case 'ERROR':
      return { ...state, status: 'error', error: action.error };
    case 'TICK': {
      const next = Math.max(0, state.timeLeft - 1);
      if (next === 0) return { ...state, timeLeft: 0, status: 'finished' };
      return { ...state, timeLeft: next };
    }
    case 'ANSWER': {
      const correct = action.result.correct;
      return {
        ...state,
        status: 'feedback',
        lastResult: action.result,
        score: state.score + action.result.pointsAwarded,
        correctCount: state.correctCount + (correct ? 1 : 0),
        wrongCount: state.wrongCount + (correct ? 0 : 1),
        timeLeft: Math.max(0, state.timeLeft + action.timeDelta),
      };
    }
    case 'NEXT': {
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.questions.length) {
        return { ...state, status: 'finished', lastResult: null };
      }
      return {
        ...state,
        status: 'playing',
        currentIndex: nextIndex,
        lastResult: null,
      };
    }
    case 'FINISH':
      return { ...state, status: 'finished' };
    case 'RESET':
      return buildInitial(state.timeLeft);
    default:
      return state;
  }
}

export function useQuizSession({
  totalQuestions = 20,
  totalSeconds = 180,
}: UseQuizSessionOptions = {}) {
  const [state, dispatch] = useReducer(reducer, totalSeconds, buildInitial);
  const totalSecondsRef = useRef(totalSeconds);
  totalSecondsRef.current = totalSeconds;

  /**
   * Solicita preguntas al backend mediante un RPC, baraja las opciones
   * (para evitar que el orden facilite la respuesta) e inicia la sesión.
   */
  const start = useCallback(async () => {
    dispatch({ type: 'START' });
    try {
      // RPC seguro: el backend valida y filtra preguntas según el usuario
      const { data, error } = await supabase.rpc('get_quiz_questions', {
        p_limit: totalQuestions,
      });
      if (error) throw error;
      const rows = (data ?? []) as unknown as Question[];
      if (rows.length === 0) {
        dispatch({ type: 'ERROR', error: 'No hay preguntas disponibles aún.' });
        return;
      }
      // Aleatoriza las opciones de las preguntas que lo requieren
      const randomized = rows.map((q): Question => {
        if (q.type === 'multiple_choice') {
          const content = q.content as Question<'multiple_choice'>['content'];
          return {
            ...q,
            content: { ...content, options: shuffle(content.options) },
          } as Question;
        }
        if (q.type === 'image_identification') {
          const content = q.content as Question<'image_identification'>['content'];
          return {
            ...q,
            content: { ...content, options: shuffle(content.options) },
          } as Question;
        }
        // Otros tipos no requieren barajado adicional aquí
        return q;
      });
      dispatch({
        type: 'LOADED',
        questions: randomized,
        totalSeconds: totalSecondsRef.current,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error cargando preguntas';
      dispatch({ type: 'ERROR', error: msg });
    }
  }, [totalQuestions]);

  /**
   * Envía la respuesta del usuario al backend para validarla.
   * El servidor es la fuente de verdad: previene trampas modificando el cliente.
   * Aplica bonus/penalización de tiempo y calcula puntos localmente.
   */
  const submitAnswer = useCallback(
    async (answer: UserAnswer) => {
      const q = state.questions[state.currentIndex];
      if (!q) return;
      const { data, error } = await supabase.rpc('check_quiz_answer', {
        p_question_id: q.id,
        p_answer: answer as unknown as never,
      });
      if (error) return;
      // El RPC puede devolver un array o un objeto según versión
      const row = Array.isArray(data) ? data[0] : data;
      const correct = !!row?.correct;
      const explanation = row?.explanation ?? undefined;
      const questionsLeft = state.questions.length - state.currentIndex;
      // Cálculo de puntos basado en tiempo restante y preguntas pendientes
      const points = calculatePoints(correct, state.timeLeft, questionsLeft);
      // Ajuste del cronómetro: bonus al acertar, penalización al fallar
      const timeDelta = correct
        ? SCORING.timeBonusOnCorrect
        : -SCORING.timePenaltyOnWrong;
      dispatch({
        type: 'ANSWER',
        result: { correct, explanation, pointsAwarded: points },
        timeDelta,
      });
    },
    [state.questions, state.currentIndex, state.timeLeft],
  );

  // Avanza a la siguiente pregunta (o finaliza si era la última).
  const next = useCallback(() => dispatch({ type: 'NEXT' }), []);
  // Reinicia el estado para permitir volver a jugar.
  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  // Timer global: el intervalo solo se activa mientras el estado es "playing".
  // Se limpia automáticamente al cambiar de estado para no consumir recursos.
  useEffect(() => {
    if (state.status !== 'playing') return;
    const id = window.setInterval(() => dispatch({ type: 'TICK' }), 1000);
    return () => window.clearInterval(id);
  }, [state.status]);

  // API expuesta a los componentes consumidores.
  return {
    ...state,
    currentQuestion: state.questions[state.currentIndex] ?? null,
    totalQuestions: state.questions.length,
    start,
    submitAnswer,
    next,
    reset,
  };
}
