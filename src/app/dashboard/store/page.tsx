"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface StoreForm {
  name: string;
  description: string;
  story: string;
  tags: string;
  openHours: string;
  phone: string;
  isOpen: boolean;
}

export default function StoreManagementPage() {
  const { data: session } = useSession();
  const storeId = session?.user?.storeId;

  const [form, setForm] = useState<StoreForm>({
    name: "",
    description: "",
    story: "",
    tags: "",
    openHours: "",
    phone: "",
    isOpen: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!storeId) {
      setLoading(false);
      return;
    }

    fetch(`/api/stores/${storeId}`)
      .then((r) => r.json())
      .then((data) => {
        setForm({
          name: data.name || "",
          description: data.description || "",
          story: data.story || "",
          tags: (data.tags || []).join(", "),
          openHours: data.openHours || "",
          phone: data.phone || "",
          isOpen: data.isOpen ?? true,
        });
      })
      .catch(() => setMessage({ type: "error", text: "점포 정보를 불러올 수 없습니다." }))
      .finally(() => setLoading(false));
  }, [storeId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!storeId) return;

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/stores/${storeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          story: form.story || null,
          tags: form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          openHours: form.openHours || null,
          phone: form.phone || null,
          isOpen: form.isOpen,
        }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "저장되었습니다." });
      } else {
        setMessage({ type: "error", text: "저장에 실패했습니다." });
      }
    } catch {
      setMessage({ type: "error", text: "네트워크 오류가 발생했습니다." });
    } finally {
      setSaving(false);
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
        <p style={{ color: "var(--color-sand)" }}>
          연결된 점포가 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <h1
        className="text-xl sm:text-2xl font-bold mb-6"
        style={{ color: "var(--color-cream)" }}
      >
        점포 관리
      </h1>

      {/* isOpen Toggle */}
      <div
        className="mb-6 p-4 rounded-xl border flex items-center justify-between"
        style={{
          background: "rgba(255,255,255,0.03)",
          borderColor: "var(--color-glass-border)",
        }}
      >
        <div>
          <p className="font-medium" style={{ color: "var(--color-cream)" }}>
            영업 상태
          </p>
          <p className="text-xs" style={{ color: "var(--color-sand)" }}>
            {form.isOpen ? "현재 영업중입니다" : "현재 영업종료 상태입니다"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setForm((f) => ({ ...f, isOpen: !f.isOpen }))}
          className="relative w-14 h-7 rounded-full transition-colors"
          style={{
            background: form.isOpen
              ? "var(--color-forest-green)"
              : "var(--color-deep-brown)",
          }}
        >
          <span
            className="absolute top-0.5 w-6 h-6 rounded-full transition-transform"
            style={{
              background: "var(--color-cream)",
              left: form.isOpen ? "calc(100% - 1.625rem)" : "0.125rem",
            }}
          />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="점포명"
          value={form.name}
          onChange={(v) => setForm((f) => ({ ...f, name: v }))}
          required
        />
        <FormTextarea
          label="소개"
          value={form.description}
          onChange={(v) => setForm((f) => ({ ...f, description: v }))}
          required
        />
        <FormTextarea
          label="스토리"
          value={form.story}
          onChange={(v) => setForm((f) => ({ ...f, story: v }))}
          placeholder="점포의 이야기를 입력하세요"
        />
        <FormField
          label="태그"
          value={form.tags}
          onChange={(v) => setForm((f) => ({ ...f, tags: v }))}
          placeholder="쉼표로 구분 (예: 카페, 브런치, 디저트)"
        />
        <FormField
          label="영업시간"
          value={form.openHours}
          onChange={(v) => setForm((f) => ({ ...f, openHours: v }))}
          placeholder="예: 10:00-18:00"
        />
        <FormField
          label="전화번호"
          value={form.phone}
          onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
          type="tel"
          placeholder="예: 031-123-4567"
        />

        {message && (
          <p
            className="text-sm"
            style={{
              color:
                message.type === "success"
                  ? "var(--color-forest-green)"
                  : "var(--color-terracotta)",
            }}
          >
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 rounded-lg font-medium text-sm transition-colors"
          style={{
            background: "var(--color-gold)",
            color: "var(--color-charcoal)",
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? "저장 중..." : "저장"}
        </button>
      </form>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        className="block text-sm font-medium mb-1"
        style={{ color: "var(--color-sand)" }}
      >
        {label}
        {required && <span style={{ color: "var(--color-terracotta)" }}> *</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid var(--color-glass-border)",
          color: "var(--color-cream)",
        }}
      />
    </div>
  );
}

function FormTextarea({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        className="block text-sm font-medium mb-1"
        style={{ color: "var(--color-sand)" }}
      >
        {label}
        {required && <span style={{ color: "var(--color-terracotta)" }}> *</span>}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        rows={4}
        className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors resize-y"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid var(--color-glass-border)",
          color: "var(--color-cream)",
        }}
      />
    </div>
  );
}
