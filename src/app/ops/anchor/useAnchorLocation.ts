// src/app/ops/anchor/useAnchorLocation.ts
"use client";

import { useState } from "react";
import type { AnchorLocation } from "./types";

export function useAnchorLocation() {
  const [anchor, setAnchor] = useState<AnchorLocation | null>(null);

  return {
    anchor,
    hasAnchor: !!anchor,
    setAnchor,
    clearAnchor: () => setAnchor(null),
  };
}
