import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface VerificationSentProps {
  email: string;
}

export default function VerificationSent({ email }: VerificationSentProps) {
  const [resending, setResending] = useState(false);

  const handleResend = async () => {
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: { emailRedirectTo: window.location.origin + '/account-activated' },
      });
      if (error) throw error;
      toast.success('Correo de verificación reenviado.');
    } catch (err: any) {
      toast.error(err.message || 'Error al reenviar el correo.');
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
        <h2 className="font-display text-xl font-semibold text-card-foreground">
          Verifica tu correo electrónico
        </h2>
        <p className="text-sm text-muted-foreground">
          Hemos enviado un enlace de verificación a
        </p>
        <p className="font-medium text-foreground">{email}</p>
        <p className="text-xs text-muted-foreground mt-3">
          Revisa tu bandeja de entrada (y la carpeta de spam) para activar tu cuenta.
        </p>
      </div>

      <div className="flex flex-col gap-3 pt-2">
        <Button
          variant="outline"
          onClick={handleResend}
          disabled={resending}
          className="w-full"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${resending ? 'animate-spin' : ''}`} />
          {resending ? 'Reenviando...' : 'Reenviar correo'}
        </Button>

        <Button asChild variant="ghost" className="w-full">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </Link>
        </Button>
      </div>
    </div>
  );
}
