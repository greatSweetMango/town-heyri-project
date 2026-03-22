"use client";

import { CATEGORY_CONFIG, type Category } from "@/types";

interface StoryCircleProps {
  storeName: string;
  category: Category;
  hasStories: boolean;
  onClick: () => void;
}

export default function StoryCircle({
  storeName,
  category,
  hasStories,
  onClick,
}: StoryCircleProps) {
  const config = CATEGORY_CONFIG[category] ?? {
    icon: "📍",
    label: category,
    color: "#888",
  };

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 shrink-0"
      style={{ width: 72 }}
    >
      {/* Gradient ring wrapper */}
      <div
        className="relative flex items-center justify-center rounded-full"
        style={{
          width: 64,
          height: 64,
          background: hasStories
            ? "linear-gradient(135deg, var(--color-gold), #e8a825, #c4841d)"
            : "var(--color-glass-border)",
          padding: 3,
        }}
      >
        {/* Inner circle */}
        <div
          className="flex items-center justify-center rounded-full w-full h-full"
          style={{
            background: "var(--color-charcoal)",
          }}
        >
          <span className="text-2xl" role="img" aria-label={config.label}>
            {config.icon}
          </span>
        </div>
      </div>

      {/* Store name */}
      <span
        className="text-[11px] font-medium text-center leading-tight line-clamp-1 w-full"
        style={{ color: "var(--color-sand)" }}
      >
        {storeName}
      </span>
    </button>
  );
}
