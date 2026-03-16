"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Category, CATEGORY_CONFIG } from "@/types";

interface CategoryFilterProps {
  onCategoryChange: (category: Category | null) => void;
  activeCategory?: Category | null;
}

const categories = Object.entries(CATEGORY_CONFIG) as [
  Category,
  (typeof CATEGORY_CONFIG)[Category],
][];

export default function CategoryFilter({
  onCategoryChange,
  activeCategory = null,
}: CategoryFilterProps) {
  const [selected, setSelected] = useState<Category | null>(
    activeCategory ?? null
  );

  const handleSelect = (category: Category | null) => {
    setSelected(category);
    onCategoryChange(category);
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
      <motion.button
        layout
        onClick={() => handleSelect(null)}
        className="shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap"
        style={{
          backgroundColor:
            selected === null ? "var(--color-gold)" : "var(--color-charcoal)",
          color:
            selected === null
              ? "var(--color-charcoal)"
              : "var(--color-cream)",
          border: `1px solid ${selected === null ? "var(--color-gold)" : "var(--color-glass-border)"}`,
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        전체
      </motion.button>

      <AnimatePresence>
        {categories.map(([key, config]) => {
          const isActive = selected === key;
          return (
            <motion.button
              key={key}
              layout
              onClick={() => handleSelect(key)}
              className="shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap"
              style={{
                backgroundColor: isActive
                  ? config.color
                  : "var(--color-charcoal)",
                color: isActive ? "#fff" : "var(--color-cream)",
                border: `1px solid ${isActive ? config.color : "var(--color-glass-border)"}`,
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="mr-1">{config.icon}</span>
              {config.label}
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
