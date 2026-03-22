"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface EventItem {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export default function EventsManagementPage() {
  const { data: session } = useSession();
  const storeId = session?.user?.storeId;

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    if (!storeId) {
      setLoading(false);
      return;
    }
    fetchEvents();
  }, [storeId]);

  async function fetchEvents() {
    try {
      const res = await fetch(`/api/events?storeId=${storeId}&active=false`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
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
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId,
          title: form.title,
          description: form.description || null,
          category: form.category || null,
          startDate: form.startDate,
          endDate: form.endDate,
        }),
      });

      if (res.ok) {
        setForm({ title: "", description: "", category: "", startDate: "", endDate: "" });
        setShowForm(false);
        fetchEvents();
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
          이벤트 관리
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-lg text-sm font-medium"
          style={{
            background: showForm ? "rgba(196,96,60,0.2)" : "var(--color-gold)",
            color: showForm ? "var(--color-terracotta)" : "var(--color-charcoal)",
          }}
        >
          {showForm ? "취소" : "새 이벤트"}
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
              설명
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
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
            <input
              type="text"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              placeholder="예: 전시, 워크숍, 공연"
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--color-glass-border)",
                color: "var(--color-cream)",
              }}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--color-sand)" }}>
                시작일 <span style={{ color: "var(--color-terracotta)" }}>*</span>
              </label>
              <input
                type="datetime-local"
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                required
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid var(--color-glass-border)",
                  color: "var(--color-cream)",
                  colorScheme: "dark",
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--color-sand)" }}>
                종료일 <span style={{ color: "var(--color-terracotta)" }}>*</span>
              </label>
              <input
                type="datetime-local"
                value={form.endDate}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                required
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid var(--color-glass-border)",
                  color: "var(--color-cream)",
                  colorScheme: "dark",
                }}
              />
            </div>
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
            {submitting ? "등록 중..." : "이벤트 등록"}
          </button>
        </form>
      )}

      {/* Events List */}
      {events.length === 0 ? (
        <p className="text-center py-12 text-sm" style={{ color: "var(--color-sand)" }}>
          등록된 이벤트가 없습니다.
        </p>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const now = new Date();
            const isActive = event.isActive && new Date(event.endDate) >= now;
            return (
              <div
                key={event.id}
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
                      {event.title}
                    </h3>
                    {event.description && (
                      <p
                        className="text-xs mt-1 line-clamp-2"
                        style={{ color: "var(--color-sand)" }}
                      >
                        {event.description}
                      </p>
                    )}
                    <p className="text-xs mt-2" style={{ color: "var(--color-sand)" }}>
                      {new Date(event.startDate).toLocaleDateString("ko-KR")} ~{" "}
                      {new Date(event.endDate).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                  <span
                    className="shrink-0 text-xs px-2 py-1 rounded-full"
                    style={{
                      background: isActive
                        ? "rgba(45,74,62,0.3)"
                        : "rgba(196,96,60,0.2)",
                      color: isActive
                        ? "var(--color-cream)"
                        : "var(--color-terracotta)",
                    }}
                  >
                    {isActive ? "진행중" : "종료"}
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
