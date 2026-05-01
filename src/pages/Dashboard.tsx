import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardNav } from '@/components/DashboardNav';
import { Zap, Target, Trophy, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Explorer';
  const profileCheckedRef = useRef(false);

  useEffect(() => {
    if (!user || profileCheckedRef.current) return;
    profileCheckedRef.current = true;
    (async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, language, gender, country')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) return;
      const missing =
        !data ||
        !data.username ||
        !data.language ||
        !data.gender ||
        !data.country;
      if (missing) {
        toast.warning(t('dashboard.profileIncompleteTitle'), {
          description: t('dashboard.profileIncompleteDesc'),
          duration: 8000,
          action: {
            label: t('dashboard.completeProfile'),
            onClick: () => navigate('/dashboard/profile'),
          },
        });
      }
    })();
  }, [user, t, navigate]);

  const missions = [
    { id: 1, title: t('dashboard.mission1Title'), desc: t('dashboard.mission1Desc'), xp: 100, status: 'disponible' },
    { id: 2, title: t('dashboard.mission2Title'), desc: t('dashboard.mission2Desc'), xp: 150, status: 'bloqueada' },
    { id: 3, title: t('dashboard.mission3Title'), desc: t('dashboard.mission3Desc'), xp: 200, status: 'bloqueada' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <main className="mx-auto max-w-7xl p-6">
        {/* Welcome */}
        <div className="mb-8 rounded-xl border border-border bg-card p-6">
          <h1 className="font-display text-2xl font-bold text-card-foreground">
            {t('dashboard.hello', { name: displayName })} <span className="text-glow">⚡</span>
          </h1>
          <p className="mt-1 text-muted-foreground">{t('dashboard.continueAdventure')}</p>
          <div className="mt-4 flex gap-4">
            <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">0 XP</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-accent/10 px-4 py-2">
              <Trophy className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-accent">{t('dashboard.level', { level: 1 })}</span>
            </div>
          </div>
        </div>

        {/* Missions */}
        <h2 className="mb-4 font-display text-xl font-semibold text-foreground">
          <Target className="mr-2 inline h-5 w-5 text-primary" />
          {t('dashboard.missionsTitle')}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {missions.map((m) => (
            <div
              key={m.id}
              className={`rounded-xl border p-5 transition-all ${
                m.status === 'disponible'
                  ? 'border-primary/30 bg-card hover:border-primary hover:glow-primary cursor-pointer'
                  : 'border-border bg-muted/50 opacity-60'
              }`}
            >
              <h3 className="font-display text-sm font-semibold text-card-foreground">{m.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{m.desc}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs font-medium text-primary">+{m.xp} XP</span>
                {m.status === 'disponible' && (
                  <Link to="/dashboard/simulator">
                    <Button size="sm" className="h-7 gap-1 text-xs">
                      {t('dashboard.start')} <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
