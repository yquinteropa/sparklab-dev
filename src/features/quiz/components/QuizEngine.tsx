import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
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
