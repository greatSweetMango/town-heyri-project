"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface CouponItem {
  id: string;
  title: string;
  description: string | null;
  discount: string;
  validUntil: string;
  isActive: boolean;
  createdAt: string;
}

export default function CouponsManagementPage() {
  const { data: session } = useSession();
  const storeId = session?.user?.storeId;

  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    discount: "",
    validUntil: "",
  });

  useEffect(() => {
    fetchCoupons();
  }, [storeId]);

  async function fetchCoupons() {
    if (!storeId) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/coupons?storeId=${storeId}`);
      if (res.ok) {
        const data = await res.json();
        setCoupons(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!storeId) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId,
          title: form.title,
          description: form.description || null,
          discount: form.discount,
          validUntil: form.validUntil,
        }),
      });

      if (res.ok) {
        setForm({ title: "", description: "", discount: "", validUntil: "" });
        setShowForm(false);
        fetchCoupons();
      }
    } catch {
      // silently fail
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(coupon: CouponItem) {
    try {
      const res = await fetch(`/api/coupons/${coupon.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });
      if (res.ok) {
        setCoupons((prev) =>
          prev.map((c) =>
            c.id === coupon.id ? { ...c, isActive: !c.isActive } : c
          )
        );
      }
    } catch {
      // silently fail
    }
  }

  async function deleteCoupon(id: string) {
    if (!confirm("이 쿠폰을 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`/api/coupons/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCoupons((prev) => prev.filter((c) => c.id !== id));
      }
    } catch {
      // silently fail
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <p style={{ color: "var(--color-sand)" }}>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1
          className="text-xl sm:text-2xl font-bold"
          style={{ color: "var(--color-cream)" }}
        >
          쿠폰 관리
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-lg text-sm font-medium"
          style={{
            background: showForm ? "rgba(196,96,60,0.2)" : "var(--color-gold)",
            color: showForm ? "var(--color-terracotta)" : "var(--color-charcoal)",
          }}
        >
          {showForm ? "취소" : "새 쿠폰"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 p-4 rounded-xl border space-y-4"
          style={{
            background: "rgba(255,255,255,0.03)",
            borderColor: "var(--color-glass-border)",
          }}
        >
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--color-sand)" }}>
              쿠폰명 <span style={{ color: "var(--color-terracotta)" }}>*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
              placeholder="예: 아메리카노 10% 할인"
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--color-glass-border)",
                color: "var(--color-cream)",
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--color-sand)" }}>
              설명
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-y"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--color-glass-border)",
                color: "var(--color-cream)",
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--color-sand)" }}>
              할인 내용 <span style={{ color: "var(--color-terracotta)" }}>*</span>
            </label>
            <input
              type="text"
              value={form.discount}
              onChange={(e) => setForm((f) => ({ ...f, discount: e.target.value }))}
              required
              placeholder="예: 10%, 1000원 할인"
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--color-glass-border)",
                color: "var(--color-cream)",
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--color-sand)" }}>
              유효기간 <span style={{ color: "var(--color-terracotta)" }}>*</span>
            </label>
            <input
              type="date"
              value={form.validUntil}
              onChange={(e) => setForm((f) => ({ ...f, validUntil: e.target.value }))}
              required
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--color-glass-border)",
                color: "var(--color-cream)",
                colorScheme: "dark",
              }}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-lg font-medium text-sm"
            style={{
              background: "var(--color-gold)",
              color: "var(--color-charcoal)",
              opacity: submitting ? 0.6 : 1,
            }}
          >
            {submitting ? "생성 중..." : "쿠폰 생성"}
          </button>
        </form>
      )}

      {/* Coupons List */}
      {coupons.length === 0 ? (
        <p className="text-center py-12 text-sm" style={{ color: "var(--color-sand)" }}>
          등록된 쿠폰이 없습니다.
        </p>
      ) : (
        <div className="space-y-3">
          {coupons.map((coupon) => {
            const isExpired = new Date(coupon.validUntil) < new Date();
            return (
              <div
                key={coupon.id}
                className="p-4 rounded-xl border"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderColor: "var(--color-glass-border)",
                  opacity: coupon.isActive && !isExpired ? 1 : 0.6,
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3
                      className="font-medium text-sm"
                      style={{ color: "var(--color-cream)" }}
                    >
                      {coupon.title}
                    </h3>
                    <p
                      className="text-lg font-bold mt-1"
                      style={{ color: "var(--color-gold)" }}
                    >
                      {coupon.discount}
                    </p>
                    {coupon.description && (
                      <p className="text-xs mt-1" style={{ color: "var(--color-sand)" }}>
                        {coupon.description}
                      </p>
                    )}
                    <p className="text-xs mt-2" style={{ color: "var(--color-sand)" }}>
                      ~{new Date(coupon.validUntil).toLocaleDateString("ko-KR")}까지
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => toggleActive(coupon)}
                      className="text-xs px-3 py-1.5 rounded-lg"
                      style={{
                        background: coupon.isActive
                          ? "rgba(45,74,62,0.3)"
                          : "rgba(196,96,60,0.2)",
                        color: coupon.isActive
                          ? "var(--color-cream)"
                          : "var(--color-terracotta)",
                      }}
                    >
                      {coupon.isActive ? "활성" : "비활성"}
                    </button>
                    <button
                      onClick={() => deleteCoupon(coupon.id)}
                      className="text-xs px-3 py-1.5 rounded-lg"
                      style={{
                        background: "rgba(196,96,60,0.1)",
                        color: "var(--color-terracotta)",
                      }}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
