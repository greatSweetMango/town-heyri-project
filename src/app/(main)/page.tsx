"use client";

import { useRef, useMemo, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
} from "framer-motion";
import { Category, CATEGORY_CONFIG, StoreWithEvents } from "@/types";
import { useStores } from "@/hooks/useStores";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import CategoryFilter from "@/components/CategoryFilter";
import StoreList from "@/components/StoreList";
import StoreDetailPanel from "@/components/StoreDetailPanel";
import AnnouncementBanner from "@/components/AnnouncementBanner";

const InteractiveMap = dynamic(() => import("@/components/InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center rounded-2xl glass" style={{ height: "80vh", minHeight: "500px" }}>
      <p className="text-[var(--color-sand)] animate-pulse-soft">
        지도를 불러오는 중...
      </p>
    </div>
  ),
});

const KakaoMap = dynamic(() => import("@/components/KakaoMap"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center rounded-2xl glass" style={{ height: "80vh", minHeight: "500px" }}>
      <p className="text-[var(--color-sand)] animate-pulse-soft">
        지도를 불러오는 중...
      </p>
    </div>
  ),
});

/* ───── Particles (CSS-only ambient background) ───── */
function Particles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        size: Math.random() * 4 + 2,
        duration: Math.random() * 12 + 10,
        delay: Math.random() * 8,
        opacity: Math.random() * 0.4 + 0.1,
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full animate-particle"
          style={{
            left: p.left,
            bottom: "-10px",
            width: p.size,
            height: p.size,
            backgroundColor: `rgba(201, 168, 76, ${p.opacity})`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ───── Hero Section ───── */
function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const title = "헤이리 예술마을";
  const subtitle = "당신만의 예술 여행을 시작하세요";

  return (
    <section
      ref={ref}
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      {/* Gradient background layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-forest-dark)] via-[var(--background)] to-[var(--background)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,168,76,0.08)_0%,transparent_60%)]" />

      <Particles />

      <motion.div
        style={{ y, opacity }}
        className="relative z-10 px-6 text-center"
      >
        {/* Decorative line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="mx-auto mb-8 h-px w-24 origin-center bg-[var(--color-gold)]"
        />

        {/* Title — letter-by-letter reveal */}
        <h1 className="mb-6 text-5xl font-black tracking-tight md:text-7xl lg:text-8xl">
          {title.split("").map((char, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.3 + i * 0.06,
                duration: 0.5,
                ease: "easeOut",
              }}
              className="inline-block"
              style={{
                color:
                  char === " "
                    ? "transparent"
                    : i < 3
                      ? "var(--color-gold)"
                      : "var(--color-cream)",
              }}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mb-12 text-lg font-light tracking-wide text-[var(--color-sand)] md:text-xl"
        >
          {subtitle}
        </motion.p>

        {/* CTA Button */}
        <motion.a
          href="#map-section"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.6, duration: 0.6 }}
          whileHover={{
            scale: 1.06,
            boxShadow: "0 0 30px rgba(201, 168, 76, 0.3)",
          }}
          whileTap={{ scale: 0.97 }}
          className="inline-block rounded-full border border-[var(--color-gold)] bg-[var(--color-gold)]/10 px-8 py-4 text-base font-medium text-[var(--color-gold)] backdrop-blur-sm transition-colors hover:bg-[var(--color-gold)]/20 md:text-lg"
        >
          지도 탐색하기
        </motion.a>

        {/* Decorative line bottom */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
          className="mx-auto mt-12 h-px w-24 origin-center bg-[var(--color-gold)]/40"
        />
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="h-10 w-6 rounded-full border border-[var(--color-sand)]/30 flex items-start justify-center pt-2"
        >
          <div className="h-2 w-1 rounded-full bg-[var(--color-sand)]/50" />
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ───── Section wrapper with fade-in ───── */
function SectionReveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className={className}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </section>
  );
}

/* ───── Map Section ───── */
function MapSection({ stores }: { stores: StoreWithEvents[] }) {
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedStore, setSelectedStore] = useState<StoreWithEvents | null>(null);
  const { isEnabled } = useFeatureFlags();
  const useKakaoMap = isEnabled("kakao_map");

  const handleCategoryChange = useCallback(
    (categories: Category[]) => {
      setSelectedCategories(categories);
    },
    []
  );

  const handleStoreSelect = useCallback((store: StoreWithEvents) => {
    setSelectedStore(store);
  }, []);

  const handleDetailClose = useCallback(() => {
    setSelectedStore(null);
  }, []);

  return (
    <SectionReveal className="px-4 py-20 md:px-8" >
      <div id="map-section" className="mx-auto max-w-6xl scroll-mt-20">
        <h2 className="mb-2 text-center text-3xl font-bold text-[var(--color-cream)] md:text-4xl">
          마을 한눈에 보기
        </h2>
        <p className="mb-8 text-center text-sm text-[var(--color-sand)]/70">
          카테고리를 선택하고 지도에서 원하는 장소를 찾아보세요
        </p>

        <div className="mb-6">
          <CategoryFilter
            onCategoryChange={handleCategoryChange}
            activeCategories={selectedCategories}
          />
        </div>

        {/* Map — switches between illustration 3D map and Kakao Map */}
        <div className="overflow-hidden rounded-2xl">
          {useKakaoMap ? (
            <KakaoMap
              stores={stores}
              allStores={stores}
              selectedCategories={selectedCategories}
            />
          ) : (
            <InteractiveMap
              stores={stores}
              selectedCategories={selectedCategories}
            />
          )}
        </div>

        {/* Store list below map */}
        <StoreList
          stores={stores}
          selectedCategories={selectedCategories}
          onStoreSelect={handleStoreSelect}
        />
      </div>

      {/* Store detail panel */}
      <StoreDetailPanel
        store={selectedStore}
        allStores={stores}
        onClose={handleDetailClose}
        onStoreSelect={handleStoreSelect}
      />
    </SectionReveal>
  );
}

/* ───── Categories Section ───── */
function CategoriesSection({ stores }: { stores: StoreWithEvents[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const categoryCounts = useMemo(() => {
    const counts: Partial<Record<Category, number>> = {};
    for (const store of stores) {
      counts[store.category] = (counts[store.category] || 0) + 1;
    }
    return counts;
  }, [stores]);

  const entries = Object.entries(CATEGORY_CONFIG) as [
    Category,
    (typeof CATEGORY_CONFIG)[Category],
  ][];

  return (
    <SectionReveal className="px-4 py-20 md:px-8">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-2 text-center text-3xl font-bold text-[var(--color-cream)] md:text-4xl">
          무엇을 찾고 계세요?
        </h2>
        <p className="mb-12 text-center text-sm text-[var(--color-sand)]/70">
          헤이리 마을의 다양한 공간을 카테고리별로 둘러보세요
        </p>

        <div
          ref={ref}
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4"
        >
          {entries.map(([key, config], i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                delay: i * 0.08,
                duration: 0.5,
                ease: "easeOut",
              }}
              whileHover={{
                y: -6,
                boxShadow: `0 8px 30px ${config.color}20`,
              }}
              className="group cursor-pointer rounded-2xl p-6 text-center glass transition-colors"
            >
              <div
                className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl text-2xl transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${config.color}20` }}
              >
                {config.icon}
              </div>
              <h3 className="mb-1 text-sm font-semibold text-[var(--color-cream)]">
                {config.label}
              </h3>
              <p className="text-xs text-[var(--color-sand)]/60">
                {categoryCounts[key] || 0}개 장소
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionReveal>
  );
}

/* ───── Story / Docent Section ───── */
function StorySection({ stores }: { stores: StoreWithEvents[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const storyStores = useMemo(
    () => stores.filter((s) => s.story),
    [stores]
  );

  return (
    <SectionReveal className="py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-2 px-4 text-center text-3xl font-bold text-[var(--color-cream)] md:px-8 md:text-4xl">
          공간의 이야기를 만나보세요
        </h2>
        <p className="mb-10 px-4 text-center text-sm text-[var(--color-sand)]/70 md:px-8">
          헤이리 마을 곳곳에 숨겨진 이야기를 발견해보세요
        </p>

        {/* Horizontal scroll on mobile, grid on desktop */}
        <div
          ref={ref}
          className="flex gap-5 overflow-x-auto px-4 pb-4 no-scrollbar md:grid md:grid-cols-3 md:overflow-visible md:px-8"
        >
          {storyStores.map((store, i) => (
            <motion.article
              key={store.id}
              initial={{ opacity: 0, x: 40 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{
                delay: i * 0.12,
                duration: 0.6,
                ease: "easeOut",
              }}
              whileHover={{ y: -4 }}
              className="group w-72 shrink-0 cursor-pointer overflow-hidden rounded-2xl glass md:w-auto"
            >
              {/* Image placeholder */}
              <div
                className="relative h-44 w-full overflow-hidden"
                style={{
                  backgroundColor: `${CATEGORY_CONFIG[store.category].color}30`,
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-40 transition-transform group-hover:scale-110">
                  {CATEGORY_CONFIG[store.category].icon}
                </div>
                {/* Category badge */}
                <span
                  className="absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-medium text-white/90"
                  style={{ backgroundColor: CATEGORY_CONFIG[store.category].color }}
                >
                  {CATEGORY_CONFIG[store.category].label}
                </span>
              </div>

              <div className="p-5">
                <h3 className="mb-2 text-base font-bold text-[var(--color-cream)]">
                  {store.name}
                </h3>
                <p className="line-clamp-3 text-sm leading-relaxed text-[var(--color-sand)]/70">
                  {store.story}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </SectionReveal>
  );
}

/* ───── Footer ───── */
function Footer() {
  return (
    <footer className="border-t border-[var(--color-glass-border)] px-4 py-12 md:px-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 md:flex-row md:justify-between">
        <div className="text-center md:text-left">
          <p className="text-sm font-semibold text-[var(--color-cream)]">
            헤이리 예술마을 방문 안내 서비스
          </p>
          <p className="mt-1 text-xs text-[var(--color-sand)]/50">
            경기도 파주시 탄현면 헤이리마을길
          </p>
        </div>

        <nav className="flex gap-6 text-xs text-[var(--color-sand)]/60">
          <a href="#map-section" className="transition-colors hover:text-[var(--color-gold)]">
            지도
          </a>
          <a href="#" className="transition-colors hover:text-[var(--color-gold)]">
            이용안내
          </a>
          <a href="#" className="transition-colors hover:text-[var(--color-gold)]">
            오시는 길
          </a>
          <a href="#" className="transition-colors hover:text-[var(--color-gold)]">
            문의
          </a>
        </nav>
      </div>
    </footer>
  );
}

/* ───── Main Page ───── */
export default function Home() {
  const { stores, isLoading } = useStores();

  return (
    <main className="min-h-screen">
      <AnnouncementBanner />
      <HeroSection />
      <MapSection stores={stores} />
      <CategoriesSection stores={stores} />
      <StorySection stores={stores} />
      <Footer />
    </main>
  );
}
