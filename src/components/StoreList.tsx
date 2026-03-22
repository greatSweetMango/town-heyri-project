"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Category, CATEGORY_CONFIG, StoreWithEvents } from "@/types";

interface StoreListProps {
  stores: StoreWithEvents[];
  selectedCategories: Category[];
  onStoreSelect: (store: StoreWithEvents) => void;
}

export default function StoreList({
  stores,
  selectedCategories,
  onStoreSelect,
}: StoreListProps) {
  const filteredStores = useMemo(() => {
    if (selectedCategories.length === 0) return stores;
    return stores.filter((s) => selectedCategories.includes(s.category));
  }, [stores, selectedCategories]);

  return (
    <div className="mt-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-bold text-[var(--color-cream)]">
          장소 목록
        </h3>
        <span className="text-xs text-[var(--color-sand)]/60">
          총 {filteredStores.length}개 장소
        </span>
      </div>

      {/* Store cards */}
      <div className="flex flex-col gap-3">
        {filteredStores.map((store, i) => {
          const config = CATEGORY_CONFIG[store.category];

          return (
            <motion.button
              key={store.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: i * 0.04,
                duration: 0.4,
                ease: "easeOut",
              }}
              whileHover={{
                y: -2,
                boxShadow: `0 4px 20px ${config.color}15`,
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onStoreSelect(store)}
              className="w-full rounded-2xl p-4 text-left glass transition-colors"
            >
              <div className="flex items-start gap-3">
                {/* Category icon */}
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
                  style={{ backgroundColor: `${config.color}20` }}
                >
                  {config.icon}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  {/* Name + status row */}
                  <div className="flex items-center gap-2">
                    <h4 className="truncate text-sm font-semibold text-[var(--color-cream)]">
                      {store.name}
                    </h4>
                    {store.hasActiveEvent && (
                      <span className="shrink-0 text-xs">✨</span>
                    )}
                    {store.isOpen ? (
                      <span className="shrink-0 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                        영업중
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-[var(--color-sand)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-sand)]/50">
                        영업종료
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="mt-1 line-clamp-1 text-xs text-[var(--color-sand)]/60">
                    {store.description}
                  </p>

                  {/* Tags + openHours row */}
                  <div className="mt-2 flex items-center gap-2">
                    {store.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                        style={{
                          backgroundColor: `${config.color}12`,
                          color: config.color,
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                    {store.openHours && (
                      <span className="ml-auto shrink-0 text-[10px] text-[var(--color-sand)]/40">
                        {store.openHours}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {filteredStores.length === 0 && (
        <div className="rounded-2xl py-12 text-center glass">
          <p className="text-sm text-[var(--color-sand)]/50">
            선택한 카테고리에 해당하는 장소가 없습니다
          </p>
        </div>
      )}
    </div>
  );
}
