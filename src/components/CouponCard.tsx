"use client";

import { cn } from "@/lib/utils";

interface CouponStore {
  name: string;
}

interface Coupon {
  id: string;
  title: string;
  description?: string;
  discount: string;
  validUntil: string;
  store?: CouponStore;
}

interface CouponCardProps {
  coupon: Coupon;
  className?: string;
}

export function CouponCard({ coupon, className }: CouponCardProps) {
  return (
    <div
      className={cn(
        "relative flex overflow-hidden rounded-2xl",
        "border border-[var(--color-glass-border)]",
        "bg-[var(--color-glass-bg)] backdrop-blur-xl",
        className
      )}
    >
      {/* Left: discount highlight */}
      <div className="flex flex-col items-center justify-center px-5 py-6 min-w-[100px] bg-[var(--color-gold)]/15 border-r border-dashed border-[var(--color-gold)]/40">
        <span className="text-2xl font-extrabold text-[var(--color-gold)] leading-tight">
          {coupon.discount}
        </span>
      </div>

      {/* Perforated edge circles */}
      <div className="absolute left-[99px] top-[-8px] w-4 h-4 rounded-full bg-[var(--background)]" />
      <div className="absolute left-[99px] bottom-[-8px] w-4 h-4 rounded-full bg-[var(--background)]" />

      {/* Right: details */}
      <div className="flex-1 px-4 py-4 min-w-0">
        <h3 className="text-sm font-bold text-[var(--color-cream)] truncate">
          {coupon.title}
        </h3>
        {coupon.description && (
          <p className="mt-1 text-xs text-[var(--color-sand)] line-clamp-2 leading-relaxed">
            {coupon.description}
          </p>
        )}
        <div className="mt-3 flex items-center justify-between gap-2">
          {coupon.store && (
            <span className="text-xs text-[var(--color-sand)]/70 truncate">
              {coupon.store.name}
            </span>
          )}
          <span className="shrink-0 text-[10px] text-[var(--color-sand)]/50">
            ~{coupon.validUntil}
          </span>
        </div>
      </div>
    </div>
  );
}
