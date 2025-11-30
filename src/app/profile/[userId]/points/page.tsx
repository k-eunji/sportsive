//src/app/profile/[userId]/points/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Trophy, Star, ArrowLeft } from 'lucide-react'

export default function PointsPage() {
  const { userId } = useParams() as { userId: string }
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    ;(async () => {
      try {
        const res = await fetch(`/api/users/${userId}/points`, { cache: 'no-store' })
        const data = await res.json()
        setLogs(data.logs || [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    })()
  }, [userId])

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-8">
      {/* ✅ Header */}
      <header className="flex items-center gap-2">
        <a
          href={`/profile/${userId}`}
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          <ArrowLeft size={14} /> Back
        </a>
        <h1 className="text-2xl font-bold ml-2 flex items-center gap-2">
          <Star className="text-yellow-500" /> My Points
        </h1>
      </header>

      {/* ✅ How to Earn Points */}
      <section className="bg-muted/30 border border-border/40 rounded-xl p-5 space-y-3">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <Trophy className="text-yellow-400" /> How to Earn Points
        </h2>
        <ul className="text-sm leading-relaxed text-muted-foreground space-y-1">
          <li>🏆 Host Meetup (after confirmed): <b>+200 pts</b></li>
          <li>🤝 Join Meetup: <b>+50 pts</b></li>
          <li>📝 Write Review: <b>+20 pts</b></li>
          <li>💬 Participate in Live Chat: <b>+5 pts</b></li>
          <li>⭐ Receive Like: <b>+2 pts</b></li>
          <li>🙌 Gain a Fan: <b>+3 pts</b></li>
          <li>🚫 Reported by others: <b>-20 pts</b></li>
        </ul>
      </section>

      {/* ✅ Recent Point Activity */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Recent Point Activity</h2>

        {loading ? (
          <p className="text-sm text-muted-foreground italic">Loading...</p>
        ) : logs.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No point activity yet.
          </p>
        ) : (
          <div className="border rounded-xl divide-y bg-background">
            {logs.map((log) => (
              <div key={log.id} className="flex justify-between items-center p-3 text-sm">
                <div>
                  <div className="font-medium">{log.description || log.action}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString('en-GB', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </div>
                </div>
                <div
                  className={`font-bold ${
                    log.delta > 0 ? 'text-green-600' : 'text-red-500'
                  }`}
                >
                  {log.delta > 0 ? '+' : ''}
                  {log.delta}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
