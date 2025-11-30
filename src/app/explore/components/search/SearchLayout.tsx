//src/app/explore/components/search/SearchLayout.tsx

"use client";

import { ReactNode } from "react";

type Props = {
  query: string;
  loading: boolean;
  hasResults: boolean;
  children: ReactNode;
};

export default function SearchLayout({
  query,
  loading,
  hasResults,
  children,
}: Props) {
  if (!query || query.length < 2) return null;

  return (
    <section className="mt-6">

      {/* Searching indicator */}
      {loading && (
        <p className="text-gray-500 mt-4 animate-pulse">Searching…</p>
      )}

      {/* Results */}
      {!loading && hasResults && (
        <div className="space-y-10">
          {children}
        </div>
      )}

      {/* Empty */}
      {!loading && !hasResults && (
        <p className="text-gray-500 text-sm">
          No results found for “{query}”.
        </p>
      )}
    </section>
  );
}
