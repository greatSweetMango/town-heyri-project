"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { Store, CATEGORY_CONFIG } from "@/types";
import { stores as allStores } from "@/data/stores";
import NearbyStores from "./NearbyStores";

interface StoreDetailPanelProps {
  store: Store | null;
  onClose: () => void;
  onStoreSelect?: (store: Store) => void;
}

export default function StoreDetailPanel({
  store,
  onClose,
  onStoreSelect,
}: StoreDetailPanelProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (store) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [store, onClose]);

  return (
    <AnimatePresence>
      {store && (
        <>
          {/* Overlay */}
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={handleOverlayClick}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          />

          {/* Desktop: slide from right */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed top-0 right-0 z-50 h-full w-full max-w-md
              bg-white/80 dark:bg-stone-900/85 backdrop-blur-xl
              border-l border-white/30 dark:border-stone-700/40
              shadow-2xl overflow-y-auto
              hidden md:block"
          >
            <PanelContent
              store={store}
              onClose={onClose}
              onStoreSelect={onStoreSelect}
            />
          </motion.aside>

          {/* Mobile: bottom sheet */}
          <motion.aside
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            drag="y"
            dragControls={dragControls}
            dragConstraints={{ top: 0 }}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 400) {
                onClose();
              }
            }}
            className="fixed bottom-0 left-0 right-0 z-50
              max-h-[85vh] rounded-t-3xl overflow-y-auto
              bg-white/85 dark:bg-stone-900/90 backdrop-blur-xl
              border-t border-white/30 dark:border-stone-700/40
              shadow-2xl
              md:hidden"
          >
            {/* Drag handle */}
            <div className="sticky top-0 z-10 flex justify-center pt-3 pb-1 bg-white/85 dark:bg-stone-900/90 backdrop-blur-xl rounded-t-3xl">
              <div className="w-10 h-1 rounded-full bg-stone-300 dark:bg-stone-600" />
            </div>
            <PanelContent
              store={store}
              onClose={onClose}
              onStoreSelect={onStoreSelect}
            />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */

function PanelContent({
  store,
  onClose,
  onStoreSelect,
}: {
  store: Store;
  onClose: () => void;
  onStoreSelect?: (store: Store) => void;
}) {
  const config = CATEGORY_CONFIG[store.category];

  return (
    <div className="p-5 pb-10 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-stone-800 dark:text-stone-100 leading-tight">
            {store.name}
          </h2>
          <span
            className="inline-flex items-center gap-1 mt-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{
              backgroundColor: `${config.color}18`,
              color: config.color,
            }}
          >
            {config.icon} {config.label}
          </span>
        </div>
        <button
          onClick={onClose}
          aria-label="닫기"
          className="p-2 -mr-2 -mt-1 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-700/50 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M5 5l10 10M15 5L5 15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Description */}
      <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
        {store.description}
      </p>

      {/* Story / docent card */}
      {store.story && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.35 }}
          className="rounded-2xl p-4 bg-amber-50/70 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/30"
        >
          <h3 className="text-xs font-bold text-amber-700 dark:text-amber-400 tracking-wide uppercase mb-2">
            이 공간의 이야기
          </h3>
          <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-[serif] italic">
            {store.story}
          </p>
        </motion.div>
      )}

      {/* Tags */}
      {store.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {store.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{
                backgroundColor: `${config.color}12`,
                color: config.color,
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Open hours */}
      {store.openHours && (
        <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-300">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="text-stone-400 flex-shrink-0"
          >
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
            <path
              d="M8 4.5V8l2.5 1.5"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>{store.openHours}</span>
        </div>
      )}

      {/* Phone */}
      {store.phone && (
        <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-300">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="text-stone-400 flex-shrink-0"
          >
            <path
              d="M3 2.5h3l1.5 3-1.75 1.25a8 8 0 003.5 3.5L10.5 8.5l3 1.5v3a1 1 0 01-1 1C6.5 14 2 9.5 2 3.5a1 1 0 011-1z"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>{store.phone}</span>
        </div>
      )}

      {/* Directions button */}
      <button
        className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
        style={{ backgroundColor: config.color }}
      >
        길찾기
      </button>

      {/* Nearby stores */}
      <NearbyStores
        currentStore={store}
        stores={allStores}
        limit={3}
        onStoreClick={onStoreSelect}
      />
    </div>
  );
}
