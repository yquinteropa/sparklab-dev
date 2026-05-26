import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import type { RendererProps } from '../../types';

export function TrueFalseRenderer({
  question,
  disabled,
  onAnswer,
}: RendererProps<'true_false'>) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg sm:text-xl font-semibold text-foreground">
        {question.content.question_text}
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <Choice
          label="Verdadero"
          icon={<Check className="size-6" />}
          color="primary"
          disabled={disabled}
          onClick={() => onAnswer(true)}
        />
        <Choice
          label="Falso"
          icon={<X className="size-6" />}
          color="destructive"
          disabled={disabled}
          onClick={() => onAnswer(false)}
        />
      </div>
    </div>
  );
}

function Choice({
  label,
  icon,
  color,
  disabled,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  color: 'primary' | 'destructive';
  disabled: boolean;
  onClick: () => void;
}) {
  const ring =
    color === 'primary'
      ? 'hover:border-primary hover:shadow-[0_0_25px_hsl(var(--primary)/0.4)] text-primary'
      : 'hover:border-destructive hover:shadow-[0_0_25px_hsl(var(--destructive)/0.4)] text-destructive';
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      whileHover={{ y: -2 }}
      disabled={disabled}
      onClick={onClick}
      className={`flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-border bg-card font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60 ${ring}`}
    >
      {icon}
      <span className="text-base sm:text-lg">{label}</span>
    </motion.button>
  );
}
