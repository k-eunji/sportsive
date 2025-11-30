//src/app/explore/components/ExploreQuickFilters.tsx

"use client";

export default function ExploreQuickFilters() {
  const items = [
    { name: "Football", icon: "⚽", query: "football" },
    { name: "Rugby", icon: "🏉", query: "rugby" },
    { name: "Tennis", icon: "🎾", query: "tennis" },
    { name: "F1", icon: "🏎️", query: "f1" },
    { name: "Cricket", icon: "🏏", query: "cricket" },
  ];

  return (
    <section>
      <h2 className="text-[15px] font-semibold mb-3">Quick Filters</h2>

      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <a
            key={item.query}
            href={`/events?category=${item.query}`}
            className="
              px-4 py-2 rounded-full text-sm font-medium
              bg-gray-100 dark:bg-neutral-800 
              text-gray-800 dark:text-gray-200
              active:scale-[0.97] transition
              flex items-center gap-2
            "
          >
            <span>{item.icon}</span> {item.name}
          </a>
        ))}
      </div>
    </section>
  );
}
