'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function StoryViewer({ wish }) {
  const slides = wish.slides || [wish.message]
  const [index, setIndex] = useState(0)

  // Auto-play
  useEffect(() => {
    const timer = setTimeout(() => {
      if (index < slides.length - 1) {
        setIndex(index + 1)
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [index])

  const next = () => {
    if (index < slides.length - 1) setIndex(index + 1)
  }

  const prev = () => {
    if (index > 0) setIndex(index - 1)
  }

  return (
    <div className="fixed inset-0 bg-black text-white flex items-center justify-center">

      {/* Progress bars */}
      <div className="absolute top-4 left-4 right-4 flex gap-1">
        {slides.map((_, i) => (
          <div key={i} className="flex-1 h-1 bg-white/30 rounded">
            <div
              className="h-1 bg-white rounded transition-all"
              style={{
                width: i <= index ? '100%' : '0%'
              }}
            />
          </div>
        ))}
      </div>

      {/* Slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4 }}
          className="text-center px-6"
        >
          <p className="text-3xl font-bold leading-relaxed">
            {slides[index]}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Tap areas */}
      <div className="absolute inset-0 flex">
        <div className="flex-1" onClick={prev} />
        <div className="flex-1" onClick={next} />
      </div>

    </div>
  )
}