"use client";

import { Suspense, useState, useCallback, useEffect } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import dynamic from "next/dynamic";
import type { StoreWithEvents, Category } from "@/types";
import { gpsToMapPosition } from "@/lib/utils";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import MapMarker from "./MapMarker";
import MapTooltip from "./MapTooltip";
import CurrentLocationMarker from "./CurrentLocationMarker";
import MapGate from "./MapGate";
import MapTrail from "./MapTrail";
import MapPin from "./MapPin";

// Map plane dimensions — the map lies flat on the XZ plane
const MAP_WIDTH = 24;
const MAP_ASPECT = 1.2;
const MAP_HEIGHT = MAP_WIDTH / MAP_ASPECT;

function MapPlane() {
  const texture = useLoader(THREE.TextureLoader, "/images/heyri-map.jpg");

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
  }, [texture]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[MAP_WIDTH, MAP_HEIGHT]} />
      <meshStandardMaterial map={texture} roughness={0.9} metalness={0} />
    </mesh>
  );
}

interface GateData { id: string; name: string; positionX: number; positionY: number; description: string | null; }
interface TrailData { id: string; name: string; points: { x: number; y: number }[]; isActive: boolean; }
interface PinData { id: string; name: string; category: string; positionX: number; positionY: number; description: string | null; }

// Scene
interface SceneProps {
  stores: StoreWithEvents[];
  selectedCategories: Category[];
  gates: GateData[];
  trails: TrailData[];
  pins: PinData[];
  showGates: boolean;
  showTrails: boolean;
  onHover: (store: StoreWithEvents | null, screenPos: { x: number; y: number } | null) => void;
  onSelect: (store: StoreWithEvents) => void;
  selectedStore: StoreWithEvents | null;
  userPosition: { x: number; y: number } | null;
}

function Scene({ stores, selectedCategories, gates, trails, pins, showGates, showTrails, onHover, onSelect, selectedStore, userPosition }: SceneProps) {
  // Filter stores based on selected categories (empty = show all)
  const filteredStores =
    selectedCategories.length === 0
      ? stores
      : stores.filter((s) => selectedCategories.includes(s.category));

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 15, 5]} intensity={0.8} castShadow />
      <directionalLight position={[-5, 10, -5]} intensity={0.3} />
      <hemisphereLight args={["#dceeff", "#3d2b1f", 0.4]} />

      <OrbitControls
        enableRotate={true}
        enablePan={true}
        enableZoom={true}
        minPolarAngle={Math.PI / 9}
        maxPolarAngle={Math.PI / 2.8}
        minDistance={8}
        maxDistance={30}
        mouseButtons={{
          LEFT: THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.PAN,
        }}
        touches={{
          ONE: THREE.TOUCH.ROTATE,
          TWO: THREE.TOUCH.DOLLY_PAN,
        }}
        zoomSpeed={0.6}
        rotateSpeed={0.5}
        panSpeed={0.6}
        dampingFactor={0.1}
        enableDamping
      />

      <Suspense fallback={null}>
        <MapPlane />
      </Suspense>

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[MAP_WIDTH + 4, MAP_HEIGHT + 4]} />
        <meshStandardMaterial color="#e8e0d4" roughness={1} />
      </mesh>

      {/* Store markers */}
      {filteredStores.map((store) => (
        <MapMarker
          key={store.id}
          store={store}
          mapWidth={MAP_WIDTH}
          mapHeight={MAP_HEIGHT}
          onHover={onHover}
          onClick={onSelect}
          isSelected={selectedStore?.id === store.id}
          isOpen={store.isOpen}
          hasActiveEvent={store.hasActiveEvent}
        />
      ))}

      {/* Gates */}
      {showGates && gates.map((gate) => (
        <MapGate key={gate.id} gate={gate} mapWidth={MAP_WIDTH} mapHeight={MAP_HEIGHT} />
      ))}

      {/* Trails */}
      {showTrails && trails.map((trail) => (
        <MapTrail key={trail.id} trail={trail} mapWidth={MAP_WIDTH} mapHeight={MAP_HEIGHT} />
      ))}

      {/* Facility pins */}
      {pins.map((pin) => (
        <MapPin key={pin.id} pin={pin} mapWidth={MAP_WIDTH} mapHeight={MAP_HEIGHT} />
      ))}

      {/* Current location */}
      {userPosition && (
        <CurrentLocationMarker
          mapWidth={MAP_WIDTH}
          mapHeight={MAP_HEIGHT}
          position={userPosition}
        />
      )}
    </>
  );
}

// Loading overlay
function LoadingOverlay() {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-stone-100/90 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-stone-300 border-t-stone-700" />
        <p className="text-sm font-medium text-stone-500">
          지도를 불러오는 중...
        </p>
      </div>
    </div>
  );
}

// GPS hook
function useCurrentLocation() {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "granted" | "denied" | "outside">("idle");

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus("denied");
      return;
    }

    setStatus("loading");

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const mapped = gpsToMapPosition(pos.coords.latitude, pos.coords.longitude);
        if (mapped) {
          setPosition(mapped);
          setStatus("granted");
        } else {
          setStatus("outside");
        }
      },
      () => {
        setStatus("denied");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return { position, status, requestLocation };
}

// Props for the exported component
interface InteractiveMapProps {
  stores: StoreWithEvents[];
  selectedCategories: Category[];
}

// Hook to fetch map overlay data
function useMapOverlays() {
  const [gates, setGates] = useState<GateData[]>([]);
  const [trails, setTrails] = useState<TrailData[]>([]);
  const [pins, setPins] = useState<PinData[]>([]);

  useEffect(() => {
    fetch("/api/gates").then(r => r.json()).then(setGates).catch(() => {});
    fetch("/api/trails").then(r => r.json()).then(setTrails).catch(() => {});
    fetch("/api/pins").then(r => r.json()).then(setPins).catch(() => {});
  }, []);

  return { gates, trails, pins };
}

// Main component
function InteractiveMapInner({ stores, selectedCategories }: InteractiveMapProps) {
  const [hoveredStore, setHoveredStore] = useState<StoreWithEvents | null>(null);
  const [selectedStore, setSelectedStore] = useState<StoreWithEvents | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const { position: userPosition, status: gpsStatus, requestLocation } = useCurrentLocation();
  const { gates, trails, pins } = useMapOverlays();
  const { isEnabled } = useFeatureFlags();

  const handleHover = useCallback(
    (store: StoreWithEvents | null, screenPos: { x: number; y: number } | null) => {
      setHoveredStore(store);
      setTooltipPos(screenPos);
    },
    []
  );

  const handleSelect = useCallback((store: StoreWithEvents) => {
    setSelectedStore((prev) => (prev?.id === store.id ? null : store));
  }, []);

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-b from-stone-200 to-stone-100 shadow-2xl"
      style={{ height: "80vh", minHeight: "500px", maxHeight: "900px" }}
    >
      <Canvas
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
          preserveDrawingBuffer: true,
        }}
        camera={{
          position: [0, 18, 14],
          fov: 45,
          near: 0.1,
          far: 200,
        }}
        shadows
        style={{ width: "100%", height: "100%" }}
        dpr={[1, 2]}
      >
        <Scene
          stores={stores}
          selectedCategories={selectedCategories}
          gates={gates}
          trails={trails}
          pins={pins}
          showGates={isEnabled("gates_enabled")}
          showTrails={isEnabled("trails_enabled")}
          onHover={handleHover}
          onSelect={handleSelect}
          selectedStore={selectedStore}
          userPosition={userPosition}
        />
      </Canvas>

      {/* Tooltip overlay */}
      <MapTooltip store={hoveredStore} screenPosition={tooltipPos} />

      {/* GPS location button */}
      <button
        onClick={requestLocation}
        className="absolute right-4 top-4 z-20 flex items-center gap-2 rounded-xl bg-white/80 px-3 py-2 text-sm font-medium shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:shadow-xl active:scale-95"
        title="내 위치 보기"
      >
        <svg
          className={`h-5 w-5 ${
            gpsStatus === "loading"
              ? "animate-pulse text-blue-400"
              : gpsStatus === "granted"
                ? "text-blue-500"
                : "text-gray-500"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 2a1 1 0 011 1v2.07A8.002 8.002 0 0119.93 12H22a1 1 0 110 2h-2.07A8.002 8.002 0 0113 20.93V22a1 1 0 11-2 0v-1.07A8.002 8.002 0 014.07 14H2a1 1 0 110-2h2.07A8.002 8.002 0 0111 5.07V3a1 1 0 011-1zm0 6a4 4 0 100 8 4 4 0 000-8z"
          />
        </svg>
        <span className="hidden sm:inline">
          {gpsStatus === "idle" && "내 위치"}
          {gpsStatus === "loading" && "위치 확인 중..."}
          {gpsStatus === "granted" && "현재 위치 표시 중"}
          {gpsStatus === "denied" && "위치 권한 필요"}
          {gpsStatus === "outside" && "헤이리 밖에 계세요"}
        </span>
      </button>

      {/* GPS status toast */}
      {gpsStatus === "outside" && (
        <div className="absolute left-1/2 top-4 z-20 -translate-x-1/2 rounded-xl bg-amber-500/90 px-4 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-sm">
          현재 위치가 헤이리마을 밖입니다
        </div>
      )}
      {gpsStatus === "denied" && (
        <div className="absolute left-1/2 top-4 z-20 -translate-x-1/2 rounded-xl bg-red-500/90 px-4 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-sm">
          위치 권한을 허용해주세요
        </div>
      )}

      {/* Controls hint */}
      <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex justify-between">
        <div className="rounded-lg bg-black/50 px-3 py-1.5 text-xs text-white/80 backdrop-blur-sm">
          <span className="hidden md:inline">좌클릭 드래그: 회전 · 우클릭: 이동 · 스크롤: 확대/축소</span>
          <span className="md:hidden">터치 회전 · 두 손가락 확대/이동</span>
        </div>
        <div className="rounded-lg bg-black/50 px-3 py-1.5 text-xs text-white/80 backdrop-blur-sm">
          핀을 터치하여 정보 보기
        </div>
      </div>
    </div>
  );
}

const InteractiveMap = dynamic(
  () => Promise.resolve(InteractiveMapInner),
  {
    ssr: false,
    loading: () => <LoadingOverlay />,
  }
) as React.ComponentType<InteractiveMapProps>;

export default InteractiveMap;
