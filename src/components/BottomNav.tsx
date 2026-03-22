"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const tabs = [
  {
    href: "/",
    label: "지도",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "var(--color-gold)" : "var(--color-sand)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" />
        <path d="M8 2v16" />
        <path d="M16 6v16" />
      </svg>
    ),
  },
  {
    href: "/board",
    label: "대자보",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "var(--color-gold)" : "var(--color-sand)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M16 13H8" />
        <path d="M16 17H8" />
        <path d="M10 9H8" />
      </svg>
    ),
  },
  {
    href: "/stories",
    label: "소식",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "var(--color-gold)" : "var(--color-sand)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3" />
        <path d="M12 19v3" />
        <path d="M2 12h3" />
        <path d="M19 12h3" />
      </svg>
    ),
  },
  {
    href: "/login",
    label: "로그인",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "var(--color-gold)" : "var(--color-sand)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t md:hidden"
      style={{
        background: "rgba(26, 22, 18, 0.95)",
        borderColor: "var(--color-glass-border)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {tabs.map((tab) => {
          const isActive = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center gap-0.5 py-2 px-3 min-w-[60px] transition-colors"
            >
              {tab.icon(isActive)}
              <span
                className="text-[10px] font-medium"
                style={{ color: isActive ? "var(--color-gold)" : "var(--color-sand)" }}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
