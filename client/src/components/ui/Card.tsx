import { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("bg-white rounded-2xl border border-neutral-150 p-6", className)} {...rest}>
      {children}
    </div>
  );
}
