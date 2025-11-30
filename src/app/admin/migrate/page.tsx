// src/app/admin/migrate/page.tsx
"use client";

import { useState } from "react";

export default function MigratePage() {
  const [loading, setLoading] = useState(false);

  const handleMigrate = async (type: "posts" | "comments") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/migrate/${type}`, { method: "POST" });
      const data = await res.json();
      alert(
        data.success
          ? `✅ ${type === "posts" ? "Posts" : "Comments"} migration complete!`
          : `❌ ${type === "posts" ? "Posts" : "Comments"} migration failed.`
      );
    } catch {
      alert(`❌ ${type === "posts" ? "Posts" : "Comments"} migration failed.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 min-h-dvh bg-surface text-foreground">
      <section className="mx-auto max-w-md rounded-2xl bg-card p-6 shadow-lg border border-border">
        <h1 className="text-xl font-semibold mb-6">Migration Tool</h1>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => handleMigrate("posts")}
            disabled={loading}
            className="rounded-lg bg-primary text-primary-foreground px-4 py-2 font-medium hover:bg-primary/80 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Migrating..." : "Migrate Posts Now"}
          </button>

          <button
            onClick={() => handleMigrate("comments")}
            disabled={loading}
            className="rounded-lg bg-secondary text-secondary-foreground px-4 py-2 font-medium hover:bg-secondary/80 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Migrating..." : "Migrate Comments Now"}
          </button>
        </div>
      </section>
    </main>
  );
}
