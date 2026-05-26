import { useCallback, useEffect, useReducer, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type {
  FeedbackResult,
  Question,
  QuizStatus,
  UserAnswer,
} from '../types';
import { pickRandom } from '../lib/shuffle';
import { SCORING, calculatePoints, isAnswerCorrect } from '../lib/scoring';

interface UseQuizSessionOptions {
  totalQuestions?: number;
  totalSeconds?: number;
  autoStart?: boolean;
}

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

type Action =
  | { type: 'LOAD' }
  | { type: 'LOADED'; questions: Question[]; totalSeconds: number }
  | { type: 'ERROR'; error: string }
  | { type: 'TICK' }
  | { type: 'ANSWER'; result: FeedbackResult; timeDelta: number }
  | { type: 'NEXT' }
  | { type: 'FINISH' }
  | { type: 'RESET' };

const buildInitial = (totalSeconds: number): State => ({
  status: 'loading',
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
  autoStart = true,
}: UseQuizSessionOptions = {}) {
  const [state, dispatch] = useReducer(reducer, totalSeconds, buildInitial);
  const totalSecondsRef = useRef(totalSeconds);
  totalSecondsRef.current = totalSeconds;

  const start = useCallback(async () => {
    dispatch({ type: 'LOAD' });
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('id, type, difficulty, content')
        .eq('is_active', true);
      if (error) throw error;
      const rows = (data ?? []) as unknown as Question[];
      if (rows.length === 0) {
        dispatch({ type: 'ERROR', error: 'No hay preguntas disponibles aún.' });
        return;
      }
      const selected = pickRandom(rows, totalQuestions);
      dispatch({
        type: 'LOADED',
        questions: selected,
        totalSeconds: totalSecondsRef.current,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error cargando preguntas';
      dispatch({ type: 'ERROR', error: msg });
    }
  }, [totalQuestions]);

  const submitAnswer = useCallback(
    (answer: UserAnswer) => {
      const q = state.questions[state.currentIndex];
      if (!q) return;
      const correct = isAnswerCorrect(q, answer);
      const questionsLeft = state.questions.length - state.currentIndex;
      const points = calculatePoints(correct, state.timeLeft, questionsLeft);
      const timeDelta = correct
        ? SCORING.timeBonusOnCorrect
        : -SCORING.timePenaltyOnWrong;
      const explanation = (q.content as { explanation?: string }).explanation;
      dispatch({
        type: 'ANSWER',
        result: { correct, explanation, pointsAwarded: points },
        timeDelta,
      });
    },
    [state.questions, state.currentIndex, state.timeLeft],
  );

  const next = useCallback(() => dispatch({ type: 'NEXT' }), []);
  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  // Auto-start
  useEffect(() => {
    if (autoStart) start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer global: solo corre mientras playing
  useEffect(() => {
    if (state.status !== 'playing') return;
    const id = window.setInterval(() => dispatch({ type: 'TICK' }), 1000);
    return () => window.clearInterval(id);
  }, [state.status]);

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
