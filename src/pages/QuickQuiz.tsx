/**
 * Ruta dedicada al modo cronometrado.
 * Monta directamente el QuizEngine con su configuración por defecto.
 */
import { DashboardNav } from '@/components/DashboardNav';
import { QuizEngine } from '@/features/quiz/components/QuizEngine';
import { useTranslation } from 'react-i18next';

export default function QuickQuiz() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardNav />
      <main className="container mx-auto px-4 py-6 sm:py-10">
        <header className="mb-6 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold">
            {t('quiz.pageTitle1')} <span className="text-primary">{t('quiz.pageTitle2')}</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('quiz.pageSubtitle')}
          </p>
        </header>
        <QuizEngine totalQuestions={20} totalSeconds={180} />
      </main>
    </div>
  );
}
