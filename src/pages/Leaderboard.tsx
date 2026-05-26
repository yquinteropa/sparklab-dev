import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Crown, Zap, Loader2, Timer } from 'lucide-react';
import { DashboardNav } from '@/components/DashboardNav';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

function getTimeUntilNextReset() {
  const now = new Date();
  const next = new Date(now);
  next.setUTCDate(now.getUTCDate() + ((7 - now.getUTCDay()) % 7 || 7));
  next.setUTCHours(0, 0, 0, 0);
  if (next.getTime() <= now.getTime()) {
    next.setUTCDate(next.getUTCDate() + 7);
  }
  return next.getTime() - now.getTime();
}

function formatCountdown(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  if (days > 0) return `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function useCountdown() {
  const [ms, setMs] = useState(getTimeUntilNextReset());
  useEffect(() => {
    const id = window.setInterval(() => setMs(getTimeUntilNextReset()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return ms;
}

interface LeaderboardRow {
  rank: number;
  user_id: string;
  score: number;
  display_name: string | null;
  avatar_url: string | null;
}

const podiumStyles = [
  {
    // Gold
    ring: 'ring-2 ring-primary',
    glow: 'shadow-[0_0_40px_hsl(var(--primary)/0.55)]',
    badge: 'bg-primary text-primary-foreground',
    icon: Crown,
    height: 'md:h-44',
    order: 'md:order-2',
  },
  {
    // Silver
    ring: 'ring-2 ring-foreground/40',
    glow: 'shadow-[0_0_25px_hsl(var(--foreground)/0.18)]',
    badge: 'bg-foreground/20 text-foreground',
    icon: Trophy,
    height: 'md:h-36',
    order: 'md:order-1',
  },
  {
    // Bronze
    ring: 'ring-2 ring-amber-600/60',
    glow: 'shadow-[0_0_25px_rgba(217,119,6,0.35)]',
    badge: 'bg-amber-600/30 text-amber-200',
    icon: Medal,
    height: 'md:h-32',
    order: 'md:order-3',
  },
];

export default function Leaderboard() {
  const { t } = useTranslation();
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [{ data: userData }, { data, error }] = await Promise.all([
        supabase.auth.getUser(),
        supabase
          .from('weekly_leaderboard')
          .select('rank, user_id, score, display_name, avatar_url')
          .order('rank', { ascending: true })
          .limit(100),
      ]);
      if (!alive) return;
      setCurrentUserId(userData.user?.id ?? null);
      if (!error && data) setRows(data as LeaderboardRow[]);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const top3 = rows.slice(0, 3);
  const rest = rows.slice(3);

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <main className="mx-auto max-w-4xl p-4 sm:p-6">
        <motion.h1
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 flex items-center gap-2 font-display text-2xl font-bold text-foreground"
        >
          <Trophy className="h-6 w-6 text-primary" /> {t('leaderboard.title')}
        </motion.h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Top 100 mundial · Mejor puntaje histórico de cada jugador
        </p>

        {loading ? (
          <div className="flex min-h-[200px] items-center justify-center text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" />
            Cargando ranking…
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
            Aún no hay puntajes registrados. ¡Sé el primero en jugar!
          </div>
        ) : (
          <>
            {/* Podium */}
            <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-3 md:items-end">
              {top3.map((p, i) => {
                const s = podiumStyles[i];
                const Icon = s.icon;
                return (
                  <motion.div
                    key={p.user_id}
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: i * 0.12, type: 'spring', stiffness: 120 }}
                    className={cn(
                      'relative flex flex-col items-center justify-end rounded-2xl border border-border bg-card/70 p-4 backdrop-blur',
                      s.ring,
                      s.glow,
                      s.height,
                      s.order,
                      p.user_id === currentUserId && 'outline outline-2 outline-primary/60',
                    )}
                  >
                    <div className={cn('absolute -top-4 flex h-9 w-9 items-center justify-center rounded-full', s.badge)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="mt-2 text-center">
                      <div className="truncate font-display text-base font-semibold text-card-foreground">
                        {p.display_name || 'Jugador'}
                      </div>
                      <div className="mt-1 flex items-center justify-center gap-1 text-sm font-bold text-primary">
                        <Zap className="h-3.5 w-3.5" /> {p.score.toLocaleString()}
                      </div>
                      <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                        #{p.rank}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Rest of list */}
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {rest.map((p, idx) => (
                  <motion.div
                    key={p.user_id}
                    layout
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ delay: Math.min(idx * 0.015, 0.4), duration: 0.25 }}
                    className={cn(
                      'flex items-center gap-3 rounded-xl border border-border bg-card/60 p-3 backdrop-blur transition-colors hover:border-primary/40',
                      p.user_id === currentUserId && 'border-primary bg-primary/5',
                    )}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted font-display text-xs font-bold text-muted-foreground">
                      {p.rank}
                    </span>
                    <span className="flex-1 truncate text-sm font-medium text-card-foreground">
                      {p.display_name || 'Jugador'}
                      {p.user_id === currentUserId && (
                        <span className="ml-2 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                          Tú
                        </span>
                      )}
                    </span>
                    <div className="flex items-center gap-1 text-sm font-bold text-primary">
                      <Zap className="h-3.5 w-3.5" /> {p.score.toLocaleString()}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
