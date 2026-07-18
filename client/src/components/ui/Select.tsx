import { forwardRef, SelectHTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import { fieldBase } from "./Input";

type SelectSize = "sm" | "md";

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  size?: SelectSize;
}

const sizes: Record<SelectSize, string> = {
  // sm carries no colors so callers can supply them (e.g. status-tinted selects)
  sm: "px-2.5 py-1 rounded-lg text-xs font-semibold border focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50",
  md: cn(fieldBase, "px-3"),
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ size = "md", className, children, ...rest }, ref) => (
  <select ref={ref} className={cn(sizes[size], className)} {...rest}>
    {children}
  </select>
));

Select.displayName = "Select";
