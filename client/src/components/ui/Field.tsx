import { ReactNode } from "react";

interface FieldProps {
  label?: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}

// label + control wrapper
export function Field({ label, htmlFor, children, className }: FieldProps) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={htmlFor} className="block text-xs font-semibold text-neutral-700 mb-1.5">
          {label}
        </label>
      )}
      {children}
    </div>
  );
}
