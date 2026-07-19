import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({ className, ...rest }, ref) => (
  <input
    ref={ref}
    type="checkbox"
    className={cn(
      "w-4 h-4 rounded border-neutral-300 accent-emerald-600 focus:ring-2 focus:ring-emerald-500",
      className
    )}
    {...rest}
  />
));

Checkbox.displayName = "Checkbox";
