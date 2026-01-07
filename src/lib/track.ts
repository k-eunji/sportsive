// src/lib/track.ts
import { logEvent } from "@/lib/analytics";

type Props = Record<string, string | number | boolean | null | undefined>;

function normalizeProps(props: Props): Record<string, string> {
  const out: Record<string, string> = {};

  for (const [key, value] of Object.entries(props)) {
    if (value === null || value === undefined) continue;
    out[key] = String(value);
  }

  return out;
}

export function track(name: string, props: Props = {}) {
  try {
    logEvent(name, normalizeProps(props));
  } catch {
    if (process.env.NODE_ENV !== "production") {
      console.log("[track]", name, props);
    }
  }
}
