/**
 * AuthContext — Provee la sesión y el usuario autenticado a toda la app.
 * Implementa el patrón recomendado por Supabase:
 *   1. Registrar PRIMERO el listener `onAuthStateChange` (no perder eventos).
 *   2. DESPUÉS restaurar la sesión almacenada en localStorage.
 * Esto evita race conditions donde el callback de getSession sobrescribiría
 * un cambio de sesión disparado durante la inicialización.
 */
import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// Forma del contexto expuesto a los consumidores.
interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;          // True hasta que se conozca el estado inicial de auth
  signOut: () => Promise<void>;
}

// Valor por defecto seguro: sin sesión y en estado "cargando".
const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
});

// Hook conveniente para consumir el contexto en cualquier componente.
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  // Bandera para saber si el listener ya disparó (evita sobrescribir con getSession)
  const initializedRef = useRef(false);

  useEffect(() => {
    // 1) Registrar listener PRIMERO para no perder cambios de auth simultáneos
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      initializedRef.current = true;
      setSession(newSession);
      setLoading(false);
    });

    // 2) Restaurar la sesión persistida sólo si el listener aún no ha disparado
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!initializedRef.current) {
        setSession(currentSession);
        setLoading(false);
      }
    });

    // Cleanup: cancelar la suscripción para evitar fugas al desmontar el provider
    return () => subscription.unsubscribe();
  }, []);

  // Cierra la sesión del usuario actual; el listener actualizará el estado global.
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
