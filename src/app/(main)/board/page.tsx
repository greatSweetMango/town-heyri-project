"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BoardPostCard, {
  type BoardPostData,
} from "@/components/board/BoardPostCard";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { key: null, label: "전체" },
  { key: "performance", label: "공연" },
  { key: "exhibition", label: "전시" },
  { key: "newmenu", label: "신메뉴" },
  { key: "fleamarket", label: "플리마켓" },
  { key: "announcement", label: "공지" },
] as const;

const PAGE_SIZE = 10;

function SkeletonCard() {
  return (
    <div className="w-full rounded-2xl p-4 bg-[var(--color-glass-bg)] border border-[var(--color-glass-border)] animate-pulse">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[var(--color-charcoal)]" />
          <div className="w-20 h-3 rounded bg-[var(--color-charcoal)]" />
        </div>
        <div className="w-10 h-4 rounded-full bg-[var(--color-charcoal)]" />
      </div>
      <div className="w-3/4 h-4 rounded bg-[var(--color-charcoal)] mb-2" />
      <div className="w-full h-3 rounded bg-[var(--color-charcoal)] mb-1" />
      <div className="w-2/3 h-3 rounded bg-[var(--color-charcoal)]" />
      <div className="mt-3 pt-2 border-t border-[var(--color-glass-border)]">
        <div className="w-12 h-2.5 rounded bg-[var(--color-charcoal)]" />
      </div>
    </div>
  );
}

export default function BoardPage() {
  const [posts, setPosts] = useState<BoardPostData[]>([]);
  const [category, setCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const initialLoad = useRef(true);

  const fetchPosts = useCallback(
    async (pageNum: number, append: boolean) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const params = new URLSearchParams({
          page: String(pageNum),
          limit: String(PAGE_SIZE),
        });
        if (category) params.set("category", category);

        const res = await fetch(`/api/board?${params}`);
        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();

        if (append) {
          setPosts((prev) => [...prev, ...data.posts]);
        } else {
          setPosts(data.posts);
        }
        setPage(data.page);
        setTotalPages(data.totalPages);
      } catch {
        // Silently handle - posts stay as-is
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [category]
  );

  // Fetch on mount and when category changes
  useEffect(() => {
    setPosts([]);
    setPage(1);
    fetchPosts(1, false);
    initialLoad.current = false;
  }, [fetchPosts]);

  const handleLoadMore = () => {
    if (page < totalPages && !loadingMore) {
      fetchPosts(page + 1, true);
    }
  };

  const handleCategoryChange = (key: string | null) => {
    if (key === category) return;
    setCategory(key);
  };

  return (
    <main className="min-h-screen pb-4">
      {/* Header */}
      <div className="sticky top-0 z-40 pt-[env(safe-area-inset-top)]" style={{ background: "rgba(26, 22, 18, 0.92)", backdropFilter: "blur(12px)" }}>
        <div className="px-4 pt-4 pb-2">
          <h1 className="text-xl font-bold text-[var(--color-cream)]">
            헤이리 대자보
          </h1>
          <p className="text-xs text-[var(--color-sand)]/60 mt-0.5">
            마을 소식과 이벤트를 확인하세요
          </p>
        </div>

        {/* Category filter tabs */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isActive = category === cat.key;
            return (
              <button
                key={cat.key ?? "all"}
                onClick={() => handleCategoryChange(cat.key)}
                className={cn(
                  "flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                  isActive
                    ? "bg-[var(--color-gold)] text-[var(--color-charcoal)]"
                    : "bg-[var(--color-glass-bg-light)] text-[var(--color-sand)]/70 border border-[var(--color-glass-border)]"
                )}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Posts list */}
      <div className="px-4 mt-2">
        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="text-4xl mb-4 opacity-40">📋</div>
            <p className="text-sm font-medium text-[var(--color-sand)]/60">
              아직 게시된 글이 없습니다
            </p>
            <p className="text-xs text-[var(--color-sand)]/40 mt-1">
              상점 주인이 소식을 올리면 여기에 표시됩니다
            </p>
          </motion.div>
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              <div className="flex flex-col gap-3">
                {posts.map((post) => (
                  <BoardPostCard key={post.id} post={post} />
                ))}
              </div>
            </AnimatePresence>

            {/* Load more */}
            {page < totalPages && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className={cn(
                    "px-6 py-2.5 rounded-full text-xs font-medium transition-all duration-200",
                    "bg-[var(--color-glass-bg-light)] text-[var(--color-sand)]",
                    "border border-[var(--color-glass-border)]",
                    "active:scale-95",
                    loadingMore && "opacity-60"
                  )}
                >
                  {loadingMore ? (
                    <span className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 border-2 border-[var(--color-sand)]/30 border-t-[var(--color-sand)] rounded-full animate-spin" />
                      불러오는 중...
                    </span>
                  ) : (
                    "더 보기"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
