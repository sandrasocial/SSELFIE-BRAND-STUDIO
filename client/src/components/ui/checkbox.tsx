import React from "react";
import { cn } from "./lib/utils";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  error?: string;
  fullWidth?: boolean;
  className?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    { label, error, fullWidth = false, className, ...props },
    ref
  ) => (
    <div className={cn("flex flex-col", fullWidth && "w-full", className)}>
      <label className="flex items-start gap-3 cursor-pointer">
        <div className="relative flex-shrink-0 mt-0.5">
          <input
            ref={ref}
            type="checkbox"
            className="sr-only peer"
            {...props}
          />
          {/* Checkbox square - Sharp corners, no border-radius */}
          <div className="w-4 h-4 border-2 border-[#e5e5e5] peer-checked:border-[#0a0a0a] peer-checked:bg-[#0a0a0a] transition-all duration-300" />
          {/* Checkmark - Simple square when checked */}
          <div className="absolute top-1 left-1 w-2 h-2 bg-white opacity-0 peer-checked:opacity-100 transition-all duration-300" />
        </div>
        {label && (
          <div className="text-base text-[#0a0a0a] leading-relaxed" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            {label}
          </div>
        )}
      </label>
      {error && (
        <span className="text-red-600 text-sm mt-2" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          {error}
        </span>
      )}
    </div>
  )
);

Checkbox.displayName = "Checkbox";

export { Checkbox };