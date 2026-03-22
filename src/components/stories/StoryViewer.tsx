"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CATEGORY_CONFIG, type Category } from "@/types";

interface StoryItem {
  id: string;
  image?: string | null;
  text?: string | null;
  category?: string | null;
  createdAt: string;
  author: { name: string | null };
  store: { name: string; category: string };
  storeId: string;
}

interface StoreGroup {
  storeId: string;
  storeName: string;
  storeCategory: string;
  stories: StoryItem[];
}

interface StoryViewerProps {
  stories: StoreGroup[];
  initialStoreIndex: number;
  onClose: () => void;
}

const STORY_DURATION = 5000; // 5 seconds per story

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

export default function StoryViewer({
  stories,
  initialStoreIndex,
  onClose,
}: StoryViewerProps) {
  const [storeIndex, setStoreIndex] = useState(initialStoreIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(Date.now());

  const currentGroup = stories[storeIndex];
  const currentStory = currentGroup?.stories[storyIndex];

  const totalStores = stories.length;

  const goNext = useCallback(() => {
    if (!currentGroup) return;
    if (storyIndex < currentGroup.stories.length - 1) {
      setStoryIndex((i) => i + 1);
      setProgress(0);
      startTimeRef.current = Date.now();
    } else if (storeIndex < totalStores - 1) {
      setStoreIndex((i) => i + 1);
      setStoryIndex(0);
      setProgress(0);
      startTimeRef.current = Date.now();
    } else {
      onClose();
    }
  }, [currentGroup, storyIndex, storeIndex, totalStores, onClose]);

  const goPrev = useCallback(() => {
    if (storyIndex > 0) {
      setStoryIndex((i) => i - 1);
      setProgress(0);
      startTimeRef.current = Date.now();
    } else if (storeIndex > 0) {
      const prevGroup = stories[storeIndex - 1];
      setStoreIndex((i) => i - 1);
      setStoryIndex(prevGroup.stories.length - 1);
      setProgress(0);
      startTimeRef.current = Date.now();
    }
  }, [storyIndex, storeIndex, stories]);

  // Auto-advance timer
  useEffect(() => {
    startTimeRef.current = Date.now();
    setProgress(0);

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(elapsed / STORY_DURATION, 1);
      setProgress(pct);
      if (pct >= 1) {
        goNext();
      }
    }, 50);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [storeIndex, storyIndex, goNext]);

  // Handle keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, goNext, goPrev]);

  // Touch handling for swipe
  const touchStartX = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 50) {
      if (diff < 0) goNext();
      else goPrev();
    }
  };

  // Tap zones
  const handleTap = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const thirdWidth = rect.width / 3;
    if (x < thirdWidth) {
      goPrev();
    } else {
      goNext();
    }
  };

  const categoryConfig = useMemo(() => {
    const cat = currentGroup?.storeCategory as Category;
    return CATEGORY_CONFIG[cat] ?? { icon: "📍", label: cat, color: "#888" };
  }, [currentGroup?.storeCategory]);

  if (!currentGroup || !currentStory) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: "rgba(0, 0, 0, 0.95)" }}
    >
      <div
        className="relative w-full h-[100dvh] max-w-md mx-auto flex flex-col"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleTap}
      >
        {/* Progress bars */}
        <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 px-3 pt-[env(safe-area-inset-top,8px)]">
          {currentGroup.stories.map((_, i) => (
            <div
              key={i}
              className="flex-1 h-[3px] rounded-full overflow-hidden"
              style={{ background: "rgba(255, 255, 255, 0.25)" }}
            >
              <div
                className="h-full rounded-full transition-none"
                style={{
                  width:
                    i < storyIndex
                      ? "100%"
                      : i === storyIndex
                        ? `${progress * 100}%`
                        : "0%",
                  background: "var(--color-gold)",
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div
          className="absolute top-0 left-0 right-0 z-10 flex items-center gap-3 px-4"
          style={{
            paddingTop: "calc(env(safe-area-inset-top, 8px) + 16px)",
          }}
        >
          {/* Store icon */}
          <div
            className="flex items-center justify-center rounded-full shrink-0"
            style={{
              width: 36,
              height: 36,
              background: "rgba(255, 255, 255, 0.1)",
              border: `2px solid ${categoryConfig.color}`,
            }}
          >
            <span className="text-base">{categoryConfig.icon}</span>
          </div>

          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-semibold truncate"
              style={{ color: "var(--color-cream)" }}
            >
              {currentGroup.storeName}
            </p>
            <p className="text-[11px]" style={{ color: "var(--color-sand)" }}>
              {categoryConfig.label} &middot;{" "}
              {formatTimeAgo(currentStory.createdAt)}
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="shrink-0 flex items-center justify-center rounded-full"
            style={{
              width: 36,
              height: 36,
              background: "rgba(255, 255, 255, 0.1)",
            }}
            aria-label="닫기"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-cream)"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Story content */}
        <div className="flex-1 flex items-center justify-center overflow-hidden">
          {currentStory.image ? (
            <img
              src={currentStory.image}
              alt=""
              className="w-full h-full object-contain"
              draggable={false}
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full px-8">
              <p
                className="text-xl font-medium text-center leading-relaxed"
                style={{ color: "var(--color-cream)" }}
              >
                {currentStory.text || ""}
              </p>
            </div>
          )}
        </div>

        {/* Text overlay (when image + text) */}
        {currentStory.image && currentStory.text && (
          <div
            className="absolute bottom-0 left-0 right-0 z-10 px-5 pb-8"
            style={{
              background:
                "linear-gradient(transparent, rgba(0,0,0,0.7) 40%)",
              paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 32px)",
            }}
          >
            <p
              className="text-base font-medium leading-relaxed"
              style={{ color: "var(--color-cream)" }}
            >
              {currentStory.text}
            </p>
          </div>
        )}

        {/* Store index indicator */}
        {totalStores > 1 && (
          <div className="absolute bottom-4 left-0 right-0 z-10 flex justify-center gap-1.5">
            {stories.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-200"
                style={{
                  width: i === storeIndex ? 16 : 6,
                  height: 6,
                  background:
                    i === storeIndex
                      ? "var(--color-gold)"
                      : "rgba(255, 255, 255, 0.3)",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
