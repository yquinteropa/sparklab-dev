/**
 * Modal de feedback inmediato tras responder una pregunta.
 * Muestra acierto/error con animación, puntos ganados, explicación opcional
 * y cierra al hacer clic en cualquier parte (continuar a la siguiente pregunta).
 */
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { FeedbackResult } from '../types';

interface QuizFeedbackProps {
  result: FeedbackResult | null;
  onContinue: () => void;
}

export function QuizFeedback({ result, onContinue }: QuizFeedbackProps) {
  const { t } = useTranslation();
  return (
    <AnimatePresence>
      {result && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onClick={onContinue}
        >
          <motion.div
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className={`w-full max-w-md rounded-2xl border-2 p-6 text-center ${
              result.correct
                ? 'border-primary bg-card shadow-[0_0_40px_hsl(var(--primary)/0.4)]'
                : 'border-destructive bg-card shadow-[0_0_40px_hsl(var(--destructive)/0.4)]'
            }`}
          >
            <div
              className={`mx-auto mb-3 flex size-16 items-center justify-center rounded-full ${
                result.correct ? 'bg-primary/15 text-primary' : 'bg-destructive/15 text-destructive'
              }`}
            >
              {result.correct ? <Check className="size-9" /> : <X className="size-9" />}
            </div>
            <h3 className="text-xl font-bold">
              {result.correct ? t('quiz.correct') : t('quiz.incorrect')}
            </h3>
            {result.pointsAwarded > 0 && (
              <p className="mt-1 text-sm text-primary font-semibold">
                +{result.pointsAwarded} {t('quiz.pts')}
              </p>
            )}
            {result.explanation && (
              <p className="mt-3 text-sm text-muted-foreground">{result.explanation}</p>
            )}
            <p className="mt-4 text-xs uppercase tracking-wider text-muted-foreground">
              {t('quiz.tapToContinue')}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
