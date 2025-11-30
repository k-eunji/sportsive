// src/app/profile/[userId]/components/ProfileTabs/AboutTab.tsx

'use client'

export default function AboutTab({ bio }: { bio?: string }) {
  return (
    <div className="bg-background dark:bg-foreground/5 p-5 rounded-xl text-sm text-muted-foreground leading-relaxed border border-border/40">
      <p>
        {bio ||
          "This user hasn’t added an introduction yet. Maybe you’ll see them at the next match! ⚽"}
      </p>
    </div>
  )
}
