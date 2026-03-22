"use client";

import { useEffect, useState } from "react";

interface Pin {
  id: string;
  name: string;
  category: string;
  positionX: number;
  positionY: number;
  description: string | null;
}

const emptyForm = {
  name: "",
  category: "",
  positionX: 0,
  positionY: 0,
  description: "",
};

export default function PinsPage() {
  const [pins, setPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchPins = async () => {
    const res = await fetch("/api/pins");
    setPins(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchPins();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/pins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        positionX: Number(form.positionX),
        positionY: Number(form.positionY),
      }),
    });
    setForm(emptyForm);
    setShowForm(false);
    fetchPins();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    await fetch(`/api/pins/${id}`, { method: "DELETE" });
    fetchPins();
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.15)",
    color: "var(--color-cream)",
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--color-cream)" }}>
          시설물 핀 관리
        </h1>
        <button
          onClick={() => {
            setForm(emptyForm);
            setShowForm(!showForm);
          }}
          className="px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: "var(--color-gold)", color: "#1a1612" }}
        >
          {showForm ? "취소" : "새 핀 추가"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-6 p-4 rounded-lg border grid grid-cols-1 sm:grid-cols-2 gap-3"
          style={{
            background: "rgba(255,255,255,0.03)",
            borderColor: "rgba(255,255,255,0.1)",
          }}
        >
          <input
            required
            placeholder="이름"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="px-3 py-2 rounded border text-sm"
            style={inputStyle}
          />
          <input
            required
            placeholder="카테고리 (예: 화장실, 주차장)"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="px-3 py-2 rounded border text-sm"
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
            placeholder="설명 (선택)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="px-3 py-2 rounded border text-sm sm:col-span-2"
            style={inputStyle}
          />
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="px-4 py-2 rounded text-sm font-medium"
              style={{ background: "var(--color-gold)", color: "#1a1612" }}
            >
              생성
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
                <th className="pb-2 pr-4 whitespace-nowrap">이름</th>
                <th className="pb-2 pr-4 whitespace-nowrap">카테고리</th>
                <th className="pb-2 pr-4 whitespace-nowrap">좌표</th>
                <th className="pb-2 pr-4 whitespace-nowrap">설명</th>
                <th className="pb-2 whitespace-nowrap">관리</th>
              </tr>
            </thead>
            <tbody>
              {pins.map((pin) => (
                <tr
                  key={pin.id}
                  className="border-b"
                  style={{ borderColor: "rgba(255,255,255,0.05)" }}
                >
                  <td className="py-2 pr-4 whitespace-nowrap">{pin.name}</td>
                  <td className="py-2 pr-4 whitespace-nowrap">{pin.category}</td>
                  <td className="py-2 pr-4 whitespace-nowrap">
                    ({pin.positionX.toFixed(1)}, {pin.positionY.toFixed(1)})
                  </td>
                  <td className="py-2 pr-4 truncate max-w-[200px]">
                    {pin.description ?? "-"}
                  </td>
                  <td className="py-2 whitespace-nowrap">
                    <button
                      onClick={() => handleDelete(pin.id)}
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
          {pins.length === 0 && (
            <p className="text-center py-8 text-sm" style={{ color: "var(--color-sand)" }}>
              등록된 핀이 없습니다.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
