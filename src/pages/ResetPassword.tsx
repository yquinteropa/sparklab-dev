import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Zap, Lock, Eye, EyeOff, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const passwordRules = [
    { label: t('auth.pwMin8'), test: (p: string) => p.length >= 8 },
    { label: t('auth.pwUppercase'), test: (p: string) => /[A-Z]/.test(p) },
    { label: t('auth.pwLowercase'), test: (p: string) => /[a-z]/.test(p) },
    { label: t('auth.pwNumber'), test: (p: string) => /\d/.test(p) },
    { label: t('auth.pwSpecial'), test: (p: string) => /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`]/.test(p) },
  ];

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setIsValidSession(true);
      setChecking(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setIsValidSession(true);
      setChecking(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const allRulesPass = passwordRules.every((r) => r.test(password));
  const passwordsMatch = confirmPassword.length === 0 || password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allRulesPass) { toast.error(t('resetPassword.securityError')); return; }
    if (password !== confirmPassword) { toast.error(t('resetPassword.passwordsDontMatch')); return; }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      await supabase.auth.signOut();
      toast.success(t('resetPassword.success'));
      setTimeout(() => navigate('/auth'), 2000);
    } catch (err: any) {
      toast.error(err.message || t('resetPassword.error'));
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary">
        <span className="text-muted-foreground">{t('resetPassword.verifying')}</span>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-2xl">
          <h2 className="mb-2 font-display text-lg font-semibold text-card-foreground">{t('resetPassword.invalidLink')}</h2>
          <p className="mb-6 text-sm text-muted-foreground">{t('resetPassword.invalidLinkDesc')}</p>
          <Button onClick={() => navigate('/auth/forgot-password')} className="glow-primary">{t('resetPassword.requestNewLink')}</Button>
        </div>
      </div>
    );
  }

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
          <h2 className="mb-2 text-center font-display text-lg font-semibold text-card-foreground">{t('resetPassword.title')}</h2>
          <p className="mb-6 text-center text-sm text-muted-foreground">{t('resetPassword.desc')}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input type={showPassword ? 'text' : 'password'} placeholder={t('resetPassword.newPassword')} value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {password.length > 0 && (
              <div className="space-y-1 rounded-lg border border-border bg-muted/40 p-3">
                {passwordRules.map((rule, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    {rule.test(password) ? <Check className="h-3.5 w-3.5 text-green-500" /> : <X className="h-3.5 w-3.5 text-destructive" />}
                    <span className={rule.test(password) ? 'text-green-500' : 'text-muted-foreground'}>{rule.label}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input type={showConfirm ? 'text' : 'password'} placeholder={t('resetPassword.confirmPassword')} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`pl-10 pr-10 ${!passwordsMatch ? 'border-destructive' : ''}`} required />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors">
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {!passwordsMatch && <p className="text-sm text-destructive">{t('resetPassword.passwordsDontMatch')}</p>}

            <Button type="submit" className="w-full glow-primary" disabled={loading || !allRulesPass || !passwordsMatch}>
              {loading ? t('resetPassword.submitting') : t('resetPassword.submit')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
