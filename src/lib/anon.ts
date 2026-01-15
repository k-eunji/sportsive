//src/lib/anon.ts

export function getAnonId() {
  if (typeof window === "undefined") return "server";

  const KEY = "sportsive_anon_id";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}
