import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Zap, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Always call resetPasswordForEmail — Supabase won't reveal if email exists
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
          <h1 className="font-display text-3xl font-bold text-secondary-foreground text-glow">
            SparkLab
          </h1>
        </div>

        <div className="rounded-xl border border-border bg-card p-8 shadow-2xl">
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent">
                <CheckCircle className="h-7 w-7 text-primary" />
              </div>
              <h2 className="font-display text-lg font-semibold text-card-foreground">
                Revisa tu correo
              </h2>
              <p className="text-sm text-muted-foreground">
                Si el correo <span className="font-medium text-card-foreground">{email}</span> existe en nuestro sistema, recibirás un enlace de recuperación en unos minutos.
              </p>
              <p className="text-xs text-muted-foreground">
                Revisa también tu carpeta de spam o correo no deseado.
              </p>
              <div className="pt-2 space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setSubmitted(false)}
                >
                  Intentar con otro correo
                </Button>
                <Link
                  to="/auth"
                  className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver a Iniciar Sesión
                </Link>
              </div>
            </div>
          ) : (
            <>
              <h2 className="mb-2 text-center font-display text-lg font-semibold text-card-foreground">
                Recuperar Contraseña
              </h2>
              <p className="mb-6 text-center text-sm text-muted-foreground">
                Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>

                <Button type="submit" className="w-full glow-primary" disabled={loading}>
                  {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                </Button>
              </form>

              <Link
                to="/auth"
                className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver a Iniciar Sesión
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
