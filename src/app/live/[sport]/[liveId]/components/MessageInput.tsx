// src/app/live/[sport]/[liveId]/components/MessageInput.tsx

'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'

export default function MessageInput({ onSend, liveId }: any) {
  const [text, setText] = useState('')

  const submit = () => {
    const content = text.trim()
    if (!content) return
    onSend(content)
    setText('')
  }

  return (
    <div className="backdrop-blur-xl bg-background/60 border-t border-border px-4 py-3 flex items-center gap-2">
      <input
        type="text"
        className="flex-1 bg-muted/30 rounded-full px-4 py-2 text-sm focus:outline-none"
        placeholder="Type a message…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
      />
      <button
        onClick={submit}
        className="p-3 rounded-full bg-primary text-primary-foreground"
      >
        <Send size={18} />
      </button>
    </div>
  )
}
