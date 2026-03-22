"use client";

import { useEffect, useState } from "react";

interface Stats {
  totalStores: number;
  totalUsers: number;
  totalEvents: number;
  todayViews: number;
  weekViews: number;
  monthViews: number;
  topStores: { storeId: string; storeName: string; views: number }[];
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <p style={{ color: "var(--color-sand)" }}>로딩중...</p>
      </div>
    );
  }

  if (!stats) return null;

  const viewCards = [
    { label: "오늘 조회수", value: stats.todayViews },
    { label: "이번 주 조회수", value: stats.weekViews },
    { label: "이번 달 조회수", value: stats.monthViews },
  ];

  const summaryCards = [
    { label: "총 점포", value: stats.totalStores },
    { label: "총 계정", value: stats.totalUsers },
    { label: "활성 이벤트", value: stats.totalEvents },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--color-cream)" }}>
        통계
      </h1>

      <h2 className="text-sm font-medium mb-3" style={{ color: "var(--color-sand)" }}>
        페이지 조회수
      </h2>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {viewCards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg p-4 border"
            style={{
              background: "rgba(255,255,255,0.03)",
              borderColor: "rgba(255,255,255,0.1)",
            }}
          >
            <p className="text-xs" style={{ color: "var(--color-sand)" }}>
              {card.label}
            </p>
            <p className="text-xl font-bold mt-1" style={{ color: "var(--color-gold)" }}>
              {card.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <h2 className="text-sm font-medium mb-3" style={{ color: "var(--color-sand)" }}>
        요약
      </h2>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg p-4 border"
            style={{
              background: "rgba(255,255,255,0.03)",
              borderColor: "rgba(255,255,255,0.1)",
            }}
          >
            <p className="text-xs" style={{ color: "var(--color-sand)" }}>
              {card.label}
            </p>
            <p className="text-xl font-bold mt-1" style={{ color: "var(--color-cream)" }}>
              {card.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <h2 className="text-sm font-medium mb-3" style={{ color: "var(--color-sand)" }}>
        인기 점포 Top 10 (최근 30일)
      </h2>
      {stats.topStores.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--color-sand)" }}>
          데이터가 없습니다.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ color: "var(--color-cream)" }}>
            <thead>
              <tr
                className="text-left border-b"
                style={{ borderColor: "rgba(255,255,255,0.1)", color: "var(--color-sand)" }}
              >
                <th className="pb-2 pr-4 whitespace-nowrap">순위</th>
                <th className="pb-2 pr-4 whitespace-nowrap">점포명</th>
                <th className="pb-2 whitespace-nowrap text-right">조회수</th>
              </tr>
            </thead>
            <tbody>
              {stats.topStores.map((store, idx) => (
                <tr
                  key={store.storeId}
                  className="border-b"
                  style={{ borderColor: "rgba(255,255,255,0.05)" }}
                >
                  <td className="py-2 pr-4" style={{ color: "var(--color-gold)" }}>
                    {idx + 1}
                  </td>
                  <td className="py-2 pr-4">{store.storeName}</td>
                  <td className="py-2 text-right">{store.views.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
