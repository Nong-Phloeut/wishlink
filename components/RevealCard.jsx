'use client'
import { getOccasion } from '@/lib/occasions'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react'

function parseImages(raw) {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch { return [raw] }
  }
  return []
}

export default function RevealCard({ wish, compact = false }) {
  const occ = getOccasion(wish.occasion)
  const [revealed, setRevealed] = useState(compact)
  const [showContent, setShowContent] = useState(compact)
  const [images, setImages] = useState([])
  const [lightbox, setLightbox] = useState(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    setImages(parseImages(wish.image_url || wish.image_urls))
  }, [wish.image_url, wish.image_urls])

  // --- RESTORED LAUNCH CONFETTI FUNCTION ---
  const launchConfetti = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    const pieces = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      r: Math.random() * 6 + 3,
      d: Math.random() * 80,
      color: ['#1D9E75', '#FFD700', '#FF6B6B', '#4ECDC4', '#A78BFA', '#FB923C'][Math.floor(Math.random() * 6)],
      tilt: Math.random() * 10 - 10,
      tiltAngle: 0,
      tiltSpeed: Math.random() * 0.1 + 0.05,
    }))
    let frame, done = false
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      pieces.forEach((p) => {
        p.tiltAngle += p.tiltSpeed
        p.y += Math.cos(p.d) + 2
        p.tilt = Math.sin(p.tiltAngle) * 12
        ctx.beginPath()
        ctx.fillStyle = p.color
        ctx.ellipse(p.x + p.tilt, p.y, p.r, p.r * 0.4, p.tilt, 0, Math.PI * 2)
        ctx.fill()
      })
      if (!done) frame = requestAnimationFrame(draw)
    }
    draw()
    setTimeout(() => {
      done = true
      cancelAnimationFrame(frame)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }, 3000)
  }

  const handleReveal = () => {
    setRevealed(true)
    // Now launchConfetti is defined and will work!
    setTimeout(() => { setShowContent(true); launchConfetti() }, 400)
  }

  const ImageGrid = () => {
    if (images.length === 0) return null
    return (
      <div className="mt-6 space-y-2 px-2 pb-4">
        <div className="flex items-center gap-2 mb-4 opacity-40">
          <div className="h-[1px] flex-1 bg-current" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Memories</span>
          <div className="h-[1px] flex-1 bg-current" />
        </div>
        <div className={images.length === 1 ? "block" : "grid grid-cols-2 gap-2"}>
          {images.map((src, i) => (
            <motion.div
              key={i}
              whileTap={{ scale: 0.98 }}
              onClick={() => setLightbox(i)}
              className="relative overflow-hidden rounded-2xl cursor-pointer border shadow-sm bg-white/20"
              style={{ 
                borderColor: `${occ.accent}33`,
                aspectRatio: images.length === 1 ? '16/10' : '1/1' 
              }}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full max-w-sm mx-auto">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-50 rounded-3xl" />

      <div
        className="rounded-[2.5rem] relative overflow-hidden transition-all duration-700 shadow-2xl"
        style={{
          background: `linear-gradient(145deg, ${occ.bg} 0%, #ffffff 100%)`,
          border: `1.5px solid ${occ.border}`,
          transform: revealed ? 'scale(1)' : 'scale(0.96)',
        }}
      >
        <div 
          className="relative z-10 pt-12 pb-8 px-6 text-center"
          style={{
            opacity: showContent ? 1 : 0,
            transform: showContent ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <div className="text-6xl mb-4">{occ.emoji}</div>
          <div className="mb-6">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50" style={{ color: occ.accent }}>
              {occ.label}
            </span>
            <h2 className="text-3xl font-bold mt-1" style={{ color: occ.fg }}>{wish.recipient}</h2>
          </div>

          <div className="relative inline-block mb-6">
             <p className="text-[17px] leading-relaxed italic px-4" style={{ color: occ.fg }}>
               "{wish.message}"
             </p>
          </div>

          {(wish.from_name || wish.date) && (
            <div className="mb-8 opacity-70" style={{ color: occ.fg }}>
              {wish.from_name && <p className="font-semibold text-sm">— {wish.from_name}</p>}
              {wish.date && <p className="text-[10px] mt-1 uppercase tracking-tighter">
                {new Date(wish.date).toLocaleDateString(undefined, { dateStyle: 'long' })}
              </p>}
            </div>
          )}

          {wish.video_url && !compact && (
            <div className="mb-6 rounded-2xl overflow-hidden shadow-lg border-2 border-white bg-black aspect-video">
              <video src={wish.video_url} controls playsInline className="w-full h-full object-contain" />
            </div>
          )}

          <ImageGrid />
        </div>

        <AnimatePresence>
          {!revealed && (
            <motion.div
              exit={{ opacity: 0, scale: 1.1 }}
              onClick={handleReveal}
              className="absolute inset-0 z-40 flex flex-col items-center justify-center cursor-pointer"
              style={{ background: occ.accent }}
            >
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-7xl mb-4">🎁</motion.div>
              <p className="text-white font-bold text-xl">For {wish.recipient}</p>
              <p className="text-white/70 text-sm mt-1">Tap to open</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lightbox logic remains same... */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <button className="absolute top-6 right-6 text-white"><X size={32} /></button>
            <img src={images[lightbox]} className="max-w-full max-h-[80vh] rounded-lg shadow-2xl" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}