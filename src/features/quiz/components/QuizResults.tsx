import { motion } from 'framer-motion';
import { RotateCcw, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface QuizResultsProps {
  score: number;
  correctCount: number;
  wrongCount: number;
  totalQuestions: number;
  onRestart: () => void;
}

export function QuizResults({
  score,
  correctCount,
  wrongCount,
  totalQuestions,
  onRestart,
}: QuizResultsProps) {
  const { t } = useTranslation();
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-lg rounded-2xl border border-primary/30 bg-card p-6 text-center shadow-[0_0_40px_hsl(var(--primary)/0.25)]"
    >
      <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-primary/15 text-primary">
        <Trophy className="size-10" />
      </div>
      <h2 className="text-2xl font-bold">{t('quiz.completed')}</h2>
      <p className="mt-1 text-muted-foreground">{t('quiz.performance')}</p>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <Stat label={t('quiz.points')} value={score.toString()} />
        <Stat label={t('quiz.hits')} value={`${correctCount}/${totalQuestions}`} />
        <Stat label={t('quiz.accuracy')} value={`${accuracy}%`} />
      </div>

      <Button onClick={onRestart} className="mt-6 w-full" size="lg">
        <RotateCcw className="mr-2 size-4" />
        {t('quiz.playAgain')}
      </Button>
    </motion.div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/40 p-3">
      <div className="text-lg font-bold text-primary">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
