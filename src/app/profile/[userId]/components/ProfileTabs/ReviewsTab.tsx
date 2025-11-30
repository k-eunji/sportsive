// src/app/profile/[userId]/components/ProfileTabs/ReviewsTab.tsx

'use client'

import { Star, MessageCircle } from 'lucide-react'

export default function ReviewsTab({ reviews }: { reviews: any[] }) {
  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-8 rounded-xl border border-dashed border-border bg-background/60 text-center">
        <p className="text-sm font-medium text-foreground">
          No reviews yet
        </p>
        <p className="text-xs text-muted-foreground">
          Join or host meetups to receive your first review.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reviews.map((r) => (
        <div
          key={r.id}
          className="bg-background border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition"
        >
          <div className="flex items-center justify-between">
            <p className="font-semibold text-foreground">@{r.reviewer}</p>

            <div className="flex items-center gap-1 text-yellow-400">
              {Array.from({ length: r.rating || 0 }).map((_, i) => (
                <Star key={i} size={16} fill="currentColor" />
              ))}
            </div>
          </div>

          {r.comment && (
            <p className="text-sm text-muted-foreground mt-2">{r.comment}</p>
          )}

          <div className="flex items-center gap-1 text-xs text-primary mt-2">
            <MessageCircle size={12} /> {r.sport || 'Sports'}
          </div>
        </div>
      ))}
    </div>
  )
}
