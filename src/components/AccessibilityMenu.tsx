import { useState } from 'react';
import { Accessibility, Sun, Moon, Contrast, Type, Globe } from 'lucide-react';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

const LANGUAGES = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
  { value: 'pt', label: 'Português' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
];

export function AccessibilityMenu() {
  const [open, setOpen] = useState(false);
  const { fontSize, setFontSize, themeMode, setThemeMode, language, setLanguage } = useAccessibility();
  const { t } = useTranslation();

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-3 w-64 rounded-lg border bg-card p-4 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300" role="dialog" aria-label={t('accessibility.title')}>
          <h3 className="mb-3 text-sm font-semibold text-card-foreground font-display">{t('accessibility.title')}</h3>

          {/* Font Size */}
          <div className="mb-3">
            <label className="mb-1.5 flex items-center gap-2 text-xs text-muted-foreground">
              <Type className="h-3.5 w-3.5" /> {t('accessibility.fontSize')}
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['small', 'normal', 'large'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFontSize(s)}
                  className={`rounded-md border py-2 text-xs font-medium transition-colors ${
                    fontSize === s ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-muted text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {t(`accessibility.${s}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div className="mb-3">
            <label className="mb-1.5 flex items-center gap-2 text-xs text-muted-foreground">
              <Sun className="h-3.5 w-3.5" /> {t('accessibility.visualMode')}
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {([
                { key: 'light' as const, label: t('accessibility.light'), icon: Sun },
                { key: 'dark' as const, label: t('accessibility.dark'), icon: Moon },
                { key: 'high-contrast' as const, label: t('accessibility.highContrast'), icon: Contrast },
              ]).map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setThemeMode(key)}
                  className={`flex items-center justify-center gap-1 rounded-md border py-2 text-xs font-medium transition-colors ${
                    themeMode === key ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-muted text-muted-foreground hover:bg-accent'
                  }`}
                >
                  <Icon className="h-3 w-3 shrink-0" />
                  <span className="truncate">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-xs text-muted-foreground">
              <Globe className="h-3.5 w-3.5" /> {t('accessibility.changeLanguage')}
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-md border border-border bg-muted px-3 py-2 text-xs text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <Button
        onClick={() => setOpen(!open)}
        size="icon"
        className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg glow-primary hover:scale-105 transition-transform"
        aria-label={t('accessibility.openMenu')}
      >
        <Accessibility className="h-6 w-6" />
      </Button>
    </div>
  );
}
