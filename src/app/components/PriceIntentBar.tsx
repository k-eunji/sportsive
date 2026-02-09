//src/app/components/home/PriceIntentBar.tsx

"use client";

export type PriceFilter = "all" | "free" | "paid";

export default function PriceIntentBar({
  value,
  onChange,
  disabled,
}: {
  value: PriceFilter;
  onChange: (v: PriceFilter) => void;
  disabled?: boolean;
}) {
  const options: { key: PriceFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "free", label: "Walk-in" },
    { key: "paid", label: "Ticketed" },
  ];

  return (
    <div
      className={`
        inline-flex items-center
        rounded-full
        ring-1 ring-border/40
        p-1
        ${disabled ? "opacity-40 pointer-events-none" : ""}
      `}
    >
      {options.map((o) => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          className={[
            "px-2.5 py-1.5 text-[12px] font-semibold rounded-full transition",
            value === o.key
              ? "bg-foreground text-background shadow-sm"
              : "text-muted-foreground",
          ].join(" ")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
