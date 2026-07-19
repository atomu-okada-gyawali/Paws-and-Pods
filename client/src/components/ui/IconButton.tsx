import { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: "default" | "danger";
}

const variants = {
  default: "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 focus:ring-emerald-500",
  danger: "text-neutral-500 hover:text-rose-600 hover:bg-rose-50 focus:ring-rose-500",
};

export function IconButton({ label, variant = "default", className, children, ...rest }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cn(
        "p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 disabled:opacity-50",
        variants[variant],
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
