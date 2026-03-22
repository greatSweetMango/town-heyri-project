"use client";

import { cn } from "@/lib/utils";
import { InputHTMLAttributes } from "react";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, id, ...rest }: InputProps) {
  const inputId = id || label?.replace(/\s+/g, "-").toLowerCase();

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-[var(--color-sand)] mb-1.5"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "w-full min-h-[44px] px-4 py-2.5 rounded-xl text-sm",
          "bg-[var(--color-charcoal)] text-[var(--color-cream)]",
          "border border-[var(--color-glass-border)]",
          "placeholder:text-[var(--color-sand)]/40",
          "focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/30",
          "transition-colors duration-200",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/30",
          className
        )}
        {...rest}
      />
      {error && (
        <p className="mt-1.5 text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
