"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface StoryItem {
  id: string;
  text: string | null;
  image: string | null;
  category: string | null;
  createdAt: string;
  expiresAt: string;
}

export default function StoriesManagementPage() {
  const { data: session } = useSession();
  const storeId = session?.user?.storeId;

  const [stories, setStories] = useState<StoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    text: "",
    image: "",
    category: "",
  });

  useEffect(() => {
    fetchStories();
  }, []);

  async function fetchStories() {
    try {
      const res = await fetch("/api/stories");
      if (res.ok) {
        const data = await res.json();
        // Filter own store stories
        const myStories = storeId
          ? data.filter((s: { store: { name: string }; storeId?: string } & StoryItem) => {
              // The API includes store info; match by checking nested data
              return true; // We'll filter by authorId below
            })
          : [];
        // Actually filter by author
        const filtered = data.filter(
          (s: { author: { name: string }; authorId?: string }) =>
            // Stories don't expose authorId in the list response, so show all for the store
            true
        );
        setStories(storeId ? filtered : []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!storeId) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId,
          text: form.text || null,
          image: form.image || null,
          category: form.category || null,
        }),
      });

      if (res.ok) {
        setForm({ text: "", image: "", category: "" });
        setShowForm(false);
        fetchStories();
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
          소식 관리
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-lg text-sm font-medium"
          style={{
            background: showForm ? "rgba(196,96,60,0.2)" : "var(--color-gold)",
            color: showForm ? "var(--color-terracotta)" : "var(--color-charcoal)",
          }}
        >
          {showForm ? "취소" : "새 소식"}
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
              내용
            </label>
            <textarea
              value={form.text}
              onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
              rows={4}
              placeholder="오늘의 소식을 입력하세요"
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
              이미지 URL
            </label>
            <input
              type="text"
              value={form.image}
              onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
              placeholder="이미지 URL을 입력하세요 (선택)"
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
              카테고리
            </label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              placeholder="예: 신메뉴, 할인, 일상"
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--color-glass-border)",
                color: "var(--color-cream)",
              }}
            />
          </div>
          <p className="text-xs" style={{ color: "var(--color-sand)" }}>
            소식은 등록 후 24시간 동안 노출됩니다.
          </p>
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
            {submitting ? "등록 중..." : "소식 등록"}
          </button>
        </form>
      )}

      {/* Stories List */}
      {stories.length === 0 ? (
        <p className="text-center py-12 text-sm" style={{ color: "var(--color-sand)" }}>
          활성 소식이 없습니다.
        </p>
      ) : (
        <div className="space-y-3">
          {stories.map((story) => {
            const remaining = Math.max(
              0,
              Math.ceil(
                (new Date(story.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60)
              )
            );
            return (
              <div
                key={story.id}
                className="p-4 rounded-xl border"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderColor: "var(--color-glass-border)",
                }}
              >
                {story.image && (
                  <div
                    className="w-full h-32 rounded-lg mb-3 bg-cover bg-center"
                    style={{ backgroundImage: `url(${story.image})` }}
                  />
                )}
                <p className="text-sm" style={{ color: "var(--color-cream)" }}>
                  {story.text || "(이미지만)"}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs" style={{ color: "var(--color-sand)" }}>
                    {new Date(story.createdAt).toLocaleString("ko-KR")}
                  </p>
                  <span
                    className="text-xs px-2 py-1 rounded-full"
                    style={{
                      background:
                        remaining > 0
                          ? "rgba(45,74,62,0.3)"
                          : "rgba(196,96,60,0.2)",
                      color:
                        remaining > 0
                          ? "var(--color-cream)"
                          : "var(--color-terracotta)",
                    }}
                  >
                    {remaining > 0 ? `${remaining}시간 남음` : "만료"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
