import { ReactNode, forwardRef, ComponentPropsWithoutRef, ElementRef } from 'react';

interface TooltipProviderProps {
  children: ReactNode;
  delayDuration?: number;
}

export function TooltipProvider({ children }: TooltipProviderProps) {
  return <>{children}</>;
}

export const Tooltip = ({ children }: { children: ReactNode }) => <>{children}</>;

export const TooltipTrigger = forwardRef<
  ElementRef<"button">,
  ComponentPropsWithoutRef<"button"> & { asChild?: boolean }
>(({ asChild, ...props }, ref) => <button ref={ref} {...props} />);

export const TooltipContent = forwardRef<
  ElementRef<"div">,
  ComponentPropsWithoutRef<"div"> & { side?: string; align?: string; sideOffset?: number }
>(({ children, side, align, sideOffset, ...props }, ref) => <div ref={ref} {...props}>{children}</div>);

TooltipTrigger.displayName = "TooltipTrigger";
TooltipContent.displayName = "TooltipContent";