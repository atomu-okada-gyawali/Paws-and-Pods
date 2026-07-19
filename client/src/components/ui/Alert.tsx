import { ReactNode } from "react";
import { cn } from "../../lib/cn";

export type AlertVariant = "error" | "success" | "info";

const variants: Record<AlertVariant, string> = {
  error: "bg-rose-50 text-rose-700 border-rose-100",
  success: "bg-emerald-50 text-emerald-800 border-emerald-100",
  info: "bg-neutral-50 text-neutral-600 border-neutral-100",
};

interface AlertProps {
  variant?: AlertVariant;
  children: ReactNode;
  className?: string;
}

export function Alert({ variant = "error", children, className }: AlertProps) {
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn("p-3 text-xs font-semibold rounded-xl border", variants[variant], className)}
    >
      {children}
    </div>
  );
}
