//src/app/components/home/stamps.ts

import type { Event } from "@/types";
import { track } from "@/lib/track";
import { logActivity } from "./activity";

const STORAGE_KEY = "sportsive_discovery_v3";

type Store = {
  stamps: Record<string, { key: string; label: string; lastSeen: number }>;
};

function load(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { stamps: {} };
    const parsed = JSON.parse(raw);
    return { stamps: parsed?.stamps ?? {} };
  } catch {
    return { stamps: {} };
  }
}

function save(partial: Store) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const base = raw ? JSON.parse(raw) : {};
    const next = { ...base, ...partial };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {}
}

function stampKey(e: any) {
  const name = (e.venueName ?? e.venue?.name ?? e.locationName ?? "Venue").toString().trim();
  const loc = e.location;
  const ll =
    loc && typeof loc.lat === "number" && typeof loc.lng === "number"
      ? `${loc.lat.toFixed(3)},${loc.lng.toFixed(3)}`
      : "na";
  return `${name}|${ll}`;
}

function stampLabel(e: any) {
  const venue =
    e.venueName ??
    e.venue?.name ??
    e.locationName;

  if (venue) {
    const v = venue.toString().trim();
    return v.length > 42 ? `${v.slice(0, 42)}…` : v;
  }

  // ⭐ fallback 개선
  if (e.homeTeam && e.awayTeam) {
    return `${e.homeTeam} vs ${e.awayTeam}`;
  }

  if (e.city) {
    return `Venue in ${e.city}`;
  }

  return "Local match";
}

export function addStamp(event: Event) {
  const e: any = event;
  const key = stampKey(e);
  const store = load();

  const existed = Boolean(store.stamps[key]);
  store.stamps[key] = { key, label: stampLabel(e), lastSeen: Date.now() };

  save({ stamps: store.stamps });

  if (!existed) {
    logActivity({ type: "stamp", at: Date.now() });
    track("stamp_earned", { key });
    }
}

export function listStamps() {
  const store = load();
  return Object.values(store.stamps)
    .sort((a, b) => b.lastSeen - a.lastSeen)
    .slice(0, 50);
}

export function clearStamps() {
  save({ stamps: {} });
  track("stamps_cleared");
}
