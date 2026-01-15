//src/app/components/map-hero/PublicNotes.tsx

"use client";

import { useEffect, useState } from "react";
import { getAnonId } from "@/lib/anon";

export default function PublicNotes({ eventId }: { eventId: string }) {
  const [notes, setNotes] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    fetch(`/api/events/${eventId}/notes`)
      .then((r) => r.json())
      .then((d) => setNotes(d.notes ?? []));
  }, [eventId]);

  async function submit() {
    if (!text.trim()) return;

    await fetch(`/api/events/${eventId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        anonId: getAnonId(),
      }),
    });

    setText("");
    setOpen(false);

    const r = await fetch(`/api/events/${eventId}/notes`);
    const d = await r.json();
    setNotes(d.notes ?? []);
  }

  return (
    <div className="mt-3 space-y-2">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground flex items-center gap-1">
        <span>🔊</span>
        <span>Crowd noise</span>
      </p>

      <div className="space-y-1 pl-3 border-l border-border/60">
        {notes.map((n) => (
          <p key={n.id} className="text-sm leading-snug">
          {n.text}
          </p>
        ))}
      </div>

      <div className="pt-1">
        <button
          onClick={() => setOpen(true)}
          className="text-xs text-blue-600 font-semibold"
        >
          Say something →
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50">
          <button
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />

          <div className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl p-4">
            <p className="text-[11px] text-muted-foreground text-center">
              Worth watching? · Anyone going? · Big game?
            </p>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Feels like…"
              maxLength={80}
              className="w-full rounded-full px-4 py-2 bg-muted/30"
            />

            <button
              onClick={submit}
              className="mt-3 w-full rounded-full bg-primary text-primary-foreground py-2 font-semibold"
            >
              Send →
            </button>

            {/* 👇 4) 휘발성 선언 (입력 후 불안 제거) */}
            <p className="text-[11px] text-muted-foreground text-center">
                Just quick thoughts — nothing sticks.
            </p>
            
          </div>
        </div>
      )}
    </div>
  );
}
