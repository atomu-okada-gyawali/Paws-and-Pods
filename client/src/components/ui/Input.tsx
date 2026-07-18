import { forwardRef, InputHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
}

const fieldBase =
  "w-full py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500";

export const Input = forwardRef<HTMLInputElement, InputProps>(({ icon, className, ...rest }, ref) => {
  const input = (
    <input ref={ref} className={cn(fieldBase, icon ? "pl-10 pr-4" : "px-3", className)} {...rest} />
  );

  if (!icon) return input;

  return (
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">{icon}</span>
      {input}
    </div>
  );
});

Input.displayName = "Input";

export { fieldBase };
