/**
 * Renderer de preguntas de emparejamiento (matching).
 * Patrón de interacción:
 *   1. Usuario selecciona un elemento de la columna izquierda.
 *   2. Selecciona su par en la columna derecha (que aparece barajada).
 *   3. Cuando todos los pares están unidos, puede confirmar.
 * Devuelve un Record<leftIndex, rightIndex> al motor para validar.
 */
import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { shuffle } from '../../lib/shuffle';
import type { RendererProps } from '../../types';

export function MatchingRenderer({
  question,
  disabled,
  onAnswer,
}: RendererProps<'matching'>) {
  const pairs = question.content.pairs;

  // Orden barajado del lado derecho. Mapeo: posición visual derecha → índice original del par
  const rightOrder = useMemo(
    () => shuffle(pairs.map((_, i) => i)),
    // Reorder solo al cambiar de pregunta
    [question.id],
  );

  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  // matches: leftIndex → rightIndex (índices originales del par)
  const [matches, setMatches] = useState<Record<number, number>>({});

  useEffect(() => {
    setSelectedLeft(null);
    setMatches({});
  }, [question.id]);

  // Set de índices del lado derecho ya utilizados (para deshabilitarlos visualmente)
  const usedRight = new Set(Object.values(matches));
  // ¿Todos los pares ya tienen asignación? Habilita el botón "Confirmar".
  const allDone = Object.keys(matches).length === pairs.length;

  // Selección de un elemento de la columna izquierda.
  const handleLeft = (i: number) => {
    if (disabled) return;
    setSelectedLeft(i);
  };

  // Selección de un elemento de la columna derecha (asocia con el izquierdo activo).
  const handleRight = (rightIdx: number) => {
    if (disabled || selectedLeft === null) return;
    if (usedRight.has(rightIdx)) return; // Ya emparejado: ignorar
    setMatches((m) => ({ ...m, [selectedLeft]: rightIdx }));
    setSelectedLeft(null);
  };

  // Reinicia los emparejamientos actuales (no envía nada al motor).
  const clear = () => {
    if (disabled) return;
    setMatches({});
    setSelectedLeft(null);
  };

  return (
    <div className="space-y-5">
      <h3 className="text-lg sm:text-xl font-semibold text-foreground">
        {question.content.question_text}
      </h3>
      <p className="text-xs text-muted-foreground">
        Toca un elemento de la izquierda y luego su par a la derecha.
      </p>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-2">
          {pairs.map((p, i) => {
            const matched = matches[i] !== undefined;
            const selected = selectedLeft === i;
            return (
              <motion.button
                key={`l-${i}`}
                layout
                whileTap={{ scale: 0.97 }}
                disabled={disabled || matched}
                onClick={() => handleLeft(i)}
                className={`w-full min-h-[52px] rounded-xl border px-3 py-2 text-left text-sm sm:text-base transition-colors ${
                  matched
                    ? 'border-primary/60 bg-primary/10 text-foreground'
                    : selected
                    ? 'border-primary bg-primary/15 text-foreground shadow-[0_0_18px_hsl(var(--primary)/0.4)]'
                    : 'border-border bg-card text-foreground hover:border-primary/50'
                } disabled:cursor-not-allowed`}
              >
                {p.left}
                {matched && (
                  <span className="ml-2 text-xs text-primary">
                    → {pairs[matches[i]].right}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        <div className="space-y-2">
          {rightOrder.map((origIdx) => {
            const used = usedRight.has(origIdx);
            return (
              <motion.button
                key={`r-${origIdx}`}
                layout
                whileTap={{ scale: 0.97 }}
                disabled={disabled || used || selectedLeft === null}
                onClick={() => handleRight(origIdx)}
                className={`w-full min-h-[52px] rounded-xl border px-3 py-2 text-left text-sm sm:text-base transition-colors ${
                  used
                    ? 'border-border bg-secondary/40 text-muted-foreground line-through'
                    : 'border-border bg-card text-foreground hover:border-primary/50'
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {pairs[origIdx].right}
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={clear}
          disabled={disabled || Object.keys(matches).length === 0}
        >
          Limpiar
        </Button>
        <Button
          size="sm"
          className="flex-1"
          disabled={disabled || !allDone}
          onClick={() => onAnswer(matches)}
        >
          Confirmar
        </Button>
      </div>
    </div>
  );
}
