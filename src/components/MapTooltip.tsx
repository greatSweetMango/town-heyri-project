"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Store } from "@/types";
import { CATEGORY_CONFIG } from "@/types";

interface MapTooltipProps {
  store: Store | null;
  screenPosition: { x: number; y: number } | null;
}

export default function MapTooltip({ store, screenPosition }: MapTooltipProps) {
  if (!screenPosition || !store) return null;

  const tooltipWidth = 280;
  const tooltipHeight = 180;
  const padding = 16;

  let left = screenPosition.x + 16;
  let top = screenPosition.y - tooltipHeight / 2;

  if (typeof window !== "undefined") {
    if (left + tooltipWidth + padding > window.innerWidth) {
      left = screenPosition.x - tooltipWidth - 16;
    }
    if (left < padding) left = padding;
    if (top < padding) top = padding;
    if (top + tooltipHeight + padding > window.innerHeight) {
      top = window.innerHeight - tooltipHeight - padding;
    }
  }

  const config = CATEGORY_CONFIG[store.category];

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      <AnimatePresence mode="wait">
        <motion.div
          key={store.id}
          initial={{ opacity: 0, scale: 0.9, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 6 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          style={{ position: "absolute", left, top, width: tooltipWidth }}
          className="rounded-2xl border border-white/30 bg-white/80 p-4 shadow-2xl backdrop-blur-xl"
        >
          {/* Category badge */}
          <div className="flex items-center gap-2 mb-2">
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
              style={{ backgroundColor: config.color }}
            >
              <span>{config.icon}</span>
              <span>{config.label}</span>
            </span>
            {store.openHours && (
              <span className="text-xs text-gray-500">{store.openHours}</span>
            )}
          </div>

          {/* Name */}
          <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">
            {store.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-2">
            {store.description}
          </p>

          {/* Story teaser */}
          {store.story && (
            <div className="flex items-center gap-1.5 text-xs font-medium mb-2" style={{ color: config.color }}>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>스토리 보기</span>
            </div>
          )}

          {/* Tags */}
          {store.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {store.tags.map((tag) => (
                <span key={tag} className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
