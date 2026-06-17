/**
 * AccessibilityContext
 *
 * Provee el estado global y los efectos secundarios para las funcionalidades de
 * accesibilidad construidas en SparkLab. Este archivo es el "cerebro" que
 * sincroniza las preferencias del usuario con el DOM y con la base de datos.
 *
 * Funcionalidades documentadas:
 * 1. Tamaño de fuente   → Clases CSS en <html> + localStorage.
 * 2. Modo oscuro        → Clase .dark en <html> + localStorage.
 * 3. Alto contraste     → Clase .high-contrast en <html> + localStorage.
 *
 * Además gestiona el idioma (i18n) sincronizándolo con el perfil de Supabase.
 */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';

type FontSize = 'small' | 'normal' | 'large';
type ThemeMode = 'light' | 'dark' | 'high-contrast';

interface AccessibilityContextType {
  fontSize: FontSize;
  setFontSize: (s: FontSize) => void;
  themeMode: ThemeMode;
  setThemeMode: (m: ThemeMode) => void;
  language: string;
  setLanguage: (lang: string) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType>({
  fontSize: 'normal',
  setFontSize: () => {},
  themeMode: 'dark',
  setThemeMode: () => {},
  language: 'es',
  setLanguage: () => {},
});

export const useAccessibility = () => useContext(AccessibilityContext);

const THEME_KEY = 'sparklab-theme';
const FONT_SIZE_KEY = 'sparklab-font-size';

const isThemeMode = (v: unknown): v is ThemeMode =>
  v === 'light' || v === 'dark' || v === 'high-contrast';
const isFontSize = (v: unknown): v is FontSize =>
  v === 'small' || v === 'normal' || v === 'large';

const readStoredTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'dark';
  const stored = window.localStorage.getItem(THEME_KEY);
  return isThemeMode(stored) ? stored : 'dark';
};

const readStoredFontSize = (): FontSize => {
  if (typeof window === 'undefined') return 'normal';
  const stored = window.localStorage.getItem(FONT_SIZE_KEY);
  return isFontSize(stored) ? stored : 'normal';
};

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const [fontSize, setFontSizeState] = useState<FontSize>(readStoredFontSize);
  const [themeMode, setThemeModeState] = useState<ThemeMode>(readStoredTheme);
  const [language, setLanguageState] = useState(i18n.language?.substring(0, 2) || 'es');

  const setThemeMode = (m: ThemeMode) => {
    setThemeModeState(m);
    try { localStorage.setItem(THEME_KEY, m); } catch {}
  };

  const setFontSize = (s: FontSize) => {
    setFontSizeState(s);
    try { localStorage.setItem(FONT_SIZE_KEY, s); } catch {}
  };

  // Load user's language from profile on auth
  useEffect(() => {
    const loadUserLanguage = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('language')
          .eq('user_id', session.user.id)
          .single();
        if (data?.language) {
          setLanguageState(data.language);
          i18n.changeLanguage(data.language);
          localStorage.setItem('sparklab-language', data.language);
        }
      }
    };
    loadUserLanguage();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        supabase
          .from('profiles')
          .select('language')
          .eq('user_id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data?.language) {
              setLanguageState(data.language);
              i18n.changeLanguage(data.language);
              localStorage.setItem('sparklab-language', data.language);
            }
          });
      }
    });

    return () => subscription.unsubscribe();
  }, [i18n]);

  const setLanguage = async (lang: string) => {
    // Avoid unnecessary reload if language hasn't changed
    if (lang === language) return;

    // Persist locally first so the reload picks up the new language immediately
    try { localStorage.setItem('sparklab-language', lang); } catch {}
    setLanguageState(lang);
    await i18n.changeLanguage(lang);
    document.documentElement.setAttribute('lang', lang);

    // Sync to DB if logged in (best-effort, don't block reload on failure)
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase
          .from('profiles')
          .update({ language: lang })
          .eq('user_id', session.user.id);
      }
    } catch (err) {
      console.warn('[i18n] Failed to sync language to profile:', err);
    }

    // Global refresh so every component (including non-reactive strings,
    // memoized translations, and third-party widgets) picks up the new language.
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('font-size-small', 'font-size-normal', 'font-size-large');
    root.classList.add(`font-size-${fontSize}`);
  }, [fontSize]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'high-contrast');
    if (themeMode === 'dark') root.classList.add('dark');
    if (themeMode === 'high-contrast') root.classList.add('high-contrast');
  }, [themeMode]);

  return (
    <AccessibilityContext.Provider value={{ fontSize, setFontSize, themeMode, setThemeMode, language, setLanguage }}>
      {children}
    </AccessibilityContext.Provider>
  );
}
