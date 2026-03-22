"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

interface DashboardShellProps {
  user: {
    email: string;
    name?: string;
    role: string;
    storeId?: string;
  };
  children: React.ReactNode;
}

const navItems = [
  { href: "/dashboard", label: "개요", icon: "📊" },
  { href: "/dashboard/store", label: "점포관리", icon: "🏪" },
  { href: "/dashboard/events", label: "이벤트", icon: "🎉" },
  { href: "/dashboard/board", label: "대자보", icon: "📋" },
  { href: "/dashboard/stories", label: "소식", icon: "📰" },
  { href: "/dashboard/coupons", label: "쿠폰", icon: "🎟️" },
  { href: "/dashboard/stats", label: "통계", icon: "📈" },
];

export function DashboardShell({ user, children }: DashboardShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <div
      className="min-h-dvh flex flex-col lg:flex-row"
      style={{ background: "var(--color-charcoal)" }}
    >
      {/* Mobile Header */}
      <header
        className="lg:hidden flex items-center justify-between px-4 py-3 border-b"
        style={{
          background: "rgba(26, 22, 18, 0.95)",
          borderColor: "var(--color-glass-border)",
        }}
      >
        <div>
          <span
            className="font-bold text-sm"
            style={{ color: "var(--color-gold)" }}
          >
            {user.name || "점주 대시보드"}
          </span>
        </div>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 rounded-md"
          style={{ color: "var(--color-cream)" }}
          aria-label="메뉴 열기"
        >
          {menuOpen ? (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.5)" }}
          />
          <nav
            className="relative w-64 h-full overflow-y-auto p-4 flex flex-col"
            style={{
              background: "var(--background)",
              borderRight: "1px solid var(--color-glass-border)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6">
              <p
                className="font-bold text-lg"
                style={{ color: "var(--color-gold)" }}
              >
                대시보드
              </p>
              <p
                className="text-xs mt-1 truncate"
                style={{ color: "var(--color-sand)" }}
              >
                {user.email}
              </p>
            </div>
            <ul className="flex-1 space-y-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
                    style={{
                      color: isActive(item.href)
                        ? "var(--color-gold)"
                        : "var(--color-cream)",
                      background: isActive(item.href)
                        ? "rgba(201, 168, 76, 0.1)"
                        : "transparent",
                    }}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="mt-4 w-full px-3 py-2.5 rounded-lg text-sm text-left transition-colors"
              style={{
                color: "var(--color-terracotta)",
                background: "rgba(196, 96, 60, 0.1)",
              }}
            >
              로그아웃
            </button>
          </nav>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex flex-col w-56 shrink-0 p-4 border-r"
        style={{
          background: "var(--background)",
          borderColor: "var(--color-glass-border)",
        }}
      >
        <div className="mb-8">
          <p
            className="font-bold text-lg"
            style={{ color: "var(--color-gold)" }}
          >
            대시보드
          </p>
          <p
            className="text-xs mt-1 truncate"
            style={{ color: "var(--color-sand)" }}
          >
            {user.email}
          </p>
        </div>
        <nav className="flex-1">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
                  style={{
                    color: isActive(item.href)
                      ? "var(--color-gold)"
                      : "var(--color-cream)",
                    background: isActive(item.href)
                      ? "rgba(201, 168, 76, 0.1)"
                      : "transparent",
                  }}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="mt-4 w-full px-3 py-2.5 rounded-lg text-sm text-left transition-colors"
          style={{
            color: "var(--color-terracotta)",
            background: "rgba(196, 96, 60, 0.1)",
          }}
        >
          로그아웃
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
    </div>
  );
}
