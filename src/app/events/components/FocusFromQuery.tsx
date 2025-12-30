// src/app/events/components/FocusFromQuery.tsx

'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { Event } from '@/types';

export default function FocusFromQuery({
  events,
  onSelect,
}: {
  events: Event[];
  onSelect: (event: Event) => void;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const focusId = searchParams?.get('focus');

  useEffect(() => {
    if (!focusId) return;

    const found = events.find((e) => String(e.id) === focusId);
    if (!found) return;

    // ✅ 1. 이벤트 포커스
    onSelect(found);

    // ✅ 2. URL에서 focus 제거 (이게 핵심)
    router.replace('/events', { scroll: false });

  }, [focusId, events, onSelect, router]);

  return null;
}
