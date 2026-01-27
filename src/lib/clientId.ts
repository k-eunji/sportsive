//src/lib/clientId.ts

export function getClientId(): string {
  if (typeof window === "undefined") {
    return "server";
  }

  const KEY = "sportsive_client_id";
  let id = localStorage.getItem(KEY);

  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }

  return id;
}
