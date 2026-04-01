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
        <div className="mb-3 w-72 rounded-lg border bg-card p-4 shadow-xl" role="dialog" aria-label={t('accessibility.title')}>
          <h3 className="mb-3 text-sm font-semibold text-card-foreground font-display">{t('accessibility.title')}</h3>

          {/* Font Size */}
          <div className="mb-3">
            <label className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
              <Type className="h-3.5 w-3.5" /> {t('accessibility.fontSize')}
            </label>
            <div className="flex gap-1">
              {(['small', 'normal', 'large'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFontSize(s)}
                  className={`flex-1 rounded-md border px-2 py-1.5 text-xs transition-colors ${
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
            <label className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
              <Sun className="h-3.5 w-3.5" /> {t('accessibility.visualMode')}
            </label>
            <div className="flex gap-1">
              {([
                { key: 'light' as const, label: t('accessibility.light'), icon: Sun },
                { key: 'dark' as const, label: t('accessibility.dark'), icon: Moon },
                { key: 'high-contrast' as const, label: t('accessibility.highContrast'), icon: Contrast },
              ]).map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setThemeMode(key)}
                  className={`flex flex-1 items-center justify-center gap-1 rounded-md border px-2 py-1.5 text-xs transition-colors ${
                    themeMode === key ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-muted text-muted-foreground hover:bg-accent'
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
              <Globe className="h-3.5 w-3.5" /> {t('accessibility.changeLanguage')}
            </label>
            <div className="flex flex-wrap gap-1">
              {LANGUAGES.map((l) => (
                <button
                  key={l.value}
                  onClick={() => setLanguage(l.value)}
                  className={`rounded-md border px-2.5 py-1.5 text-xs transition-colors ${
                    language === l.value ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-muted text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
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
