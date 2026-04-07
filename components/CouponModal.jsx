'use client'
import { useState } from 'react'
import { X, Tag, CheckCircle2, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'

export default function CouponModal({ onClose, onUpgraded, wishId }) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleApply = async () => {
    const cleanCode = code.trim().toUpperCase()
    if (!cleanCode) return setError("Please enter a code")
    setLoading(true)
    setError('')

    try {
      const res = await fetch("/api/coupons/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: cleanCode, wishId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Invalid coupon code")
      } else {
        setIsSuccess(true)
        setTimeout(() => {
          onUpgraded()
          onClose()
        }, 1200)
      }
    } catch (err) {
      setError("Server error. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-stone-900/40 backdrop-blur-sm">
      {/* Click overlay to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="relative bg-white w-full max-w-[450px] rounded-t-[2.5rem] p-6 pb-10 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] overflow-hidden"
      >
        {/* Handle bar for visual "pull up" cue */}
        <div className="mx-auto w-12 h-1.5 bg-stone-200 rounded-full mb-6" />

        <button 
          onClick={onClose}
          className="absolute right-6 top-6 text-stone-300 hover:text-stone-500 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
          {/* Smaller Icon Header */}
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4 border border-emerald-100">
            {isSuccess ? (
              <CheckCircle2 size={24} className="text-emerald-500" />
            ) : (
              <Tag size={22} className="text-emerald-600" />
            )}
          </div>

          <h3 className="text-xl font-black text-stone-900 tracking-tight">
            {isSuccess ? "Unlocked!" : "Coupon Code"}
          </h3>
          <p className="text-[13px] font-medium text-stone-500 mt-1 mb-6 px-6">
            {isSuccess 
              ? "Premium features are now ready." 
              : "Enter your code to unlock premium features."}
          </p>

          {!isSuccess && (
            <div className="w-full space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value)
                    setError('')
                  }}
                  placeholder="ENTER CODE"
                  className={`w-full h-14 bg-stone-50 border-2 rounded-2xl px-6 text-center text-base font-black tracking-[0.2em] outline-none transition-all ${
                    error ? 'border-red-200 text-red-500' : 'border-stone-100 focus:border-emerald-500 text-stone-800'
                  }`}
                  autoFocus
                />
                {loading && (
                  <div className="absolute right-4 top-4">
                    <Loader2 size={20} className="text-emerald-500 animate-spin" />
                  </div>
                )}
              </div>

              <AnimatePresence>
                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] font-bold text-red-500">
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <Button
                onClick={handleApply}
                disabled={loading || code.length < 3}
                className="w-full h-14 rounded-2xl bg-stone-900 text-white font-bold text-base hover:bg-stone-800 active:scale-[0.97] transition-all mb-15"
              >
                {loading ? "Checking..." : "Apply Coupon"}
              </Button>
              
              <div className="flex items-center justify-center gap-1.5 pt-2 text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                <Sparkles size={10} />
                Instant Access Unlocked
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}