// src/app/live/[sport]/[liveId]/components/MessageList.tsx

'use client'

import type { Message } from '@/types'

interface Props {
  messages: Message[]
}

export default function MessageList({ messages }: Props) {
  return (
    <div className="flex-1 overflow-y-auto space-y-2 px-2 py-3">
      {messages.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No messages yet. Be the first to say something!
        </p>
      ) : (
        messages.map((msg) => (
          <div
            key={msg.id}
            className="rounded-lg px-3 py-2 bg-muted/20 text-foreground text-sm break-words"
          >
            <div className="flex items-baseline justify-between gap-2">
              <strong className="font-medium">{msg.user}</strong>
              <span
                className="text-[11px] text-muted-foreground"
                aria-label={`Sent at ${new Date(msg.timestamp).toLocaleTimeString()}`}
              >
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <p className="mt-0.5">{msg.content}</p>
          </div>
        ))
      )}
    </div>
  )
}
