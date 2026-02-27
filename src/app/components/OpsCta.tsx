//src/app/components/OpsCta.tsx

'use client';

import Link from "next/link";
import { getClientId } from "@/lib/clientId";
import { usePathname } from "next/navigation";

export default function OpsCta() {
  const pathname = usePathname();

  const handleClick = async () => {
    await fetch('/api/log/map-switch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: getClientId(),
        pathname,
        referrer: document.referrer || null,
        source: "date_export_map_link"
      }),
    });
  };

  return (
    <Link
      href="/ops"
      onClick={handleClick}
      className="text-xs text-muted-foreground underline underline-offset-4 hover:opacity-80 transition"
    >
      Explore on map →
    </Link>
  );
}