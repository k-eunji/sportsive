//src/app/explore/components/ExploreSearch.tsx

"use client";

type Props = {
  query: string;
  setQuery: (value: string) => void;
};

export default function ExploreSearch({ query, setQuery }: Props) {
  return (
    <div className="mb-8">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search teams, matches, posts…"
        className="
          w-full px-4 py-3 
          bg-gray-50 dark:bg-neutral-900
          border border-gray-300 dark:border-neutral-700
          rounded-xl
          text-sm text-gray-900 dark:text-gray-100
          focus:outline-none focus:ring-2 focus:ring-blue-600
        "
      />
    </div>
  );
}
