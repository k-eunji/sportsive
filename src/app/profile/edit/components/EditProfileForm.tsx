// src/app/profile/edit/components/EditProfileForm.tsx

'use client'

import { useState } from 'react'
import type { ProfileUser } from '@/types/user'

export default function EditProfileForm({
  profile,
  onSave,
}: {
  profile: ProfileUser
  onSave: (updated: Partial<ProfileUser>) => void
}) {
  const [form, setForm] = useState({
    displayName: profile.displayName || '',
    region: profile.region || '',
    bio: profile.bio || '',
    sports: profile.sports?.join(', ') || '',
  })

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...profile,
      displayName: form.displayName,
      region: form.region,
      bio: form.bio,
      sports: form.sports
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-background border border-border/40 p-6 rounded-2xl shadow-sm space-y-5"
    >
      {/* 이름 */}
      <div>
        <label className="block text-sm text-muted-foreground mb-1">
          Display Name
        </label>
        <input
          type="text"
          value={form.displayName}
          onChange={(e) => handleChange('displayName', e.target.value)}
          className="w-full border border-border rounded-lg p-2 bg-muted/20 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Your name"
        />
      </div>

      {/* 지역 */}
      <div>
        <label className="block text-sm text-muted-foreground mb-1">
          Region
        </label>
        <input
          type="text"
          value={form.region}
          onChange={(e) => handleChange('region', e.target.value)}
          className="w-full border border-border rounded-lg p-2 bg-muted/20 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Seoul, Korea"
        />
      </div>

      {/* 스포츠 */}
      <div>
        <label className="block text-sm text-muted-foreground mb-1">
          Favorite Sports (comma separated)
        </label>
        <input
          type="text"
          value={form.sports}
          onChange={(e) => handleChange('sports', e.target.value)}
          className="w-full border border-border rounded-lg p-2 bg-muted/20 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Soccer, Basketball"
        />
      </div>

      {/* 소개 */}
      <div>
        <label className="block text-sm text-muted-foreground mb-1">
          Bio
        </label>
        <textarea
          value={form.bio}
          onChange={(e) => handleChange('bio', e.target.value)}
          className="w-full border border-border rounded-lg p-2 bg-muted/20 text-foreground placeholder:text-muted-foreground min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Tell others about yourself..."
        />
      </div>

      {/* 버튼 영역 */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => history.back()}
          className="px-4 py-2 rounded-lg border border-border text-muted-foreground hover:bg-accent/10 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </form>
  )
}
