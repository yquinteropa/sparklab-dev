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

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const [fontSize, setFontSize] = useState<FontSize>('normal');
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [language, setLanguageState] = useState(i18n.language?.substring(0, 2) || 'es');

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
    setLanguageState(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem('sparklab-language', lang);

    // Sync to DB if logged in
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase
        .from('profiles')
        .update({ language: lang })
        .eq('user_id', session.user.id);
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
