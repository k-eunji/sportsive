//src/app/fanhub/components/item/TagList.tsx

"use client";

export default function TagList({ tags = [] }: { tags?: string[] }) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {tags.map((t) => (
        <a
          key={t}
          href={`/fanhub?tag=${t}`}
          className="px-2 py-1 bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 rounded-md text-xs"
        >
          #{t}
        </a>
      ))}
    </div>
  );
}
