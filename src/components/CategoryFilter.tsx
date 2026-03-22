"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Category, CATEGORY_CONFIG } from "@/types";

interface CategoryFilterProps {
  onCategoryChange: (categories: Category[]) => void;
  activeCategories: Category[];
}

const categories = Object.entries(CATEGORY_CONFIG) as [
  Category,
  (typeof CATEGORY_CONFIG)[Category],
][];

export default function CategoryFilter({
  onCategoryChange,
  activeCategories,
}: CategoryFilterProps) {
  const handleToggle = (category: Category) => {
    const isActive = activeCategories.includes(category);
    if (isActive) {
      onCategoryChange(activeCategories.filter((c) => c !== category));
    } else {
      onCategoryChange([...activeCategories, category]);
    }
  };

  const handleReset = () => {
    onCategoryChange([]);
  };

  const isAllSelected = activeCategories.length === 0;

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
      <motion.button
        layout
        onClick={handleReset}
        className="shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap"
        style={{
          backgroundColor:
            isAllSelected ? "var(--color-gold)" : "var(--color-charcoal)",
          color:
            isAllSelected
              ? "var(--color-charcoal)"
              : "var(--color-cream)",
          border: `1px solid ${isAllSelected ? "var(--color-gold)" : "var(--color-glass-border)"}`,
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        전체
      </motion.button>

      <AnimatePresence>
        {categories.map(([key, config]) => {
          const isActive = activeCategories.includes(key);
          return (
            <motion.button
              key={key}
              layout
              onClick={() => handleToggle(key)}
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
