import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Zap, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
    } catch {
      // Silently ignore errors to prevent enumeration
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary glow-primary">
            <Zap className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold text-secondary-foreground text-glow">SparkLab</h1>
        </div>

        <div className="rounded-xl border border-border bg-card p-8 shadow-2xl">
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent">
                <CheckCircle className="h-7 w-7 text-primary" />
              </div>
              <h2 className="font-display text-lg font-semibold text-card-foreground">{t('forgotPassword.checkEmail')}</h2>
              <p className="text-sm text-muted-foreground">
                {t('forgotPassword.checkEmailDesc', { email })}
              </p>
              <p className="text-xs text-muted-foreground">{t('forgotPassword.checkSpam')}</p>
              <div className="pt-2 space-y-3">
                <Button variant="outline" className="w-full" onClick={() => setSubmitted(false)}>
                  {t('forgotPassword.tryAnother')}
                </Button>
                <Link to="/auth" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <ArrowLeft className="h-4 w-4" /> {t('forgotPassword.backToLogin')}
                </Link>
              </div>
            </div>
          ) : (
            <>
              <h2 className="mb-2 text-center font-display text-lg font-semibold text-card-foreground">{t('forgotPassword.title')}</h2>
              <p className="mb-6 text-center text-sm text-muted-foreground">{t('forgotPassword.desc')}</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input type="email" placeholder={t('auth.email')} value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
                </div>
                <Button type="submit" className="w-full glow-primary" disabled={loading}>
                  {loading ? t('forgotPassword.sending') : t('forgotPassword.send')}
                </Button>
              </form>
              <Link to="/auth" className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="h-4 w-4" /> {t('forgotPassword.backToLogin')}
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
