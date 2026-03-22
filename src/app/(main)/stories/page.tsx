"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import StoryCircle from "@/components/stories/StoryCircle";
import StoryViewer from "@/components/stories/StoryViewer";
import { CATEGORY_CONFIG, type Category } from "@/types";

interface StoryItem {
  id: string;
  image?: string | null;
  text?: string | null;
  category?: string | null;
  createdAt: string;
  storeId: string;
  author: { name: string | null };
  store: { name: string; category: string };
}

interface StoreGroup {
  storeId: string;
  storeName: string;
  storeCategory: string;
  stories: StoryItem[];
}

const BOARD_CATEGORIES = [
  { key: "전체", label: "전체" },
  { key: "cafe", label: "카페" },
  { key: "restaurant", label: "음식점" },
  { key: "gallery", label: "갤러리" },
  { key: "workshop", label: "공방" },
  { key: "shop", label: "소품샵" },
] as const;

export default function StoriesPage() {
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("전체");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerStoreIndex, setViewerStoreIndex] = useState(0);

  const fetchStories = useCallback(async () => {
    try {
      const res = await fetch("/api/stories");
      if (res.ok) {
        const data = await res.json();
        setStories(data);
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  // Group stories by store
  const storeGroups = useMemo(() => {
    const map = new Map<string, StoreGroup>();
    for (const story of stories) {
      if (!map.has(story.storeId)) {
        map.set(story.storeId, {
          storeId: story.storeId,
          storeName: story.store.name,
          storeCategory: story.store.category,
          stories: [],
        });
      }
      map.get(story.storeId)!.stories.push(story);
    }
    return Array.from(map.values());
  }, [stories]);

  // Filter by category
  const filteredGroups = useMemo(() => {
    if (activeCategory === "전체") return storeGroups;
    return storeGroups.filter((g) => g.storeCategory === activeCategory);
  }, [storeGroups, activeCategory]);

  const handleCircleClick = (index: number) => {
    setViewerStoreIndex(index);
    setViewerOpen(true);
  };

  return (
    <div
      className="min-h-screen pb-20"
      style={{ background: "var(--color-charcoal)" }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-30 px-5 pt-[env(safe-area-inset-top,12px)] pb-3"
        style={{
          background: "rgba(26, 22, 18, 0.92)",
          backdropFilter: "blur(12px)",
        }}
      >
        <h1
          className="text-xl font-bold mb-3"
          style={{ color: "var(--color-cream)" }}
        >
          오늘의 소식
        </h1>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {BOARD_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className="shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors whitespace-nowrap"
                style={{
                  backgroundColor: isActive
                    ? "var(--color-gold)"
                    : "transparent",
                  color: isActive
                    ? "var(--color-charcoal)"
                    : "var(--color-sand)",
                  border: `1px solid ${isActive ? "var(--color-gold)" : "var(--color-glass-border)"}`,
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Story circles - horizontal scroll */}
      {filteredGroups.length > 0 && (
        <div className="px-4 py-4">
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {filteredGroups.map((group, i) => (
              <StoryCircle
                key={group.storeId}
                storeName={group.storeName}
                category={group.storeCategory as Category}
                hasStories={group.stories.length > 0}
                onClick={() => handleCircleClick(i)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Story cards list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div
            className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "var(--color-gold)", borderTopColor: "transparent" }}
          />
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6">
          <div
            className="text-5xl mb-4 opacity-40"
            role="img"
            aria-label="no stories"
          >
            📷
          </div>
          <p
            className="text-base font-medium text-center mb-1"
            style={{ color: "var(--color-sand)" }}
          >
            아직 오늘의 소식이 없어요
          </p>
          <p
            className="text-sm text-center"
            style={{ color: "var(--color-sand)", opacity: 0.6 }}
          >
            상점의 새로운 소식이 올라오면 여기에 표시됩니다
          </p>
        </div>
      ) : (
        <div className="px-4 space-y-3">
          {filteredGroups.map((group) => (
            <div
              key={group.storeId}
              className="rounded-xl p-4"
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid var(--color-glass-border)",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">
                  {CATEGORY_CONFIG[group.storeCategory as Category]?.icon ??
                    "📍"}
                </span>
                <span
                  className="font-semibold text-sm"
                  style={{ color: "var(--color-cream)" }}
                >
                  {group.storeName}
                </span>
                <span
                  className="text-xs"
                  style={{ color: "var(--color-sand)", opacity: 0.6 }}
                >
                  {group.stories.length}개 소식
                </span>
              </div>

              {/* Horizontal thumbnail strip */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {group.stories.map((story) => (
                  <div
                    key={story.id}
                    className="shrink-0 rounded-lg overflow-hidden"
                    style={{
                      width: 120,
                      height: 160,
                      background: "rgba(255, 255, 255, 0.06)",
                    }}
                  >
                    {story.image ? (
                      <img
                        src={story.image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center p-3"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(200,165,100,0.15), rgba(200,165,100,0.05))",
                        }}
                      >
                        <p
                          className="text-xs leading-relaxed line-clamp-5 text-center"
                          style={{ color: "var(--color-sand)" }}
                        >
                          {story.text || ""}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Story Viewer overlay */}
      {viewerOpen && filteredGroups.length > 0 && (
        <StoryViewer
          stories={filteredGroups}
          initialStoreIndex={viewerStoreIndex}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </div>
  );
}
