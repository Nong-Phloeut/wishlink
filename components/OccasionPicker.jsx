'use client'
import { OCCASIONS } from '@/lib/occasions'

export default function OccasionPicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {OCCASIONS.map((occ) => {
        const selected = value === occ.id
        return (
          <button
            key={occ.id}
            type="button"
            onClick={() => onChange(occ.id)}
            className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl border transition-all"
            style={{
              background: selected ? occ.bg : 'white',
              borderColor: selected ? occ.accent : '#e5e5e3',
              borderWidth: selected ? '1.5px' : '0.5px',
            }}
          >
            <span style={{ fontSize: 22, lineHeight: 1 }}>{occ.emoji}</span>
            <span
              className="text-[11px] font-medium"
              style={{ color: selected ? occ.fg : '#888' }}
            >
              {occ.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
