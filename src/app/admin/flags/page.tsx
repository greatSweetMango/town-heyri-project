"use client";

import { useEffect, useState } from "react";

interface Flag {
  id: string;
  name: string;
  description: string | null;
  enabled: boolean;
}

export default function FlagsPage() {
  const [flags, setFlags] = useState<Flag[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFlags = async () => {
    const res = await fetch("/api/feature-flags?detail=true");
    const data = await res.json();
    // The API returns { name: enabled } map, but we need detail
    // We'll handle both formats
    if (Array.isArray(data)) {
      setFlags(data);
    } else {
      // Convert map format to array
      const arr = Object.entries(data).map(([name, enabled]) => ({
        id: name,
        name,
        description: null,
        enabled: enabled as boolean,
      }));
      setFlags(arr);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  const toggleFlag = async (name: string, enabled: boolean) => {
    // Optimistic update
    setFlags((prev) =>
      prev.map((f) => (f.name === name ? { ...f, enabled } : f))
    );
    await fetch("/api/feature-flags", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, enabled }),
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--color-cream)" }}>
        Feature Flags
      </h1>

      {loading ? (
        <p style={{ color: "var(--color-sand)" }}>로딩중...</p>
      ) : flags.length === 0 ? (
        <p style={{ color: "var(--color-sand)" }}>등록된 플래그가 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {flags.map((flag) => (
            <div
              key={flag.name}
              className="flex items-center justify-between p-4 rounded-lg border"
              style={{
                background: "rgba(255,255,255,0.03)",
                borderColor: "rgba(255,255,255,0.1)",
              }}
            >
              <div>
                <p className="font-medium" style={{ color: "var(--color-cream)" }}>
                  {flag.name}
                </p>
                {flag.description && (
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-sand)" }}>
                    {flag.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => toggleFlag(flag.name, !flag.enabled)}
                className="relative w-12 h-6 rounded-full transition-colors shrink-0 ml-4"
                style={{
                  background: flag.enabled
                    ? "var(--color-gold)"
                    : "rgba(255,255,255,0.15)",
                }}
              >
                <span
                  className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform"
                  style={{
                    left: flag.enabled ? "calc(100% - 22px)" : "2px",
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
