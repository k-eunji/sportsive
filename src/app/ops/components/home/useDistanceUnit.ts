//src/app/ops/components/home/useDistanceUnit.ts

"use client";

import { useEffect, useState } from "react";
import { detectDefaultUnit, DistanceUnit } from "@/lib/distance";

const STORAGE_KEY = "sportsive_distance_unit";

export function useDistanceUnit() {
  const [unit, setUnit] = useState<DistanceUnit>("km");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as DistanceUnit | null;
    if (saved === "km" || saved === "mi") {
      setUnit(saved);
    } else {
      setUnit(detectDefaultUnit());
    }
  }, []);

  const toggle = () => {
    setUnit((prev) => {
      const next = prev === "km" ? "mi" : "km";
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  };

  return { unit, toggle };
}
