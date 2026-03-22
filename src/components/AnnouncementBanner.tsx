"use client";

import { useEffect, useState } from "react";

interface Announcement {
  id: string;
  title: string;
  content: string;
}

export default function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch("/api/announcements")
      .then((r) => r.json())
      .then((data: Announcement[]) => {
        if (data.length > 0) {
          const dismissedIds = JSON.parse(
            sessionStorage.getItem("dismissed_announcements") || "[]"
          );
          const active = data.find((a) => !dismissedIds.includes(a.id));
          if (active) setAnnouncement(active);
        }
      })
      .catch(() => {});
  }, []);

  if (!announcement || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    const dismissedIds = JSON.parse(
      sessionStorage.getItem("dismissed_announcements") || "[]"
    );
    dismissedIds.push(announcement.id);
    sessionStorage.setItem(
      "dismissed_announcements",
      JSON.stringify(dismissedIds)
    );
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between gap-3"
      style={{
        background: "linear-gradient(135deg, var(--color-gold), #b8963e)",
        color: "var(--color-charcoal)",
      }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{announcement.title}</p>
        <p className="text-xs opacity-80 truncate">{announcement.content}</p>
      </div>
      <button
        onClick={handleDismiss}
        className="shrink-0 p-1 rounded-full hover:bg-black/10 transition-colors"
        aria-label="닫기"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M4 4l8 8M12 4L4 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}
