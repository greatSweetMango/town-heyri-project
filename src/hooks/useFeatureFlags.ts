"use client";

import { useState, useEffect } from "react";

export function useFeatureFlags() {
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/feature-flags")
      .then((res) => res.json())
      .then((data) => setFlags(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const isEnabled = (name: string) => flags[name] ?? false;

  return { flags, loading, isEnabled };
}
