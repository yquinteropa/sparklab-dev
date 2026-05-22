import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface SparkLabLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  iconClassName?: string;
}

const sizeMap = {
  sm: { box: "w-8 h-8 rounded-md", icon: "w-4 h-4" },
  md: { box: "w-9 h-9 rounded-lg", icon: "w-5 h-5" },
  lg: { box: "w-12 h-12 rounded-xl", icon: "w-7 h-7" },
};

export default function SparkLabLogo({
  size = "md",
  className,
  iconClassName,
}: SparkLabLogoProps) {
  const s = sizeMap[size];
  return (
    <div
      className={cn(
        s.box,
        "bg-primary/10 border border-primary/40 shadow-[0_0_12px_hsl(var(--primary)/0.25)] flex items-center justify-center",
        className,
      )}
    >
      <Zap className={cn(s.icon, "text-primary", iconClassName)} />
    </div>
  );
}
