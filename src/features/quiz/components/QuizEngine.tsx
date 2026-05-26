import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Timer, Zap, Trophy, AlertCircle, CheckCircle2, BrainCircuit } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useQuizSession } from '../hooks/useQuizSession';
import { RENDERERS } from './renderers';
import { QuizHeader } from './QuizHeader';
import { QuizFeedback } from './QuizFeedback';
import { QuizResults } from './QuizResults';

interface QuizEngineProps {
  totalQuestions?: number;
  totalSeconds?: number;
}

export function QuizEngine({
  totalQuestions = 20,
  totalSeconds = 180,
}: QuizEngineProps) {
  const session = useQuizSession({ totalQuestions, totalSeconds });
  const submittedRef = useRef(false);

  useEffect(() => {
    if (session.status !== 'finished') {
      submittedRef.current = false;
      return;
    }
    if (submittedRef.current) return;
    submittedRef.current = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase.rpc('update_user_score', { p_score: session.score });
      if (error) return;
      const row = Array.isArray(data) ? data[0] : data;
      if (row?.entered_top) {
        toast.success(`¡Entraste al Top 100! Puntaje: ${row.new_best}`);
      } else if (row?.improved) {
        toast.success(`¡Mejoraste tu puntaje! Nuevo mejor: ${row.new_best}`);
      }
    })();
  }, [session.status, session.score]);

  if (session.status === 'loading') {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p>Cargando preguntas…</p>
      </div>
    );
  }

  if (session.status === 'error') {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-destructive/40 bg-card p-6 text-center">
        <h3 className="text-lg font-semibold text-destructive">No se pudo iniciar el quiz</h3>
        <p className="mt-2 text-sm text-muted-foreground">{session.error}</p>
        <Button onClick={session.start} className="mt-4">
          Reintentar
        </Button>
      </div>
    );
  }

  if (session.status === 'ready') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto w-full max-w-2xl"
      >
        <div className="rounded-2xl border border-primary/20 bg-card/70 p-6 sm:p-8 text-center shadow-[0_0_40px_hsl(var(--primary)/0.12)] backdrop-blur">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/15 text-primary">
            <BrainCircuit className="size-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold">
            Modo <span className="text-primary">Preguntas Rápidas</span>
          </h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            Pon a prueba tus conocimientos de circuitos eléctricos contra el reloj. Responde con precisión y rapidez para maximizar tu puntuación.
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <InfoCard
              icon={<Timer className="size-5 text-primary" />}
              label="Tiempo límite"
              value={`${totalSeconds} segundos`}
            />
            <InfoCard
              icon={<Zap className="size-5 text-primary" />}
              label="Preguntas"
              value={`${totalQuestions}`}
            />
            <InfoCard
              icon={<Trophy className="size-5 text-primary" />}
              label="Puntos base"
              value="100 pts"
            />
          </div>

          <div className="mt-8 rounded-xl border border-border bg-secondary/40 p-5 text-left space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <AlertCircle className="size-4 text-primary" />
              Indicaciones
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-4 mt-0.5 text-primary shrink-0" />
                Tienes un tiempo global para responder todas las preguntas.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-4 mt-0.5 text-primary shrink-0" />
                Cada acierto suma puntos base + bonificación por tiempo restante.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-4 mt-0.5 text-primary shrink-0" />
                Al acertar ganas 3 segundos extra; al fallar pierdes 5 segundos.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-4 mt-0.5 text-primary shrink-0" />
                Las opciones aparecen en orden aleatorio en cada intento.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-4 mt-0.5 text-primary shrink-0" />
                Solo se notifica si entras al Top 100 o mejoras tu marca personal.
              </li>
            </ul>
          </div>

          <Button onClick={session.start} className="mt-8 w-full sm:w-auto" size="lg">
            <Zap className="mr-2 size-4" />
            Comenzar intento
          </Button>
        </div>
      </motion.div>
    );
  }

  if (session.status === 'finished') {
    return (
      <QuizResults
        score={session.score}
        correctCount={session.correctCount}
        wrongCount={session.wrongCount}
        totalQuestions={session.totalQuestions}
        onRestart={session.start}
      />
    );
  }

  const q = session.currentQuestion;
  if (!q) return null;

  const Renderer = RENDERERS[q.type];

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <QuizHeader
        currentIndex={session.currentIndex}
        totalQuestions={session.totalQuestions}
        score={session.score}
        timeLeft={session.timeLeft}
        totalSeconds={totalSeconds}
      />

      <div className="rounded-2xl border border-border bg-card/60 p-5 sm:p-6 backdrop-blur shadow-[0_0_30px_hsl(var(--primary)/0.08)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={q.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
          >
            <Renderer
              question={q}
              disabled={session.status === 'feedback'}
              onAnswer={session.submitAnswer}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <QuizFeedback result={session.lastResult} onContinue={session.next} />
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 p-4">
      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
        {icon}
      </div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-semibold text-foreground">{value}</div>
      </div>
    </div>
  );
}
