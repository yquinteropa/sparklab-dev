import { motion } from 'framer-motion';
import { ImageOff } from 'lucide-react';
import { useState } from 'react';
import type { RendererProps } from '../../types';

export function ImageIdentificationRenderer({
  question,
  disabled,
  onAnswer,
}: RendererProps<'image_identification'>) {
  const { question_text, media_url, options } = question.content;
  const [imgError, setImgError] = useState(false);

  return (
    <div className="space-y-5">
      <h3 className="text-lg sm:text-xl font-semibold text-foreground">
        {question_text}
      </h3>

      <div className="mx-auto flex aspect-square w-full max-w-xs items-center justify-center overflow-hidden rounded-2xl border border-primary/30 bg-secondary/30 shadow-[0_0_30px_hsl(var(--primary)/0.15)]">
        {imgError || !media_url ? (
          <div className="flex flex-col items-center text-muted-foreground">
            <ImageOff className="mb-2 size-10" />
            <span className="text-xs">Imagen no disponible</span>
          </div>
        ) : (
          <img
            src={media_url}
            alt="Componente a identificar"
            loading="lazy"
            onError={() => setImgError(true)}
            className="size-full object-contain p-3"
          />
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {options.map((opt, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.96 }}
            whileHover={{ y: -2 }}
            disabled={disabled}
            onClick={() => onAnswer(i)}
            className="min-h-[56px] rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/60 hover:bg-primary/5 hover:shadow-[0_0_20px_hsl(var(--primary)/0.25)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {opt}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
