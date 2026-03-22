"use client";

import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  color?: "gold" | "green" | "red" | "blue" | "sand" | "default";
  className?: string;
}

const colorStyles: Record<string, string> = {
  default:
    "bg-[var(--color-glass-bg-light)] text-[var(--color-cream)] border-[var(--color-glass-border)]",
  gold: "bg-[var(--color-gold)]/15 text-[var(--color-gold)] border-[var(--color-gold)]/25",
  green:
    "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  red: "bg-red-500/15 text-red-400 border-red-500/25",
  blue: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  sand: "bg-[var(--color-sand)]/15 text-[var(--color-sand)] border-[var(--color-sand)]/25",
};

export function Badge({
  children,
  color = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        colorStyles[color],
        className
      )}
    >
      {children}
    </span>
  );
}
