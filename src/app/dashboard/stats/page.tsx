"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface DayViewCount {
  date: string;
  count: number;
}

export default function StatsPage() {
  const { data: session } = useSession();
  const storeId = session?.user?.storeId;

  const [dailyViews, setDailyViews] = useState<DayViewCount[]>([]);
  const [todayViews, setTodayViews] = useState(0);
  const [weekViews, setWeekViews] = useState(0);
  const [monthViews, setMonthViews] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!storeId) {
      setLoading(false);
      return;
    }

    fetch(`/api/stats/store/${storeId}`)
      .then((r) => r.json())
      .then((data) => {
        setTodayViews(data.todayViews ?? 0);
        setWeekViews(data.weekViews ?? 0);
        setMonthViews(data.monthViews ?? 0);
        setDailyViews(data.dailyViews ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [storeId]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <p style={{ color: "var(--color-sand)" }}>로딩 중...</p>
      </div>
    );
  }

  if (!storeId) {
    return (
      <div className="p-6">
        <p style={{ color: "var(--color-sand)" }}>연결된 점포가 없습니다.</p>
      </div>
    );
  }

  const maxViews = Math.max(...dailyViews.map((d) => d.count), 1);

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <h1
        className="text-xl sm:text-2xl font-bold mb-6"
        style={{ color: "var(--color-cream)" }}
      >
        조회 통계
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div
          className="rounded-xl p-4 border text-center"
          style={{
            background: "rgba(255,255,255,0.03)",
            borderColor: "var(--color-glass-border)",
          }}
        >
          <p className="text-xs mb-1" style={{ color: "var(--color-sand)" }}>
            오늘
          </p>
          <p
            className="text-2xl font-bold"
            style={{ color: "var(--color-gold)" }}
          >
            {todayViews}
          </p>
        </div>
        <div
          className="rounded-xl p-4 border text-center"
          style={{
            background: "rgba(255,255,255,0.03)",
            borderColor: "var(--color-glass-border)",
          }}
        >
          <p className="text-xs mb-1" style={{ color: "var(--color-sand)" }}>
            이번 주
          </p>
          <p
            className="text-2xl font-bold"
            style={{ color: "var(--color-gold)" }}
          >
            {weekViews}
          </p>
        </div>
        <div
          className="rounded-xl p-4 border text-center"
          style={{
            background: "rgba(255,255,255,0.03)",
            borderColor: "var(--color-glass-border)",
          }}
        >
          <p className="text-xs mb-1" style={{ color: "var(--color-sand)" }}>
            이번 달
          </p>
          <p
            className="text-2xl font-bold"
            style={{ color: "var(--color-gold)" }}
          >
            {monthViews}
          </p>
        </div>
      </div>

      {/* Bar Chart */}
      <div
        className="rounded-xl p-4 border"
        style={{
          background: "rgba(255,255,255,0.03)",
          borderColor: "var(--color-glass-border)",
        }}
      >
        <h2
          className="text-sm font-medium mb-4"
          style={{ color: "var(--color-cream)" }}
        >
          최근 30일 조회수
        </h2>

        {dailyViews.length === 0 ? (
          <p className="text-center py-8 text-sm" style={{ color: "var(--color-sand)" }}>
            데이터가 없습니다.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <div
              className="flex items-end gap-1 min-w-[600px]"
              style={{ height: "200px" }}
            >
              {dailyViews.map((day) => {
                const height = Math.max((day.count / maxViews) * 100, 2);
                const date = new Date(day.date);
                const dayLabel = `${date.getMonth() + 1}/${date.getDate()}`;
                return (
                  <div
                    key={day.date}
                    className="flex-1 flex flex-col items-center justify-end h-full"
                  >
                    <span
                      className="text-[10px] mb-1"
                      style={{ color: "var(--color-sand)" }}
                    >
                      {day.count > 0 ? day.count : ""}
                    </span>
                    <div
                      className="w-full rounded-t transition-all"
                      style={{
                        height: `${height}%`,
                        background:
                          day.count > 0
                            ? "var(--color-gold)"
                            : "rgba(255,255,255,0.05)",
                        minHeight: "2px",
                      }}
                    />
                    <span
                      className="text-[9px] mt-1 rotate-[-45deg] origin-top-left whitespace-nowrap"
                      style={{ color: "var(--color-sand)" }}
                    >
                      {dayLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
