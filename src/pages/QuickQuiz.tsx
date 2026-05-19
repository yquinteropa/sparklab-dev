import { useEffect, useMemo, useReducer, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardNav } from '@/components/DashboardNav';
import { Check, X, Timer, Trophy, Zap, RotateCcw } from 'lucide-react';
import { useAccessibility } from '@/contexts/AccessibilityContext';

/* ─────────── Tipos & Banco de preguntas ─────────── */
type BoolQ = {
  id: string;
  type: 'boolean';
  question: string;
  answer: boolean;
  explanation?: string;
};
type MultipleQ = {
  id: string;
  type: 'multiple';
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
};
type MatchingQ = {
  id: string;
  type: 'matching';
  question: string;
  pairs: { left: string; right: string }[];
  explanation?: string;
};
type Question = BoolQ | MultipleQ | MatchingQ;

const BANK: Question[] = [
  { id: 'b1', type: 'boolean', question: 'Una resistencia limita el flujo de corriente en un circuito.', answer: true, explanation: 'Sí: la resistencia se opone al paso de corriente.' },
  { id: 'b2', type: 'boolean', question: 'Un LED puede conectarse directamente a una batería de 9V sin resistencia.', answer: false, explanation: 'No: necesita una resistencia para no quemarse.' },
  { id: 'b3', type: 'boolean', question: 'La corriente convencional fluye del polo positivo al negativo.', answer: true },
  { id: 'b4', type: 'boolean', question: 'Un cortocircuito ocurre cuando la corriente encuentra mucha resistencia.', answer: false, explanation: 'Al contrario: ocurre cuando hay muy poca resistencia.' },
  { id: 'b5', type: 'boolean', question: 'En un circuito en serie, la corriente es la misma en todos los componentes.', answer: true },
  { id: 'b6', type: 'boolean', question: 'El voltaje se mide en Amperios.', answer: false, explanation: 'El voltaje se mide en Voltios (V).' },
  { id: 'm1', type: 'multiple', question: '¿Cuál es la unidad de la resistencia eléctrica?', options: ['Voltio', 'Amperio', 'Ohmio', 'Vatio'], correctIndex: 2 },
  { id: 'm2', type: 'multiple', question: 'Según la Ley de Ohm: V = ?', options: ['I × R', 'I / R', 'R / I', 'I + R'], correctIndex: 0 },
  { id: 'm3', type: 'multiple', question: '¿Qué componente almacena energía en un campo eléctrico?', options: ['Resistencia', 'Capacitor', 'Inductor', 'Diodo'], correctIndex: 1 },
  { id: 'm4', type: 'multiple', question: 'El símbolo ▬ generalmente representa:', options: ['Batería', 'LED', 'Resistencia', 'Interruptor'], correctIndex: 2 },
  { id: 'm5', type: 'multiple', question: '¿Qué pasa si conectas dos resistencias iguales en paralelo?', options: ['Se duplica la resistencia', 'Se reduce a la mitad', 'Permanece igual', 'Se vuelve infinita'], correctIndex: 1 },
  { id: 'm6', type: 'multiple', question: 'En un circuito de 12V con resistencia 4Ω, la corriente es:', options: ['48 A', '3 A', '0.33 A', '8 A'], correctIndex: 1 },
  { id: 'p1', type: 'matching', question: 'Empareja cada magnitud con su unidad:', pairs: [
    { left: 'Voltaje', right: 'Voltio' },
    { left: 'Corriente', right: 'Amperio' },
    { left: 'Resistencia', right: 'Ohmio' },
    { left: 'Potencia', right: 'Vatio' },
  ]},
  { id: 'p2', type: 'matching', question: 'Asocia cada componente con su función:', pairs: [
    { left: 'Batería', right: 'Fuente de energía' },
    { left: 'LED', right: 'Emite luz' },
    { left: 'Resistencia', right: 'Limita corriente' },
    { left: 'Interruptor', right: 'Abre/cierra circuito' },
  ]},
  { id: 'p3', type: 'matching', question: 'Empareja símbolo con componente:', pairs: [
    { left: '⚡', right: 'Energía' },
    { left: '💡', right: 'LED' },
    { left: '🔋', right: 'Batería' },
    { left: '〰️', right: 'Cable' },
  ]},
];

const QUESTIONS_PER_GAME = 8;
const TIME_PER_QUESTION = 15;

/* ─────────── Utils ─────────── */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickQuestions(n: number): Question[] {
  return shuffle(BANK).slice(0, Math.min(n, BANK.length));
}

/* ─────────── Estado del juego (reducer) ─────────── */
type Status = 'idle' | 'playing' | 'feedback' | 'finished';
type State = {
  status: Status;
  questions: Question[];
  index: number;
  score: number;
  correctCount: number;
  timeLeft: number;
  lastCorrect: boolean | null;
  combo: number;
};
type Action =
  | { type: 'START' }
  | { type: 'TICK' }
  | { type: 'ANSWER'; correct: boolean }
  | { type: 'NEXT' }
  | { type: 'TIMEOUT' }
  | { type: 'RESET' };

const initialState: State = {
  status: 'idle',
  questions: [],
  index: 0,
  score: 0,
  correctCount: 0,
  timeLeft: TIME_PER_QUESTION,
  lastCorrect: null,
  combo: 0,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'START':
      return { ...initialState, status: 'playing', questions: pickQuestions(QUESTIONS_PER_GAME), timeLeft: TIME_PER_QUESTION };
    case 'TICK':
      return { ...state, timeLeft: Math.max(0, state.timeLeft - 1) };
    case 'ANSWER': {
      const bonus = Math.round(state.timeLeft * 6);
      const comboBonus = action.correct ? state.combo * 10 : 0;
      const gained = action.correct ? 100 + bonus + comboBonus : 0;
      return {
        ...state,
        status: 'feedback',
        lastCorrect: action.correct,
        score: state.score + gained,
        correctCount: state.correctCount + (action.correct ? 1 : 0),
        combo: action.correct ? state.combo + 1 : 0,
      };
    }
    case 'TIMEOUT':
      return { ...state, status: 'feedback', lastCorrect: false, combo: 0 };
    case 'NEXT': {
      const next = state.index + 1;
      if (next >= state.questions.length) return { ...state, status: 'finished' };
      return { ...state, index: next, status: 'playing', timeLeft: TIME_PER_QUESTION, lastCorrect: null };
    }
    case 'RESET':
      return initialState;
  }
}

/* ─────────── Componentes de pregunta ─────────── */
function BoolView({ q, onAnswer }: { q: BoolQ; onAnswer: (correct: boolean) => void }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {[true, false].map((v) => (
        <motion.button
          key={String(v)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => onAnswer(v === q.answer)}
          className="rounded-2xl border-2 border-cyan-500/40 bg-white px-6 py-8 text-lg font-bold text-slate-900 transition-colors hover:border-cyan-500 hover:bg-cyan-50 dark:border-cyan-500/30 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:border-cyan-400 dark:hover:bg-cyan-500/10"
        >
          {v ? '✅ Verdadero' : '❌ Falso'}
        </motion.button>
      ))}
    </div>
  );
}

function MultipleView({ q, onAnswer }: { q: MultipleQ; onAnswer: (correct: boolean) => void }) {
  const colors = ['#22d3ee', '#a78bfa', '#f59e0b', '#34d399'];
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {q.options.map((opt, i) => (
        <motion.button
          key={i}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onAnswer(i === q.correctIndex)}
          className="flex items-center gap-3 rounded-xl border-2 bg-white px-5 py-4 text-left text-base font-semibold text-slate-900 dark:bg-slate-900/60 dark:text-slate-100"
          style={{ borderColor: `${colors[i % colors.length]}55` }}
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-black"
            style={{ background: `${colors[i % colors.length]}22`, color: colors[i % colors.length] }}
          >
            {String.fromCharCode(65 + i)}
          </span>
          {opt}
        </motion.button>
      ))}
    </div>
  );
}

function MatchingView({ q, onAnswer }: { q: MatchingQ; onAnswer: (correct: boolean) => void }) {
  const lefts = q.pairs.map((p) => p.left);
  const [shuffledRights] = useState(() => shuffle(q.pairs.map((p) => p.right)));
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matched, setMatched] = useState<Record<string, string>>({});

  useEffect(() => {
    if (Object.keys(matched).length === lefts.length) {
      const allCorrect = q.pairs.every((p) => matched[p.left] === p.right);
      const t = setTimeout(() => onAnswer(allCorrect), 400);
      return () => clearTimeout(t);
    }
  }, [matched, lefts.length, q.pairs, onAnswer]);

  const handleRight = (r: string) => {
    if (!selectedLeft || Object.values(matched).includes(r)) return;
    setMatched((m) => ({ ...m, [selectedLeft]: r }));
    setSelectedLeft(null);
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="flex flex-col gap-2">
        {lefts.map((l) => {
          const isMatched = !!matched[l];
          const isSelected = selectedLeft === l;
          return (
            <motion.button
              key={l}
              whileTap={{ scale: 0.97 }}
              onClick={() => !isMatched && setSelectedLeft(l)}
              disabled={isMatched}
              className="rounded-xl border-2 px-4 py-3 text-sm font-bold text-slate-900 transition-colors disabled:opacity-50 dark:text-slate-100"
              style={{
                borderColor: isMatched ? '#34d39955' : isSelected ? '#22d3ee' : '#94a3b8',
                background: isMatched ? 'rgba(52,211,153,0.12)' : isSelected ? 'rgba(34,211,238,0.15)' : 'transparent',
              }}
            >
              {l}
              {isMatched && <span className="ml-2 text-emerald-600 dark:text-emerald-400">→ {matched[l]}</span>}
            </motion.button>
          );
        })}
      </div>
      <div className="flex flex-col gap-2">
        {shuffledRights.map((r) => {
          const used = Object.values(matched).includes(r);
          return (
            <motion.button
              key={r}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleRight(r)}
              disabled={used || !selectedLeft}
              className="rounded-xl border-2 px-4 py-3 text-sm font-bold text-slate-900 transition-colors disabled:opacity-30 dark:text-slate-100"
              style={{ borderColor: '#a78bfa55', background: 'transparent' }}
            >
              {r}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────── Página principal ─────────── */
export default function QuickQuiz() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const navigate = useNavigate();
  const { themeMode } = useAccessibility();
  const isDark = themeMode !== 'light';
  const current = state.questions[state.index];

  /* Cronómetro */
  useEffect(() => {
    if (state.status !== 'playing') return;
    if (state.timeLeft <= 0) {
      dispatch({ type: 'TIMEOUT' });
      return;
    }
    const t = setTimeout(() => dispatch({ type: 'TICK' }), 1000);
    return () => clearTimeout(t);
  }, [state.status, state.timeLeft]);

  /* Auto-avance tras feedback */
  useEffect(() => {
    if (state.status !== 'feedback') return;
    const t = setTimeout(() => dispatch({ type: 'NEXT' }), 1400);
    return () => clearTimeout(t);
  }, [state.status, state.index]);

  const progress = useMemo(() => {
    if (!state.questions.length) return 0;
    return ((state.index + (state.status === 'feedback' || state.status === 'finished' ? 1 : 0)) / state.questions.length) * 100;
  }, [state.index, state.questions.length, state.status]);

  return (
    <div className="min-h-screen flex flex-col text-slate-900 dark:text-slate-200" style={{ background: isDark ? 'linear-gradient(160deg,#060e1d 0%,#091624 60%,#060e1d 100%)' : 'linear-gradient(160deg,#f8fafc 0%,#eff6ff 60%,#f8fafc 100%)' }}>
      <DashboardNav />

      <main className="flex-1 px-4 py-10">
        <div className="mx-auto max-w-2xl">
          {/* HEADER */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="inline-block rounded-full border border-cyan-500/30 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                ⚡ Preguntas Rápidas
              </div>
              <h1 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100 sm:text-3xl">Quiz Cronometrado</h1>
            </div>
            <Link to="/dashboard" className="text-xs text-slate-600 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400">← Volver</Link>
          </div>

          {/* IDLE */}
          {state.status === 'idle' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-cyan-500/30 bg-white p-8 text-center backdrop-blur dark:border-cyan-500/20 dark:bg-slate-900/60">
              <div className="mb-4 text-5xl">🎮</div>
              <h2 className="mb-2 text-xl font-black text-slate-900 dark:text-slate-100">¿Listo para el reto?</h2>
              <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
                Responde {QUESTIONS_PER_GAME} preguntas en menos de {TIME_PER_QUESTION}s cada una.<br />
                ¡Cuanto más rápido, más puntos!
              </p>
              <div className="mb-6 grid grid-cols-3 gap-3 text-xs">
                <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800/60"><div className="text-lg">✅❌</div><div className="text-slate-600 dark:text-slate-400">V/F</div></div>
                <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800/60"><div className="text-lg">🔘</div><div className="text-slate-600 dark:text-slate-400">Opción múltiple</div></div>
                <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800/60"><div className="text-lg">🔗</div><div className="text-slate-600 dark:text-slate-400">Emparejar</div></div>
              </div>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => dispatch({ type: 'START' })}
                className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-8 py-3 font-black uppercase tracking-wider text-white shadow-lg shadow-cyan-500/30">
                <Zap className="mr-2 inline h-4 w-4" /> Comenzar
              </motion.button>
            </motion.div>
          )}

          {/* PLAYING / FEEDBACK */}
          {(state.status === 'playing' || state.status === 'feedback') && current && (
            <>
              {/* Barra de progreso + stats */}
              <div className="mb-4 flex items-center gap-3 text-xs font-bold">
                <span className="text-slate-600 dark:text-slate-400">{state.index + 1} / {state.questions.length}</span>
                <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <motion.div className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-400 to-emerald-400"
                    animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
                </div>
                <span className="text-cyan-600 dark:text-cyan-400">⭐ {state.score}</span>
              </div>

              {/* Cronómetro */}
              <div className="mb-4 flex items-center gap-2">
                <Timer className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <motion.div
                    className="absolute inset-y-0 left-0"
                    style={{
                      background: state.timeLeft > 7 ? '#22d3ee' : state.timeLeft > 3 ? '#f59e0b' : '#ef4444',
                    }}
                    animate={{ width: `${(state.timeLeft / TIME_PER_QUESTION) * 100}%` }}
                    transition={{ duration: 0.4, ease: 'linear' }}
                  />
                </div>
                <span className="w-8 text-right text-sm font-black text-slate-900 dark:text-slate-100">{state.timeLeft}s</span>
              </div>

              {/* Card de la pregunta */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25 }}
                  className="rounded-2xl border border-cyan-500/30 bg-white p-6 backdrop-blur dark:border-cyan-500/20 dark:bg-slate-900/60"
                >
                  <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
                    {current.type === 'boolean' ? 'Verdadero / Falso' : current.type === 'multiple' ? 'Opción múltiple' : 'Empareja'}
                  </div>
                  <h3 className="mb-6 text-lg font-bold text-slate-900 dark:text-slate-100">{current.question}</h3>

                  <div className={state.status === 'feedback' ? 'pointer-events-none opacity-60' : ''}>
                    {current.type === 'boolean' && <BoolView q={current} onAnswer={(c) => dispatch({ type: 'ANSWER', correct: c })} />}
                    {current.type === 'multiple' && <MultipleView q={current} onAnswer={(c) => dispatch({ type: 'ANSWER', correct: c })} />}
                    {current.type === 'matching' && <MatchingView q={current} onAnswer={(c) => dispatch({ type: 'ANSWER', correct: c })} />}
                  </div>

                  {/* Feedback */}
                  <AnimatePresence>
                    {state.status === 'feedback' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-5 flex items-center gap-3 rounded-xl border-2 p-4"
                        style={{
                          borderColor: state.lastCorrect ? '#22c55e' : '#ef4444',
                          background: state.lastCorrect ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                        }}
                      >
                        {state.lastCorrect ? <Check className="h-6 w-6 text-emerald-400" /> : <X className="h-6 w-6 text-red-400" />}
                        <div className="flex-1 text-sm">
                          <div className="font-black" style={{ color: state.lastCorrect ? '#22c55e' : '#ef4444' }}>
                            {state.lastCorrect ? `¡Correcto! ${state.combo > 1 ? `🔥 x${state.combo}` : ''}` : '¡Incorrecto!'}
                          </div>
                          {('explanation' in current) && current.explanation && (
                            <div className="mt-1 text-slate-700 dark:text-slate-300">{current.explanation}</div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </AnimatePresence>
            </>
          )}

          {/* FINISHED */}
          {state.status === 'finished' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl border border-cyan-500/30 bg-white p-8 text-center backdrop-blur dark:border-cyan-500/20 dark:bg-slate-900/60">
              <Trophy className="mx-auto mb-4 h-16 w-16 text-amber-500 dark:text-amber-400" />
              <h2 className="mb-2 text-3xl font-black text-slate-900 dark:text-slate-100">¡Quiz completado!</h2>
              <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">Has terminado el reto cronometrado.</p>

              <div className="mb-6 grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-cyan-500/40 bg-slate-50 p-4 dark:border-cyan-500/30 dark:bg-slate-800/60">
                  <div className="text-xs text-slate-600 dark:text-slate-400">Aciertos</div>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{state.correctCount}/{state.questions.length}</div>
                </div>
                <div className="rounded-xl border border-cyan-500/40 bg-slate-50 p-4 dark:border-cyan-500/30 dark:bg-slate-800/60">
                  <div className="text-xs text-slate-600 dark:text-slate-400">Puntuación</div>
                  <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400">{state.score}</div>
                </div>
                <div className="rounded-xl border border-cyan-500/40 bg-slate-50 p-4 dark:border-cyan-500/30 dark:bg-slate-800/60">
                  <div className="text-xs text-slate-600 dark:text-slate-400">Precisión</div>
                  <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                    {Math.round((state.correctCount / state.questions.length) * 100)}%
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  onClick={() => dispatch({ type: 'START' })}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 font-black uppercase tracking-wider text-white">
                  <RotateCcw className="h-4 w-4" /> Otra ronda
                </motion.button>
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  onClick={() => navigate('/dashboard')}
                  className="rounded-xl border border-slate-300 px-6 py-3 font-black uppercase tracking-wider text-slate-700 dark:border-slate-700 dark:text-slate-300">
                  Inicio
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
