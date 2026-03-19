import { DashboardNav } from '@/components/DashboardNav';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Zap, Trophy } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <main className="mx-auto max-w-2xl p-6">
        <div className="rounded-xl border border-border bg-card p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground font-display">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-card-foreground">
                {user?.user_metadata?.full_name || 'Explorador'}
              </h1>
              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5" /> {user?.email}
              </p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-border bg-muted p-4 text-center">
              <Zap className="mx-auto h-6 w-6 text-primary" />
              <p className="mt-1 font-display text-lg font-bold text-card-foreground">0</p>
              <p className="text-xs text-muted-foreground">Puntos XP</p>
            </div>
            <div className="rounded-lg border border-border bg-muted p-4 text-center">
              <Trophy className="mx-auto h-6 w-6 text-accent" />
              <p className="mt-1 font-display text-lg font-bold text-card-foreground">1</p>
              <p className="text-xs text-muted-foreground">Nivel</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
