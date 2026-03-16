"use client";

import { motion } from "framer-motion";
import { Store, CATEGORY_CONFIG } from "@/types";
import { cn } from "@/lib/utils";

interface StoreCardProps {
  store: Store;
  onClick?: () => void;
  variant?: "default" | "compact" | "featured";
}

export default function StoreCard({
  store,
  onClick,
  variant = "default",
}: StoreCardProps) {
  const config = CATEGORY_CONFIG[store.category];

  if (variant === "compact") {
    return (
      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -2, boxShadow: `0 4px 20px ${config.color}30` }}
        onClick={onClick}
        className={cn(
          "flex items-center gap-3 w-full text-left",
          "px-3 py-2.5 rounded-xl",
          "bg-white/40 dark:bg-stone-800/40",
          "backdrop-blur-md border border-white/30 dark:border-stone-700/40",
          "hover:border-opacity-60 transition-colors duration-200",
          "cursor-pointer"
        )}
        style={
          {
            "--card-accent": config.color,
          } as React.CSSProperties
        }
      >
        <span className="text-xl flex-shrink-0">{config.icon}</span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-stone-800 dark:text-stone-100 truncate">
            {store.name}
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            {config.label}
          </p>
        </div>
      </motion.button>
    );
  }

  if (variant === "featured") {
    return (
      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        whileHover={{
          y: -4,
          boxShadow: `0 12px 40px ${config.color}25`,
        }}
        onClick={onClick}
        className={cn(
          "w-full text-left rounded-2xl p-5",
          "bg-white/50 dark:bg-stone-800/50",
          "backdrop-blur-lg border border-white/40 dark:border-stone-700/40",
          "hover:border-opacity-70 transition-all duration-300",
          "cursor-pointer group"
        )}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{config.icon}</span>
            <div>
              <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100">
                {store.name}
              </h3>
              <span
                className="inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-0.5"
                style={{
                  backgroundColor: `${config.color}18`,
                  color: config.color,
                }}
              >
                {config.label}
              </span>
            </div>
          </div>
        </div>

        <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed mb-3">
          {store.description}
        </p>

        {store.story && (
          <p className="text-xs text-stone-500 dark:text-stone-400 italic leading-relaxed mb-3 line-clamp-2 border-l-2 border-stone-300 dark:border-stone-600 pl-3">
            {store.story}
          </p>
        )}

        {store.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {store.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full bg-stone-200/60 dark:bg-stone-700/60 text-stone-600 dark:text-stone-300"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </motion.button>
    );
  }

  // Default variant
  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={{
        y: -3,
        boxShadow: `0 8px 30px ${config.color}20`,
      }}
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-2xl p-4",
        "bg-white/45 dark:bg-stone-800/45",
        "backdrop-blur-md border border-white/35 dark:border-stone-700/40",
        "hover:border-opacity-60 transition-all duration-300",
        "cursor-pointer group"
      )}
    >
      <div className="flex items-center gap-2.5 mb-2.5">
        <span className="text-xl">{config.icon}</span>
        <div>
          <h3 className="text-base font-bold text-stone-800 dark:text-stone-100 group-hover:text-stone-900">
            {store.name}
          </h3>
          <span
            className="inline-block text-xs font-medium px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: `${config.color}15`,
              color: config.color,
            }}
          >
            {config.label}
          </span>
        </div>
      </div>

      <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed mb-3 line-clamp-2">
        {store.description}
      </p>

      {store.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {store.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full bg-stone-200/50 dark:bg-stone-700/50 text-stone-600 dark:text-stone-300"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </motion.button>
  );
}
