import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface VerificationSentProps {
  email: string;
}

export default function VerificationSent({ email }: VerificationSentProps) {
  const [resending, setResending] = useState(false);
  const { t } = useTranslation();

  const handleResend = async () => {
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: { emailRedirectTo: window.location.origin + '/account-activated' },
      });
      if (error) throw error;
      toast.success(t('verification.resent'));
    } catch (err: any) {
      toast.error(err.message || t('verification.resendError'));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="text-center space-y-6">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <Mail className="h-10 w-10 text-primary" />
      </div>
      <div className="space-y-2">
        <h2 className="font-display text-xl font-semibold text-card-foreground">{t('verification.title')}</h2>
        <p className="text-sm text-muted-foreground">{t('verification.sentTo')}</p>
        <p className="font-medium text-foreground">{email}</p>
        <p className="text-xs text-muted-foreground mt-3">{t('verification.checkInbox')}</p>
      </div>
      <div className="flex flex-col gap-3 pt-2">
        <Button variant="outline" onClick={handleResend} disabled={resending} className="w-full">
          <RefreshCw className={`mr-2 h-4 w-4 ${resending ? 'animate-spin' : ''}`} />
          {resending ? t('verification.resending') : t('verification.resend')}
        </Button>
        <Button asChild variant="ghost" className="w-full">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('verification.backHome')}
          </Link>
        </Button>
      </div>
    </div>
  );
}
