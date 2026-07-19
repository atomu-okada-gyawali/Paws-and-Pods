import { ReactNode } from "react";
import { cn } from "../../lib/cn";

export type BadgeColor = "emerald" | "amber" | "blue" | "indigo" | "neutral" | "rose";

const colors: Record<BadgeColor, string> = {
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
  neutral: "bg-neutral-100 text-neutral-600 border-neutral-200",
  rose: "bg-rose-50 text-rose-700 border-rose-200",
};

interface BadgeProps {
  color?: BadgeColor;
  children: ReactNode;
  className?: string;
}

export function Badge({ color = "neutral", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase border",
        colors[color],
        className
      )}
    >
      {children}
    </span>
  );
}
