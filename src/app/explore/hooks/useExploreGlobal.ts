//src/app/explore/hooks/useExploreGlobal.ts

"use client";

import { useEffect, useState } from "react";

export function useExploreGlobal() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/explore/global", { cache: "no-store" });
        const json = await res.json();
        setData(json);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { loading, data };
}
