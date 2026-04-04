'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { getOccasion } from '@/lib/occasions'
import BottomNav from '@/components/BottomNav'

function WishCard({ wish, onDelete }) {
  const occ = getOccasion(wish.occasion)
  const wishUrl = typeof window !== 'undefined' ? `${window.location.origin}/v/${wish.id}` : `/v/${wish.id}`

  const formatDate = (d) => {
    if (!d) return null
    return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const copyLink = (e) => {
    e.preventDefault()
    navigator.clipboard.writeText(wishUrl).then(() => toast.success('Link copied!')).catch(() => {})
  }

  return (
    <div className="bg-white border border-[#e5e5e3] rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 p-4 pb-3">
        <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: occ.bg }}>
          <span style={{ fontSize: 20 }}>{occ.emoji}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-[14px] text-gray-800 truncate">{occ.label} — {wish.recipient}</p>
          <p className="text-[12px] text-gray-400 mt-0.5">
            {wish.from_name && `From ${wish.from_name} · `}
            {wish.date ? formatDate(wish.date) : 'No date'} · {wish.scans || 0} scan{wish.scans !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <p className="px-4 pb-3 text-[13px] text-gray-500 line-clamp-2 leading-relaxed">{wish.message}</p>

      <div className="flex border-t border-[#f0f0ee]">
        <button onClick={copyLink} className="flex-1 py-2.5 text-[12px] font-medium text-gray-500 hover:bg-gray-50 transition-colors">
          Copy link
        </button>
        <div className="w-px bg-[#f0f0ee]" />
        <Link href={`/v/${wish.id}`} target="_blank" className="flex-1 py-2.5 text-[12px] font-medium text-center text-[#1D9E75] hover:bg-[#f0faf6] transition-colors">
          Preview
        </Link>
        <div className="w-px bg-[#f0f0ee]" />
        <button
          onClick={() => onDelete(wish.id)}
          className="flex-1 py-2.5 text-[12px] font-medium text-red-400 hover:bg-red-50 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  )
}

export default function MyWishesPage() {
  const [wishes, setWishes] = useState([])
  const [loading, setLoading] = useState(true)

  const loadWishes = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/wishes')
      const data = await res.json()
      setWishes(data.wishes || [])
    } catch {
      toast.error('Failed to load wishes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadWishes() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this wish? The QR link will stop working.')) return
    try {
      await fetch(`/api/wishes/${id}`, { method: 'DELETE' })
      setWishes((w) => w.filter((x) => x.id !== id))
      toast.success('Wish deleted')
    } catch {
      toast.error('Delete failed')
    }
  }

  const totalScans = wishes.reduce((a, w) => a + (w.scans || 0), 0)
  const uniqueOccasions = [...new Set(wishes.map((w) => w.occasion))].length

  return (
    <div className="app-container">
      {/* Header */}
      <div className="pt-8 pb-4">
        <h1 className="font-display text-[26px] font-semibold text-gray-900">
          Wish<span className="italic text-[#1D9E75]">Link</span>
        </h1>
        <p className="text-[13px] text-gray-400 mt-0.5">All your QR wishes</p>
      </div>

      {/* Stats */}
      {wishes.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-5">
          {[
            { val: wishes.length, label: 'Total' },
            { val: totalScans, label: 'Scans' },
            { val: uniqueOccasions, label: 'Occasions' },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-[#e5e5e3] rounded-xl p-3 text-center">
              <div className="text-[22px] font-medium text-gray-800">{s.val}</div>
              <div className="text-[11px] text-gray-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-12 gap-3 text-gray-400 text-[14px]">
          <div className="w-4 h-4 border-2 border-[#e5e5e3] border-t-[#1D9E75] rounded-full animate-spin" />
          Loading wishes…
        </div>
      ) : wishes.length === 0 ? (
        <div className="text-center py-14">
          <div className="text-4xl mb-3">✨</div>
          <p className="font-display text-[18px] font-semibold text-gray-700 mb-1">No wishes yet</p>
          <p className="text-[13px] text-gray-400 mb-5">Create your first QR wish and share the magic</p>
          <Link href="/" className="inline-block px-6 py-3 bg-[#1D9E75] text-white rounded-xl text-[14px] font-medium hover:bg-[#085041] transition-colors">
            Create a wish
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {wishes.map((w) => (
            <WishCard key={w.id} wish={w} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  )
}
