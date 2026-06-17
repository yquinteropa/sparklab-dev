/**
 * Utilidades para otorgar experiencia (XP), registrar misiones completadas
 * y consultar el progreso local del usuario por nivel.
 *
 * Reglas:
 *  - Cada nivel completado otorga 100 XP por defecto y suma 1 a missions_completed.
 *  - Se usa una clave en localStorage por (usuario, nivel) para evitar otorgar
 *    XP múltiples veces al mismo usuario por el mismo nivel.
 *  - Si el usuario no está autenticado, no se hace nada (sin errores).
 */
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const STORAGE_PREFIX = "sparklab:awarded:";

/**
 * Clave única de localStorage para marcar un nivel como completado por un usuario.
 */
export function awardedKey(userId: string, levelKey: string): string {
  return `${STORAGE_PREFIX}${userId}:${levelKey}`;
}

/**
 * Devuelve true si el usuario ya completó (y se le otorgó XP por) ese nivel.
 * Seguro en SSR — si no hay window, devuelve false.
 */
export function isLevelAwarded(userId: string | undefined, levelKey: string): boolean {
  if (!userId || typeof window === "undefined") return false;
  return Boolean(localStorage.getItem(awardedKey(userId, levelKey)));
}

/**
 * Mapa de progresión secuencial entre niveles construidos.
 * Define cuál es el "siguiente nivel" disponible al terminar el actual.
 */
export const NEXT_LEVEL: Record<string, { route: string; key: string; label: string } | null> = {
  "basico:level1":          { route: "/dashboard/level1-medio",    key: "basico:level1-medio",    label: "Nivel 1 — Medio" },
  "basico:level1-medio":    { route: "/dashboard/level1-avanzado", key: "basico:level1-avanzado", label: "Nivel 1 — Avanzado" },
  "basico:level1-avanzado": null, // Último nivel construido; vuelve a módulos.
};

/**
 * Devuelve la información del siguiente nivel, o null si es el último.
 */
export function getNextLevel(levelKey: string) {
  return NEXT_LEVEL[levelKey] ?? null;
}

/**
 * Otorga XP por completar un nivel. Idempotente por (userId, levelKey).
 * @param userId  ID del usuario autenticado.
 * @param levelKey  Clave única del nivel (ej: 'basico:level1', 'basico:level1-medio').
 * @param amount  Cantidad de XP a sumar (por defecto 100).
 */
export async function awardLevelXP(
  userId: string | undefined,
  levelKey: string,
  amount = 100
): Promise<void> {
  if (!userId) return;
  const storageKey = awardedKey(userId, levelKey);
  if (typeof window !== "undefined" && localStorage.getItem(storageKey)) {
    return; // Ya se otorgó previamente.
  }

  // Leer progreso actual
  const { data: current, error: readErr } = await supabase
    .from("user_progress")
    .select("xp, missions_completed, level")
    .eq("user_id", userId)
    .maybeSingle();

  if (readErr) {
    console.error("[progress] error leyendo user_progress:", readErr);
    return;
  }

  const prevXp = current?.xp ?? 0;
  const prevMissions = current?.missions_completed ?? 0;
  const newXp = prevXp + amount;
  const newMissions = prevMissions + 1;
  // Cada 500 XP se sube un nivel (regla simple, ajustable).
  const newLevel = Math.max(1, Math.floor(newXp / 500) + 1);

  const { error: upErr } = await supabase
    .from("user_progress")
    .update({
      xp: newXp,
      missions_completed: newMissions,
      level: newLevel,
    })
    .eq("user_id", userId);

  if (upErr) {
    console.error("[progress] error actualizando user_progress:", upErr);
    return;
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(storageKey, "1");
  }
  toast.success(`+${amount} XP`, {
    description: "¡Nivel completado!",
  });
}
