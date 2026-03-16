"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export type CompanionType = "couple" | "family" | "solo" | "group";
export type InterestType =
  | "cafe"
  | "gallery"
  | "workshop"
  | "restaurant"
  | "explore";

export interface OnboardingResult {
  companion: CompanionType;
  interests: InterestType[];
}

interface OnboardingModalProps {
  open: boolean;
  onComplete: (result: OnboardingResult) => void;
}

const COMPANIONS: { value: CompanionType; label: string; emoji: string }[] = [
  { value: "couple", label: "연인/친구", emoji: "👫" },
  { value: "family", label: "가족", emoji: "👨‍👩‍👧" },
  { value: "solo", label: "혼자", emoji: "🧑" },
  { value: "group", label: "단체", emoji: "👥" },
];

const INTERESTS: { value: InterestType; label: string; emoji: string }[] = [
  { value: "cafe", label: "카페 투어", emoji: "☕" },
  { value: "gallery", label: "전시 관람", emoji: "🎨" },
  { value: "workshop", label: "체험/공방", emoji: "🔨" },
  { value: "restaurant", label: "맛집 탐방", emoji: "🍽️" },
  { value: "explore", label: "그냥 둘러보기", emoji: "🚶" },
];

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 200 : -200,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({
    x: dir > 0 ? -200 : 200,
    opacity: 0,
  }),
};

export default function OnboardingModal({
  open,
  onComplete,
}: OnboardingModalProps) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [companion, setCompanion] = useState<CompanionType | null>(null);
  const [interests, setInterests] = useState<InterestType[]>([]);

  const goNext = useCallback(() => {
    setDirection(1);
    setStep(1);
  }, []);

  const goBack = useCallback(() => {
    setDirection(-1);
    setStep(0);
  }, []);

  const toggleInterest = useCallback((val: InterestType) => {
    setInterests((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  }, []);

  const handleComplete = useCallback(() => {
    if (companion && interests.length > 0) {
      onComplete({ companion, interests });
    }
  }, [companion, interests, onComplete]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 24 }}
          transition={{ type: "spring", damping: 26, stiffness: 280 }}
          className="w-full max-w-md bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl rounded-3xl border border-white/40 dark:border-stone-700/40 shadow-2xl overflow-hidden"
        >
          {/* Progress dots */}
          <div className="flex justify-center gap-2 pt-5">
            {[0, 1].map((i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === step
                    ? "w-6 bg-amber-600 dark:bg-amber-500"
                    : "w-1.5 bg-stone-300 dark:bg-stone-600"
                )}
              />
            ))}
          </div>

          <div className="relative min-h-[360px]">
            <AnimatePresence mode="wait" custom={direction}>
              {step === 0 && (
                <motion.div
                  key="step-0"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="p-6"
                >
                  <h2 className="text-xl font-extrabold text-stone-800 dark:text-stone-100 text-center mb-1">
                    누구와 함께 오셨나요?
                  </h2>
                  <p className="text-sm text-stone-500 dark:text-stone-400 text-center mb-6">
                    맞춤 추천을 위해 알려주세요
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    {COMPANIONS.map((item) => (
                      <button
                        key={item.value}
                        onClick={() => setCompanion(item.value)}
                        className={cn(
                          "flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all duration-200",
                          companion === item.value
                            ? "border-amber-500 bg-amber-50/60 dark:bg-amber-900/25 shadow-md scale-[1.02]"
                            : "border-stone-200/60 dark:border-stone-700/50 bg-white/50 dark:bg-stone-800/40 hover:border-stone-300 dark:hover:border-stone-600"
                        )}
                      >
                        <span className="text-3xl">{item.emoji}</span>
                        <span className="text-sm font-semibold text-stone-700 dark:text-stone-200">
                          {item.label}
                        </span>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={goNext}
                    disabled={!companion}
                    className={cn(
                      "w-full mt-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                      companion
                        ? "bg-amber-600 text-white hover:bg-amber-700 active:scale-[0.98]"
                        : "bg-stone-200 dark:bg-stone-700 text-stone-400 dark:text-stone-500 cursor-not-allowed"
                    )}
                  >
                    다음
                  </button>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div
                  key="step-1"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="p-6"
                >
                  <h2 className="text-xl font-extrabold text-stone-800 dark:text-stone-100 text-center mb-1">
                    무엇을 하고 싶으세요?
                  </h2>
                  <p className="text-sm text-stone-500 dark:text-stone-400 text-center mb-6">
                    여러 개 선택할 수 있어요
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    {INTERESTS.map((item) => {
                      const selected = interests.includes(item.value);
                      return (
                        <button
                          key={item.value}
                          onClick={() => toggleInterest(item.value)}
                          className={cn(
                            "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200",
                            selected
                              ? "border-amber-500 bg-amber-50/60 dark:bg-amber-900/25 shadow-md scale-[1.02]"
                              : "border-stone-200/60 dark:border-stone-700/50 bg-white/50 dark:bg-stone-800/40 hover:border-stone-300 dark:hover:border-stone-600"
                          )}
                        >
                          <span className="text-2xl">{item.emoji}</span>
                          <span className="text-sm font-semibold text-stone-700 dark:text-stone-200">
                            {item.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={goBack}
                      className="px-5 py-3 rounded-xl text-sm font-semibold text-stone-600 dark:text-stone-300 bg-stone-100/70 dark:bg-stone-800/60 hover:bg-stone-200/70 dark:hover:bg-stone-700/60 transition-colors"
                    >
                      이전
                    </button>
                    <button
                      onClick={handleComplete}
                      disabled={interests.length === 0}
                      className={cn(
                        "flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                        interests.length > 0
                          ? "bg-amber-600 text-white hover:bg-amber-700 active:scale-[0.98]"
                          : "bg-stone-200 dark:bg-stone-700 text-stone-400 dark:text-stone-500 cursor-not-allowed"
                      )}
                    >
                      시작하기
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
