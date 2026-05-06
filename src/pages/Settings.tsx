import { DashboardNav } from '@/components/DashboardNav';
import { ProfileSecurity } from '@/components/ProfileSecurity';
import { Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
  return (
    <div className="min-h-screen" style={{ background: '#060e1d', color: '#e2e8f0' }}>
      <DashboardNav />
      <main className="relative z-10 max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: '#22d3ee18', color: '#22d3ee', border: '1px solid #22d3ee35' }}
          >
            <SettingsIcon size={18} />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold" style={{ color: '#f1f5f9' }}>
              Configuración y privacidad
            </h1>
            <p className="text-xs" style={{ color: '#64748b' }}>
              Administra la seguridad de tu cuenta y tus preferencias de privacidad.
            </p>
          </div>
        </div>
        <ProfileSecurity />
      </main>
    </div>
  );
}
