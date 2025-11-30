// src/app/profile/[userId]/components/ProfileTabs/MeetupsTab.tsx

'use client'

import MeetupCategory from './MeetupCategory'

export default function MeetupsTab({
  hosted,
  joined,
}: {
  hosted: any[]
  joined: any[]
}) {
  return (
    <div className="space-y-6 bg-background/50 p-5 rounded-xl border border-border/40">
      <MeetupCategory title="Hosted Meetups" meetups={hosted} type="hosted" />
      <MeetupCategory title="Joined Meetups" meetups={joined} type="joined" />
    </div>
  )
}
