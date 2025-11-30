// src/components/DateFormatter.tsx

"use client";

import { useEffect, useState } from "react";

type Props = {
  timestamp: number;  // 무조건 숫자로 받기
};

export default function DateFormatter({ timestamp }: Props) {
  const [formatted, setFormatted] = useState<string | null>(null);

  useEffect(() => {
    if (timestamp === undefined || timestamp === null) return;

    const date = new Date(timestamp);
    setFormatted(
      date.toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  }, [timestamp]);

  if (formatted === null) return <span suppressHydrationWarning>Loading...</span>;

  return <span>{formatted}</span>;
}

