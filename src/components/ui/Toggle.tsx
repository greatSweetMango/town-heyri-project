"use client";

import { cn } from "@/lib/utils";

interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Toggle({ enabled, onChange, label, disabled = false }: ToggleProps) {
  return (
    <label
      className={cn(
        "inline-flex items-center gap-3 select-none",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      )}
    >
      <button
        role="switch"
        type="button"
        aria-checked={enabled}
        disabled={disabled}
        onClick={() => !disabled && onChange(!enabled)}
        className={cn(
          "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200",
          "min-w-[48px] min-h-[44px] p-[2px]",
          enabled
            ? "bg-[var(--color-gold)]"
            : "bg-[var(--color-charcoal)] border border-[var(--color-glass-border)]"
        )}
      >
        <span
          className={cn(
            "inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
            enabled ? "translate-x-[22px]" : "translate-x-[2px]"
          )}
        />
      </button>
      {label && (
        <span className="text-sm text-[var(--color-cream)]">{label}</span>
      )}
    </label>
  );
}
