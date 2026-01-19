// src/app/components/home/MapPanel.tsx
"use client";

import { useState } from "react";

export default function MapPanel({
  children,
  defaultOpen = false,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="w-full">
      <div className="w-full px-4 md:max-w-3xl md:mx-auto">
        <button
            onClick={() => setOpen((v) => !v)}
            className="w-full flex items-center justify-between py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition"
            >

          <span>{open ? "Hide map" : "Show on map"}</span>
          <span className="text-xs text-muted-foreground">
            {open ? "Collapse" : "Expand"}
          </span>
        </button>

        {open && <div className="pt-3">{children}</div>}
      </div>
    </section>
  );
}
