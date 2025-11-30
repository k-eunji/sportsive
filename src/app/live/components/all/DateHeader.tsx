//src/app/live/components/all/DateHeader.tsx

"use client";

export default function DateHeader({ date }: { date: string }) {
  const d = new Date(date);

  const formatted = d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return (
    <div className="sticky top-[110px] bg-background z-10 py-2">
      <div className="font-semibold text-sm opacity-80">{formatted}</div>
    </div>
  );
}
