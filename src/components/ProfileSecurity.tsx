import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Loader2, Eye, EyeOff, Check, X, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const PW_RULES = [
  { key: 'min8', test: (p: string) => p.length >= 8 },
  { key: 'uppercase', test: (p: string) => /[A-Z]/.test(p) },
  { key: 'lowercase', test: (p: string) => /[a-z]/.test(p) },
  { key: 'number', test: (p: string) => /\d/.test(p) },
  { key: 'special', test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

const PW_LABELS: Record<string, string> = {
  min8: 'auth.pwMin8',
  uppercase: 'auth.pwUppercase',
  lowercase: 'auth.pwLowercase',
  number: 'auth.pwNumber',
  special: 'auth.pwSpecial',
};

export function ProfileSecurity() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  const isGoogleUser = user?.app_metadata?.provider === 'google' ||
    (user?.identities ?? []).some(i => i.provider === 'google') &&
    !(user?.identities ?? []).some(i => i.provider === 'email');

  const allRulesPass = PW_RULES.every(r => r.test(newPassword));
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  const handleChangePassword = async () => {
    if (!user) return;
    if (!allRulesPass) {
      toast.error(t('security.requirementsNotMet'));
      return;
    }
    if (!passwordsMatch) {
      toast.error(t('resetPassword.passwordsDontMatch'));
      return;
    }

    setSaving(true);

    // Verify current password by re-authenticating
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });

    if (signInError) {
      setSaving(false);
      toast.error(t('security.currentPasswordWrong'));
      return;
    }

    // Update password
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSaving(false);

    if (error) {
      toast.error(t('security.updateError'));
      return;
    }

    toast.success(t('security.updateSuccess'));
    setTimeout(async () => {
      await signOut();
      navigate('/');
    }, 2000);
  };

  const handleSendResetEmail = async () => {
    if (!user?.email) return;
    setSendingReset(true);
    await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSendingReset(false);
    toast.success(t('security.resetEmailSent'));
  };

  return (
    <div className="rounded-xl border border-border bg-card p-8 mt-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-5 w-5 text-primary" />
        <h2 className="font-display text-lg font-bold text-card-foreground">{t('security.title')}</h2>
      </div>

      {isGoogleUser ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">{t('security.googleMessage')}</p>
          </div>
          <div className="border-t border-border pt-4">
            <p className="text-sm text-muted-foreground mb-3">{t('security.googleSetPassword')}</p>
            <Button
              variant="outline"
              onClick={handleSendResetEmail}
              disabled={sendingReset}
              className="gap-2"
            >
              {sendingReset ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              {t('security.sendResetLink')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Current password */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">{t('security.currentPassword')}</label>
            <div className="relative">
              <Input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">{t('security.newPassword')}</label>
            <div className="relative">
              <Input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {newPassword.length > 0 && (
              <ul className="mt-2 space-y-1">
                {PW_RULES.map(r => (
                  <li key={r.key} className="flex items-center gap-1.5 text-xs">
                    {r.test(newPassword) ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-destructive" />
                    )}
                    <span className={r.test(newPassword) ? 'text-emerald-500' : 'text-muted-foreground'}>
                      {t(PW_LABELS[r.key])}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">{t('security.confirmNewPassword')}</label>
            <div className="relative">
              <Input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="mt-1 text-xs text-destructive">{t('resetPassword.passwordsDontMatch')}</p>
            )}
          </div>

          <Button
            onClick={handleChangePassword}
            disabled={saving || !currentPassword || !allRulesPass || !passwordsMatch}
            className="w-full gap-2 mt-2"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
            {saving ? t('security.changing') : t('security.changePassword')}
          </Button>
        </div>
      )}
    </div>
  );
}
