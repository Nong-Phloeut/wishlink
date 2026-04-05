'use client'
import { useState, useEffect } from 'react'
import { getOccasion } from '@/lib/occasions'
import { ChevronDown, Sparkles, MousePointer2, Heart } from 'lucide-react'
import Link from 'next/link'

export default function RevealClient({ wish }) {
  const [hasRevealed, setHasRevealed] = useState(false)
  const [imageList, setImageList] = useState([])
  
  const occ = getOccasion(wish?.occasion)

  useEffect(() => {
    if (wish?.image_urls) {
      try {
        // Handle if Supabase returns a string instead of an array
        const parsed = typeof wish.image_urls === 'string' 
          ? JSON.parse(wish.image_urls) 
          : wish.image_urls
        
        setImageList(Array.isArray(parsed) ? parsed : [parsed])
      } catch (e) {
        console.error("Error parsing image_urls:", e)
        setImageList([])
      }
    }
  }, [wish])

  if (!wish) return null

  const hasMedia = imageList.length > 0 || wish.video_url

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      
      {/* ── 1. THE MYSTERY COVER ── */}
      {!hasRevealed && (
        <div 
          onClick={() => setHasRevealed(true)}
          className="fixed inset-0 z-[100] cursor-pointer flex flex-col items-center justify-center p-6 text-center touch-none"
          style={{ background: `radial-gradient(circle at center, ${occ.bg} 0%, #ffffff 100%)` }}
        >
          <div className="animate-float text-[100px] mb-8 drop-shadow-2xl">
            {occ.emoji}
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-stone-900 tracking-tight">
              A surprise for {wish.recipient}!
            </h2>
            <div className="flex items-center justify-center gap-2 text-[#1D9E75] font-black uppercase text-[11px] tracking-[0.25em] animate-pulse">
              <MousePointer2 size={16} />
              Tap to open
            </div>
          </div>
        </div>
      )}

      {/* ── 2. THE REVEAL CONTENT ── */}
      <main className={`transition-all duration-1000 ${hasRevealed ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Full-Screen Hero */}
        <section 
          className="relative h-[100dvh] flex flex-col items-center justify-center px-10 text-center"
          style={{ background: `linear-gradient(to bottom, ${occ.bg}55, #ffffff)` }}
        >
          <div className="max-w-xl space-y-8 animate-in fade-in zoom-in-95 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-white shadow-sm mb-4">
               <Heart size={12} className="text-[#1D9E75] fill-[#1D9E75]" />
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-500">
                {occ.label}
              </p>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black text-stone-900 tracking-tighter leading-none">
              {wish.recipient}
            </h1>

            <p className="text-2xl md:text-4xl font-bold text-stone-800 leading-tight tracking-tight italic">
              "{wish.message}"
            </p>

            <p className="text-lg font-bold text-stone-400 mt-12">— {wish.sender || 'Someone Special'}</p>
          </div>

          {hasMedia && (
            <div className="absolute bottom-10 flex flex-col items-center gap-2 text-stone-300 animate-bounce">
              <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">Scroll for Memories</span>
              <ChevronDown size={24} />
            </div>
          )}
        </section>

        {/* ── IMMERSIVE GALLERY ── */}
        {hasMedia && (
          <section className="bg-white py-10 px-5 max-w-screen-md mx-auto space-y-12">
            <div className="flex items-center gap-4 mb-10">
              <div className="h-px flex-1 bg-stone-100" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-300">Our Gallery</span>
              <div className="h-px flex-1 bg-stone-100" />
            </div>

            {/* Images Mapping */}
            <div className="flex flex-col gap-12">
              {imageList.map((url, index) => (
                <div 
                  key={index}
                  className="w-full rounded-[2.5rem] overflow-hidden bg-stone-50 shadow-2xl border-4 border-white ring-1 ring-stone-100 transition-transform duration-500 hover:scale-[1.01]"
                  style={{ transform: `rotate(${index % 2 === 0 ? '1deg' : '-1deg'})` }}
                >
                  <img 
                    src={url} 
                    alt={`Memory ${index + 1}`} 
                    className="w-full h-auto block object-contain"
                    style={{ minHeight: '200px' }} 
                  />
                </div>
              ))}
            </div>

            {/* Video Player */}
            {wish.video_url && (
              <div className="rounded-[2.5rem] overflow-hidden bg-black shadow-2xl aspect-video border-[6px] border-white">
                <video src={wish.video_url} controls className="w-full h-full object-cover" />
              </div>
            )}
          </section>
        )}

        {/* Footer */}
        <footer className="py-32 px-8 bg-stone-50 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-[2.5rem] bg-white shadow-xl flex items-center justify-center mb-8 rotate-3">
            <Sparkles className="text-[#1D9E75]" size={32} />
          </div>
          <h3 className="text-3xl font-black text-stone-900 tracking-tight mb-8">Want to send joy?</h3>
          <Link href="/">
            <button className="px-12 py-5 bg-stone-950 text-white rounded-[2.5rem] font-black text-[16px] shadow-2xl active:scale-95 transition-all">
              Make Your Own Surprise
            </button>
          </Link>
        </footer>
      </main>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(-3deg); }
          50% { transform: translateY(-25px) rotate(3deg); }
        }
        .animate-float { animation: float 4s ease-in-out infinite; }
      `}</style>
    </div>
  )
}