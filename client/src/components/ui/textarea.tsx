import React from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  className?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, fullWidth = false, className, ...props }, ref) => (
    <div className={cn("flex flex-col", fullWidth && "w-full", className)}>
      {label && (
        <label className="font-inter text-[11px] uppercase tracking-[0.4em] text-[#666] mb-3 block">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={cn(
          "w-full px-0 py-4 bg-transparent resize-none min-h-[120px]",
          "border-0 border-b border-[#e5e5e5]",
          "placeholder:text-[#666] placeholder:text-sm placeholder:tracking-[0.1em] placeholder:uppercase",
          "focus:outline-none focus:border-b-2 focus:border-[#0a0a0a]",
          "transition-all duration-300",
          "font-inter text-lg text-[#0a0a0a]",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
        {...props}
      />
      {error && (
        <span className="text-[#666] text-sm mt-2 font-inter">
          {error}
        </span>
      )}
    </div>
  )
);

Textarea.displayName = "Textarea";

export { Textarea };