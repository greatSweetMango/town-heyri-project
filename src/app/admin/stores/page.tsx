"use client";

import { useEffect, useState } from "react";

interface Store {
  id: string;
  name: string;
  category: string;
  description: string;
  story?: string;
  image?: string;
  positionX: number;
  positionY: number;
  tags: string[];
  openHours?: string;
  phone?: string;
  isOpen: boolean;
}

const emptyForm = {
  name: "",
  category: "",
  description: "",
  story: "",
  image: "",
  positionX: 0,
  positionY: 0,
  tags: "",
  openHours: "",
  phone: "",
};

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchStores = async () => {
    const res = await fetch("/api/stores");
    const data = await res.json();
    setStores(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = {
      ...form,
      positionX: Number(form.positionX),
      positionY: Number(form.positionY),
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    if (editingId) {
      await fetch(`/api/stores/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } else {
      await fetch("/api/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }

    setForm(emptyForm);
    setShowForm(false);
    setEditingId(null);
    fetchStores();
  };

  const handleEdit = (store: Store) => {
    setForm({
      name: store.name,
      category: store.category,
      description: store.description,
      story: store.story ?? "",
      image: store.image ?? "",
      positionX: store.positionX,
      positionY: store.positionY,
      tags: store.tags.join(", "),
      openHours: store.openHours ?? "",
      phone: store.phone ?? "",
    });
    setEditingId(store.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    await fetch(`/api/stores/${id}`, { method: "DELETE" });
    fetchStores();
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
          점포 관리
        </h1>
        <button
          onClick={() => {
            setForm(emptyForm);
            setEditingId(null);
            setShowForm(!showForm);
          }}
          className="px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: "var(--color-gold)", color: "#1a1612" }}
        >
          {showForm ? "취소" : "새 점포 추가"}
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
            required
            placeholder="점포명"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="px-3 py-2 rounded border text-sm"
            style={inputStyle}
          />
          <input
            required
            placeholder="카테고리"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="px-3 py-2 rounded border text-sm"
            style={inputStyle}
          />
          <textarea
            required
            placeholder="설명"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="px-3 py-2 rounded border text-sm sm:col-span-2"
            style={inputStyle}
            rows={2}
          />
          <input
            placeholder="스토리"
            value={form.story}
            onChange={(e) => setForm({ ...form, story: e.target.value })}
            className="px-3 py-2 rounded border text-sm sm:col-span-2"
            style={inputStyle}
          />
          <input
            placeholder="이미지 URL"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            className="px-3 py-2 rounded border text-sm sm:col-span-2"
            style={inputStyle}
          />
          <input
            type="number"
            step="any"
            required
            placeholder="X좌표"
            value={form.positionX}
            onChange={(e) => setForm({ ...form, positionX: Number(e.target.value) })}
            className="px-3 py-2 rounded border text-sm"
            style={inputStyle}
          />
          <input
            type="number"
            step="any"
            required
            placeholder="Y좌표"
            value={form.positionY}
            onChange={(e) => setForm({ ...form, positionY: Number(e.target.value) })}
            className="px-3 py-2 rounded border text-sm"
            style={inputStyle}
          />
          <input
            placeholder="태그 (콤마 구분)"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            className="px-3 py-2 rounded border text-sm"
            style={inputStyle}
          />
          <input
            placeholder="영업시간"
            value={form.openHours}
            onChange={(e) => setForm({ ...form, openHours: e.target.value })}
            className="px-3 py-2 rounded border text-sm"
            style={inputStyle}
          />
          <input
            type="tel"
            placeholder="전화번호"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="px-3 py-2 rounded border text-sm"
            style={inputStyle}
          />
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="px-4 py-2 rounded text-sm font-medium"
              style={{ background: "var(--color-gold)", color: "#1a1612" }}
            >
              {editingId ? "수정" : "생성"}
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
                <th className="pb-2 pr-4 whitespace-nowrap">점포명</th>
                <th className="pb-2 pr-4 whitespace-nowrap">카테고리</th>
                <th className="pb-2 pr-4 whitespace-nowrap">좌표</th>
                <th className="pb-2 pr-4 whitespace-nowrap">상태</th>
                <th className="pb-2 whitespace-nowrap">관리</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => (
                <tr
                  key={store.id}
                  className="border-b"
                  style={{ borderColor: "rgba(255,255,255,0.05)" }}
                >
                  <td className="py-2 pr-4 whitespace-nowrap">{store.name}</td>
                  <td className="py-2 pr-4 whitespace-nowrap">{store.category}</td>
                  <td className="py-2 pr-4 whitespace-nowrap">
                    ({store.positionX.toFixed(1)}, {store.positionY.toFixed(1)})
                  </td>
                  <td className="py-2 pr-4 whitespace-nowrap">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: store.isOpen ? "rgba(45,74,62,0.5)" : "rgba(196,96,60,0.3)",
                        color: store.isOpen ? "#7cd4a8" : "#e8886c",
                      }}
                    >
                      {store.isOpen ? "영업중" : "휴업"}
                    </span>
                  </td>
                  <td className="py-2 whitespace-nowrap">
                    <button
                      onClick={() => handleEdit(store)}
                      className="text-xs mr-2 underline"
                      style={{ color: "var(--color-gold)" }}
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(store.id)}
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
          {stores.length === 0 && (
            <p className="text-center py-8 text-sm" style={{ color: "var(--color-sand)" }}>
              등록된 점포가 없습니다.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
