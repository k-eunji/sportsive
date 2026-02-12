//src/app/components/DateNav.tsx

"use client";

import Link from "next/link";

export function DateNav({ date }: { date: string }) {
  const d = new Date(date);

  const prev = new Date(d);
  prev.setDate(d.getDate() - 1);

  const next = new Date(d);
  next.setDate(d.getDate() + 1);

  const prevKey = prev.toISOString().slice(0, 10);
  const nextKey = next.toISOString().slice(0, 10);

  return (
    <div className="flex justify-between mt-8">
      <Link href={`/uk/sports/${prevKey}`} className="underline">
        ← {prevKey}
      </Link>

      <Link href={`/uk/sports/${nextKey}`} className="underline">
        {nextKey} →
      </Link>
    </div>
  );
}
