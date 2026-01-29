// src/lib/clientId.ts

export function getClientId(): string {
  if (typeof window === "undefined") {
    return "server";
  }

  const KEY = "sportsive_client_id";
  let id = localStorage.getItem(KEY);

  if (!id) {
    // ✅ Safari(iOS) 대응
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      id = crypto.randomUUID();
    } else {
      // fallback UUID (모든 브라우저 동작)
      id = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        }
      );
    }

    localStorage.setItem(KEY, id);
  }

  return id;
}
