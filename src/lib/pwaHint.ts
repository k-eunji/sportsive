// src/lib/pwaHint.ts
export function shouldShowPwaHint() {
  if (typeof window === "undefined") return false;

  const isMobile = /iphone|ipad|android/i.test(navigator.userAgent);
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as any).standalone === true;

  const seen = localStorage.getItem("sportsive_pwa_hint_seen");

  return isMobile && !isStandalone && !seen;
}

export function markPwaHintSeen() {
  localStorage.setItem("sportsive_pwa_hint_seen", "1");
}
