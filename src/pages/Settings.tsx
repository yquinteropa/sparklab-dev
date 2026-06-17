/**
 * Pantalla de ajustes de cuenta: incluye seguridad, idioma y accesibilidad.
 */
import { DashboardNav } from '@/components/DashboardNav';
import { ProfileSecurity } from '@/components/ProfileSecurity';
import { Settings as SettingsIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Settings() {
  const { t } = useTranslation();
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
              {t('nav.settings')}
            </h1>
            <p className="text-xs text-muted-foreground">
              {t('settings.desc')}
            </p>
          </div>
        </div>
        <ProfileSecurity />
      </main>
    </div>
  );
}
