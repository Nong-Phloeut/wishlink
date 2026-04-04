'use client'
import { getOccasion } from '@/lib/occasions'
import { useEffect, useRef, useState } from 'react'

export default function RevealCard({ wish, compact = false }) {
  const occ = getOccasion(wish.occasion)
  const [revealed, setRevealed] = useState(compact)
  const [showContent, setShowContent] = useState(compact)
  const canvasRef = useRef(null)

  const formatDate = (d) => {
    if (!d) return null
    const dt = new Date(d + 'T00:00:00')
    return dt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

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

    let frame
    let done = false

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      pieces.forEach((p) => {
        p.tiltAngle += p.tiltSpeed
        p.y += (Math.cos(p.d) + 2)
        p.tilt = Math.sin(p.tiltAngle) * 12
        ctx.beginPath()
        ctx.fillStyle = p.color
        ctx.ellipse(p.x + p.tilt, p.y, p.r, p.r * 0.4, p.tilt, 0, Math.PI * 2)
        ctx.fill()
      })
      if (!done) frame = requestAnimationFrame(draw)
    }

    draw()
    setTimeout(() => { done = true; cancelAnimationFrame(frame); ctx.clearRect(0, 0, canvas.width, canvas.height) }, 3000)
  }

  const handleReveal = () => {
    setRevealed(true)
    setTimeout(() => {
      setShowContent(true)
      launchConfetti()
    }, 400)
  }

  // Auto-reveal on reveal page (not compact/preview mode)
  useEffect(() => {
    if (!compact) {
      setTimeout(() => handleReveal(), 600)
    }
  }, [])

  return (
    <div className="relative">
      {/* Confetti canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-20 rounded-2xl"
      />

      <div
        className="rounded-2xl relative overflow-hidden"
        style={{
          background: occ.bg,
          border: `1px solid ${occ.border}`,
          transition: 'transform 0.4s ease',
          transform: revealed ? 'scale(1)' : 'scale(0.95)',
        }}
      >
        {/* Decorative circles */}
        <div className="absolute top-[-24px] right-[-24px] w-24 h-24 rounded-full opacity-30" style={{ background: occ.border }} />
        <div className="absolute bottom-[-16px] left-[-16px] w-16 h-16 rounded-full opacity-20" style={{ background: occ.accent }} />

        {/* Image */}
        {wish.image_url && (
          <div
            className="w-full overflow-hidden"
            style={{
              maxHeight: compact ? 120 : 220,
              opacity: showContent ? 1 : 0,
              transition: 'opacity 0.6s ease 0.2s',
            }}
          >
            <img
              src={wish.image_url}
              alt="Wish"
              className="w-full object-cover"
              style={{ maxHeight: compact ? 120 : 220 }}
            />
          </div>
        )}

        <div
          className="relative z-10 p-6 text-center"
          style={{
            opacity: showContent ? 1 : 0,
            transform: showContent ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s',
          }}
        >
          <div style={{ fontSize: compact ? 40 : 52 }} className="mb-2 leading-none">
            {occ.emoji}
          </div>

          <div className="text-[11px] font-medium tracking-widest uppercase mb-1" style={{ color: occ.accent }}>
            {occ.label}
          </div>

          <div className="font-display mb-3" style={{ fontSize: compact ? 20 : 26, fontWeight: 600, color: occ.fg }}>
            {wish.recipient}
          </div>

          <p className="leading-relaxed" style={{ fontSize: compact ? 13 : 15, color: occ.fg, opacity: 0.9 }}>
            {wish.message}
          </p>

          {(wish.from_name || wish.date) && (
            <div className="mt-4 text-xs flex items-center justify-center gap-2" style={{ color: occ.fg, opacity: 0.6 }}>
              {wish.from_name && <span>From {wish.from_name}</span>}
              {wish.from_name && wish.date && <span>·</span>}
              {wish.date && <span>{formatDate(wish.date)}</span>}
            </div>
          )}

          {/* Video */}
          {wish.video_url && !compact && (
            <div className="mt-5">
              <p className="text-[11px] uppercase tracking-wider mb-2" style={{ color: occ.accent, opacity: 0.7 }}>
                Video message
              </p>
              <video
                src={wish.video_url}
                controls
                playsInline
                className="w-full rounded-xl"
                style={{ maxHeight: 280 }}
              />
            </div>
          )}
        </div>

        {/* Tap to reveal overlay — only shown before reveal in non-compact mode */}
        {!compact && !revealed && (
          <div
            onClick={handleReveal}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center cursor-pointer rounded-2xl"
            style={{ background: occ.accent }}
          >
            <div className="text-5xl mb-3">🎁</div>
            <p className="text-white font-semibold text-[16px]">Tap to reveal</p>
            <p className="text-white text-[12px] mt-1 opacity-70">A special wish awaits</p>
          </div>
        )}
      </div>
    </div>
  )
}