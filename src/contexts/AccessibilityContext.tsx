import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type FontSize = 'small' | 'normal' | 'large';
type ThemeMode = 'light' | 'dark' | 'high-contrast';

interface AccessibilityContextType {
  fontSize: FontSize;
  setFontSize: (s: FontSize) => void;
  themeMode: ThemeMode;
  setThemeMode: (m: ThemeMode) => void;
  screenReaderMode: boolean;
  setScreenReaderMode: (v: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType>({
  fontSize: 'normal',
  setFontSize: () => {},
  themeMode: 'dark',
  setThemeMode: () => {},
  screenReaderMode: false,
  setScreenReaderMode: () => {},
});

export const useAccessibility = () => useContext(AccessibilityContext);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSize] = useState<FontSize>('normal');
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [screenReaderMode, setScreenReaderMode] = useState(false);

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
    <AccessibilityContext.Provider value={{ fontSize, setFontSize, themeMode, setThemeMode, screenReaderMode, setScreenReaderMode }}>
      {children}
    </AccessibilityContext.Provider>
  );
}
