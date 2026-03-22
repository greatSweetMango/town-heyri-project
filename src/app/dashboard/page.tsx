"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface StoreData {
  id: string;
  name: string;
  isOpen: boolean;
  events: { id: string }[];
  coupons: { id: string }[];
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [store, setStore] = useState<StoreData | null>(null);
  const [todayViews, setTodayViews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const storeId = session?.user?.storeId;

  useEffect(() => {
    if (!storeId) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        const [storeRes, statsRes] = await Promise.all([
          fetch(`/api/stores/${storeId}`),
          fetch(`/api/stats/store/${storeId}`),
        ]);

        if (storeRes.ok) {
          const storeData = await storeRes.json();
          setStore(storeData);
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setTodayViews(statsData.todayViews ?? 0);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [storeId]);

  async function toggleOpen() {
    if (!store || !storeId) return;
    setToggling(true);
    try {
      const res = await fetch(`/api/stores/${storeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOpen: !store.isOpen }),
      });
      if (res.ok) {
        setStore((prev) => (prev ? { ...prev, isOpen: !prev.isOpen } : prev));
      }
    } catch {
      // silently fail
    } finally {
      setToggling(false);
    }
  }

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
        <h1
          className="text-2xl font-bold mb-2"
          style={{ color: "var(--color-cream)" }}
        >
          점주 대시보드
        </h1>
        <p style={{ color: "var(--color-sand)" }}>
          연결된 점포가 없습니다. 관리자에게 문의하세요.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <h1
        className="text-xl sm:text-2xl font-bold mb-1"
        style={{ color: "var(--color-cream)" }}
      >
        {store?.name || "내 점포"} 대시보드
      </h1>
      <p className="text-sm mb-6" style={{ color: "var(--color-sand)" }}>
        {session?.user?.email}
      </p>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {/* isOpen toggle */}
        <div
          className="rounded-xl p-4 border"
          style={{
            background: "rgba(255,255,255,0.03)",
            borderColor: "var(--color-glass-border)",
          }}
        >
          <p
            className="text-xs mb-2 uppercase tracking-wide"
            style={{ color: "var(--color-sand)" }}
          >
            영업상태
          </p>
          <button
            onClick={toggleOpen}
            disabled={toggling}
            className="w-full py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: store?.isOpen
                ? "rgba(45, 74, 62, 0.6)"
                : "rgba(196, 96, 60, 0.3)",
              color: store?.isOpen
                ? "var(--color-cream)"
                : "var(--color-terracotta)",
              border: `1px solid ${store?.isOpen ? "var(--color-forest-green)" : "var(--color-terracotta)"}`,
            }}
          >
            {toggling ? "..." : store?.isOpen ? "영업중" : "영업종료"}
          </button>
        </div>

        {/* Today Views */}
        <div
          className="rounded-xl p-4 border"
          style={{
            background: "rgba(255,255,255,0.03)",
            borderColor: "var(--color-glass-border)",
          }}
        >
          <p
            className="text-xs mb-2 uppercase tracking-wide"
            style={{ color: "var(--color-sand)" }}
          >
            오늘 조회수
          </p>
          <p
            className="text-2xl font-bold"
            style={{ color: "var(--color-gold)" }}
          >
            {todayViews}
          </p>
        </div>

        {/* Active Events */}
        <div
          className="rounded-xl p-4 border"
          style={{
            background: "rgba(255,255,255,0.03)",
            borderColor: "var(--color-glass-border)",
          }}
        >
          <p
            className="text-xs mb-2 uppercase tracking-wide"
            style={{ color: "var(--color-sand)" }}
          >
            활성 이벤트
          </p>
          <p
            className="text-2xl font-bold"
            style={{ color: "var(--color-gold)" }}
          >
            {store?.events?.length ?? 0}
          </p>
        </div>

        {/* Active Coupons */}
        <div
          className="rounded-xl p-4 border"
          style={{
            background: "rgba(255,255,255,0.03)",
            borderColor: "var(--color-glass-border)",
          }}
        >
          <p
            className="text-xs mb-2 uppercase tracking-wide"
            style={{ color: "var(--color-sand)" }}
          >
            활성 쿠폰
          </p>
          <p
            className="text-2xl font-bold"
            style={{ color: "var(--color-gold)" }}
          >
            {store?.coupons?.length ?? 0}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <h2
        className="text-lg font-semibold mb-3"
        style={{ color: "var(--color-cream)" }}
      >
        빠른 실행
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          {
            title: "점포 정보 수정",
            desc: "점포 정보 수정, 영업 상태 변경",
            href: "/dashboard/store",
          },
          {
            title: "이벤트 등록",
            desc: "새 이벤트 등록 및 관리",
            href: "/dashboard/events",
          },
          {
            title: "대자보 작성",
            desc: "대자보 게시물 작성",
            href: "/dashboard/board",
          },
          {
            title: "소식 올리기",
            desc: "오늘의 소식(스토리) 올리기",
            href: "/dashboard/stories",
          },
          {
            title: "쿠폰 관리",
            desc: "쿠폰 생성 및 관리",
            href: "/dashboard/coupons",
          },
          {
            title: "통계 보기",
            desc: "내 점포 조회 통계",
            href: "/dashboard/stats",
          },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block p-4 rounded-lg border transition-colors hover:border-[var(--color-gold)]"
            style={{
              background: "rgba(255,255,255,0.03)",
              borderColor: "rgba(255,255,255,0.1)",
            }}
          >
            <h3
              className="font-medium mb-1 text-sm"
              style={{ color: "var(--color-cream)" }}
            >
              {item.title}
            </h3>
            <p className="text-xs" style={{ color: "var(--color-sand)" }}>
              {item.desc}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
