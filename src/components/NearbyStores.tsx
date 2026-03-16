"use client";

import { motion } from "framer-motion";
import { Store } from "@/types";
import { getNearbyStores, getDistance, getWalkingTime } from "@/lib/utils";
import StoreCard from "./StoreCard";

interface NearbyStoresProps {
  currentStore: Store;
  stores: Store[];
  limit?: number;
  onStoreClick?: (store: Store) => void;
}

export default function NearbyStores({
  currentStore,
  stores,
  limit = 3,
  onStoreClick,
}: NearbyStoresProps) {
  const nearby = getNearbyStores(currentStore, stores, limit);

  if (nearby.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.4 }}
    >
      <h4 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-3">
        주변 매장 보기
      </h4>
      <div className="flex flex-col gap-2.5">
        {nearby.map((store, index) => {
          const distance = getDistance(currentStore.position, store.position);
          const walkMin = getWalkingTime(distance);

          return (
            <motion.div
              key={store.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + index * 0.08, duration: 0.3 }}
            >
              <div className="relative">
                <StoreCard
                  store={store}
                  variant="compact"
                  onClick={() => onStoreClick?.(store)}
                />
                <span className="absolute top-1/2 -translate-y-1/2 right-3 text-xs text-stone-400 dark:text-stone-500 whitespace-nowrap">
                  도보 약 {walkMin}분
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
