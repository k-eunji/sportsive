// src/components/DateFormatterClient.tsx

"use client";

import React, { useState, useEffect } from "react";

type Props = {
  timestamp: number | null;
};

export default function DateFormatterClient({ timestamp }: Props) {
  const [formatted, setFormatted] = useState("");

  useEffect(() => {
    if (!timestamp) {
      setFormatted("Invalid date");
      return;
    }
    const date = new Date(timestamp);
    setFormatted(
      date.toLocaleString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  }, [timestamp]);

  if (!formatted) return <span suppressHydrationWarning>Loading...</span>;

  return <span>{formatted}</span>;
}
