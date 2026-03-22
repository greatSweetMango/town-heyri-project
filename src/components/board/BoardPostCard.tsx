"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface BoardPostData {
  id: string;
  title: string;
  content: string;
  category: string | null;
  images: string[];
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    email: string;
  };
  store: {
    id: string;
    name: string;
    category: string;
  } | null;
}

const BOARD_CATEGORY_CONFIG: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  announcement: { label: "공지", color: "#c9a84c", icon: "📢" },
  performance: { label: "공연", color: "#7B1FA2", icon: "🎭" },
  exhibition: { label: "전시", color: "#1976D2", icon: "🖼️" },
  newmenu: { label: "신메뉴", color: "#D32F2F", icon: "🍽️" },
  fleamarket: { label: "플리마켓", color: "#388E3C", icon: "🛍️" },
  general: { label: "일반", color: "#616161", icon: "📝" },
};

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay < 7) return `${diffDay}일 전`;
  return date.toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
  });
}

export default function BoardPostCard({ post }: { post: BoardPostData }) {
  const [expanded, setExpanded] = useState(false);
  const catConfig = BOARD_CATEGORY_CONFIG[post.category || "general"] ||
    BOARD_CATEGORY_CONFIG.general;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onClick={() => setExpanded((prev) => !prev)}
      className={cn(
        "w-full text-left rounded-2xl p-4 cursor-pointer",
        "bg-[var(--color-glass-bg)] backdrop-blur-md",
        "border border-[var(--color-glass-border)]",
        "transition-colors duration-200",
        "active:scale-[0.99]"
      )}
    >
      {/* Header: store info + category badge */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          {post.store ? (
            <>
              <span className="text-base flex-shrink-0">{catConfig.icon}</span>
              <span className="text-xs font-medium text-[var(--color-sand)] truncate">
                {post.store.name}
              </span>
            </>
          ) : (
            <>
              <span className="text-base flex-shrink-0">{catConfig.icon}</span>
              <span className="text-xs font-medium text-[var(--color-sand)] truncate">
                {post.author.name || post.author.email}
              </span>
            </>
          )}
        </div>

        <span
          className="flex-shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: `${catConfig.color}20`,
            color: catConfig.color,
          }}
        >
          {catConfig.label}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-sm font-bold text-[var(--color-cream)] mb-1.5 leading-snug">
        {post.title}
      </h3>

      {/* Content - preview or full */}
      <AnimatePresence mode="wait">
        {expanded ? (
          <motion.div
            key="full"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="text-xs text-[var(--color-sand)]/80 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          </motion.div>
        ) : (
          <motion.p
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs text-[var(--color-sand)]/70 leading-relaxed line-clamp-2"
          >
            {post.content}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Footer: timestamp + image count */}
      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[var(--color-glass-border)]">
        <span className="text-[10px] text-[var(--color-sand)]/50">
          {formatTimeAgo(post.createdAt)}
        </span>

        {post.images.length > 0 && (
          <span className="flex items-center gap-1 text-[10px] text-[var(--color-sand)]/50">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            {post.images.length}
          </span>
        )}
      </div>
    </motion.article>
  );
}
