// src/app/events/components/FocusFromQuery.tsx
'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Event } from '@/types';

export default function FocusFromQuery({
  events,
  onSelect,
}: {
  events: Event[];
  onSelect: (event: Event) => void;
}) {
  const searchParams = useSearchParams();
  const focusId = searchParams?.get('focus'); // ✅ 여기 핵심 수정

  useEffect(() => {
    if (!focusId) return;

    const found = events.find((e) => e.id === focusId);
    if (found) onSelect(found);
  }, [focusId, events, onSelect]);

  return null;
}
