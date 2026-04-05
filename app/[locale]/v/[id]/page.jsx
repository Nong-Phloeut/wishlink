import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getOccasion } from '@/lib/occasions'
import RevealCard from '@/components/RevealCard'
import Link from 'next/link'

export async function generateMetadata({ params }) {
  const { id } = await params
  const { data: wish } = await supabase.from('wishes').select('*').eq('id', id).single()
  if (!wish) return { title: 'Wish not found — WishLink' }
  const occ = getOccasion(wish.occasion)
  return {
    title: `${occ.label} wish for ${wish.recipient} — WishLink`,
    description: wish.message.slice(0, 120),
  }
}

export default async function RevealPage({ params }) {
  const { id } = await params

  const { data: wish, error } = await supabase.from('wishes').select('*').eq('id', id).single()

  if (error || !wish) notFound()

  // Increment scan count
  await supabase.from('wishes').update({ scans: (wish.scans || 0) + 1 }).eq('id', id)

  const occ = getOccasion(wish.occasion)

  return (
    <div className="min-h-screen flex flex-col" style={{ background: occ.bg }}>
      <div className="max-w-[480px] mx-auto w-full px-5 py-10 flex-1 flex flex-col justify-center">
        {/* Animated reveal wrapper */}
        <div
          style={{
            animation: 'fadeUp 0.6s ease both',
          }}
        >
          <RevealCard wish={wish} />
        </div>

        {/* Footer CTA */}
        <div className="mt-8 text-center">
          <p className="text-[12px] mb-3" style={{ color: occ.fg, opacity: 0.5 }}>
            Made with WishLink
          </p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 rounded-xl text-[13px] font-medium transition-colors"
            style={{ background: occ.accent, color: '#fff' }}
          >
            Create your own wish →
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
