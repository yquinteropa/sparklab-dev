/**
 * Utilidades de aleatorización para el motor de quiz.
 * Se usan para barajar opciones y seleccionar subconjuntos aleatorios sin sesgo.
 */

// Algoritmo Fisher-Yates: baraja un array de forma uniforme (no muta el original).
export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr]; // Copia defensiva para no mutar la entrada
  for (let i = a.length - 1; i > 0; i--) {
    // Índice aleatorio entre 0 e i (inclusive)
    const j = Math.floor(Math.random() * (i + 1));
    // Intercambio in-place de los dos elementos
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Devuelve `n` elementos aleatorios (sin repetición) extraídos del array. */
export function pickRandom<T>(arr: readonly T[], n: number): T[] {
  return shuffle(arr).slice(0, Math.min(n, arr.length));
}
