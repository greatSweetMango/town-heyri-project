"use client";

import { useEffect, useState } from "react";

interface Trail {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export default function TrailsPage() {
  const [trails, setTrails] = useState<Trail[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrails = async () => {
    const res = await fetch("/api/trails?all=true");
    setTrails(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchTrails();
  }, []);

  const toggleActive = async (id: string, isActive: boolean) => {
    setTrails((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isActive } : t))
    );
    await fetch(`/api/trails/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--color-cream)" }}>
        산책로 관리
      </h1>

      {loading ? (
        <p style={{ color: "var(--color-sand)" }}>로딩중...</p>
      ) : trails.length === 0 ? (
        <p style={{ color: "var(--color-sand)" }}>등록된 산책로가 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {trails.map((trail) => (
            <div
              key={trail.id}
              className="flex items-center justify-between p-4 rounded-lg border"
              style={{
                background: "rgba(255,255,255,0.03)",
                borderColor: "rgba(255,255,255,0.1)",
                opacity: trail.isActive ? 1 : 0.5,
              }}
            >
              <div>
                <p className="font-medium" style={{ color: "var(--color-cream)" }}>
                  {trail.name}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-sand)" }}>
                  생성: {new Date(trail.createdAt).toLocaleDateString("ko-KR")}
                </p>
              </div>
              <button
                onClick={() => toggleActive(trail.id, !trail.isActive)}
                className="relative w-12 h-6 rounded-full transition-colors shrink-0 ml-4"
                style={{
                  background: trail.isActive
                    ? "var(--color-gold)"
                    : "rgba(255,255,255,0.15)",
                }}
              >
                <span
                  className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform"
                  style={{
                    left: trail.isActive ? "calc(100% - 22px)" : "2px",
                  }}
                />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
