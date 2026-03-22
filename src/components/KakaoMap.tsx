"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { StoreWithEvents, Category } from "@/types";
import { CATEGORY_CONFIG } from "@/types";
import StoreDetailPanel from "./StoreDetailPanel";

declare global {
  interface Window {
    kakao: any;
  }
}

interface KakaoMapProps {
  stores: StoreWithEvents[];
  allStores: StoreWithEvents[];
  selectedCategories: Category[];
}

const HEYRI_CENTER = { lat: 37.76, lng: 126.6955 };

export default function KakaoMap({ stores, allStores, selectedCategories }: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [selectedStore, setSelectedStore] = useState<StoreWithEvents | null>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  // Load Kakao Maps SDK
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;
    if (!apiKey) {
      console.warn("NEXT_PUBLIC_KAKAO_MAP_API_KEY is not set");
      return;
    }

    if (window.kakao?.maps) {
      setSdkLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`;
    script.async = true;
    script.onload = () => {
      window.kakao.maps.load(() => setSdkLoaded(true));
    };
    document.head.appendChild(script);
  }, []);

  // Initialize map
  useEffect(() => {
    if (!sdkLoaded || !mapRef.current || mapInstanceRef.current) return;

    const { kakao } = window;
    const options = {
      center: new kakao.maps.LatLng(HEYRI_CENTER.lat, HEYRI_CENTER.lng),
      level: 4,
    };
    mapInstanceRef.current = new kakao.maps.Map(mapRef.current, options);
  }, [sdkLoaded]);

  // Update markers
  useEffect(() => {
    if (!sdkLoaded || !mapInstanceRef.current) return;

    const { kakao } = window;
    const map = mapInstanceRef.current;

    // Clear existing markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    // Filter stores
    const filtered = selectedCategories.length === 0
      ? stores
      : stores.filter((s) => selectedCategories.includes(s.category));

    filtered.forEach((store) => {
      // Convert percentage position to approximate GPS
      const lat = HEYRI_CENTER.lat + ((50 - store.positionY) / 100) * 0.012;
      const lng = HEYRI_CENTER.lng + ((store.positionX - 50) / 100) * 0.015;

      const config = CATEGORY_CONFIG[store.category];
      const marker = new kakao.maps.Marker({
        map,
        position: new kakao.maps.LatLng(lat, lng),
        title: store.name,
        opacity: store.isOpen ? 1 : 0.4,
      });

      // Info window
      const infoContent = `
        <div style="padding:8px 12px;font-size:13px;min-width:120px;">
          <strong>${config.icon} ${store.name}</strong>
          <br/><span style="color:#666;font-size:11px;">${config.label}</span>
          ${!store.isOpen ? '<br/><span style="color:red;font-size:11px;">휴무</span>' : ''}
        </div>
      `;
      const infoWindow = new kakao.maps.InfoWindow({ content: infoContent });

      kakao.maps.event.addListener(marker, "mouseover", () => infoWindow.open(map, marker));
      kakao.maps.event.addListener(marker, "mouseout", () => infoWindow.close());
      kakao.maps.event.addListener(marker, "click", () => setSelectedStore(store));

      markersRef.current.push(marker);
    });
  }, [sdkLoaded, stores, selectedCategories]);

  const handleClosePanel = useCallback(() => setSelectedStore(null), []);
  const handleStoreSelect = useCallback((store: StoreWithEvents) => setSelectedStore(store), []);

  if (!process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY) {
    return (
      <div className="flex items-center justify-center rounded-2xl bg-stone-200" style={{ height: "80vh", minHeight: "500px" }}>
        <p className="text-stone-500 text-sm">카카오맵 API 키가 설정되지 않았습니다.</p>
      </div>
    );
  }

  return (
    <div className="relative" style={{ height: "80vh", minHeight: "500px", maxHeight: "900px" }}>
      <div ref={mapRef} className="w-full h-full rounded-2xl overflow-hidden" />
      <StoreDetailPanel
        store={selectedStore}
        allStores={allStores}
        onClose={handleClosePanel}
        onStoreSelect={handleStoreSelect}
      />
    </div>
  );
}
