"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { label: "개요", href: "/admin" },
  { label: "점포관리", href: "/admin/stores" },
  { label: "계정관리", href: "/admin/accounts" },
  { label: "Feature Flags", href: "/admin/flags" },
  { label: "공지사항", href: "/admin/announcements" },
  { label: "시설물 핀", href: "/admin/pins" },
  { label: "산책로", href: "/admin/trails" },
  { label: "통계", href: "/admin/stats" },
];

export function AdminShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <div
      className="min-h-dvh flex flex-col lg:flex-row"
      style={{ background: "var(--color-charcoal)" }}
    >
      {/* Mobile header */}
      <header
        className="lg:hidden flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "rgba(255,255,255,0.1)" }}
      >
        <span className="font-bold" style={{ color: "var(--color-gold)" }}>
          헤이리 관리자
        </span>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 rounded"
          style={{ color: "var(--color-cream)" }}
          aria-label="메뉴 열기"
        >
          {menuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </header>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Sidebar / mobile drawer */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200
          lg:relative lg:translate-x-0 lg:flex lg:flex-col lg:shrink-0
          ${menuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{
          background: "#1a1612",
          borderRight: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div className="p-4 border-b" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <h2 className="text-lg font-bold" style={{ color: "var(--color-gold)" }}>
            헤이리 관리자
          </h2>
          <p className="text-xs mt-1 truncate" style={{ color: "var(--color-sand)" }}>
            {email}
          </p>
        </div>

        <nav className="flex-1 py-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2.5 text-sm transition-colors"
              style={{
                color: isActive(item.href) ? "var(--color-gold)" : "var(--color-cream)",
                background: isActive(item.href) ? "rgba(201,168,76,0.1)" : "transparent",
                borderRight: isActive(item.href) ? "3px solid var(--color-gold)" : "3px solid transparent",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="w-full text-left text-sm px-3 py-2 rounded transition-colors hover:bg-white/5"
              style={{ color: "var(--color-sand)" }}
            >
              로그아웃
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 p-4 lg:p-6">{children}</main>
    </div>
  );
}
