"use client";

import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl p-4",
        "bg-[var(--color-glass-bg)] backdrop-blur-xl",
        "border border-[var(--color-glass-border)]",
        className
      )}
    >
      {children}
    </div>
  );
}
