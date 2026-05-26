import { DashboardNav } from '@/components/DashboardNav';
import { QuizEngine } from '@/features/quiz/components/QuizEngine';

export default function QuickQuiz() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardNav />
      <main className="container mx-auto px-4 py-6 sm:py-10">
        <header className="mb-6 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold">
            Quiz <span className="text-primary">Cronometrado</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            20 preguntas · responde rápido para ganar más puntos
          </p>
        </header>
        <QuizEngine totalQuestions={20} totalSeconds={180} />
      </main>
    </div>
  );
}
