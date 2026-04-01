import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Zap, Mail, Lock, User, Eye, EyeOff, Check, X, Globe, UserCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import VerificationSent from '@/components/VerificationSent';

const LANGUAGES = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
  { value: 'pt', label: 'Português' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
];

const COUNTRIES = [
  'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia', 'Costa Rica', 'Cuba',
  'Ecuador', 'El Salvador', 'España', 'Estados Unidos', 'Guatemala', 'Honduras',
  'México', 'Nicaragua', 'Panamá', 'Paraguay', 'Perú', 'Puerto Rico',
  'República Dominicana', 'Uruguay', 'Venezuela',
];

export default function Auth() {
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [language, setLanguage] = useState('es');
  const [gender, setGender] = useState('');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

  const genders = [
    { value: 'male', label: t('auth.genderMale') },
    { value: 'female', label: t('auth.genderFemale') },
    { value: 'non_binary', label: t('auth.genderNonBinary') },
    { value: 'prefer_not_say', label: t('auth.genderPreferNot') },
  ];

  const allRulesPass = passwordRules.every((r) => r.test(password));

  useEffect(() => {
    if (session) navigate('/dashboard');
  }, [session, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message === 'Invalid login credentials') {
            const { data: resetData } = await supabase.auth.resetPasswordForEmail(email, {
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
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: `${firstName} ${lastName}`,
              first_name: firstName,
              last_name: lastName,
              username,
              language,
              gender,
              country,
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
    } catch (err: any) {
      toast.error(t('auth.googleError'));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <div className={`w-full ${isLogin ? 'max-w-md' : 'max-w-lg'} space-y-8 transition-all duration-300`}>
        {/* Logo */}
        <div className="text-center">
          <Link to="/" className="inline-block">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary glow-primary">
              <Zap className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="font-display text-3xl font-bold text-secondary-foreground text-glow">
              SparkLab
            </h1>
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('auth.slogan')}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-8 shadow-2xl">
          {verificationSent ? (
            <VerificationSent email={email} />
          ) : (
          <>
          <h2 className="mb-6 text-center font-display text-lg font-semibold text-card-foreground">
            {isLogin ? t('auth.login') : t('auth.signup')}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder={t('auth.firstName')} value={firstName} onChange={(e) => setFirstName(e.target.value)} className="pl-10" required />
                  </div>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder={t('auth.lastName')} value={lastName} onChange={(e) => setLastName(e.target.value)} className="pl-10" required />
                  </div>
                </div>

                <div className="relative">
                  <UserCircle className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder={t('auth.username')} value={username} onChange={(e) => setUsername(e.target.value)} className="pl-10" required />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder={t('auth.language')} />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((l) => (
                        <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('auth.gender')} />
                    </SelectTrigger>
                    <SelectContent>
                      {genders.map((g) => (
                        <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger>
                    <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder={t('auth.country')} />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input type="email" placeholder={t('auth.email')} value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder={t('auth.password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                required
                minLength={isLogin ? 6 : 8}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors" tabIndex={-1}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {!isLogin && password.length > 0 && (
              <div className="space-y-1.5 rounded-lg border border-border bg-secondary/50 p-3">
                {passwordRules.map((rule, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    {rule.test(password) ? <Check className="h-3.5 w-3.5 text-green-500" /> : <X className="h-3.5 w-3.5 text-muted-foreground" />}
                    <span className={rule.test(password) ? 'text-green-500' : 'text-muted-foreground'}>{rule.label}</span>
                  </div>
                ))}
              </div>
            )}

            {isLogin && (
              <div className="flex justify-end">
                <Link to="/auth/forgot-password" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                  {t('auth.forgotPassword')}
                </Link>
              </div>
            )}

            <Button type="submit" className="w-full glow-primary" disabled={loading || (!isLogin && (!allRulesPass || !firstName || !lastName || !username || !gender || !country))}>
              {loading ? t('auth.processing') : isLogin ? t('auth.login') : t('auth.register')}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">{t('auth.orContinueWith')}</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" className="w-full" onClick={() => handleSocialLogin('google')}>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </Button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}{' '}
            <button onClick={() => setIsLogin(!isLogin)} className="font-medium text-primary hover:underline">
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
