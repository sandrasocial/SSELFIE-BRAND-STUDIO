import React from "react";
import { cn } from "./lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  className?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = false, className, ...props }, ref) => (
    <div className={cn("flex flex-col", fullWidth && "w-full", className)}>
      {label && (
        <label className="text-[11px] uppercase tracking-[0.4em] text-[#666] mb-3 block" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          {label}
        </label>
      )}
      <input 
        ref={ref} 
        className={cn(
          "w-full px-0 py-4 bg-transparent",
          "border-0 border-b border-[#e5e5e5]",
          "placeholder:text-[#666] placeholder:text-sm placeholder:tracking-[0.1em] placeholder:uppercase",
          "focus:outline-none focus:border-b-2 focus:border-[#0a0a0a]",
          "transition-all duration-300",
          "text-lg text-[#0a0a0a]",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
        {...props} 
      />
      {error && (
        <span className="text-[#666] text-sm mt-2" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          {error}
        </span>
      )}
    </div>
  )
);

Input.displayName = "Input";

export { Input };