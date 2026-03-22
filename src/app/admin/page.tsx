import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [totalStores, totalUsers, activeEvents, todayViews] = await Promise.all([
    prisma.store.count(),
    prisma.user.count(),
    prisma.event.count({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
    }),
    prisma.pageView.count({
      where: { createdAt: { gte: todayStart } },
    }),
  ]);

  const cards = [
    { label: "총 점포 수", value: totalStores },
    { label: "총 계정 수", value: totalUsers },
    { label: "활성 이벤트 수", value: activeEvents },
    { label: "오늘 조회수", value: todayViews },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--color-cream)" }}>
        관리자 대시보드
      </h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg p-4 border"
            style={{
              background: "rgba(255,255,255,0.03)",
              borderColor: "rgba(255,255,255,0.1)",
            }}
          >
            <p className="text-xs mb-1" style={{ color: "var(--color-sand)" }}>
              {card.label}
            </p>
            <p className="text-2xl font-bold" style={{ color: "var(--color-gold)" }}>
              {card.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { title: "점포 관리", desc: "점포 추가, 수정, 삭제", href: "/admin/stores" },
          { title: "계정 관리", desc: "점주 계정 생성 및 관리", href: "/admin/accounts" },
          { title: "Feature Flags", desc: "기능 플래그 토글", href: "/admin/flags" },
          { title: "공지사항", desc: "공지사항 관리", href: "/admin/announcements" },
          { title: "시설물 핀", desc: "편의시설 핀 관리", href: "/admin/pins" },
          { title: "산책로", desc: "산책로 관리", href: "/admin/trails" },
          { title: "통계", desc: "방문자 및 조회 통계", href: "/admin/stats" },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="block p-4 rounded-lg border transition-colors hover:border-[var(--color-gold)]"
            style={{
              background: "rgba(255,255,255,0.03)",
              borderColor: "rgba(255,255,255,0.1)",
            }}
          >
            <h2 className="font-medium mb-1" style={{ color: "var(--color-cream)" }}>
              {item.title}
            </h2>
            <p className="text-sm" style={{ color: "var(--color-sand)" }}>
              {item.desc}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
