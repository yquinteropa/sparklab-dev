import { DashboardNav } from '@/components/DashboardNav';
import { ProfileSecurity } from '@/components/ProfileSecurity';
import { Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardNav />
      <main className="relative z-10 max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10 text-primary border border-primary/30">
            <SettingsIcon size={18} />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">
              Configuración y privacidad
            </h1>
            <p className="text-xs text-muted-foreground">
              Administra la seguridad de tu cuenta y tus preferencias de privacidad.
            </p>
          </div>
        </div>
        <ProfileSecurity />
      </main>
    </div>
  );
}
