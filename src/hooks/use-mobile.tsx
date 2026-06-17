/**
 * Hook utilitario para detectar si el viewport actual corresponde a un dispositivo móvil.
 * Se basa en un breakpoint fijo (768 px) y escucha cambios de tamaño en tiempo real.
 */
import * as React from "react";

// Umbral en píxeles a partir del cual se considera "no móvil" (>= 768 px = tablet/desktop)
const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  // Estado tri-valor: undefined mientras no se ha medido (evita hidratación incorrecta en SSR)
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    // MediaQueryList para reaccionar a cambios de ancho del navegador
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    // Medición inicial al montar el componente
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    // Limpieza del listener al desmontar para evitar memory leaks
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // Coerción a boolean: undefined => false
  return !!isMobile;
}
