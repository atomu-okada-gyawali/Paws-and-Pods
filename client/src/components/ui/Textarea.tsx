import { forwardRef, TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import { fieldBase } from "./Input";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...rest }, ref) => (
  <textarea ref={ref} className={cn(fieldBase, "px-3", className)} {...rest} />
));

Textarea.displayName = "Textarea";
