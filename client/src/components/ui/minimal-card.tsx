import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface MinimalCardProps {
  children: ReactNode;
  dark?: boolean;
  className?: string;
}

export function MinimalCard({
  children,
  dark = false,
  className,
}: MinimalCardProps) {
  return (
    <div className={cn(
      "border border-[#e5e5e5] p-8",
      dark ? "bg-[#0a0a0a] text-white border-[#666666]" : "bg-white text-[#0a0a0a]",
      className
    )}>
      {children}
    </div>
  );
}