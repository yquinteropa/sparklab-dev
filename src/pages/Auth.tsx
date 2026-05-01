import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { Input } from '@/components/ui/input';
import { Zap, Mail, Lock, User, Eye, EyeOff, Check, X, Home } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import VerificationSent from '@/components/VerificationSent';

/* ───────── Decorative SVGs ───────── */

function LightningBolt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

function CircuitPattern({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M50 20 L50 60 L100 60" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="50" cy="20" r="5" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="100" cy="60" r="5" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M20 100 L80 100 L80 140 L140 140" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="20" cy="100" r="5" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="140" cy="140" r="5" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M60 180 L60 220 L120 220 L120 260" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="60" cy="180" r="5" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="120" cy="260" r="5" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M150 80 L150 120 L200 120 L200 80 L250 80" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="150" cy="80" r="5" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="250" cy="80" r="5" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M180 160 L240 160 L240 200 L300 200" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="180" cy="160" r="5" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="300" cy="200" r="5" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M280 40 L280 100 L340 100 L340 60" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="280" cy="40" r="5" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="340" cy="60" r="5" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M300 140 L360 140 L360 180" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="300" cy="140" r="5" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="360" cy="180" r="5" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M100 300 L100 340 L160 340 L160 380" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="100" cy="300" r="5" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="160" cy="380" r="5" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M200 280 L200 320 L260 320 L260 360 L320 360" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="200" cy="280" r="5" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="320" cy="360" r="5" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M340 240 L340 300 L380 300" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="340" cy="240" r="5" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="380" cy="300" r="5" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  );
}

/* ───────── Themed Input wrapper ───────── */

function FieldShell({
  icon: Icon,
  filled,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  filled: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="group relative">
      <Icon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
      {children}
      <div
        className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full transition-all duration-300 ${
          filled
            ? 'bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.6)]'
            : 'bg-muted-foreground/40 group-focus-within:bg-primary group-focus-within:shadow-[0_0_8px_hsl(var(--primary)/0.6)]'
        }`}
      />
    </div>
  );
}

/* ───────── Page ───────── */

export default function Auth() {
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const { t } = useTranslation();
  const navigate = useNavigate();
  const { session } = useAuth();

  const passwordRules = [
    { label: t('auth.pwMin8'), test: (p: string) => p.length >= 8 },
    { label: t('auth.pwUppercase'), test: (p: string) => /[A-Z]/.test(p) },
    { label: t('auth.pwLowercase'), test: (p: string) => /[a-z]/.test(p) },
    { label: t('auth.pwNumber'), test: (p: string) => /\d/.test(p) },
    { label: t('auth.pwSpecial'), test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
  ];


  const allRulesPass = passwordRules.every((r) => r.test(password));

  useEffect(() => {
    if (session) navigate('/dashboard');
  }, [session, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && password !== confirmPassword) {
      toast.error(t('auth.passwordsDontMatch'));
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message === 'Invalid login credentials') {
            await supabase.auth.resetPasswordForEmail(email, {
              redirectTo: `${window.location.origin}/reset-password`,
            });
            toast.error(t('auth.invalidCredentials'), { duration: 6000 });
            setLoading(false);
            return;
          }
          throw error;
        }
        if (data.user && !data.user.email_confirmed_at) {
          await supabase.auth.signOut();
          toast.error(t('auth.verifyEmailFirst'));
          setLoading(false);
          return;
        }
        toast.success(t('auth.welcomeBack'));
      } else {
        const trimmed = fullName.trim();
        const parts = trimmed.split(/\s+/);
        const firstName = parts.slice(0, -1).join(' ') || parts[0] || '';
        const lastName = parts.length > 1 ? parts[parts.length - 1] : '';
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: trimmed,
              first_name: firstName,
              last_name: lastName,
            },
            emailRedirectTo: window.location.origin + '/account-activated',
          },
        });
        if (error) {
          if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
            toast.error(t('auth.emailAlreadyRegistered'), { duration: 5000 });
            setLoading(false);
            return;
          }
          throw error;
        }
        if (data.user && data.user.identities && data.user.identities.length === 0) {
          toast.error(t('auth.emailAlreadyRegistered'), { duration: 5000 });
          setLoading(false);
          return;
        }
        setVerificationSent(true);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google') => {
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: `${window.location.origin}/dashboard`,
      });
      if (result?.error) {
        const errorMsg = String(result.error);
        if (errorMsg.includes('already') || errorMsg.includes('conflict')) {
          toast.error(t('auth.googleConflict'), { duration: 5000 });
        } else {
          toast.error(errorMsg);
        }
      }
    } catch {
      toast.error(t('auth.googleError'));
    }
  };

  const inputBase =
    'w-full bg-background/60 border border-border rounded-xl py-3 pl-12 pr-12 text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300';

  const submitDisabled =
    loading || (!isLogin && (!allRulesPass || !fullName.trim() || password !== confirmPassword));

  return (
    <div className="min-h-screen bg-[hsl(var(--simulator-bg))] flex items-center justify-center p-4 overflow-hidden relative">
      {/* Home button */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-20 w-10 h-10 rounded-xl bg-card/60 border border-border backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all duration-300"
        title={t('verification.backHome')}
      >
        <Home className="w-5 h-5" />
      </Link>

      {/* Background circuit patterns */}
      <CircuitPattern className="absolute top-0 left-0 w-80 h-80 text-primary/20 pointer-events-none" />
      <CircuitPattern className="absolute bottom-0 left-10 w-72 h-72 text-primary/15 rotate-90 pointer-events-none" />
      <CircuitPattern className="absolute top-10 right-0 w-80 h-80 text-primary/20 rotate-180 pointer-events-none" />
      <CircuitPattern className="absolute bottom-0 right-0 w-72 h-72 text-primary/15 -rotate-90 pointer-events-none" />

      {/* Lightning bolts */}
      <LightningBolt className="absolute top-20 left-16 w-8 h-8 text-primary/40 animate-pulse pointer-events-none" />
      <LightningBolt className="absolute top-48 left-8 w-6 h-6 text-primary/30 animate-pulse [animation-delay:300ms] pointer-events-none" />
      <LightningBolt className="absolute bottom-32 left-20 w-7 h-7 text-primary/35 animate-pulse [animation-delay:500ms] pointer-events-none" />
      <LightningBolt className="absolute bottom-60 left-6 w-5 h-5 text-primary/25 animate-pulse [animation-delay:700ms] pointer-events-none" />
      <LightningBolt className="absolute top-24 right-12 w-7 h-7 text-primary/40 animate-pulse [animation-delay:200ms] pointer-events-none" />
      <LightningBolt className="absolute top-56 right-20 w-6 h-6 text-primary/30 animate-pulse [animation-delay:400ms] pointer-events-none" />
      <LightningBolt className="absolute bottom-40 right-8 w-8 h-8 text-primary/35 animate-pulse [animation-delay:600ms] pointer-events-none" />
      <LightningBolt className="absolute bottom-72 right-16 w-5 h-5 text-primary/25 animate-pulse pointer-events-none" />

      {/* Energy lines */}
      <div className="absolute top-1/4 left-0 w-32 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-pulse pointer-events-none" />
      <div className="absolute top-2/3 right-0 w-40 h-px bg-gradient-to-l from-transparent via-primary/50 to-transparent animate-pulse [animation-delay:300ms] pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-24 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent animate-pulse [animation-delay:500ms] pointer-events-none" />

      {/* Card */}
      <div className={`relative w-full ${isLogin ? 'max-w-md' : 'max-w-lg'} z-10 transition-all duration-300`}>
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-32 bg-primary/20 blur-3xl rounded-full pointer-events-none" />

        <div className="relative bg-card/60 backdrop-blur-xl border border-primary/20 rounded-2xl p-8 shadow-2xl shadow-primary/10">
          {/* Header */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-cyan-500 mb-4 shadow-lg shadow-primary/30 relative overflow-hidden">
              <Zap className="w-8 h-8 text-primary-foreground relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent animate-pulse" />
            </Link>
            <h1 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              {isLogin ? t('auth.login') : t('auth.signup')}
            </h1>
            <p className="text-muted-foreground text-sm">{t('auth.slogan')}</p>
          </div>

          {verificationSent ? (
            <VerificationSent email={email} />
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <>
                    {/* Step indicator */}
                    <div className="flex items-center justify-center gap-1 mb-2 select-none" aria-hidden="true">
                      {[1, 2, 3, 4].map((step, idx) => (
                        <div key={step} className="flex items-center gap-1">
                          <div className="w-7 h-7 rounded-md bg-secondary/70 border border-border flex items-center justify-center text-xs font-semibold text-muted-foreground">
                            {step}
                          </div>
                          {idx < 3 && (
                            <div className="flex items-center gap-1">
                              <span className="w-4 h-px bg-border" />
                              <span className="w-1 h-1 rounded-full bg-border" />
                              <span className="w-4 h-px bg-border" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <FieldShell icon={User} filled={fullName.length > 0}>
                      <Input
                        placeholder={t('auth.fullName')}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className={inputBase}
                        required
                      />
                    </FieldShell>
                  </>
                )}

                <FieldShell icon={Mail} filled={email.length > 0}>
                  <Input
                    type="email"
                    placeholder={t('auth.email')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputBase}
                    required
                  />
                </FieldShell>

                <div className="group relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('auth.password')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputBase} pr-20`}
                    required
                    minLength={isLogin ? 6 : 8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-10 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  <div
                    className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full transition-all duration-300 ${
                      password.length > 0
                        ? 'bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.6)]'
                        : 'bg-muted-foreground/40 group-focus-within:bg-primary'
                    }`}
                  />
                </div>

                {!isLogin && password.length > 0 && (
                  <div className="space-y-1.5 rounded-xl border border-border bg-background/40 p-3">
                    {passwordRules.map((rule, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        {rule.test(password) ? (
                          <Check className="h-3.5 w-3.5 text-[hsl(var(--success))]" />
                        ) : (
                          <X className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                        <span className={rule.test(password) ? 'text-[hsl(var(--success))]' : 'text-muted-foreground'}>
                          {rule.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {!isLogin && (
                  <div className="group relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder={t('auth.confirmPassword')}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`${inputBase} pr-20`}
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-10 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    <div
                      className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full transition-all duration-300 ${
                        confirmPassword.length > 0 && confirmPassword === password
                          ? 'bg-[hsl(var(--success))] shadow-[0_0_8px_hsl(var(--success)/0.6)]'
                          : confirmPassword.length > 0
                          ? 'bg-destructive shadow-[0_0_8px_hsl(var(--destructive)/0.6)]'
                          : 'bg-muted-foreground/40 group-focus-within:bg-primary'
                      }`}
                    />
                  </div>
                )}

                {!isLogin && confirmPassword.length > 0 && confirmPassword !== password && (
                  <p className="text-xs text-destructive -mt-2 ml-1">{t('auth.passwordsDontMatch')}</p>
                )}

                {isLogin && (
                  <div className="text-right">
                    <Link
                      to="/auth/forgot-password"
                      className="text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                      {t('auth.forgotPassword')}
                    </Link>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitDisabled}
                  className="relative w-full bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-500/90 text-primary-foreground font-semibold py-3 rounded-xl shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-primary/40 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden group"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <span className="relative flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {t('auth.processing')}
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        {isLogin ? t('auth.login') : t('auth.register')}
                      </>
                    )}
                  </span>
                </button>
              </form>

              {/* Separator */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-border" />
                <span className="text-muted-foreground text-sm">{t('auth.orContinueWith')}</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Google */}
              <button
                type="button"
                onClick={() => handleSocialLogin('google')}
                className="w-full flex items-center justify-center gap-2 bg-background/60 border border-border rounded-xl py-3 text-foreground hover:border-primary/50 hover:bg-background/80 transition-all duration-300"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>

              <p className="text-center text-muted-foreground text-sm mt-6">
                {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  {isLogin ? t('auth.signupLink') : t('auth.loginLink')}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
