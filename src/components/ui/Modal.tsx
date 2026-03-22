"use client";

import { useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
      };
    }
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Dialog */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative z-10 w-full sm:max-w-lg",
          "bg-[var(--color-charcoal)] border border-[var(--color-glass-border)]",
          // Mobile: bottom sheet
          "rounded-t-2xl sm:rounded-2xl",
          "max-h-[85vh] overflow-y-auto",
          "animate-[slideUp_0.25s_ease-out] sm:animate-[fadeIn_0.2s_ease-out]"
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h2 className="text-lg font-bold text-[var(--color-cream)]">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--color-sand)] hover:bg-[var(--color-glass-bg-light)] transition-colors"
              aria-label="Close"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M12 4L4 12M4 4l8 8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 rounded-full bg-[var(--color-sand)]/30" />
        </div>

        {/* Content */}
        <div className={cn("px-5 pb-5", !title && "pt-5")}>
          {children}
        </div>
      </div>
    </div>
  );
}
