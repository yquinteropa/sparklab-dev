import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { CheckCircle, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function AccountActivated() {
  const [ready, setReady] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    supabase.auth.signOut().then(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary">
        <span className="text-muted-foreground">{t('accountActivated.processing')}</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <Link to="/" className="inline-block">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary glow-primary">
            <Zap className="h-8 w-8 text-primary-foreground" />
          </div>
        </Link>
        <div className="rounded-xl border border-border bg-card p-8 shadow-2xl space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <div className="space-y-2">
            <h1 className="font-display text-2xl font-bold text-card-foreground">{t('accountActivated.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('accountActivated.desc')}</p>
          </div>
          <Button asChild className="w-full glow-primary">
            <Link to="/auth">{t('accountActivated.login')}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
