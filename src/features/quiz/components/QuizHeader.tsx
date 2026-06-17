/**
 * Encabezado del quiz cronometrado: muestra progreso, puntuación y tiempo restante.
 * Resalta visualmente (color destructivo + pulso) cuando quedan menos de 30 segundos.
 */
import { Timer, Trophy, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Progress } from '@/components/ui/progress';

interface QuizHeaderProps {
  currentIndex: number;
  totalQuestions: number;
  score: number;
  timeLeft: number;
  totalSeconds: number;
}

export function QuizHeader({
  currentIndex,
  totalQuestions,
  score,
  timeLeft,
  totalSeconds,
}: QuizHeaderProps) {
  const { t } = useTranslation();
  // Porcentaje de progreso de preguntas respondidas (0..100)
  const progress = totalQuestions > 0 ? ((currentIndex) / totalQuestions) * 100 : 0;
  // Porcentaje de tiempo restante (sirve para animar la barra del cronómetro)
  const timePct = totalSeconds > 0 ? (timeLeft / totalSeconds) * 100 : 0;
  // Bandera de "poco tiempo" para cambiar el estilo visual a urgencia
  const lowTime = timeLeft < 30;

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Zap className="size-4 text-primary" />
          <span>
            {t('quiz.questionOf')} <span className="font-semibold text-foreground">{Math.min(currentIndex + 1, totalQuestions)}</span> / {totalQuestions}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="size-4 text-primary" />
          <motion.span
            key={score}
            initial={{ scale: 1.2, color: 'hsl(var(--primary))' }}
            animate={{ scale: 1, color: 'hsl(var(--foreground))' }}
            className="font-bold tabular-nums"
          >
            {score} {t('quiz.pts')}
          </motion.span>
        </div>
        <div
          className={`flex items-center gap-2 font-semibold tabular-nums ${
            lowTime ? 'text-destructive' : 'text-foreground'
          }`}
        >
          <Timer className={`size-4 ${lowTime ? 'text-destructive animate-pulse' : 'text-primary'}`} />
          {timeLeft}s
        </div>
      </div>
      <Progress value={progress} className="h-2" />
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <motion.div
          className={`h-full ${lowTime ? 'bg-destructive' : 'bg-primary'}`}
          animate={{ width: `${timePct}%` }}
          transition={{ ease: 'linear', duration: 0.5 }}
          style={{ boxShadow: lowTime ? '0 0 12px hsl(var(--destructive))' : '0 0 12px hsl(var(--primary))' }}
        />
      </div>
    </div>
  );
}
