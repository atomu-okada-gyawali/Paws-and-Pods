import { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import { Spinner } from "./Spinner";

export type ButtonVariant = "primary" | "success" | "danger" | "outline" | "ghost";
export type ButtonSize = "sm" | "md";

const base =
  "inline-flex items-center justify-center gap-2 font-bold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed active:scale-[0.98]";

const sizes: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg",
  md: "px-4 py-2.5 text-sm rounded-xl",
};

const variants: Record<ButtonVariant, string> = {
  primary: "bg-neutral-950 hover:bg-neutral-850 text-white shadow-sm focus:ring-emerald-500 disabled:bg-neutral-200 disabled:text-neutral-400",
  success: "bg-emerald-600 hover:bg-emerald-750 text-white shadow-md focus:ring-emerald-600 disabled:bg-neutral-200 disabled:text-neutral-400",
  danger: "bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500 disabled:bg-neutral-300",
  outline: "border border-neutral-200 hover:bg-neutral-50 text-neutral-700 focus:ring-emerald-500 disabled:opacity-50",
  ghost: "text-neutral-600 hover:bg-neutral-100 focus:ring-emerald-500 disabled:opacity-50",
};

// class string for the button look, reusable on <Link>s that should look like buttons
export function buttonVariants(opts: { variant?: ButtonVariant; size?: ButtonSize; fullWidth?: boolean } = {}): string {
  const { variant = "primary", size = "md", fullWidth } = opts;
  return cn(base, sizes[size], variants[variant], fullWidth && "w-full");
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
}

export function Button({ variant, size, fullWidth, loading, disabled, className, children, ...rest }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Spinner className="w-4 h-4" />}
      {children}
    </button>
  );
}
