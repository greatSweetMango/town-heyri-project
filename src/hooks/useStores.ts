"use client";

import { useState, useEffect, useCallback } from "react";
import type { StoreWithEvents } from "@/types";
import { toStoreWithEvents } from "@/types";

interface UseStoresReturn {
  stores: StoreWithEvents[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useStores(): UseStoresReturn {
  const [stores, setStores] = useState<StoreWithEvents[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStores = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stores");
      if (!res.ok) {
        throw new Error(`Failed to fetch stores: ${res.status}`);
      }
      const data = await res.json();
      const mapped: StoreWithEvents[] = data.map(
        (raw: Omit<StoreWithEvents, "hasActiveEvent">) =>
          toStoreWithEvents(raw)
      );
      setStores(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  return { stores, isLoading, error, refetch: fetchStores };
}
