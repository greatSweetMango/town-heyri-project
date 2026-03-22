"use client";

import { useEffect, useState } from "react";

interface Account {
  id: string;
  email: string;
  name: string | null;
  role: string;
  storeId: string | null;
  store: { id: string; name: string } | null;
  createdAt: string;
}

interface Store {
  id: string;
  name: string;
}

const emptyForm = {
  email: "",
  password: "",
  name: "",
  role: "SHOP_OWNER",
  storeId: "",
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchData = async () => {
    const [accRes, storeRes] = await Promise.all([
      fetch("/api/admin/accounts"),
      fetch("/api/stores"),
    ]);
    const accData = await accRes.json();
    const storeData = await storeRes.json();
    setAccounts(accData);
    setStores(storeData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = {
      ...form,
      storeId: form.storeId || null,
    };
    const res = await fetch("/api/admin/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setForm(emptyForm);
      setShowForm(false);
      fetchData();
    } else {
      const err = await res.json();
      alert(err.error || "오류가 발생했습니다.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    await fetch(`/api/admin/accounts/${id}`, { method: "DELETE" });
    fetchData();
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.15)",
    color: "var(--color-cream)",
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--color-cream)" }}>
          계정 관리
        </h1>
        <button
          onClick={() => {
            setForm(emptyForm);
            setShowForm(!showForm);
          }}
          className="px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: "var(--color-gold)", color: "#1a1612" }}
        >
          {showForm ? "취소" : "새 계정 생성"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 p-4 rounded-lg border grid grid-cols-1 sm:grid-cols-2 gap-3"
          style={{
            background: "rgba(255,255,255,0.03)",
            borderColor: "rgba(255,255,255,0.1)",
          }}
        >
          <input
            type="email"
            required
            placeholder="이메일"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="px-3 py-2 rounded border text-sm"
            style={inputStyle}
          />
          <input
            type="password"
            required
            placeholder="비밀번호"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="px-3 py-2 rounded border text-sm"
            style={inputStyle}
          />
          <input
            placeholder="이름"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="px-3 py-2 rounded border text-sm"
            style={inputStyle}
          />
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="px-3 py-2 rounded border text-sm"
            style={inputStyle}
          >
            <option value="SHOP_OWNER">점주 (SHOP_OWNER)</option>
            <option value="ADMIN">관리자 (ADMIN)</option>
          </select>
          <select
            value={form.storeId}
            onChange={(e) => setForm({ ...form, storeId: e.target.value })}
            className="px-3 py-2 rounded border text-sm sm:col-span-2"
            style={inputStyle}
          >
            <option value="">연결 점포 없음</option>
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="px-4 py-2 rounded text-sm font-medium"
              style={{ background: "var(--color-gold)", color: "#1a1612" }}
            >
              계정 생성
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p style={{ color: "var(--color-sand)" }}>로딩중...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ color: "var(--color-cream)" }}>
            <thead>
              <tr
                className="text-left border-b"
                style={{ borderColor: "rgba(255,255,255,0.1)", color: "var(--color-sand)" }}
              >
                <th className="pb-2 pr-4 whitespace-nowrap">이메일</th>
                <th className="pb-2 pr-4 whitespace-nowrap">이름</th>
                <th className="pb-2 pr-4 whitespace-nowrap">역할</th>
                <th className="pb-2 pr-4 whitespace-nowrap">연결 점포</th>
                <th className="pb-2 whitespace-nowrap">관리</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((acc) => (
                <tr
                  key={acc.id}
                  className="border-b"
                  style={{ borderColor: "rgba(255,255,255,0.05)" }}
                >
                  <td className="py-2 pr-4 whitespace-nowrap">{acc.email}</td>
                  <td className="py-2 pr-4 whitespace-nowrap">{acc.name ?? "-"}</td>
                  <td className="py-2 pr-4 whitespace-nowrap">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background:
                          acc.role === "ADMIN"
                            ? "rgba(201,168,76,0.2)"
                            : "rgba(45,74,62,0.5)",
                        color: acc.role === "ADMIN" ? "var(--color-gold)" : "#7cd4a8",
                      }}
                    >
                      {acc.role}
                    </span>
                  </td>
                  <td className="py-2 pr-4 whitespace-nowrap">
                    {acc.store?.name ?? "-"}
                  </td>
                  <td className="py-2 whitespace-nowrap">
                    <button
                      onClick={() => handleDelete(acc.id)}
                      className="text-xs underline"
                      style={{ color: "var(--color-terracotta)" }}
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {accounts.length === 0 && (
            <p className="text-center py-8 text-sm" style={{ color: "var(--color-sand)" }}>
              등록된 계정이 없습니다.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
