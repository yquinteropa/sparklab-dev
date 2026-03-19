import { useState } from 'react';
import { Accessibility, Sun, Moon, Contrast, Type, Eye } from 'lucide-react';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { Button } from '@/components/ui/button';

export function AccessibilityMenu() {
  const [open, setOpen] = useState(false);
  const { fontSize, setFontSize, themeMode, setThemeMode, screenReaderMode, setScreenReaderMode } = useAccessibility();

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-3 w-72 rounded-lg border bg-card p-4 shadow-xl" role="dialog" aria-label="Menú de accesibilidad">
          <h3 className="mb-3 text-sm font-semibold text-card-foreground font-display">Accesibilidad</h3>

          {/* Font Size */}
          <div className="mb-3">
            <label className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
              <Type className="h-3.5 w-3.5" /> Tamaño de fuente
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
                  {s === 'small' ? 'Pequeño' : s === 'normal' ? 'Normal' : 'Grande'}
                </button>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div className="mb-3">
            <label className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
              <Sun className="h-3.5 w-3.5" /> Modo visual
            </label>
            <div className="flex gap-1">
              {([
                { key: 'light' as const, label: 'Claro', icon: Sun },
                { key: 'dark' as const, label: 'Oscuro', icon: Moon },
                { key: 'high-contrast' as const, label: 'Alto Contraste', icon: Contrast },
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

          {/* Screen Reader */}
          <button
            onClick={() => setScreenReaderMode(!screenReaderMode)}
            className={`flex w-full items-center gap-2 rounded-md border px-3 py-2 text-xs transition-colors ${
              screenReaderMode ? 'border-accent bg-accent text-accent-foreground' : 'border-border bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            Indicadores textuales {screenReaderMode ? '(Activo)' : '(Inactivo)'}
          </button>
        </div>
      )}

      <Button
        onClick={() => setOpen(!open)}
        size="icon"
        className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg glow-primary hover:scale-105 transition-transform"
        aria-label="Abrir menú de accesibilidad"
      >
        <Accessibility className="h-6 w-6" />
      </Button>
    </div>
  );
}
