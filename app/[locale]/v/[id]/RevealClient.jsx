'use client'
import { useState } from 'react'
import { getOccasion } from '@/lib/occasions'
import { ChevronDown, Sparkles, MousePointer2 } from 'lucide-react'
import Link from 'next/link'

export default function RevealClient({ wish }) {
  const [hasRevealed, setHasRevealed] = useState(false)
  
  // Safety check: if wish is missing for any reason, return null
  if (!wish) return null;

  const occ = getOccasion(wish.occasion)
  const hasMedia = wish.image_url || wish.video_url

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      
      {/* ── 1. THE COVER (Mystery State) ── */}
      {!hasRevealed && (
        <div 
          onClick={() => setHasRevealed(true)}
          className="fixed inset-0 z-[100] cursor-pointer flex flex-col items-center justify-center p-6 text-center"
          style={{ background: `radial-gradient(circle at center, ${occ.bg} 0%, #ffffff 100%)` }}
        >
          <div className="animate-float text-[100px] mb-10 drop-shadow-2xl">
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
      <main className={`transition-all duration-1000 ${hasRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        
        {/* Full-Screen Hero Section */}
        <section 
          className="relative h-[100dvh] flex flex-col items-center justify-center px-10 text-center"
          style={{ background: `linear-gradient(to bottom, ${occ.bg}55, #ffffff)` }}
        >
          <div className="max-w-xl space-y-8">
            <div className="inline-block px-4 py-1.5 rounded-full bg-white/50 backdrop-blur-sm border border-white/80 shadow-sm mb-4">
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-500">
                {occ.label}
              </p>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black text-stone-900 tracking-tighter leading-none">
              {wish.recipient}
            </h1>

            <div className="relative inline-block py-2">
               <p className="text-2xl md:text-4xl font-semibold text-stone-800 leading-tight tracking-tight italic">
                "{wish.message}"
              </p>
            </div>

            <p className="text-lg font-bold text-stone-400 mt-12">— {wish.sender || 'Someone Special'}</p>
          </div>

          {hasMedia && (
            <div className="absolute bottom-12 flex flex-col items-center gap-2 text-stone-300 animate-bounce">
              <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">Scroll Down</span>
              <ChevronDown size={24} />
            </div>
          )}
        </section>

        {/* Immersive Media (Images/Videos) */}
        {hasMedia && (
          <section className="bg-white py-12 px-5 max-w-screen-md mx-auto space-y-12">
            {wish.image_url && (
              <div className="rounded-[2.5rem] overflow-hidden bg-stone-50 shadow-2xl">
                <img src={wish.image_url} alt="Memory" className="w-full h-auto block" />
              </div>
            )}

            {wish.video_url && (
              <div className="rounded-[2.5rem] overflow-hidden bg-black shadow-2xl aspect-video border-[8px] border-white">
                <video src={wish.video_url} controls className="w-full h-full object-cover" />
              </div>
            )}
          </section>
        )}

        {/* Modern Footer */}
        <footer className="py-32 px-8 bg-stone-50 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-[2.5rem] bg-white shadow-xl flex items-center justify-center mb-8 rotate-3">
            <Sparkles className="text-[#1D9E75]" size={32} />
          </div>
          <h3 className="text-3xl font-black text-stone-900 tracking-tight mb-4">Want to send joy?</h3>
          <Link href="/">
            <button className="px-12 py-5 bg-stone-950 text-white rounded-[2rem] font-black text-[16px] shadow-2xl active:scale-95 transition-all">
              Make Your Own Surprise
            </button>
          </Link>
        </footer>
      </main>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-30px) rotate(5deg); }
        }
        .animate-float { animation: float 4s ease-in-out infinite; }
      `}</style>
    </div>
  )
}