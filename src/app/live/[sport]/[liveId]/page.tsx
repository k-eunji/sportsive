// src/app/live/[sport]/[liveId]/page.tsx

'use client'

import React from 'react'
import LiveRoomView from '@/app/live/LiveRoomView'

export default function Page({
  params,
}: {
  params: Promise<{ sport: string; liveId: string }>
}) {
  const resolved = React.use(params);
  if (!resolved) return null;

  const { sport, liveId } = resolved;

  return (
    <LiveRoomView
      sport={sport}
      liveId={liveId}
      variant="page"
    />

  );
}
