'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getOccasion } from '@/lib/occasions'
import BottomNav from '@/components/BottomNav'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function MyWishesPage() {
  const [wishes, setWishes] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('my_wishes') || '[]')
    setWishes(stored)
    setLoaded(true)
  }, [])

  const copyLink = (id) => {
    const url = `${window.location.origin}/v/${id}`
    navigator.clipboard.writeText(url).then(() => {
      // Show brief feedback
      setCopied(id)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  const [copied, setCopied] = useState(null)

  const shareLink = async (wish) => {
    const url = `${window.location.origin}/v/${wish.id}`
    if (navigator.share) {
      await navigator.share({ title: `A wish for ${wish.recipient}`, url })
    } else {
      copyLink(wish.id)
    }
  }

  const deleteWish = (id) => {
    const updated = wishes.filter((w) => w.id !== id)
    setWishes(updated)
    localStorage.setItem('my_wishes', JSON.stringify(updated))
  }

  const formatDate = (d) => {
    if (!d) return ''
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-[430px] mx-auto px-4 pb-32">

        {/* Header */}
        <div className="pt-8 pb-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-stone-900">
                My <span className="text-[#1D9E75]">Wishes</span>
              </h1>
              <p className="text-[11px] text-stone-400 mt-0.5">
                {loaded && wishes.length > 0
                  ? `${wishes.length} wish${wishes.length > 1 ? 'es' : ''} on this device`
                  : 'Saved on this device'}
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#1D9E75]/10 flex items-center justify-center text-lg">
              📋
            </div>
          </div>
        </div>

        {!loaded ? (
          // Skeleton loading
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-stone-200/60 rounded-2xl animate-pulse" />
            ))}
          </div>

        ) : wishes.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">🎁</div>
            <h2 className="text-[16px] font-semibold text-stone-700 mb-2">No wishes yet</h2>
            <p className="text-[13px] text-stone-400 mb-6 leading-relaxed px-6">
              Wishes you create will appear here so you can share them anytime.
            </p>
            <Link href="/">
              <Button className="rounded-xl bg-[#1D9E75] hover:bg-[#178060] text-[13px]">
                Create your first wish →
              </Button>
            </Link>
          </div>

        ) : (
          <div className="space-y-3">
            {/* Device warning */}
            <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl px-3.5 py-3">
              <span className="text-base mt-0.5">💡</span>
              <p className="text-[11px] text-amber-700 leading-relaxed">
                Wishes are saved on this device only. Sign in with Google to access them from anywhere.
              </p>
            </div>

            {wishes.map((wish) => {
              const occ = getOccasion(wish.occasion)
              const wishUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/v/${wish.id}`

              return (
                <Card key={wish.id} className="border-stone-200 shadow-sm overflow-hidden">
                  {/* Color accent bar */}
                  <div className="h-1 w-full" style={{ background: occ.accent }} />

                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Emoji */}
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                          style={{ background: occ.bg }}
                        >
                          {occ.emoji}
                        </div>

                        {/* Info */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-[14px] font-semibold text-stone-800 truncate">
                              {wish.recipient}
                            </p>
                            <Badge
                              className="text-[9px] font-medium flex-shrink-0"
                              style={{
                                background: occ.bg,
                                color: occ.accent,
                                border: `1px solid ${occ.border}`,
                              }}
                            >
                              {occ.label}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-stone-400 truncate">
                            {wish.message}
                          </p>
                          <p className="text-[10px] text-stone-300 mt-0.5">
                            {formatDate(wish.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-3">
                      <Link href={`/v/${wish.id}`} className="flex-1">
                        <Button
                          variant="outline"
                          className="w-full rounded-xl border-stone-200 text-stone-600 text-[12px] h-9"
                        >
                          👁 View
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        onClick={() => copyLink(wish.id)}
                        className={cn(
                          'flex-1 rounded-xl border-stone-200 text-[12px] h-9 transition-colors',
                          copied === wish.id
                            ? 'border-[#1D9E75] text-[#1D9E75] bg-[#F0FDF8]'
                            : 'text-stone-600'
                        )}
                      >
                        {copied === wish.id ? '✓ Copied' : '📋 Copy'}
                      </Button>
                      <Button
                        onClick={() => shareLink(wish)}
                        className="flex-1 rounded-xl bg-[#1D9E75] hover:bg-[#178060] text-[12px] h-9"
                      >
                        🔗 Share
                      </Button>
                      <button
                        onClick={() => deleteWish(wish.id)}
                        className="w-9 h-9 flex items-center justify-center rounded-xl border border-stone-200 text-stone-300 hover:text-red-400 hover:border-red-200 transition-colors text-[13px]"
                      >
                        ×
                      </button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            {/* Sign in CTA */}
            <Card className="border-dashed border-stone-200 shadow-none bg-transparent">
              <CardContent className="pt-4 pb-4 text-center">
                <p className="text-[12px] text-stone-400 mb-3">
                  Sign in to sync your wishes across devices
                </p>
                <Button
                  variant="outline"
                  className="rounded-xl border-stone-200 text-stone-600 text-[12px] gap-2"
                  onClick={async () => {
                    const { supabase } = await import('@/lib/supabase')
                    supabase.auth.signInWithOAuth({
                      provider: 'google',
                      options: { redirectTo: `${window.location.origin}/auth/callback?next=/my-wishes` }
                    })
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}