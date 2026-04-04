'use client'
import { getOccasion } from '@/lib/occasions'

export default function RevealCard({ wish, compact = false }) {
  const occ = getOccasion(wish.occasion)

  const formatDate = (d) => {
    if (!d) return null
    const dt = new Date(d + 'T00:00:00')
    return dt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div
      className="rounded-2xl p-6 text-center relative overflow-hidden"
      style={{ background: occ.bg, border: `1px solid ${occ.border}` }}
    >
      {/* Decorative circles */}
      <div
        className="absolute top-[-24px] right-[-24px] w-24 h-24 rounded-full opacity-30"
        style={{ background: occ.border }}
      />
      <div
        className="absolute bottom-[-16px] left-[-16px] w-16 h-16 rounded-full opacity-20"
        style={{ background: occ.accent }}
      />

      <div className="relative z-10">
        <div style={{ fontSize: compact ? 40 : 52 }} className="mb-2 leading-none">
          {occ.emoji}
        </div>

        <div
          className="text-[11px] font-medium tracking-widest uppercase mb-1"
          style={{ color: occ.accent }}
        >
          {occ.label}
        </div>

        <div
          className="font-display mb-3"
          style={{
            fontSize: compact ? 20 : 26,
            fontWeight: 600,
            color: occ.fg,
          }}
        >
          {wish.recipient}
        </div>

        <p
          className="leading-relaxed"
          style={{ fontSize: compact ? 13 : 15, color: occ.fg, opacity: 0.9 }}
        >
          {wish.message}
        </p>

        {(wish.from_name || wish.date) && (
          <div
            className="mt-4 text-xs flex items-center justify-center gap-2"
            style={{ color: occ.fg, opacity: 0.6 }}
          >
            {wish.from_name && <span>From {wish.from_name}</span>}
            {wish.from_name && wish.date && <span>·</span>}
            {wish.date && <span>{formatDate(wish.date)}</span>}
          </div>
        )}
      </div>
    </div>
  )
}
