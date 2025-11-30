// src/app/profile/[userId]/components/HeaderSection/LevelModal.tsx

'use client'

import { Trophy, X } from 'lucide-react'
import { LEVELS } from '@/lib/levels'

export default function LevelModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X size={18} />
        </button>

        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Trophy className="text-yellow-500" /> Level Guide
        </h2>

        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {LEVELS.map((lvl) => (
            <div
              key={lvl.name}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition"
            >
              <div>
                <div className="font-semibold" style={{ color: lvl.color }}>
                  {lvl.name}
                </div>
                <div className="text-xs text-gray-500">{lvl.desc}</div>
              </div>
              <div className="text-sm font-medium text-gray-600">
                {lvl.min} – {lvl.max === Infinity ? '∞' : lvl.max} pts
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

