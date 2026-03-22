"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface BoardPostItem {
  id: string;
  title: string;
  content: string;
  category: string | null;
  createdAt: string;
}

export default function BoardManagementPage() {
  const { data: session } = useSession();
  const storeId = session?.user?.storeId;

  const [posts, setPosts] = useState<BoardPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "general",
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      const res = await fetch("/api/board?limit=50");
      if (res.ok) {
        const data = await res.json();
        // Filter own posts
        const myPosts = data.posts.filter(
          (p: { author: { id: string } }) => p.author.id === session?.user?.id
        );
        setPosts(myPosts);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          content: form.content,
          category: form.category,
          storeId: storeId || null,
        }),
      });

      if (res.ok) {
        setForm({ title: "", content: "", category: "general" });
        setShowForm(false);
        fetchPosts();
      }
    } catch {
      // silently fail
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <p style={{ color: "var(--color-sand)" }}>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1
          className="text-xl sm:text-2xl font-bold"
          style={{ color: "var(--color-cream)" }}
        >
          대자보 관리
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-lg text-sm font-medium"
          style={{
            background: showForm ? "rgba(196,96,60,0.2)" : "var(--color-gold)",
            color: showForm ? "var(--color-terracotta)" : "var(--color-charcoal)",
          }}
        >
          {showForm ? "취소" : "새 게시물"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 p-4 rounded-xl border space-y-4"
          style={{
            background: "rgba(255,255,255,0.03)",
            borderColor: "var(--color-glass-border)",
          }}
        >
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--color-sand)" }}>
              제목 <span style={{ color: "var(--color-terracotta)" }}>*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--color-glass-border)",
                color: "var(--color-cream)",
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--color-sand)" }}>
              내용 <span style={{ color: "var(--color-terracotta)" }}>*</span>
            </label>
            <textarea
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              required
              rows={6}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-y"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--color-glass-border)",
                color: "var(--color-cream)",
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--color-sand)" }}>
              카테고리
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--color-glass-border)",
                color: "var(--color-cream)",
              }}
            >
              <option value="general">일반</option>
              <option value="notice">공지</option>
              <option value="event">이벤트</option>
              <option value="review">후기</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-lg font-medium text-sm"
            style={{
              background: "var(--color-gold)",
              color: "var(--color-charcoal)",
              opacity: submitting ? 0.6 : 1,
            }}
          >
            {submitting ? "등록 중..." : "게시물 등록"}
          </button>
        </form>
      )}

      {/* Posts List */}
      {posts.length === 0 ? (
        <p className="text-center py-12 text-sm" style={{ color: "var(--color-sand)" }}>
          작성한 게시물이 없습니다.
        </p>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="p-4 rounded-xl border"
              style={{
                background: "rgba(255,255,255,0.03)",
                borderColor: "var(--color-glass-border)",
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3
                    className="font-medium text-sm truncate"
                    style={{ color: "var(--color-cream)" }}
                  >
                    {post.title}
                  </h3>
                  <p
                    className="text-xs mt-1 line-clamp-2"
                    style={{ color: "var(--color-sand)" }}
                  >
                    {post.content}
                  </p>
                  <p className="text-xs mt-2" style={{ color: "var(--color-sand)" }}>
                    {new Date(post.createdAt).toLocaleDateString("ko-KR")}
                  </p>
                </div>
                {post.category && (
                  <span
                    className="shrink-0 text-xs px-2 py-1 rounded-full"
                    style={{
                      background: "rgba(201,168,76,0.15)",
                      color: "var(--color-gold)",
                    }}
                  >
                    {post.category}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
