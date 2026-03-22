"use client";

import { useEffect, useState } from "react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: string;
}

export default function AnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const fetchData = async () => {
    const res = await fetch("/api/announcements");
    setItems(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });
    setTitle("");
    setContent("");
    setShowForm(false);
    fetchData();
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    await fetch(`/api/announcements/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    await fetch(`/api/announcements/${id}`, { method: "DELETE" });
    fetchData();
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.15)",
    color: "var(--color-cream)",
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--color-cream)" }}>
          공지사항 관리
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: "var(--color-gold)", color: "#1a1612" }}
        >
          {showForm ? "취소" : "새 공지"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-6 p-4 rounded-lg border space-y-3"
          style={{
            background: "rgba(255,255,255,0.03)",
            borderColor: "rgba(255,255,255,0.1)",
          }}
        >
          <input
            required
            placeholder="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded border text-sm"
            style={inputStyle}
          />
          <textarea
            required
            placeholder="내용"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 rounded border text-sm"
            style={inputStyle}
            rows={3}
          />
          <button
            type="submit"
            className="px-4 py-2 rounded text-sm font-medium"
            style={{ background: "var(--color-gold)", color: "#1a1612" }}
          >
            생성
          </button>
        </form>
      )}

      {loading ? (
        <p style={{ color: "var(--color-sand)" }}>로딩중...</p>
      ) : items.length === 0 ? (
        <p style={{ color: "var(--color-sand)" }}>등록된 공지사항이 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-lg border"
              style={{
                background: "rgba(255,255,255,0.03)",
                borderColor: "rgba(255,255,255,0.1)",
                opacity: item.isActive ? 1 : 0.5,
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="font-medium" style={{ color: "var(--color-cream)" }}>
                    {item.title}
                  </h3>
                  <p className="text-sm mt-1" style={{ color: "var(--color-sand)" }}>
                    {item.content}
                  </p>
                  <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.3)" }}>
                    {new Date(item.createdAt).toLocaleDateString("ko-KR")}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleActive(item.id, !item.isActive)}
                    className="relative w-10 h-5 rounded-full transition-colors"
                    style={{
                      background: item.isActive
                        ? "var(--color-gold)"
                        : "rgba(255,255,255,0.15)",
                    }}
                    title={item.isActive ? "비활성화" : "활성화"}
                  >
                    <span
                      className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                      style={{
                        left: item.isActive ? "calc(100% - 18px)" : "2px",
                      }}
                    />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-xs underline"
                    style={{ color: "var(--color-terracotta)" }}
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
