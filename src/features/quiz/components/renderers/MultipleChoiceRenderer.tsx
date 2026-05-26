import { motion } from 'framer-motion';
import type { RendererProps } from '../../types';

export function MultipleChoiceRenderer({
  question,
  disabled,
  onAnswer,
}: RendererProps<'multiple_choice'>) {
  const { question_text, options } = question.content;
  return (
    <div className="space-y-5">
      <h3 className="text-lg sm:text-xl font-semibold text-foreground">
        {question_text}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((opt, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.97 }}
            whileHover={{ y: -2 }}
            disabled={disabled}
            onClick={() => onAnswer(i)}
            className="min-h-[56px] rounded-xl border border-border bg-card px-4 py-3 text-left text-sm sm:text-base text-foreground transition-colors hover:border-primary/60 hover:bg-primary/5 hover:shadow-[0_0_20px_hsl(var(--primary)/0.25)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="mr-2 font-bold text-primary">{String.fromCharCode(65 + i)}.</span>
            {opt}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
